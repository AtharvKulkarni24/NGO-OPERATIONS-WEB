import * as assignmentService from "../services/assignment.service.js";

/**
 * GET /api/assignments/managers/suitable
 * Find suitable managers for a project based on required skills
 */
export const getSuitableManagers = async (req, res, next) => {
  try {
    const { requiredSkills } = req.query;

    if (!requiredSkills) {
      return res.status(400).json({
        error: "requiredSkills query parameter is required (comma-separated)",
      });
    }

    const skillsArray = requiredSkills.split(",").map((s) => s.trim());
    const managers = await assignmentService.findSuitableManagers(skillsArray);

    res.json({
      data: managers,
      count: managers.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/assignments/projects/:projectId/leader
 * Assign a manager as project leader
 */
export const assignProjectLeader = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { managerId } = req.body;

    if (!managerId) {
      return res.status(400).json({ error: "managerId is required" });
    }

    const project = await assignmentService.assignProjectLeader(
      projectId,
      managerId
    );

    res.json({
      message: "Project leader assigned successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/assignments/projects/:projectId/auto-assign-leader
 * Auto-assign best matching manager to a project
 */
export const autoAssignProjectLeader = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await assignmentService.autoAssignProjectLeader(projectId);

    res.json({
      message: "Project leader auto-assigned successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/assignments/workers/suitable
 * Find suitable workers for a task based on required skills
 */
export const getSuitableWorkers = async (req, res, next) => {
  try {
    const { projectId, requiredSkills } = req.query;

    if (!requiredSkills) {
      return res.status(400).json({
        error: "requiredSkills query parameter is required (comma-separated)",
      });
    }

    const skillsArray = requiredSkills.split(",").map((s) => s.trim());
    const workers = await assignmentService.findSuitableWorkers(
      projectId,
      skillsArray
    );

    res.json({
      data: workers,
      count: workers.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/assignments/tasks/:taskId/workers
 * Assign workers to a task
 */
export const assignWorkersToTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { workerIds } = req.body;

    if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res
        .status(400)
        .json({ error: "workerIds array is required and must not be empty" });
    }

    const assignments = await assignmentService.assignWorkersToTask(
      taskId,
      workerIds
    );

    res.json({
      message: "Workers assigned to task successfully",
      data: assignments,
      count: assignments.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/assignments/projects/:projectId/team
 * Get project with leader details and team composition
 */
export const getProjectTeam = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await assignmentService.getProjectWithTeam(projectId);

    res.json({
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
