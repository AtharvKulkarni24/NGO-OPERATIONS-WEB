import { z } from "zod";
import {
  checkInWorker,
  checkOutWorker,
  getWorkerAttendance,
  getProjectAttendance,
  getAllAttendance,
} from "../services/attendance.service.js";
import {
  formatAttendanceRecord,
  formatAttendanceList,
} from "../presenters/attendance.presenter.js";
import { attendanceSchema, checkoutSchema } from "../validators/index.js";

export const checkin = async (req, res) => {
  try {
    const validated = attendanceSchema.parse(req.body);
    
    const record = await checkInWorker({
        ...validated,
        workerId: req.worker.sub // Enforce workerId from token
    });

    // Return success with geofence validation info
    res.status(201).json({
      success: true,
      data: formatAttendanceRecord(record),
      geofenceValidation: record.geofenceValidation,
      message:
        record.geofenceValidation && !record.geofenceValidation.allowed
          ? "Check-in successful but outside geofence (warning only)"
          : "Check-in successful",
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });

    // Handle geofence validation errors
    if (err.geofenceValidation) {
      return res.status(err.statusCode || 403).json({
        success: false,
        error: err.message,
        geofenceValidation: err.geofenceValidation,
        details: {
          allowed: err.geofenceValidation.allowed,
          reason: err.geofenceValidation.reason,
          nearestZone: err.geofenceValidation.nearestZone,
          suggestion: err.geofenceValidation.suggestion,
        },
      });
    }

    res.status(400).json({ error: err.message });
  }
};

export const checkout = async (req, res) => {
  try {
    checkoutSchema.parse(req.body);
    const { checkOutLat, checkOutLng } = req.body;
    const updated = await checkOutWorker(
      req.params.id,
      checkOutLat,
      checkOutLng
    );
    res.json(formatAttendanceRecord(updated));
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
};

export const getByWorker = async (req, res) => {
  try {
    const records = await getWorkerAttendance(req.params.workerId);
    res.json(formatAttendanceList(records));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getByProject = async (req, res) => {
  try {
    const records = await getProjectAttendance(req.params.projectId);
    res.json(formatAttendanceList(records));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const { workerId, date } = req.query;
    const records = await getAllAttendance({ workerId, date });
    res.json(formatAttendanceList(records));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
