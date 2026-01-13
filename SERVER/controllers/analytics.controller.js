import { analyticsService } from "../services/analytics.service.js";
import { z } from "zod";

const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  projectId: z.string().uuid(),
});

const workerIdSchema = z.object({
  workerId: z.string().uuid(),
});

export const analyticsController = {
  /**
   * Get dashboard overview for a project
   * GET /analytics/dashboard/:projectId
   */
  getDashboard: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const dashboard = await analyticsService.getDashboardOverview(projectId);
      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get attendance statistics
   * GET /analytics/attendance/:projectId
   */
  getAttendanceStats: async (req, res, next) => {
    try {
      const parsed = dateRangeSchema.parse({
        projectId: req.params.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const startDate =
        parsed.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = parsed.endDate || new Date();

      const stats = await analyticsService.getAttendanceStats(
        parsed.projectId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get worker attendance breakdown
   * GET /analytics/attendance/:projectId/breakdown
   */
  getAttendanceBreakdown: async (req, res, next) => {
    try {
      const parsed = dateRangeSchema.parse({
        projectId: req.params.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const startDate =
        parsed.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = parsed.endDate || new Date();

      const breakdown = await analyticsService.getWorkerAttendanceBreakdown(
        parsed.projectId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: breakdown,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get task metrics
   * GET /analytics/tasks/:projectId
   */
  getTaskMetrics: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const metrics = await analyticsService.getTaskMetrics(projectId);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get leave statistics
   * GET /analytics/leaves
   */
  getLeaveStats: async (req, res, next) => {
    try {
      const { startDate, endDate } = z
        .object({
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
        })
        .parse({
          startDate:
            req.query.startDate ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: req.query.endDate || new Date(),
        });

      const stats = await analyticsService.getLeaveStats(startDate, endDate);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project progress
   * GET /analytics/project/:projectId/progress
   */
  getProjectProgress: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const progress = await analyticsService.getProjectProgress(projectId);

      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get daily reports summary
   * GET /analytics/reports/:projectId
   */
  getDailyReportsSummary: async (req, res, next) => {
    try {
      const parsed = dateRangeSchema.parse({
        projectId: req.params.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const startDate =
        parsed.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = parsed.endDate || new Date();

      const summary = await analyticsService.getDailyReportsSummary(
        parsed.projectId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get worker performance metrics
   * GET /analytics/worker/:workerId/performance
   */
  getWorkerPerformance: async (req, res, next) => {
    try {
      const { workerId } = workerIdSchema.parse({
        workerId: req.params.workerId,
      });

      const performance = await analyticsService.getWorkerPerformance(workerId);

      res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get analytics overview for all projects
   * GET /analytics/overview
   */
  getAllProjectsOverview: async (req, res, next) => {
    try {
      const { startDate, endDate } = z
        .object({
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
        })
        .parse({
          startDate: req.query.startDate,
          endDate: req.query.endDate,
        });

      const start =
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      const overview = await analyticsService.getAllProjectsOverview(
        start,
        end
      );

      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  },
};
