import { exportService } from "../services/export.service.js";
import { z } from "zod";

const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  projectId: z.string().uuid(),
});

export const exportController = {
  /**
   * Export attendance data as CSV
   * GET /export/attendance/:projectId?startDate=2025-01-01&endDate=2025-01-31&format=csv
   */
  exportAttendance: async (req, res, next) => {
    try {
      const { projectId, startDate, endDate } = dateRangeSchema.parse({
        projectId: req.params.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const { filename, content } = await exportService.exportAttendanceCSV(
        projectId,
        startDate,
        endDate
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(content);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export tasks as CSV
   * GET /export/tasks/:projectId
   */
  exportTasks: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const { filename, content } = await exportService.exportTasksCSV(
        projectId
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(content);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export reports as JSON
   * GET /export/reports/:projectId
   */
  exportReports: async (req, res, next) => {
    try {
      const { projectId, startDate, endDate } = dateRangeSchema.parse({
        projectId: req.params.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const { filename, content } = await exportService.exportReportsJSON(
        projectId,
        startDate,
        endDate
      );

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(content);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate attendance summary report
   * GET /export/attendance-summary/:projectId
   */
  generateAttendanceSummary: async (req, res, next) => {
    try {
      const { projectId, startDate, endDate } = dateRangeSchema.parse({
        projectId: req.params.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const { filename, content } =
        await exportService.generateAttendanceSummary(
          projectId,
          startDate,
          endDate
        );

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(content);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate project overview report
   * GET /export/project/:projectId
   */
  generateProjectReport: async (req, res, next) => {
    try {
      const { projectId } = z.object({ projectId: z.string().uuid() }).parse({
        projectId: req.params.projectId,
      });

      const { filename, content } = await exportService.generateProjectReport(
        projectId
      );

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(content);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export worker summary as CSV
   * GET /export/workers/:projectId
   */
  exportWorkerSummary: async (req, res, next) => {
    try {
      const { projectId, startDate, endDate } = dateRangeSchema.parse({
        projectId: req.params.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const { filename, content } = await exportService.exportWorkerSummaryCSV(
        projectId,
        startDate,
        endDate
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(content);
    } catch (error) {
      next(error);
    }
  },
};
