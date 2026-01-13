import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const attendanceSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  workerId: { type: String, ref: 'Worker', required: true },
  projectId: { type: String, ref: 'Project' },
  shiftId: { type: String, ref: 'Shift' },
  checkInAt: { type: Date },
  checkOutAt: { type: Date },
  checkInLat: { type: Number },
  checkInLng: { type: Number },
  checkOutLat: { type: Number },
  checkOutLng: { type: Number },
  method: { type: String, maxlength: 50 },
  status: { type: String, default: "PENDING", maxlength: 30 },
  workingHours: { type: Number },
  date: { type: Date },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export const attendanceTable = Attendance;
export default Attendance;
