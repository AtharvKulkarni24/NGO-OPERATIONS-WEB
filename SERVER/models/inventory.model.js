import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const inventorySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  projectId: { type: String, ref: 'Project' },
  itemName: { type: String, required: true, maxlength: 150 },
  category: { type: String, maxlength: 100 },
  quantityAvailable: { type: Number, required: true, default: 0 },
  unit: { type: String, maxlength: 30 },
  location: { type: String, maxlength: 150 },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Inventory = mongoose.model("Inventory", inventorySchema);
export const inventoryTable = Inventory;

const inventoryLogSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  inventoryId: { type: String, ref: 'Inventory', required: true },
  workerId: { type: String, ref: 'Worker' },
  changeQty: { type: Number, required: true },
  reason: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema);
export const inventoryLogsTable = InventoryLog;

export default Inventory;
