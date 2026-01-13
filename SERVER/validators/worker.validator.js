import { z } from "zod";

export const workerSchema = z.object({
  firstname: z.string().min(1, "First name required"),
  lastname: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
  passwordHash: z.string().optional(),
  role: z
    .enum(["ADMIN", "MANAGER", "WORKER", "VOLUNTEER", "VERIFICATION_OFFICER"])
    .optional(),
  department: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]).optional(),
  profilePictureUrl: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
});

export const workerUpdateSchema = workerSchema.partial();
