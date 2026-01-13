import {
  attendanceTable,
  tasksTable,
  dailyReportsTable,
  workersTable,
} from "../models/index.js";

/**
 * Export Service for Data Export (CSV, JSON)
 * Generates reports in various formats for download
 */

export const exportService = {
  /**
   * Convert array of objects to CSV format
   */
  convertToCSV: (data, headers = null) => {
    if (!data || data.length === 0) {
      return "";
    }

    // Use provided headers or extract from first object
    const cols = headers || Object.keys(data[0]);
    const csv = [
      cols.join(","),
      ...data.map((obj) =>
        cols
          .map((col) => {
            const val = obj[col];
            // Handle values with commas or quotes
            if (
              typeof val === "string" &&
              (val.includes(",") || val.includes('"'))
            ) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      ),
    ].join("\n");

    return csv;
  },

  /**
   * Export attendance data as CSV
   */
  exportAttendanceCSV: async (projectId, startDate, endDate) => {
    const attendanceRecords = await attendanceTable
      .find({
        projectId,
        checkInAt: { $gte: startDate, $lte: endDate },
      })
      .populate("workerId")
      .sort({ checkInAt: 1 });

    const data = attendanceRecords.map((record) => {
      const worker = record.workerId || {};
      return {
        workerId: worker._id || record.workerId, // Use populated ID or original if not populated
        workerName: worker.firstname
          ? `${worker.firstname} ${worker.lastname}`
          : "Unknown",
        checkInTime: record.checkInAt,
        checkOutTime: record.checkOutAt,
        checkInLat: record.checkInLat,
        checkInLon: record.checkInLng,
        checkOutLat: record.checkOutLat,
        checkOutLon: record.checkOutLng,
        status: record.status,
        method: record.method,
      };
    });

    const headers = [
      "workerId",
      "workerName",
      "checkInTime",
      "checkOutTime",
      "checkInLat",
      "checkInLon",
      "checkOutLat",
      "checkOutLon",
      "status",
      "method",
    ];

    const csv = exportService.convertToCSV(data, headers);
    return {
      filename: `attendance_${projectId}_${
        startDate.toISOString().split("T")[0]
      }.csv`,
      content: csv,
    };
  },

  /**
   * Export tasks as CSV
   */
  exportTasksCSV: async (projectId) => {
    const tasks = await tasksTable
      .find({ projectId })
      .sort({ createdAt: 1 });

    const data = tasks.map((task) => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      startDate: task.startDate,
      endDate: task.endDate,
      createdAt: task.createdAt,
    }));

    const headers = [
      "id",
      "title",
      "description",
      "status",
      "priority",
      "progress",
      "startDate",
      "endDate",
      "createdAt",
    ];

    const csv = exportService.convertToCSV(data, headers);
    return {
      filename: `tasks_${projectId}.csv`,
      content: csv,
    };
  },

  /**
   * Export daily reports as JSON
   */
  exportReportsJSON: async (projectId, startDate, endDate) => {
    const reports = await dailyReportsTable
      .find({
        projectId,
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ createdAt: 1 });

    return {
      filename: `reports_${projectId}_${
        startDate.toISOString().split("T")[0]
      }.json`,
      content: JSON.stringify(reports, null, 2),
    };
  },

  /**
   * Generate attendance report summary (HTML/JSON)
   */
  generateAttendanceSummary: async (projectId, startDate, endDate) => {
    // Using aggregation pipeline for summary statistics
    const data = await attendanceTable.aggregate([
      {
        $match: {
          projectId: projectId, // Ensure projectId matches type (String/ObjectId)
          checkInAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$workerId",
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "workers", // Collection name in MongoDB (usually lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "worker",
        },
      },
      {
        $unwind: {
          path: "$worker",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          workerId: "$_id",
          workerName: {
            $concat: [
              { $ifNull: ["$worker.firstname", "Unknown"] },
              " ",
              { $ifNull: ["$worker.lastname", ""] },
            ],
          },
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
        },
      },
    ]);

    const summary = {
      projectId,
      period: {
        start: startDate,
        end: endDate,
      },
      workers: data.map((w) => ({
        ...w,
        attendanceRate:
          w.totalDays > 0
            ? ((w.presentDays / w.totalDays) * 100).toFixed(2)
            : "0.00",
      })),
      generatedAt: new Date(),
    };

    return {
      filename: `attendance_summary_${projectId}_${
        startDate.toISOString().split("T")[0]
      }.json`,
      content: summary,
    };
  },
};
