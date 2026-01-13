import { Router } from "express";
import * as assignmentController from "../controllers/assignment.controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Manager assignment routes
router.get("/managers/suitable", assignmentController.getSuitableManagers);

router.post(
  "/projects/:projectId/leader",
  assignmentController.assignProjectLeader
);

router.post(
  "/projects/:projectId/auto-assign-leader",
  assignmentController.autoAssignProjectLeader
);

// Worker assignment routes
router.get("/workers/suitable", assignmentController.getSuitableWorkers);

router.post("/tasks/:taskId/workers", assignmentController.assignWorkersToTask);

// Team composition routes
router.get("/projects/:projectId/team", assignmentController.getProjectTeam);

export default router;
