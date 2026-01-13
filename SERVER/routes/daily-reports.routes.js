import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import {
  createDailyReport,
  getProjectReports,
  getWorkerReports,
  addReportItem,
  updateDailyReport,
  deleteDailyReport,
} from "../services/report.service.js";
import { reportSchema, itemSchema } from "../validators/index.js";

const router = Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = reportSchema.parse(req.body);
    
    // Map frontend fields to backend model
    const reportData = {
      ...validated,
      summary: validated.tasksSummary || validated.summary,
      date: validated.date || new Date(),
    };

    const [report] = await createDailyReport(reportData, req.worker.sub);
    res.status(201).json(report);
  } catch (err) {
    throw err;
  }
});

router.get("/my-reports", verifyToken, async (req, res) => {
  try {
    const reports = await getWorkerReports(req.worker.sub);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const reports = await getProjectReports(req.params.projectId);
    res.json(reports);
  } catch (err) {
    throw err;
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = reportSchema.partial().parse(req.body);
    const [updated] = await updateDailyReport(req.params.id, validated);
    if (!updated) return res.status(404).json({ error: "Report not found" });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await deleteDailyReport(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/items", verifyToken, async (req, res) => {
  try {
    const validated = itemSchema.parse(req.body);
    const [item] = await addReportItem(validated);
    res.status(201).json(item);
  } catch (err) {
    throw err;
  }
});

export default router;
