export { default as workersTable } from "./worker.model.js";
export { default as projectsTable } from "./project.model.js";
export { default as shiftsTable } from "./shift.model.js";
export { default as attendanceTable } from "./attendance.model.js";
export { default as leaveRequestsTable } from "./leave-request.model.js";
export {
  default as tasksTable,
  taskAssignmentsTable,
  taskUpdatesTable,
} from "./task.model.js";
export { default as eventsTable } from "./event.model.js";
export { default as dailyReportsTable, reportItemsTable } from "./daily-report.model.js";
export { default as inventoryTable, inventoryLogsTable } from "./inventory.model.js";
export { default as notificationsTable } from "./notification.model.js";
export { default as storiesTable } from "./story.model.js";

// Export roles as a constant array if needed for validation elsewhere
export const rolesEnum = {
  enumValues: ["ADMIN", "MANAGER", "WORKER", "VOLUNTEER", "VERIFICATION_OFFICER"]
};
