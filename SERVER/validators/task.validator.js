import { z } from "zod";

export const taskSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  title: z.string().min(1, "Task title required"),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  plannedStart: z.string().datetime().optional(),
  plannedEnd: z.string().datetime().optional(),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "DONE", "BLOCKED"]).optional(),
});

export const assignmentSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  workerId: z.string().uuid("Invalid worker ID"),
  roleOnTask: z.string().optional(),
  allocationPercent: z.number().int().min(0).max(100).optional(),
});

export const updateSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  workerId: z.string().uuid("Invalid worker ID"),
  note: z.string().optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  attachmentUrl: z.string().url().optional(),
});
