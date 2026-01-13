import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

// All analytics endpoints require authentication
router.use(verifyToken);

/**
 * Dashboard & Overview
 */
router.get("/overview", analyticsController.getAllProjectsOverview);
router.get("/dashboard/:projectId", analyticsController.getDashboard);

/**
 * Attendance Analytics
 */
router.get("/attendance/:projectId", analyticsController.getAttendanceStats);
router.get(
  "/attendance/:projectId/breakdown",
  analyticsController.getAttendanceBreakdown
);

/**
 * Task Analytics
 */
router.get("/tasks/:projectId", analyticsController.getTaskMetrics);

/**
 * Leave Analytics
 */
router.get("/leaves", analyticsController.getLeaveStats);

/**
 * Project Analytics
 */
router.get(
  "/project/:projectId/progress",
  analyticsController.getProjectProgress
);

/**
 * Daily Reports Analytics
 */
router.get("/reports/:projectId", analyticsController.getDailyReportsSummary);

/**
 * Worker Performance
 */
router.get(
  "/worker/:workerId/performance",
  analyticsController.getWorkerPerformance
);

export default router;
