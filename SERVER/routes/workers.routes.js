import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import * as workerController from "../controllers/worker.controller.js";

const router = Router();

// POST /workers (create)
router.post("/", async (req, res) => {
  await workerController.create(req, res);
});

// GET /workers (list all, admin only)
router.get("/", verifyToken, async (req, res) => {
  await workerController.getAll(req, res);
});

// GET /workers/me (get current worker)
router.get("/me", verifyToken, async (req, res) => {
  await workerController.getMe(req, res);
});

// GET /workers/:id (get one)
router.get("/:id", verifyToken, async (req, res) => {
  await workerController.getById(req, res);
});

// PATCH /workers/:id (update)
router.patch("/:id", verifyToken, async (req, res) => {
  await workerController.update(req, res);
});

// DELETE /workers/:id (delete, admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  await workerController.remove(req, res);
});

export default router;
