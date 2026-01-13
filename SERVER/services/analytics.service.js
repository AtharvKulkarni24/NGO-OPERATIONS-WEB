import {
  attendanceTable,
  tasksTable,
  workersTable,
  projectsTable,
  leaveRequestsTable,
} from "../models/index.js";

/**
 * Analytics Service for Field Operations Management
 * Provides metrics, dashboards, and performance insights
 */

export const analyticsService = {
  /**
   * Get attendance statistics for a project
   * @param {string} projectId - Project UUID
   * @param {Date} startDate - Start date for period
   * @param {Date} endDate - End date for period
   */
  getAttendanceStats: async (projectId, startDate, endDate) => {
    const stats = await attendanceTable.aggregate([
      {
        $match: {
          projectId,
          checkInAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalWorkers: { $addToSet: "$workerId" },
          totalCheckIns: { $sum: 1 },
          avgDuration: {
            $avg: {
              $divide: [
                {
                  $subtract: [
                    { $ifNull: ["$checkOutAt", new Date()] },
                    "$checkInAt",
                  ],
                },
                3600000, // ms to hours
              ],
            },
          },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalWorkers: { $size: "$totalWorkers" },
          totalCheckIns: 1,
          avgDuration: 1,
          presentDays: 1,
          absentDays: 1,
        },
      },
    ]);

    return (
      stats[0] || {
        totalWorkers: 0,
        totalCheckIns: 0,
        avgDuration: 0,
        presentDays: 0,
        absentDays: 0,
      }
    );
  },

  /**
   * Get per-worker attendance breakdown
   */
  getWorkerAttendanceBreakdown: async (projectId, startDate, endDate) => {
    const data = await attendanceTable.aggregate([
      {
        $match: {
          projectId,
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
          avgHours: {
            $avg: {
              $divide: [
                {
                  $subtract: [
                    { $ifNull: ["$checkOutAt", new Date()] },
                    "$checkInAt",
                  ],
                },
                3600000,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "workers",
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
          _id: 0,
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
          avgHours: 1,
        },
      },
    ]);

    return data;
  },

  /**
   * Get task completion metrics
   */
  getTaskMetrics: async (projectId) => {
    const stats = await tasksTable.aggregate([
      { $match: { projectId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [
                { $in: ["$status", ["DONE", "COMPLETED"]] },
                1,
                0,
              ],
            },
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] },
          },
          blockedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "BLOCKED"] }, 1, 0] },
          },
          backlogTasks: {
            $sum: {
              $cond: [
                { $in: ["$status", ["BACKLOG", "PENDING"]] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      blockedTasks: 0,
      backlogTasks: 0,
    };

    const total = result.totalTasks;
    const completed = result.completedTasks;

    return {
      ...result,
      avgProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  },

  /**
   * Get leave statistics for a period
   */
  getLeaveStats: async (startDate, endDate) => {
    const stats = await leaveRequestsTable.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          approvedLeaves: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          pendingLeaves: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
          rejectedLeaves: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalRequests: 0,
        approvedLeaves: 0,
        pendingLeaves: 0,
        rejectedLeaves: 0,
      }
    );
  },

  /**
   * Get project progress overview
   */
  getProjectProgress: async (projectId) => {
    const project = await projectsTable.findById(projectId).select("name status startDate endDate");

    if (!project) {
      return {};
    }

    const taskStats = await tasksTable.aggregate([
      { $match: { projectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] },
          },
        },
      },
    ]);

    const attendanceStats = await attendanceTable.distinct("workerId", { projectId });
    
    const stats = taskStats[0] || { total: 0, completed: 0 };
    const uniqueWorkers = attendanceStats.length;

    return {
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      totalTasks: stats.total,
      completedTasks: stats.completed,
      uniqueWorkers,
      taskCompletionRate:
        stats.total > 0
          ? ((stats.completed / stats.total) * 100).toFixed(2)
          : "0.00",
    };
  },
};
