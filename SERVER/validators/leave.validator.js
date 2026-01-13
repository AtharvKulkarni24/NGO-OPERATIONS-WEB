import { z } from "zod";

export const leaveSchema = z.object({
  workerId: z.string().uuid("Invalid worker ID"),
  type: z.string().min(1, "Leave type required"),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});
