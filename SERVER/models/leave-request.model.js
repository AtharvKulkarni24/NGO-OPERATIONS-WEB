import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const leaveRequestSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  workerId: { type: String, ref: 'Worker', required: true },
  type: { type: String, required: true, maxlength: 50 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, required: true, default: "PENDING", maxlength: 30 },
  approvedBy: { type: String, ref: 'Worker' },
  approvedAt: { type: Date },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
export const leaveRequestsTable = LeaveRequest;
export default LeaveRequest;
