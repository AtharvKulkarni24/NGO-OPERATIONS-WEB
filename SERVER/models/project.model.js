import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const projectSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  name: { type: String, required: true, maxlength: 120 },
  location: { type: String, maxlength: 255 },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, default: "ACTIVE", maxlength: 50 },
  description: { type: String },
  
  projectLeaderId: { type: String, ref: 'Worker' },
  requiredSkills: { type: [String], default: [] },
  
  // Geofence Configuration
  latitude: { type: Number },
  longitude: { type: Number },
  geofenceRadiusKm: { type: Number, default: 0.5 },
  geofenceEnabled: { type: Boolean, default: true },
  geofenceZones: { type: mongoose.Schema.Types.Mixed }, // jsonb
  enforceGeofenceOnCheckIn: { type: Boolean, default: true },
  alertOnGeofenceBreach: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Project = mongoose.model("Project", projectSchema);
export const projectsTable = Project;
export default Project;
