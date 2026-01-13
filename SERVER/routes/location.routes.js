import { Router } from "express";
import { locationTrackingController } from "../controllers/location-tracking.controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

// All location tracking endpoints require authentication
router.use(verifyToken);

/**
 * Update worker location
 */
router.post("/update", locationTrackingController.updateLocation);

/**
 * Get active workers on project
 */
router.get(
  "/project/:projectId/active",
  locationTrackingController.getActiveWorkersOnProject
);

/**
 * Get active workers count on project
 */
router.get(
  "/project/:projectId/count",
  locationTrackingController.getActiveWorkersCount
);

/**
 * Get all active workers
 */
router.get("/active-workers", locationTrackingController.getAllActiveWorkers);

/**
 * Get worker's current location
 */
router.get(
  "/worker/:workerId/current",
  locationTrackingController.getWorkerLocation
);

/**
 * Mark worker as inactive
 */
router.post(
  "/worker/:workerId/inactive",
  locationTrackingController.markWorkerInactive
);

/**
 * Validate check-in location (geofence)
 */
router.post("/validate-checkin", locationTrackingController.validateCheckIn);

/**
 * Calculate distance between two points
 */
router.post("/distance", locationTrackingController.calculateDistance);

/**
 * Optimize route for multiple tasks
 */
router.post("/optimize-route", locationTrackingController.optimizeRoute);

/**
 * Get worker location history
 */
router.get(
  "/worker/:workerId/history",
  locationTrackingController.getLocationHistory
);

/**
 * Geocode address to coordinates
 */
router.post("/geocode", locationTrackingController.geocodeAddress);

/**
 * Reverse geocode coordinates to address
 */
router.post("/reverse-geocode", locationTrackingController.reverseGeocode);

/**
 * Get directions between two points
 */
router.post("/directions", locationTrackingController.getDirections);

export default router;
