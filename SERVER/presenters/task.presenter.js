export const formatTask = (task) => ({
  id: task.id,
  projectId: task.projectId,
  title: task.title,
  description: task.description,
  category: task.category,
  priority: task.priority,
  plannedStart: task.plannedStart?.toISOString(),
  plannedEnd: task.plannedEnd?.toISOString(),
  status: task.status,
  createdAt: task.createdAt?.toISOString(),
});

export const formatTaskList = (tasks) => tasks.map(formatTask);
