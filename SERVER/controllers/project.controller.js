import { z } from "zod";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../services/project.service.js";
import {
  formatProject,
  formatProjectList,
} from "../presenters/project.presenter.js";
import { projectSchema } from "../validators/index.js";

export const create = async (req, res) => {
  try {
    const validated = projectSchema.parse(req.body);
    const [project] = await createProject(validated);
    res.status(201).json(formatProject(project));
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(formatProjectList(projects));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const [project] = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(formatProject(project));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const validated = projectSchema.partial().parse(req.body);
    const [updated] = await updateProject(req.params.id, validated);
    res.json(formatProject(updated));
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
