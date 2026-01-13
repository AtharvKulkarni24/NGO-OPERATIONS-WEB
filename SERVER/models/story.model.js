import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const storySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  workerId: { type: String, ref: 'Worker', required: true },
  projectId: { type: String, ref: 'Project' },
  taskId: { type: String, ref: 'Task' },
  content: { type: String, required: true },
  platform: { 
    type: String, 
    enum: ['instagram', 'twitter', 'facebook', 'linkedin', 'other'],
    default: 'other'
  },
  tone: { type: String, default: 'professional' },
  status: { 
    type: String, 
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'],
    default: 'DRAFT'
  },
  mediaUrl: { type: String },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  rejectionReason: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Story = mongoose.model("Story", storySchema);
export const storiesTable = Story;
export default Story;
