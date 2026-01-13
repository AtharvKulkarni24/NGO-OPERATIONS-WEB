import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name required"),
  location: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  description: z.string().optional(),
});
