import { inventoryTable, inventoryLogsTable } from "../models/index.js";

export const createInventoryItem = async (data) => {
  const item = await inventoryTable.create(data);
  return [item];
};

export const getProjectInventory = (projectId) =>
  inventoryTable.find({ projectId });

export const logInventoryChange = async (data, workerId) => {
  const log = await inventoryLogsTable.create({ ...data, workerId });
  return [log];
};

export const getInventoryLogs = (inventoryId) =>
  inventoryLogsTable.find({ inventoryId });

export const updateInventoryItem = async (id, data) => {
  const item = await inventoryTable.findByIdAndUpdate(id, data, { new: true });
  return item ? [item] : [];
};

export const deleteInventoryItem = (id) =>
  inventoryTable.findByIdAndDelete(id);
