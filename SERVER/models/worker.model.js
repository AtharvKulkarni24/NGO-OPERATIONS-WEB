import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const workerSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  firstname: { type: String, required: true, maxlength: 55 },
  lastname: { type: String, required: true, maxlength: 55 },
  passwordHash: { type: String, maxlength: 255 },
  email: { type: String, required: true, unique: true, maxlength: 255 },
  phone: { type: String, required: true, unique: true, maxlength: 20 },
  role: {
    type: String,
    enum: ["ADMIN", "MANAGER", "WORKER", "VOLUNTEER", "VERIFICATION_OFFICER"],
    default: "WORKER",
    required: true
  },
  department: { type: String, maxlength: 100 },
  status: { type: String, default: "ACTIVE", maxlength: 50 },
  profilePictureUrl: { type: String, maxlength: 255 },
  skills: { type: [String], default: [] },
  lastLogin: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for 'id' is added by default by Mongoose if not specified, 
// but since _id is string, it maps directly.

const Worker = mongoose.model("Worker", workerSchema);
export const workersTable = Worker; // Alias for backward compatibility if needed, though we should use Worker
export default Worker;
