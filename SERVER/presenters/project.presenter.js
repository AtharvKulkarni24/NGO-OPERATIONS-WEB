export const formatProject = (project) => ({
  id: project.id,
  name: project.name,
  location: project.location,
  startDate: project.startDate,
  endDate: project.endDate,
  status: project.status,
  description: project.description,
  createdAt: project.createdAt?.toISOString(),
  updatedAt: project.updatedAt?.toISOString(),
});

export const formatProjectList = (projects) => projects.map(formatProject);
