import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import {
  createStory,
  getMyStories,
  generateStory,
  getStoryById,
  updateStory,
  deleteStory
} from "../controllers/story.controller.js";

const router = Router();

router.use(verifyToken);

router.post("/", createStory);
router.get("/my-stories", getMyStories);
router.post("/generate", generateStory);
router.get("/:id", getStoryById);
router.put("/:id", updateStory);
router.delete("/:id", deleteStory);

export default router;
