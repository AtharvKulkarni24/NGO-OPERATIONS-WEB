import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

// All notification endpoints require authentication
router.use(verifyToken);

/**
 * Get notifications
 */
router.get("/", notificationController.getNotifications);

/**
 * Get unread count
 */
router.get("/count/unread", notificationController.getUnreadCount);

/**
 * Mark notification as read
 */
router.patch("/:notificationId/read", notificationController.markAsRead);

/**
 * Mark all as read
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * Delete notification
 */
router.delete("/:notificationId", notificationController.deleteNotification);

/**
 * Create notification (admin only - for testing)
 */
router.post("/", notificationController.createNotification);

/**
 * Broadcast notification (admin only)
 */
router.post("/broadcast", notificationController.broadcastNotification);

export default router;
