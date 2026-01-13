import { notificationService } from "../services/notification.service.js";
import { z } from "zod";

const notificationSchema = z.object({
  workerId: z.string().uuid(),
  type: z.enum([
    "LEAVE_STATUS",
    "TASK_ASSIGNMENT",
    "SHIFT_SCHEDULED",
    "ATTENDANCE_REMINDER",
    "GENERAL",
  ]),
  payload: z.record(z.any()),
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const notificationController = {
  /**
   * Get all notifications for current worker
   * GET /notifications
   */
  getNotifications: async (req, res, next) => {
    try {
      const { limit, offset } = paginationSchema.parse({
        limit: req.query.limit,
        offset: req.query.offset,
      });

      const isRead = req.query.isRead ? req.query.isRead === "true" : null;
      const notifications = await notificationService.getNotifications(
        req.user.workerId,
        isRead,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: { limit, offset },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread notification count
   * GET /notifications/count/unread
   */
  getUnreadCount: async (req, res, next) => {
    try {
      const count = await notificationService.getUnreadCount(req.user.workerId);

      res.status(200).json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark notification as read
   * PATCH /notifications/:notificationId/read
   */
  markAsRead: async (req, res, next) => {
    try {
      const { notificationId } = z
        .object({ notificationId: z.string().uuid() })
        .parse({
          notificationId: req.params.notificationId,
        });

      await notificationService.markAsRead(notificationId);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all notifications as read
   * PATCH /notifications/read-all
   */
  markAllAsRead: async (req, res, next) => {
    try {
      await notificationService.markAllAsRead(req.user.workerId);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete notification
   * DELETE /notifications/:notificationId
   */
  deleteNotification: async (req, res, next) => {
    try {
      const { notificationId } = z
        .object({ notificationId: z.string().uuid() })
        .parse({
          notificationId: req.params.notificationId,
        });

      await notificationService.deleteNotification(notificationId);

      res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create notification (admin only - for testing)
   * POST /notifications
   */
  createNotification: async (req, res, next) => {
    try {
      const { workerId, type, payload } = notificationSchema.parse(req.body);

      const notification = await notificationService.createNotification(
        workerId,
        type,
        payload
      );

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Broadcast notification (admin only)
   * POST /notifications/broadcast
   */
  broadcastNotification: async (req, res, next) => {
    try {
      const { workerIds, type, payload } = z
        .object({
          workerIds: z.array(z.string().uuid()),
          type: z.enum([
            "LEAVE_STATUS",
            "TASK_ASSIGNMENT",
            "SHIFT_SCHEDULED",
            "ATTENDANCE_REMINDER",
            "GENERAL",
          ]),
          payload: z.record(z.any()),
        })
        .parse(req.body);

      const notifications = await notificationService.broadcastNotification(
        workerIds,
        type,
        payload
      );

      res.status(201).json({
        success: true,
        message: `Notification sent to ${workerIds.length} workers`,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },
};
