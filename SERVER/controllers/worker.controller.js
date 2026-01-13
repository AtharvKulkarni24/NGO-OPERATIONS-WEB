import { z } from "zod";
import {
  createWorker,
  getAllWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
} from "../services/worker.service.js";
import {
  formatWorkerListSecure,
  formatWorkerSecure,
} from "../presenters/worker.presenter.js";
import {
  workerSchema,
  workerUpdateSchema,
} from "../validators/worker.validator.js";

export const create = async (req, res) => {
  try {
    const validated = workerSchema.parse(req.body);
    const [worker] = await createWorker(validated);
    res.status(201).json(formatWorkerSecure(worker));
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    if (req.worker.role !== "ADMIN")
      return res.status(403).json({ error: "Forbidden" });
    const workers = await getAllWorkers();
    res.json(formatWorkerListSecure(workers));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const [worker] = await getWorkerById(req.worker.sub);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(formatWorkerSecure(worker));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  // #region agent log
  const logDebug = (location, message, data) => {
    fetch("http://127.0.0.1:7242/ingest/51d8f5a9-8cae-46e5-ba4d-366eec339780", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: "debug-session",
      }),
    }).catch(() => {});
  };
  logDebug("worker.controller.js:41", "getById endpoint called", {
    workerId: req.params.id,
    hypothesisId: "B",
  });
  // #endregion
  try {
    // #region agent log
    logDebug("worker.controller.js:44", "Before getWorkerById call", {
      workerId: req.params.id,
      hypothesisId: "B",
    });
    // #endregion
    const [worker] = await getWorkerById(req.params.id);
    // #region agent log
    logDebug("worker.controller.js:47", "After getWorkerById call", {
      workerId: req.params.id,
      workerFound: !!worker,
      workerData: worker
        ? { id: worker.id, firstname: worker.firstname, email: worker.email }
        : null,
      hypothesisId: "B",
    });
    // #endregion
    if (!worker) {
      // #region agent log
      logDebug("worker.controller.js:50", "Worker not found, returning 404", {
        workerId: req.params.id,
        hypothesisId: "B",
      });
      // #endregion
      return res.status(404).json({ error: "Worker not found" });
    }
    // #region agent log
    logDebug("worker.controller.js:54", "Before formatWorkerSecure", {
      workerId: req.params.id,
      hypothesisId: "B",
    });
    // #endregion
    const formatted = formatWorkerSecure(worker);
    // #region agent log
    logDebug(
      "worker.controller.js:57",
      "After formatWorkerSecure, sending response",
      {
        workerId: req.params.id,
        formattedKeys: Object.keys(formatted),
        hypothesisId: "B",
      }
    );
    // #endregion
    res.json(formatted);
  } catch (err) {
    // #region agent log
    logDebug("worker.controller.js:61", "Error in getById", {
      workerId: req.params.id,
      errorMessage: err.message,
      errorStack: err.stack,
      hypothesisId: "E",
    });
    // #endregion
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    if (req.worker.sub !== req.params.id && req.worker.role !== "ADMIN")
      return res.status(403).json({ error: "Forbidden" });
    const validated = workerUpdateSchema.parse(req.body);
    const [updated] = await updateWorker(req.params.id, validated);
    res.json(formatWorkerSecure(updated));
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    if (req.worker.role !== "ADMIN")
      return res.status(403).json({ error: "Forbidden" });
    await deleteWorker(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
