import { notificationsTable } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const notificationService = {
  /**
   * Create a notification
   */
  createNotification: async (workerId, type, payload) => {
    const notification = await notificationsTable.create({
      _id: uuidv4(),
      workerId,
      type,
      payload,
      isRead: false,
      sentAt: new Date(),
    });

    return notification;
  },

  /**
   * Get notifications for a worker
   */
  getNotifications: async (workerId, isRead = null, limit = 20, offset = 0) => {
    const query = { workerId };

    if (isRead !== null) {
      query.isRead = isRead;
    }

    const notificationList = await notificationsTable
      .find(query)
      .sort({ sentAt: -1 })
      .limit(limit)
      .skip(offset);

    return notificationList;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    await notificationsTable.findByIdAndUpdate(notificationId, { isRead: true });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (workerId) => {
    await notificationsTable.updateMany(
      { workerId, isRead: false },
      { isRead: true }
    );
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (workerId) => {
    const count = await notificationsTable.countDocuments({
      workerId,
      isRead: false,
    });

    return count;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    await notificationsTable.findByIdAndDelete(notificationId);
  },

  /**
   * Send leave approval notification
   */
  notifyLeaveApproval: async function (workerId, leaveStatus, approverName) {
    const message =
      leaveStatus === "APPROVED"
        ? `Your leave request has been approved by ${approverName}`
        : `Your leave request has been rejected by ${approverName}`;

    return this.createNotification(workerId, "LEAVE_STATUS", {
      message,
      status: leaveStatus,
      approver: approverName,
    });
  },

  /**
   * Send task assignment notification
   */
  notifyTaskAssignment: async function (workerId, taskName, projectName) {
    return this.createNotification(workerId, "TASK_ASSIGNMENT", {
      message: `You have been assigned to task "${taskName}" in project "${projectName}"`,
      taskName,
      projectName,
    });
  },

  /**
   * Send shift schedule notification
   */
  notifyShiftSchedule: async function (workerId, shiftName, shiftTime) {
    return this.createNotification(workerId, "SHIFT_SCHEDULED", {
      message: `You are scheduled for shift "${shiftName}" at ${shiftTime}`,
      shiftName,
      shiftTime,
    });
  },

  /**
   * Send attendance reminder
   */
  notifyAttendanceReminder: async function (workerId, projectName) {
    return this.createNotification(workerId, "ATTENDANCE_REMINDER", {
      message: `Don't forget to check in for project "${projectName}"`,
      projectName,
    });
  },

  /**
   * Broadcast notification to multiple workers
   */
  broadcastNotification: async (workerIds, type, payload) => {
    const notificationList = workerIds.map((workerId) => ({
      _id: uuidv4(),
      workerId,
      type,
      payload,
      isRead: false,
      sentAt: new Date(),
    }));

    await notificationsTable.create(notificationList);

    return notificationList;
  },
};
