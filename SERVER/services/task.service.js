import {
  tasksTable,
  taskAssignmentsTable,
  taskUpdatesTable,
  projectsTable,
} from "../models/index.js";

export const createTask = async (data, createdBy) => {
  const task = await tasksTable.create({ ...data, createdBy });
  return [task];
};

export const getAllTasks = async () => {
  // Get all tasks
  const tasks = await tasksTable.find({});

  if (tasks.length === 0) {
    return [];
  }

  // Get all task assignments in one query
  const taskIds = tasks.map((t) => t.id);
  
  const assignments = await taskAssignmentsTable
    .find({ taskId: { $in: taskIds } })
    .populate('workerId', 'firstname lastname');

  // Get all project IDs and fetch project names
  const projectIds = [
    ...new Set(tasks.map((t) => t.projectId).filter(Boolean)),
  ];
  
  const projects = await projectsTable.find({ _id: { $in: projectIds } }, 'name');
  
  // Group assignments by taskId
  const assignmentsByTask = {};
  for (const assignment of assignments) {
    if (!assignmentsByTask[assignment.taskId]) {
      assignmentsByTask[assignment.taskId] = [];
    }
    assignmentsByTask[assignment.taskId].push(assignment);
  }

  // Create project map
  const projectMap = {};
  for (const project of projects) {
    projectMap[project.id] = project.name;
  }

  // Enrich tasks with assignments and project names
  const enrichedTasks = tasks.map((task) => {
    const assignments = assignmentsByTask[task.id] || [];
    return {
      ...task.toObject(),
      assignedTo: assignments.length > 0 ? assignments[0].workerId._id : null,
      assignedToNames: assignments
        .map((a) => a.workerId ? `${a.workerId.firstname || ""} ${a.workerId.lastname || ""}`.trim() : "")
        .filter(Boolean),
      project: task.projectId ? projectMap[task.projectId] || null : null,
      dueDate: task.plannedEnd ? task.plannedEnd.toISOString() : null,
    };
  });

  return enrichedTasks;
};

export const getTaskById = async (id) => {
  const task = await tasksTable.findById(id);

  if (!task) {
    return null;
  }

  // Get assigned workers
  const assignments = await taskAssignmentsTable
    .find({ taskId: id })
    .populate('workerId', 'firstname lastname');

  // Get project name if projectId exists
  let projectName = null;
  if (task.projectId) {
    const project = await projectsTable.findById(task.projectId, 'name');
    projectName = project?.name || null;
  }

  return {
    ...task.toObject(),
    assignedTo: assignments.length > 0 ? assignments[0].workerId._id : null,
    assignedToNames: assignments.map((a) => a.workerId ? `${a.workerId.firstname} ${a.workerId.lastname}` : ""),
    project: projectName,
    dueDate: task.plannedEnd ? task.plannedEnd.toISOString() : null,
  };
};

export const getProjectTasks = async (projectId) => {
  return tasksTable.find({ projectId });
};

export const updateTask = async (id, data) => {
  const task = await tasksTable.findByIdAndUpdate(id, data, { new: true });
  return task ? [task] : [];
};

export const deleteTask = async (id) => {
  const task = await tasksTable.findByIdAndDelete(id);
  return task ? [task] : [];
};

export const assignTask = async (data) => {
  const assignment = await taskAssignmentsTable.create(data);
  return [assignment];
};

export const addTaskUpdate = async (data) => {
  const update = await taskUpdatesTable.create(data);
  return [update];
};

export const getTaskUpdates = async (taskId) => {
  return taskUpdatesTable.find({ taskId });
};
