import { z } from "zod";
import {
  createWorker,
  findWorkerByEmail,
  hashPassword,
  verifyPassword,
  signWorkerToken,
} from "../auth/auth.service.js";
import { formatWorkerSecure } from "../presenters/worker.presenter.js";
import { signupSchema, loginSchema } from "../auth/validators.js";

export const signup = async (req, res) => {
  try {
    const validated = signupSchema.parse(req.body);
    const { firstname, lastname, email, phone, password, role } = validated;

    // Check if worker already exists
    const existing = await findWorkerByEmail(email);
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await hashPassword(password);
    const [worker] = await createWorker({
      firstname,
      lastname,
      email,
      phone,
      passwordHash,
      role: role || "WORKER",
    });
    const token = signWorkerToken(worker);
    res.status(201).json({
      ...formatWorkerSecure(worker),
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("📥 Login attempt received:", { email: req.body.email });
    
    const validated = loginSchema.parse(req.body);
    const { email, password } = validated;

    console.log("✅ Validation passed, searching for worker...");
    const [worker] = await findWorkerByEmail(email);
    if (!worker) {
      console.log("❌ Worker not found for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ Worker found, verifying password...");
    const ok = await verifyPassword(password, worker.passwordHash);
    if (!ok) {
      console.log("❌ Password verification failed");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ Password verified, generating token...");
    const token = signWorkerToken(worker);
    console.log("✅ Login successful for:", email);
    res.json({
      ...formatWorkerSecure(worker),
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    if (err instanceof z.ZodError)
      return res.status(401).json({ error: err.errors[0].message });
    res.status(401).json({ error: err.message });
  }
};

