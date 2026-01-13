import { dailyReportsTable, reportItemsTable } from "../models/index.js";

export const createDailyReport = async (data, submittedBy) => {
  const report = await dailyReportsTable.create({ ...data, submittedBy });
  return [report];
};

export const getProjectReports = (projectId) =>
  dailyReportsTable.find({ projectId });

export const getWorkerReports = (workerId) =>
  dailyReportsTable.find({ submittedBy: workerId }).sort({ date: -1 });

export const addReportItem = async (data) => {
  const item = await reportItemsTable.create(data);
  return [item];
};

export const getReportItems = (reportId) =>
  reportItemsTable.find({ dailyReportId: reportId });

export const updateDailyReport = async (id, data) => {
  const report = await dailyReportsTable.findByIdAndUpdate(id, data, { new: true });
  return report ? [report] : [];
};

export const deleteDailyReport = (id) =>
  dailyReportsTable.findByIdAndDelete(id);
