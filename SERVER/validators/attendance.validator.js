import { z } from "zod";

export const attendanceSchema = z.object({
  workerId: z.string().uuid("Invalid worker ID").optional(),
  projectId: z.string().uuid("Invalid project ID").optional(),
  checkInLat: z.number().min(-90).max(90),
  checkInLng: z.number().min(-180).max(180),
  checkInAddress: z.string().optional(),
});

export const checkoutSchema = z.object({
  checkOutLat: z.string().optional(),
  checkOutLng: z.string().optional(),
});
