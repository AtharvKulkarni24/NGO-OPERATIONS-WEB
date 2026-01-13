import { z } from "zod";
import { projectsTable } from "../models/index.js";
import { geofenceService } from "../services/geofence.service.js";
import { geofenceAlertService } from "../services/geofence-alert.service.js";

// Validation schemas
const geofenceZoneSchema = z.object({
  name: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().positive().default(0.5),
  type: z
    .enum(["SECONDARY", "PARKING", "STORAGE", "OFFICE"])
    .default("SECONDARY"),
});

const updateProjectGeofenceSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  geofenceRadiusKm: z.number().positive().optional(),
  geofenceEnabled: z.boolean().optional(),
  enforceGeofenceOnCheckIn: z.boolean().optional(),
  alertOnGeofenceBreach: z.boolean().optional(),
});

export const geofenceController = {
  /**
   * Update project primary geofence configuration
   * PATCH /api/projects/:projectId/geofence
   */
  updateProjectGeofence: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const validated = updateProjectGeofenceSchema.parse(req.body);

      // Validate coordinates if provided
      if (validated.latitude && validated.longitude) {
        const validation = geofenceService.validateGeofenceConfig({
          latitude: validated.latitude,
          longitude: validated.longitude,
          radiusKm: validated.geofenceRadiusKm || 0.5,
        });

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: "Invalid geofence configuration",
            details: validation.errors,
          });
        }
      }

      const updated = await projectsTable.findByIdAndUpdate(
        projectId,
        {
          ...validated,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(200).json({
        success: true,
        message: "Geofence configuration updated",
        data: {
          id: updated.id,
          name: updated.name,
          geofence: {
            latitude: updated.latitude,
            longitude: updated.longitude,
            radiusKm: updated.geofenceRadiusKm,
            enabled: updated.geofenceEnabled,
            enforceOnCheckIn: updated.enforceGeofenceOnCheckIn,
            alertOnBreach: updated.alertOnGeofenceBreach,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get project geofence configuration
   * GET /api/projects/:projectId/geofence
   */
  getProjectGeofence: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const project = await projectsTable.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          projectId: project.id,
          projectName: project.name,
          location: project.location,
          primaryGeofence: {
            latitude: project.latitude,
            longitude: project.longitude,
            radiusKm: project.geofenceRadiusKm,
            enabled: project.geofenceEnabled,
          },
          additionalZones: project.geofenceZones || [],
          policies: {
            enforceOnCheckIn: project.enforceGeofenceOnCheckIn,
            alertOnBreach: project.alertOnGeofenceBreach,
          },
          totalZones:
            (project.latitude && project.longitude ? 1 : 0) +
            (project.geofenceZones?.length || 0),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Add geofence zone to project
   * POST /api/projects/:projectId/geofence/zones
   */
  addGeofenceZone: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const zoneData = geofenceZoneSchema.parse(req.body);

      // Get current project
      const project = await projectsTable.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Create new zone
      const newZone = geofenceService.createGeofenceZone(
        zoneData.name,
        zoneData.latitude,
        zoneData.longitude,
        zoneData.radiusKm,
        zoneData.type
      );

      // Add to existing zones
      const existingZones = project.geofenceZones || [];
      const updatedZones = [...existingZones, newZone];

      // Update project
      const updated = await projectsTable.findByIdAndUpdate(
        projectId,
        {
          geofenceZones: updatedZones,
          updatedAt: new Date(),
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        message: "Geofence zone added",
        data: {
          zone: newZone,
          totalZones: updatedZones.length,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Remove geofence zone from project
   * DELETE /api/projects/:projectId/geofence/zones/:zoneId
   */
  removeGeofenceZone: async (req, res, next) => {
    try {
      const { projectId, zoneId } = req.params;

      const project = await projectsTable.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const zones = project.geofenceZones || [];
      const updatedZones = zones.filter((z) => z.id !== zoneId);

      if (zones.length === updatedZones.length) {
        return res.status(404).json({ error: "Zone not found" });
      }

      await projectsTable.findByIdAndUpdate(projectId, {
        geofenceZones: updatedZones,
        updatedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Geofence zone removed",
        data: {
          remainingZones: updatedZones.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Validate location against project geofences
   * POST /api/projects/:projectId/geofence/validate
   */
  validateLocation: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const { latitude, longitude } = z
        .object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        })
        .parse(req.body);

      const project = await projectsTable.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const validation = geofenceService.validateCheckInLocation(
        latitude,
        longitude,
        project
      );

      res.status(200).json({
        success: true,
        data: validation,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get geofence breach statistics
   * GET /api/projects/:projectId/geofence/statistics
   */
  getGeofenceStatistics: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const { startDate, endDate } = z
        .object({
          startDate: z.string().datetime(),
          endDate: z.string().datetime(),
        })
        .parse({
          startDate:
            req.query.startDate ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: req.query.endDate || new Date().toISOString(),
        });

      const statistics = await geofenceAlertService.getBreachStatistics(
        projectId,
        new Date(startDate),
        new Date(endDate)
      );

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Check worker's current position
   * POST /api/projects/:projectId/geofence/check-position
   */
  checkWorkerPosition: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const { latitude, longitude } = z
        .object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        })
        .parse(req.body);

      const project = await projectsTable.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const position = geofenceAlertService.checkCurrentPosition(
        latitude,
        longitude,
        project
      );

      res.status(200).json({
        success: true,
        data: {
          projectId,
          projectName: project.name,
          workerLocation: { latitude, longitude },
          ...position,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },
};
