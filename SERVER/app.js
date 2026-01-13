import "dotenv/config";
import express from "express";
import {
  corsHandler,
  requestLogger,
  limiter,
  authLimiter,
  errorHandler,
} from "./middlewares/index.js";
import { connectDB } from "./config/db.js";
import { initRedis } from "./services/redis.service.js";
import authRoutes from "./routes/auth.routes.js";
import workerRoutes from "./routes/workers.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import shiftRoutes from "./routes/shifts.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave-requests.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import eventRoutes from "./routes/events.routes.js";
import reportRoutes from "./routes/daily-reports.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import locationRoutes from "./routes/location.routes.js";
import exportRoutes from "./routes/export.routes.js";
import geofenceRoutes from "./routes/geofence.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import storyRoutes from "./routes/story.routes.js";

const app = express();

// Global middlewares
app.use(corsHandler);
app.use(requestLogger);
app.use(express.json());
app.use(limiter);

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-requests", leaveRoutes); // Alias for frontend compatibility
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/projects", geofenceRoutes); // Geofence routes under /api/projects/:projectId/geofence
app.use("/api/assignments", assignmentRoutes); // Skill-based assignment routes
app.use("/api/stories", storyRoutes);

// Error handler (last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Initialize Redis and start server
(async () => {
  try {
    await connectDB();
    await initRedis();
    console.log("✅ Redis initialized successfully");
  } catch (error) {
    console.warn("⚠️ Redis initialization warning:", error.message);
    console.log("Server will continue without Redis caching");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Server accessible on all network interfaces at port ${PORT}`);
    console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics`);
    console.log(
      `📍 Location Tracking API: http://localhost:${PORT}/api/location`
    );
    console.log(
      `🔔 Notifications API: http://localhost:${PORT}/api/notifications`
    );
    console.log(`📤 Export API: http://localhost:${PORT}/api/export`);
  });
})();

export default app;
