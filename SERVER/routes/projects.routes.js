import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "../controllers/project.controller.js";

const router = Router();

router.post("/", verifyToken, create);
router.get("/", verifyToken, getAll);
router.get("/:id", verifyToken, getById);
router.patch("/:id", verifyToken, update);
router.delete("/:id", verifyToken, remove);

export default router;
