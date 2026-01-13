import { Router } from "express";
import { geofenceController } from "../controllers/geofence.controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

// All geofence endpoints require authentication
router.use(verifyToken);

/**
 * Get project geofence configuration
 * GET /api/projects/:projectId/geofence
 */
router.get("/:projectId/geofence", geofenceController.getProjectGeofence);

/**
 * Update project primary geofence configuration
 * PATCH /api/projects/:projectId/geofence
 */
router.patch("/:projectId/geofence", geofenceController.updateProjectGeofence);

/**
 * Add geofence zone to project
 * POST /api/projects/:projectId/geofence/zones
 */
router.post("/:projectId/geofence/zones", geofenceController.addGeofenceZone);

/**
 * Remove geofence zone from project
 * DELETE /api/projects/:projectId/geofence/zones/:zoneId
 */
router.delete(
  "/:projectId/geofence/zones/:zoneId",
  geofenceController.removeGeofenceZone
);

/**
 * Validate location against project geofences
 * POST /api/projects/:projectId/geofence/validate
 */
router.post(
  "/:projectId/geofence/validate",
  geofenceController.validateLocation
);

/**
 * Get geofence breach statistics
 * GET /api/projects/:projectId/geofence/statistics
 */
router.get(
  "/:projectId/geofence/statistics",
  geofenceController.getGeofenceStatistics
);

/**
 * Check worker's current position against project geofences
 * POST /api/projects/:projectId/geofence/check-position
 */
router.post(
  "/:projectId/geofence/check-position",
  geofenceController.checkWorkerPosition
);

export default router;
