import { getDistance, getPreciseDistance } from "geolib";

/**
 * Geofencing Service
 * Handles geofence validation, zone detection, and boundary checks
 */

export const geofenceService = {
  /**
   * Check if worker location is within project zone (using geolib)
   */
  isWithinGeofence: (workerLat, workerLng, zoneLat, zoneLng, radiusKm) => {
    const distanceMeters = getPreciseDistance(
      { latitude: workerLat, longitude: workerLng },
      { latitude: zoneLat, longitude: zoneLng }
    );

    const distanceKm = distanceMeters / 1000;
    const isInside = distanceKm <= radiusKm;

    return {
      isInside,
      distanceKm: parseFloat(distanceKm.toFixed(3)),
      distanceMeters,
      radiusKm,
      tolerance: radiusKm - distanceKm,
    };
  },

  /**
   * Check if worker crossed geofence boundary (entering)
   */
  checkGeofenceEntry: (previousLocation, currentLocation, zone, radiusKm) => {
    const previousCheck = geofenceService.isWithinGeofence(
      previousLocation.latitude,
      previousLocation.longitude,
      zone.latitude,
      zone.longitude,
      radiusKm
    );

    const currentCheck = geofenceService.isWithinGeofence(
      currentLocation.latitude,
      currentLocation.longitude,
      zone.latitude,
      zone.longitude,
      radiusKm
    );

    return {
      entered: !previousCheck.isInside && currentCheck.isInside,
      exited: previousCheck.isInside && !currentCheck.isInside,
      previousDistance: previousCheck.distanceKm,
      currentDistance: currentCheck.distanceKm,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Calculate distance between worker and zone center
   */
  getDistanceToZone: (workerLat, workerLng, zoneLat, zoneLng) => {
    const distanceMeters = getPreciseDistance(
      { latitude: workerLat, longitude: workerLng },
      { latitude: zoneLat, longitude: zoneLng }
    );

    return {
      distanceMeters,
      distanceKm: (distanceMeters / 1000).toFixed(3),
      distanceMiles: ((distanceMeters / 1000) * 0.621371).toFixed(3),
    };
  },

  /**
   * Check if multiple workers are within geofence
   */
  getWorkersWithinGeofence: (workers, zone, radiusKm) => {
    return workers
      .map((worker) => {
        const check = geofenceService.isWithinGeofence(
          worker.latitude,
          worker.longitude,
          zone.latitude,
          zone.longitude,
          radiusKm
        );

        return {
          workerId: worker.id,
          ...check,
          workerName: worker.name,
        };
      })
      .filter((w) => w.isInside)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  },

  /**
   * Calculate geofence breach severity
   */
  getBreachSeverity: (distanceFromBoundary) => {
    if (distanceFromBoundary >= 0) return "INSIDE";
    if (distanceFromBoundary > -0.05) return "NEAR_BOUNDARY"; // 50 meters
    if (distanceFromBoundary > -0.5) return "MODERATE_BREACH"; // 500 meters
    return "SEVERE_BREACH";
  },

  /**
   * Create geofence alert
   */
  createGeofenceAlert: (worker, zone, breachType, severity) => {
    return {
      workerId: worker.id,
      workerName: `${worker.firstname} ${worker.lastname}`,
      zoneId: zone.id,
      zoneName: zone.name,
      breachType, // ENTRY, EXIT, BREACH
      severity, // INSIDE, NEAR_BOUNDARY, MODERATE_BREACH, SEVERE_BREACH
      timestamp: new Date().toISOString(),
      alertId: `alert-${worker.id}-${zone.id}-${Date.now()}`,
    };
  },

  /**
   * Validate geofence configuration
   */
  validateGeofenceConfig: (config) => {
    const errors = [];

    if (
      typeof config.latitude !== "number" ||
      config.latitude < -90 ||
      config.latitude > 90
    ) {
      errors.push("Invalid latitude");
    }

    if (
      typeof config.longitude !== "number" ||
      config.longitude < -180 ||
      config.longitude > 180
    ) {
      errors.push("Invalid longitude");
    }

    if (typeof config.radiusKm !== "number" || config.radiusKm <= 0) {
      errors.push("Radius must be positive number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Check if worker is within any of the project's geofence zones
   */
  isWithinAnyZone: (workerLat, workerLng, zones) => {
    if (!zones || zones.length === 0) {
      return {
        isInside: false,
        message: "No geofence zones configured",
        matchedZones: [],
      };
    }

    const matchedZones = zones
      .map((zone) => {
        const check = geofenceService.isWithinGeofence(
          workerLat,
          workerLng,
          zone.latitude,
          zone.longitude,
          zone.radiusKm || 0.5
        );
        return {
          ...check,
          zoneId: zone.id,
          zoneName: zone.name,
          zoneType: zone.type || "PRIMARY",
        };
      })
      .filter((z) => z.isInside)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return {
      isInside: matchedZones.length > 0,
      matchedZones,
      closestZone: matchedZones[0] || null,
      totalZones: zones.length,
    };
  },

  /**
   * Find nearest zone to worker location
   */
  findNearestZone: (workerLat, workerLng, zones) => {
    if (!zones || zones.length === 0) return null;

    const distances = zones.map((zone) => {
      const distance = geofenceService.getDistanceToZone(
        workerLat,
        workerLng,
        zone.latitude,
        zone.longitude
      );
      return {
        zone,
        ...distance,
        isWithinRadius:
          parseFloat(distance.distanceKm) <= (zone.radiusKm || 0.5),
      };
    });

    return distances.sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  },

  /**
   * Validate check-in location against project geofences
   */
  validateCheckInLocation: (workerLat, workerLng, project) => {
    // If geofence is not enabled for project, allow check-in
    if (!project.geofenceEnabled) {
      return {
        allowed: true,
        reason: "Geofence validation disabled for this project",
        geofenceEnabled: false,
      };
    }

    // Check if project has primary geofence coordinates
    if (project.latitude && project.longitude) {
      const primaryCheck = geofenceService.isWithinGeofence(
        workerLat,
        workerLng,
        project.latitude,
        project.longitude,
        project.geofenceRadiusKm || 0.5
      );

      if (primaryCheck.isInside) {
        return {
          allowed: true,
          reason: "Within primary project geofence",
          zone: "PRIMARY",
          ...primaryCheck,
        };
      }
    }

    // Check additional geofence zones
    if (project.geofenceZones && project.geofenceZones.length > 0) {
      const zoneCheck = geofenceService.isWithinAnyZone(
        workerLat,
        workerLng,
        project.geofenceZones
      );

      if (zoneCheck.isInside) {
        return {
          allowed: true,
          reason: "Within project geofence zone",
          zone: zoneCheck.closestZone.zoneName,
          ...zoneCheck.closestZone,
        };
      }
    }

    // Find nearest zone for helpful error message
    let nearestInfo = null;
    if (project.latitude && project.longitude) {
      const primaryDistance = geofenceService.getDistanceToZone(
        workerLat,
        workerLng,
        project.latitude,
        project.longitude
      );
      nearestInfo = {
        zoneName: "Primary Zone",
        ...primaryDistance,
      };
    }

    if (project.geofenceZones && project.geofenceZones.length > 0) {
      const nearest = geofenceService.findNearestZone(
        workerLat,
        workerLng,
        project.geofenceZones
      );
      if (
        !nearestInfo ||
        nearest.distanceMeters < parseFloat(nearestInfo.distanceMeters)
      ) {
        nearestInfo = {
          zoneName: nearest.zone.name,
          distanceMeters: nearest.distanceMeters,
          distanceKm: nearest.distanceKm,
          distanceMiles: nearest.distanceMiles,
        };
      }
    }

    return {
      allowed: false,
      reason: "Outside all project geofence zones",
      enforced: project.enforceGeofenceOnCheckIn !== false,
      nearestZone: nearestInfo,
      suggestion: nearestInfo
        ? `Move ${nearestInfo.distanceKm}km closer to ${nearestInfo.zoneName}`
        : "Contact your manager to update project geofence",
    };
  },

  /**
   * Create geofence zone object
   */
  createGeofenceZone: (
    name,
    latitude,
    longitude,
    radiusKm,
    type = "SECONDARY"
  ) => {
    return {
      id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      latitude,
      longitude,
      radiusKm,
      type, // PRIMARY, SECONDARY, PARKING, STORAGE, OFFICE
      createdAt: new Date().toISOString(),
      active: true,
    };
  },

  /**
   * Monitor geofence boundary crossings
   */
  monitorBoundaryCrossings: (
    previousLat,
    previousLng,
    currentLat,
    currentLng,
    zones
  ) => {
    const crossings = [];

    zones.forEach((zone) => {
      const previous = geofenceService.isWithinGeofence(
        previousLat,
        previousLng,
        zone.latitude,
        zone.longitude,
        zone.radiusKm || 0.5
      );

      const current = geofenceService.isWithinGeofence(
        currentLat,
        currentLng,
        zone.latitude,
        zone.longitude,
        zone.radiusKm || 0.5
      );

      if (previous.isInside !== current.isInside) {
        crossings.push({
          zoneId: zone.id,
          zoneName: zone.name,
          eventType: current.isInside ? "ENTRY" : "EXIT",
          previousDistance: previous.distanceKm,
          currentDistance: current.distanceKm,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return crossings;
  },
};
