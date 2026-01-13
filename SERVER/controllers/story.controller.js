import { z } from "zod";
import { storyService } from "../services/story.service.js";

export const createStory = async (req, res, next) => {
  try {
    const schema = z.object({
      content: z.string(),
      platform: z.enum(['instagram', 'twitter', 'facebook', 'linkedin', 'other']),
      tone: z.string().optional(),
      projectId: z.string().optional(),
      mediaUrl: z.string().optional(),
      status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED']).default('DRAFT')
    });

    const validated = schema.parse(req.body);
    const story = await storyService.createStory({
      ...validated,
      workerId: req.worker.sub
    });

    res.status(201).json(story);
  } catch (error) {
    next(error);
  }
};

export const getMyStories = async (req, res, next) => {
  try {
    const stories = await storyService.getWorkerStories(req.worker.sub);
    res.json(stories);
  } catch (error) {
    next(error);
  }
};

export const generateStory = async (req, res, next) => {
  try {
    const schema = z.object({
      projectId: z.string().optional(),
      platform: z.string(),
      tone: z.string().optional(),
      additionalContext: z.string().optional()
    });

    const validated = schema.parse(req.body);
    const result = await storyService.generateStoryContent({
      ...validated,
      workerId: req.worker.sub
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStoryById = async (req, res, next) => {
  try {
    const story = await storyService.getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found" });
    
    // Check ownership unless admin
    if (req.worker.role !== 'ADMIN' && req.worker.role !== 'MANAGER' && story.workerId !== req.worker.sub) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    res.json(story);
  } catch (error) {
    next(error);
  }
};

export const updateStory = async (req, res, next) => {
  try {
    const story = await storyService.updateStory(req.params.id, req.body);
    if (!story) return res.status(404).json({ error: "Story not found" });
    res.json(story);
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const story = await storyService.getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found" });

    // Check ownership unless admin
    if (req.worker.role !== 'ADMIN' && req.worker.role !== 'MANAGER' && story.workerId !== req.worker.sub) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await storyService.deleteStory(req.params.id);
    res.json({ message: "Story deleted" });
  } catch (error) {
    next(error);
  }
};
