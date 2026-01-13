import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const taskSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  projectId: { type: String, ref: 'Project' },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String },
  category: { type: String, maxlength: 100 },
  priority: { type: String, default: "MEDIUM", maxlength: 30 },
  plannedStart: { type: Date },
  plannedEnd: { type: Date },
  status: { type: String, default: "BACKLOG", maxlength: 30 },
  requiredSkills: { type: [String], default: [] },
  createdBy: { type: String, ref: 'Worker' },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Task = mongoose.model("Task", taskSchema);
export const tasksTable = Task;

const taskAssignmentSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  taskId: { type: String, ref: 'Task', required: true },
  workerId: { type: String, ref: 'Worker', required: true },
  roleOnTask: { type: String, maxlength: 50 },
  allocationPercent: { type: Number },
  assignedAt: { type: Date, required: true, default: Date.now },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const TaskAssignment = mongoose.model("TaskAssignment", taskAssignmentSchema);
export const taskAssignmentsTable = TaskAssignment;

const taskUpdateSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  taskId: { type: String, ref: 'Task', required: true },
  workerId: { type: String, ref: 'Worker', required: true },
  note: { type: String },
  progressPercent: { type: Number },
  attachmentUrl: { type: String, maxlength: 255 },
  createdAt: { type: Date, required: true, default: Date.now },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const TaskUpdate = mongoose.model("TaskUpdate", taskUpdateSchema);
export const taskUpdatesTable = TaskUpdate;

export default Task;
