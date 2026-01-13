import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import {
  create,
  getAll,
  getById,
  getByProject,
  update,
  remove,
  assign,
  addUpdate,
  getUpdates,
} from "../controllers/task.controller.js";

const router = Router();

// POST, GET, PATCH, DELETE endpoints

router.post("/", verifyToken, create);
router.get("/", verifyToken, getAll);
router.post("/assign", verifyToken, assign);
router.post("/update", verifyToken, addUpdate);
router.get("/project/:projectId", verifyToken, getByProject);
router.get("/:taskId/updates", verifyToken, getUpdates);
router.get("/:id", verifyToken, getById);
router.patch("/:id", verifyToken, update);
router.delete("/:id", verifyToken, remove);

export default router;
