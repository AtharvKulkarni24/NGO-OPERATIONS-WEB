import { Router } from "express";
import { exportController } from "../controllers/export.controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

// All export endpoints require authentication
router.use(verifyToken);

/**
 * Export attendance data as CSV
 */
router.get("/attendance/:projectId", exportController.exportAttendance);

/**
 * Export attendance summary as JSON
 */
router.get(
  "/attendance-summary/:projectId",
  exportController.generateAttendanceSummary
);

/**
 * Export tasks as CSV
 */
router.get("/tasks/:projectId", exportController.exportTasks);

/**
 * Export daily reports as JSON
 */
router.get("/reports/:projectId", exportController.exportReports);

/**
 * Generate project overview report
 */
router.get("/project/:projectId", exportController.generateProjectReport);

/**
 * Export worker summary as CSV
 */
router.get("/workers/:projectId", exportController.exportWorkerSummary);

export default router;
