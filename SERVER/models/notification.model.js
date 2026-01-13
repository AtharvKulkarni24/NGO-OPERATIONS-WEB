import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const notificationSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  workerId: { type: String, ref: 'Worker', required: true },
  type: { type: String, required: true, maxlength: 100 },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} }, // jsonb
  sentAt: { type: Date, required: true, default: Date.now },
  readAt: { type: Date },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Notification = mongoose.model("Notification", notificationSchema);
export const notificationsTable = Notification;
export default Notification;
