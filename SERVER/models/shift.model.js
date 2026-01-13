import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const shiftSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  projectId: { type: String, ref: 'Project', required: true },
  name: { type: String, required: true, maxlength: 100 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  recurrenceRule: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only createdAt in original
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Shift = mongoose.model("Shift", shiftSchema);
export const shiftsTable = Shift;
export default Shift;
