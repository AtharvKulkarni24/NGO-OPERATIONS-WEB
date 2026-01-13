import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const eventSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  projectId: { type: String, ref: 'Project' },
  title: { type: String, required: true, maxlength: 200 },
  type: { type: String, maxlength: 100 },
  startAt: { type: Date, required: true },
  endAt: { type: Date },
  locationLat: { type: Number },
  locationLng: { type: Number },
  status: { type: String, default: "PLANNED", maxlength: 30 },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Event = mongoose.model("Event", eventSchema);
export const eventsTable = Event;
export default Event;
