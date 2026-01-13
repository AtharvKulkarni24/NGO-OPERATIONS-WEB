import { shiftsTable } from "../models/index.js";

export const createShift = async (data) => {
  const shift = await shiftsTable.create(data);
  return [shift];
};

export const getShiftsByProject = (projectId) =>
  shiftsTable.find({ projectId });

export const getShiftById = async (id) => {
  const shift = await shiftsTable.findById(id);
  return shift ? [shift] : [];
};

export const updateShift = async (id, data) => {
  const shift = await shiftsTable.findByIdAndUpdate(id, data, { new: true });
  return shift ? [shift] : [];
};

export const deleteShift = (id) =>
  shiftsTable.findByIdAndDelete(id);
