import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

// POST /auth/signup
router.post("/signup", async (req, res) => {
  await authController.signup(req, res);
});

// POST /auth/login
router.post("/login", async (req, res) => {
  await authController.login(req, res);
});

// GET /auth/verify - Verify token and return user data
router.get("/verify", verifyToken, async (req, res) => {
  try {
    // req.worker is set by verifyToken middleware
    res.json({
      id: req.worker.sub,
      email: req.worker.email,
      firstname: req.worker.firstname,
      lastname: req.worker.lastname,
      role: req.worker.role,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
