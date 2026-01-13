import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import {
  checkin,
  checkout,
  getByWorker,
  getByProject,
  getAll,
} from "../controllers/attendance.controller.js";

const router = Router();

router.get("/", verifyToken, getAll);
router.get("/my-attendance", verifyToken, async (req, res) => {
    try {
        // Reuse getByWorker logic but force workerId from token
        req.params.workerId = req.worker.sub; 
        return getByWorker(req, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/checkin", verifyToken, checkin);
router.patch("/:id/checkout", verifyToken, checkout);
router.get("/worker/:workerId", verifyToken, getByWorker);
router.get("/project/:projectId", verifyToken, getByProject);

export default router;
