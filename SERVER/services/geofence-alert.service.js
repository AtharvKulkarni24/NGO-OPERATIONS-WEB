import { notificationsTable } from "../models/index.js";
import { geofenceService } from "./geofence.service.js";

/**
 * Geofence Alert Service
 * Handles boundary crossing alerts and notifications
 */

// In-memory store for recent alerts (prevent duplicate alerts)
const recentAlerts = new Map();
const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export const geofenceAlertService = {
  /**
   * Process location update and check for boundary crossings
   */
  processLocationUpdate: async (
    workerId,
    workerName,
    previousLat,
    previousLng,
    currentLat,
    currentLng,
    project
  ) => {
    if (!project.alertOnGeofenceBreach) {
      return { alertsGenerated: 0, alerts: [] };
    }

    const zones = [];

    // Add primary zone if configured
    if (project.latitude && project.longitude) {
      zones.push({
        id: "primary",
        name: project.name + " (Primary Zone)",
        latitude: project.latitude,
        longitude: project.longitude,
        radiusKm: project.geofenceRadiusKm || 0.5,
        type: "PRIMARY",
      });
    }

    // Add additional zones
    if (project.geofenceZones && project.geofenceZones.length > 0) {
      zones.push(...project.geofenceZones);
    }

    // Monitor boundary crossings
    const crossings = geofenceService.monitorBoundaryCrossings(
      previousLat,
      previousLng,
      currentLat,
      currentLng,
      zones
    );

    const alerts = [];

    for (const crossing of crossings) {
      // Check if we recently sent this alert
      const alertKey = `${workerId}-${crossing.zoneId}-${crossing.eventType}`;
      const lastAlert = recentAlerts.get(alertKey);

      if (lastAlert && Date.now() - lastAlert < ALERT_COOLDOWN_MS) {
        continue; // Skip duplicate alert
      }

      // Create notification
      const alert = await geofenceAlertService.createBoundaryAlert(
        workerId,
        workerName,
        crossing,
        project
      );

      alerts.push(alert);
      recentAlerts.set(alertKey, Date.now());
    }

    // Clean up old alerts from memory
    geofenceAlertService.cleanupOldAlerts();

    return {
      alertsGenerated: alerts.length,
      alerts,
      crossings,
    };
  },

  /**
   * Create boundary crossing alert notification
   */
  createBoundaryAlert: async (workerId, workerName, crossing, project) => {
    const severity = crossing.eventType === "EXIT" ? "HIGH" : "INFO";
    const title =
      crossing.eventType === "EXIT"
        ? "🚨 Geofence Exit Alert"
        : "✅ Geofence Entry Confirmed";

    const message =
      crossing.eventType === "EXIT"
        ? `${workerName} has exited ${crossing.zoneName}. Distance: ${crossing.currentDistance}km`
        : `${workerName} has entered ${crossing.zoneName}`;

    try {
      const notification = await notificationsTable.create({
        workerId,
        type: "GEOFENCE_ALERT",
        payload: {
          title,
          message,
          eventType: crossing.eventType,
          zoneName: crossing.zoneName,
          zoneId: crossing.zoneId,
          previousDistance: crossing.previousDistance,
          currentDistance: crossing.currentDistance,
          projectId: project.id,
          projectName: project.name,
          severity,
          timestamp: crossing.timestamp,
        },
      });

      return {
        ...notification.toObject(),
        crossing,
        severity,
      };
    } catch (error) {
      console.error("Failed to create geofence alert:", error);
      return null;
    }
  },

  /**
   * Create check-in denied alert
   */
  createCheckInDeniedAlert: async (
    workerId,
    workerName,
    geofenceValidation,
    project
  ) => {
    try {
      const notification = await notificationsTable.create({
        workerId,
        type: "GEOFENCE_ALERT",
        payload: {
          title: "❌ Check-In Location Invalid",
          message: `Check-in denied for ${project.name}. ${
            geofenceValidation.reason
          }. ${geofenceValidation.suggestion || ""}`,
          eventType: "CHECK_IN_DENIED",
          projectId: project.id,
          projectName: project.name,
          validation: geofenceValidation,
          timestamp: new Date().toISOString(),
        },
      });

      return notification;
    } catch (error) {
      console.error("Failed to create check-in denied alert:", error);
      return null;
    }
  },

  /**
   * Check worker's current position against all zones
   */
  checkCurrentPosition: (workerLat, workerLng, project) => {
    const zones = [];

    if (project.latitude && project.longitude) {
      zones.push({
        id: "primary",
        name: project.name + " (Primary)",
        latitude: project.latitude,
        longitude: project.longitude,
        radiusKm: project.geofenceRadiusKm || 0.5,
      });
    }

    if (project.geofenceZones) {
      zones.push(...project.geofenceZones);
    }

    return geofenceService.isWithinAnyZone(workerLat, workerLng, zones);
  },

  /**
   * Get geofence breach statistics for a project
   */
  getBreachStatistics: async (projectId, startDate, endDate) => {
    // Query notifications table for geofence alerts
    const alerts = await notificationsTable.find({
      type: "GEOFENCE_ALERT",
      sentAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const getPayload = (a) => {
      return typeof a.payload === 'string' ? JSON.parse(a.payload || "{}") : a.payload || {};
    };

    const exitEvents = alerts.filter((a) => {
      const payload = getPayload(a);
      return payload.eventType === "EXIT" && payload.projectId === projectId;
    });

    const entryEvents = alerts.filter((a) => {
      const payload = getPayload(a);
      return payload.eventType === "ENTRY" && payload.projectId === projectId;
    });

    const deniedCheckIns = alerts.filter((a) => {
      const payload = getPayload(a);
      return (
        payload.eventType === "CHECK_IN_DENIED" &&
        payload.projectId === projectId
      );
    });

    return {
      totalAlerts: alerts.length,
      exitEvents: exitEvents.length,
      entryEvents: entryEvents.length,
      deniedCheckIns: deniedCheckIns.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  },

  /**
   * Clean up old alert records from memory
   */
  cleanupOldAlerts: () => {
    const now = Date.now();
    for (const [key, timestamp] of recentAlerts.entries()) {
      if (now - timestamp > ALERT_COOLDOWN_MS * 2) {
        recentAlerts.delete(key);
      }
    }
  },

  /**
   * Get active alerts for a worker
   */
  getActiveAlertsForWorker: async (workerId, limit = 10) => {
    const alerts = await notificationsTable
      .find({
        workerId,
        type: "GEOFENCE_ALERT"
      })
      .sort({ sentAt: -1 })
      .limit(limit);

    return alerts;
  },
};
