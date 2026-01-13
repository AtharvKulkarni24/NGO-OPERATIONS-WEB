import { projectsTable } from "../models/index.js";

export const createProject = async (data) => {
  const project = await projectsTable.create(data);
  return [project];
};

export const getAllProjects = () => projectsTable.find({});

export const getProjectById = async (id) => {
  const project = await projectsTable.findById(id);
  return project ? [project] : [];
};

export const updateProject = async (id, data) => {
  const project = await projectsTable.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true }
  );
  return project ? [project] : [];
};

export const deleteProject = (id) => projectsTable.findByIdAndDelete(id);
