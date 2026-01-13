import { Router } from "express";
import { z } from "zod";
import { leaveRequestsTable } from "../models/index.js";
import {
  createLeaveRequest,
  getWorkerLeaves,
} from "../services/leave.service.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

const leaveSchema = z.object({
  workerId: z.string().uuid("Invalid worker ID"),
  type: z.string().min(1, "Leave type required"),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

// GET all leave requests
router.get("/", verifyToken, async (req, res) => {
  try {
    const leaves = await leaveRequestsTable.find({});
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const leaves = await getWorkerLeaves(req.worker.sub);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = leaveSchema.parse(req.body);
    // Ensure workerId matches the logged-in user
    if (validated.workerId !== req.worker.sub && req.worker.role !== 'ADMIN') {
        validated.workerId = req.worker.sub;
    }
    const [leave] = await createLeaveRequest(validated);
    res.status(201).json(leave);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/worker/:workerId", verifyToken, async (req, res) => {
  try {
    const leaves = await getWorkerLeaves(req.params.workerId);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve leave request
router.put("/:id/approve", verifyToken, async (req, res) => {
  try {
    const updated = await leaveRequestsTable.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED", approvedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject leave request
router.put("/:id/reject", verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const updated = await leaveRequestsTable.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED", rejectionReason: reason },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await deleteLeaveRequest(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = leaveSchema.partial().parse(req.body);
    const updated = await leaveRequestsTable.findByIdAndUpdate(
      req.params.id,
      { ...validated, approvedAt: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

export default router;
