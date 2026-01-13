import { attendanceTable, projectsTable } from "../models/index.js";
import { geofenceService } from "./geofence.service.js";

export const checkInWorker = async (data) => {
  // 1. Check if already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await attendanceTable.findOne({
    workerId: data.workerId,
    checkInAt: { $gte: today, $lt: tomorrow }
  });

  if (existing) {
    throw new Error("Already checked in for today");
  }

  // 2. Check for active session (not checked out)
  const activeSession = await attendanceTable.findOne({
    workerId: data.workerId,
    checkOutAt: null
  });

  if (activeSession) {
    throw new Error("Previous session not closed. Please check out first.");
  }

  // Get project details including geofence configuration
  const project = await projectsTable.findById(data.projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // Validate geofence if enabled and enforced
  let geofenceValidation = null;
  if (project.geofenceEnabled && data.checkInLat && data.checkInLng) {
    geofenceValidation = geofenceService.validateCheckInLocation(
      data.checkInLat,
      data.checkInLng,
      project
    );

    // Block check-in if outside geofence and enforcement is enabled
    if (!geofenceValidation.allowed && project.enforceGeofenceOnCheckIn) {
      const error = new Error("Check-in location outside project geofence");
      error.geofenceValidation = geofenceValidation;
      error.statusCode = 403;
      throw error;
    }
  }

  // Proceed with check-in
  const checkInTime = new Date();
  const record = await attendanceTable.create({
    ...data,
    checkInAt: checkInTime,
    date: today, // Store date part
    geofenceValidation: geofenceValidation
      ? JSON.stringify(geofenceValidation)
      : null,
  });

  return {
    ...record.toObject(),
    geofenceValidation,
    project: {
      id: project.id,
      name: project.name,
      location: project.location,
    },
  };
};

export const checkOutWorker = async (id, checkOutLat, checkOutLng) => {
  // Get the record to calculate duration
  const record = await attendanceTable.findById(id);

  if (!record) {
    throw new Error("Attendance record not found");
  }

  if (record.checkOutAt) {
    throw new Error("Already checked out");
  }

  const checkOutTime = new Date();
  const durationMs = checkOutTime - new Date(record.checkInAt);
  const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(2);

  const updated = await attendanceTable.findByIdAndUpdate(
    id,
    {
      checkOutAt: checkOutTime,
      checkOutLat,
      checkOutLng,
      status: "PRESENT",
      workingHours: durationHours,
    },
    { new: true }
  );
  return updated;
};

export const getWorkerAttendance = async (workerId) => {
  const records = await attendanceTable.find({ workerId }).sort({ checkInAt: -1 });
  return records;
};

export const getAllAttendance = async (filters = {}) => {
  const query = {};

  if (filters.workerId) {
    query.workerId = filters.workerId;
  }

  if (filters.date) {
    const filterDate = new Date(filters.date);
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.checkInAt = {
      $gte: filterDate,
      $lt: nextDay
    };
  }

  const records = await attendanceTable.find(query)
    .populate('workerId', 'firstname lastname email')
    .sort({ checkInAt: -1 });

  return records.map(record => ({
    attendance: record,
    worker: record.workerId
  }));
};

export const getProjectAttendance = async (projectId) => {
  const records = await attendanceTable.find({ projectId });
  return records;
};
