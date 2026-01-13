import { locationTrackingService } from "../services/location-tracking.service.js";
import { geofenceService } from "../services/geofence.service.js";
import { routeOptimizationService } from "../services/route-optimization.service.js";
import { googleMapsService } from "../services/google-maps.service.js";
import { z } from "zod";

const locationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  projectId: z.string().uuid(),
  accuracy: z.number().optional(),
});

const geofenceValidationSchema = z.object({
  checkinLatitude: z.number().min(-90).max(90),
  checkinLongitude: z.number().min(-180).max(180),
  projectLatitude: z.number().min(-90).max(90),
  projectLongitude: z.number().min(-180).max(180),
  radiusKm: z.number().positive().default(0.5),
});

const distanceSchema = z.object({
  lat1: z.number().min(-90).max(90),
  lon1: z.number().min(-180).max(180),
  lat2: z.number().min(-90).max(90),
  lon2: z.number().min(-180).max(180),
});

export const locationTrackingController = {
  /**
   * Update worker's real-time location
   * POST /location/update
   */
  updateLocation: async (req, res, next) => {
    try {
      const { latitude, longitude, projectId, accuracy } =
        locationUpdateSchema.parse(req.body);

      const result = await locationTrackingService.updateWorkerLocation(
        req.worker.sub,
        latitude,
        longitude,
        projectId,
        accuracy
      );

      res.status(200).json({
        success: true,
        message: "Location updated successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get all active workers on a project
   * GET /location/project/:projectId/active
   */
  getActiveWorkersOnProject: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const activeWorkers =
        await locationTrackingService.getActiveWorkersOnProject(projectId);

      res.status(200).json({
        success: true,
        data: activeWorkers,
        count: activeWorkers.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get active workers count on project
   * GET /location/project/:projectId/count
   */
  getActiveWorkersCount: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const count = await locationTrackingService.getActiveWorkersCount(
        projectId
      );

      res.status(200).json({
        success: true,
        data: { projectId, activeWorkerCount: count },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get all active workers across all projects
   * GET /location/active-workers
   */
  getAllActiveWorkers: async (req, res, next) => {
    try {
      const activeWorkers = await locationTrackingService.getAllActiveWorkers();

      res.status(200).json({
        success: true,
        data: activeWorkers,
        count: activeWorkers.length,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get worker's current location
   * GET /location/worker/:workerId/current
   */
  getWorkerLocation: async (req, res, next) => {
    try {
      const { workerId } = z.object({ workerId: z.string().uuid() }).parse({
        workerId: req.params.workerId,
      });

      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.query.projectId,
      });

      const location = await locationTrackingService.getWorkerLocation(
        workerId,
        projectId
      );

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Worker location not found or worker is inactive",
        });
      }

      res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Mark worker as inactive
   * POST /location/worker/:workerId/inactive
   */
  markWorkerInactive: async (req, res, next) => {
    try {
      const { workerId } = z.object({ workerId: z.string().uuid() }).parse({
        workerId: req.params.workerId,
      });

      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.body.projectId,
      });

      const result = await locationTrackingService.markWorkerInactive(
        workerId,
        projectId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Validate check-in within geofence
   * POST /location/validate-checkin
   */
  validateCheckIn: async (req, res, next) => {
    try {
      const {
        checkinLatitude,
        checkinLongitude,
        projectLatitude,
        projectLongitude,
        radiusKm,
      } = geofenceValidationSchema.parse(req.body);

      const result = geofenceService.isWithinGeofence(
        checkinLatitude,
        checkinLongitude,
        projectLatitude,
        projectLongitude,
        radiusKm
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.isInside
          ? "Check-in location is valid"
          : "Check-in location is outside project geofence",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Calculate distance between two points
   * POST /location/distance
   */
  calculateDistance: async (req, res, next) => {
    try {
      const { lat1, lon1, lat2, lon2 } = distanceSchema.parse(req.body);

      const distance = await googleMapsService.getDistance(
        { latitude: lat1, longitude: lon1 },
        { latitude: lat2, longitude: lon2 }
      );

      res.status(200).json({
        success: true,
        data: distance,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get directions between two locations
   * POST /location/directions
   */
  getDirections: async (req, res, next) => {
    try {
      const { originLat, originLng, destLat, destLng, waypoints } = z
        .object({
          originLat: z.number(),
          originLng: z.number(),
          destLat: z.number(),
          destLng: z.number(),
          waypoints: z
            .array(
              z.object({
                latitude: z.number(),
                longitude: z.number(),
              })
            )
            .optional(),
        })
        .parse(req.body);

      const directions = await googleMapsService.getDirections(
        { latitude: originLat, longitude: originLng },
        { latitude: destLat, longitude: destLng },
        waypoints
      );

      res.status(200).json({
        success: true,
        data: directions,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get optimized route for worker with multiple tasks
   * POST /location/optimize-route
   */
  optimizeRoute: async (req, res, next) => {
    try {
      const { workerLocation, tasks } = z
        .object({
          workerLocation: z.object({
            latitude: z.number(),
            longitude: z.number(),
          }),
          tasks: z.array(
            z.object({
              id: z.string(),
              location: z.object({
                latitude: z.number(),
                longitude: z.number(),
                address: z.string().optional(),
              }),
              priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
              estimatedDurationMinutes: z.number().optional(),
            })
          ),
        })
        .parse(req.body);

      const optimized = await routeOptimizationService.generateOptimizedRoute(
        workerLocation,
        tasks
      );

      res.status(200).json({
        success: true,
        data: optimized,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Get location history for a worker
   * GET /location/worker/:workerId/history
   */
  getLocationHistory: async (req, res, next) => {
    try {
      const { workerId } = z.object({ workerId: z.string().uuid() }).parse({
        workerId: req.params.workerId,
      });

      const { projectId, hoursBack } = z
        .object({
          projectId: z.string().uuid(),
          hoursBack: z.coerce.number().default(24),
        })
        .parse({
          projectId: req.query.projectId,
          hoursBack: req.query.hoursBack,
        });

      const history = await locationTrackingService.getLocationHistory(
        workerId,
        projectId,
        hoursBack
      );

      res.status(200).json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Geocode address to coordinates
   * POST /location/geocode
   */
  geocodeAddress: async (req, res, next) => {
    try {
      const { address } = z
        .object({
          address: z.string().min(3),
        })
        .parse(req.body);

      const result = await googleMapsService.geocodeAddress(address);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },

  /**
   * Reverse geocode coordinates to address
   * POST /location/reverse-geocode
   */
  reverseGeocode: async (req, res, next) => {
    try {
      const { latitude, longitude } = z
        .object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        })
        .parse(req.body);

      const result = await googleMapsService.reverseGeocode(
        latitude,
        longitude
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  },
};
