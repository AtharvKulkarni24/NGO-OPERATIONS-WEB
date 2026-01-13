import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const dailyReportSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  projectId: { type: String, ref: 'Project' },
  date: { type: Date, required: true },
  submittedBy: { type: String, ref: 'Worker' },
  summary: { type: String },
  achievements: { type: String },
  challenges: { type: String },
  location: { type: String },
  mediaUrls: [{ type: String }],
  issues: { type: String },
  risks: { type: String },
  needs: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);
export const dailyReportsTable = DailyReport;

const reportItemSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  dailyReportId: { type: String, ref: 'DailyReport', required: true },
  category: { type: String, maxlength: 100 },
  metricName: { type: String, required: true, maxlength: 100 },
  metricValue: { type: Number },
  unit: { type: String, maxlength: 30 },
  notes: { type: String },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const ReportItem = mongoose.model("ReportItem", reportItemSchema);
export const reportItemsTable = ReportItem;

export default DailyReport;
