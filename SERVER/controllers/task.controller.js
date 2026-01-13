import { z } from "zod";
import {
  createTask,
  getAllTasks,
  getTaskById,
  getProjectTasks,
  updateTask,
  deleteTask,
  assignTask,
  addTaskUpdate,
  getTaskUpdates,
} from "../services/task.service.js";
import {
  taskSchema,
  assignmentSchema,
  updateSchema,
} from "../validators/index.js";

export const create = async (req, res) => {
  try {
    const validated = taskSchema.parse(req.body);
    const [task] = await createTask(validated, req.worker.sub);
    res.status(201).json(task);
  } catch (err) {
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (err) {
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    // #region agent log
    appendFileSync(
      "d:\\CTC\\.cursor\\debug.log",
      JSON.stringify({
        location: "task.controller.js:37",
        message: "getById called",
        data: { taskId: req.params.id, timestamp: Date.now() },
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }) + "\n"
    );
    // #endregion
    const task = await getTaskById(req.params.id);
    if (!task) {
      // #region agent log
      appendFileSync(
        "d:\\CTC\\.cursor\\debug.log",
        JSON.stringify({
          location: "task.controller.js:41",
          message: "getById not found",
          data: { taskId: req.params.id, timestamp: Date.now() },
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "A",
        }) + "\n"
      );
      // #endregion
      return res.status(404).json({ error: "Task not found" });
    }
    // #region agent log
    appendFileSync(
      "d:\\CTC\\.cursor\\debug.log",
      JSON.stringify({
        location: "task.controller.js:46",
        message: "getById success",
        data: {
          taskId: req.params.id,
          hasAssignedTo: !!task.assignedTo,
          hasDueDate: !!task.dueDate,
          timestamp: Date.now(),
        },
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }) + "\n"
    );
    // #endregion
    res.json(task);
  } catch (err) {
    // #region agent log
    appendFileSync(
      "d:\\CTC\\.cursor\\debug.log",
      JSON.stringify({
        location: "task.controller.js:50",
        message: "getById error",
        data: {
          taskId: req.params.id,
          error: err.message,
          timestamp: Date.now(),
        },
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }) + "\n"
    );
    // #endregion
    throw err;
  }
};

export const getByProject = async (req, res) => {
  try {
    const tasks = await getProjectTasks(req.params.projectId);
    res.json(tasks);
  } catch (err) {
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const validated = taskSchema.partial().parse(req.body);
    const [updated] = await updateTask(req.params.id, validated);
    res.json(updated);
  } catch (err) {
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const [deleted] = await deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully", task: deleted });
  } catch (err) {
    throw err;
  }
};

export const assign = async (req, res) => {
  try {
    const validated = assignmentSchema.parse(req.body);
    const [assignment] = await assignTask(validated);
    res.status(201).json(assignment);
  } catch (err) {
    throw err;
  }
};

export const addUpdate = async (req, res) => {
  try {
    const validated = updateSchema.parse(req.body);
    const [taskUpdate] = await addTaskUpdate(validated);
    res.status(201).json(taskUpdate);
  } catch (err) {
    throw err;
  }
};

export const getUpdates = async (req, res) => {
  try {
    const updates = await getTaskUpdates(req.params.taskId);
    res.json(updates);
  } catch (err) {
    throw err;
  }
};
