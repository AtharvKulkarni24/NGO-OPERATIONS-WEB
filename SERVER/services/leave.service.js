import { leaveRequestsTable } from "../models/index.js";

export const createLeaveRequest = async (data) => {
  const leave = await leaveRequestsTable.create(data);
  return [leave];
};

export const getWorkerLeaves = (workerId) =>
  leaveRequestsTable.find({ workerId });

export const updateLeaveStatus = async (id, status, approvedBy) => {
  const leave = await leaveRequestsTable.findByIdAndUpdate(
    id,
    { status, approvedBy, approvedAt: new Date() },
    { new: true }
  );
  return leave ? [leave] : [];
};

export const deleteLeaveRequest = (id) =>
  leaveRequestsTable.findByIdAndDelete(id);
