import { z } from "zod";

export const signupSchema = z.object({
  firstname: z.string().min(1, "First name required"),
  lastname: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "WORKER"]).optional().default("WORKER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required"),
});

export const validateSignup = (data) => signupSchema.parse(data);

export const validateLogin = (data) => loginSchema.parse(data);
