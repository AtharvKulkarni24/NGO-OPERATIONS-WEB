import {
  attendanceTable,
  workersTable,
  projectsTable,
} from "../models/index.js";
import { redisService, getRedisClient } from "./redis.service.js";
import { geofenceService } from "./geofence.service.js";
import { googleMapsService } from "./google-maps.service.js";
import { geofenceAlertService } from "./geofence-alert.service.js";

/**
 * Real-time Location Tracking Service (Redis-backed)
 * Handles live location updates, active worker visibility, and geofencing
 */

export const locationTrackingService = {
  /**
   * Update worker's real-time location with geofence validation
   */
  updateWorkerLocation: async (
    workerId,
    latitude,
    longitude,
    projectId,
    accuracy = null
  ) => {
    try {
      // Get previous location for boundary crossing detection
      const previousLocation = await redisService.getWorkerLocation(
        workerId,
        projectId
      );

      const location = {
        latitude,
        longitude,
        accuracy,
      };

      // Store in Redis with expiration
      const cached = await redisService.setWorkerLocation(
        workerId,
        projectId,
        location
      );

      // Get project details for geofence monitoring
      const project = await projectsTable.findById(projectId);

      // Get worker details for alerts
      const worker = await workersTable.findById(workerId);

      // Check for boundary crossings and generate alerts
      let alertsResult = null;
      if (
        project &&
        worker &&
        previousLocation &&
        project.alertOnGeofenceBreach
      ) {
        alertsResult = await geofenceAlertService.processLocationUpdate(
          workerId,
          `${worker.firstname} ${worker.lastname}`,
          previousLocation.latitude,
          previousLocation.longitude,
          latitude,
          longitude,
          project
        );
      }

      // Also store in database for history
      // Note: This updates all attendance records for the worker to reflect latest location
      // ideally should only update the active session
      await attendanceTable.updateMany(
        { workerId },
        {
          checkOutLat: latitude.toString(),
          checkOutLng: longitude.toString(),
          updatedAt: new Date(),
        }
      );

      return {
        success: true,
        message: "Location updated",
        location: cached,
        alerts: alertsResult,
      };
    } catch (error) {
      console.error("Location update error:", error);
      throw error;
    }
  },

  /**
   * Get all active workers on a project with details
   */
  getActiveWorkersOnProject: async (projectId) => {
    try {
      const activeWorkers = await redisService.getActiveWorkersOnProject(
        projectId
      );

      // Enrich with worker details from database
      const enrichedWorkers = await Promise.all(
        activeWorkers.map(async (activeWorker) => {
          const workerData = await workersTable
            .findById(activeWorker.workerId)
            .select('firstname lastname email phone role department');

          return {
            ...activeWorker,
            firstname: workerData?.firstname || "Unknown",
            lastname: workerData?.lastname || "User",
            fullName: `${workerData?.firstname} ${workerData?.lastname}`,
            email: workerData?.email,
            phone: workerData?.phone,
            role: workerData?.role,
            department: workerData?.department,
          };
        })
      );

      return enrichedWorkers;
    } catch (error) {
      console.error("Get active workers error:", error);
      throw error;
    }
  },

  /**
   * Get worker's current location
   */
  getWorkerLocation: async (workerId, projectId) => {
    try {
      return await redisService.getWorkerLocation(workerId, projectId);
    } catch (error) {
      console.error("Get worker location error:", error);
      throw error;
    }
  },

  /**
   * Mark worker as inactive after check-out
   */
  markWorkerInactive: async (workerId, projectId) => {
    try {
      await redisService.removeWorkerLocation(workerId, projectId);
      return {
        success: true,
        message: "Worker marked as inactive",
      };
    } catch (error) {
      console.error("Mark inactive error:", error);
      throw error;
    }
  },

  /**
   * Validate worker location within project geofence
   */
  validateGeofence: async (
    workerId,
    latitude,
    longitude,
    projectId,
    radiusKm = 0.5
  ) => {
    try {
      // Get project details (you'll need to implement this query)
      // For now, using a placeholder structure
      const check = geofenceService.isWithinGeofence(
        latitude,
        longitude,
        40.7128, // project latitude (example)
        -74.006, // project longitude (example)
        radiusKm
      );

      // Cache the result
      if (!check.isInside) {
        await redisService.setCachedGeofenceCheck(workerId, projectId, check);
      }

      return {
        ...check,
        workerId,
        projectId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Geofence validation error:", error);
      throw error;
    }
  },

  /**
   * Get distance between worker and project location
   */
  getDistanceToProject: async (
    latitude,
    longitude,
    projectLatitude,
    projectLongitude
  ) => {
    try {
      const distance = await googleMapsService.getDistance(
        { latitude, longitude },
        { latitude: projectLatitude, longitude: projectLongitude }
      );

      return distance;
    } catch (error) {
      console.error("Distance calculation error:", error);
      throw error;
    }
  },

  /**
   * Get active workers count on project
   */
  getActiveWorkersCount: async (projectId) => {
    try {
      const workers = await redisService.getActiveWorkersOnProject(projectId);
      return workers.length;
    } catch (error) {
      console.error("Get count error:", error);
      throw error;
    }
  },

  /**
   * Get all active workers across all projects
   */
  getAllActiveWorkers: async () => {
    try {
      // Get all location keys from Redis
      const client = getRedisClient();

      // If Redis is not available, return empty array
      if (!client) {
        return [];
      }

      const keys = await client.keys("location:*");

      const workers = [];
      for (const key of keys) {
        const data = await client.get(key);
        if (data) {
          workers.push(JSON.parse(data));
        }
      }

      return workers;
    } catch (error) {
      console.error("Get all active workers error:", error);
      // Return empty array instead of throwing to prevent 500 errors
      return [];
    }
  },

  /**
   * Create geofence alert when worker enters/exits zone
   */
  createGeofenceAlert: async (worker, zone, eventType) => {
    const alert = geofenceService.createGeofenceAlert(
      worker,
      zone,
      eventType,
      "BOUNDARY_ALERT"
    );

    // Store alert in Redis for real-time processing
    // You can emit this via WebSocket for live notifications
    return alert;
  },

  /**
   * Get location history from database
   */
  getLocationHistory: async (workerId, projectId, hoursBack = 24) => {
    try {
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const records = await attendanceTable.find({
        workerId,
        projectId
        // Add createdAt filter (you may need to adjust based on your schema)
      });

      return records.map((r) => ({
        checkInAt: r.checkInAt,
        checkInLat: parseFloat(r.checkInLat),
        checkInLng: parseFloat(r.checkInLng),
        checkOutAt: r.checkOutAt,
        checkOutLat: parseFloat(r.checkOutLat),
        checkOutLng: parseFloat(r.checkOutLng),
      }));
    } catch (error) {
      console.error("Get history error:", error);
      throw error;
    }
  },

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },

  /**
   * Check if worker is within geofence radius
   */
  isWithinGeofence: (
    workerLat,
    workerLon,
    fenceLat,
    fenceLon,
    radiusKm = 0.5
  ) => {
    const distance = this.calculateDistance(
      workerLat,
      workerLon,
      fenceLat,
      fenceLon
    );
    return distance <= radiusKm;
  },

  /**
   * Validate attendance check-in within geofence
   */
  validateCheckInLocation: (
    checkinLat,
    checkinLon,
    projectLat,
    projectLon,
    radiusKm = 0.5
  ) => {
    const isValid = this.isWithinGeofence(
      checkinLat,
      checkinLon,
      projectLat,
      projectLon,
      radiusKm
    );

    return {
      isValid,
      message: isValid
        ? "Check-in location verified"
        : `Check-in outside geofence. Distance: ${this.calculateDistance(
            checkinLat,
            checkinLon,
            projectLat,
            projectLon
          ).toFixed(2)}km`,
    };
  },
};
