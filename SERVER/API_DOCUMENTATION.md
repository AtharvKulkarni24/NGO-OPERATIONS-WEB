# Field Operations Management System - API Documentation

## Newly Implemented Features

### 1. Analytics Dashboard Endpoints

**Base URL:** `/api/analytics`

#### Get Dashboard Overview

```
GET /api/analytics/dashboard/:projectId
```

Returns complete dashboard with project progress, tasks, attendance, leaves, and reports summary.

**Example:**

```bash
curl -X GET "http://localhost:3000/api/analytics/dashboard/project-uuid" \
  -H "Authorization: Bearer token"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "project": {
      "name": "Clean City Initiative",
      "status": "ACTIVE",
      "taskCompletionRate": "75.50",
      "completedTasks": 75,
      "totalTasks": 100,
      "activeWorkers": 12
    },
    "tasks": {
      "totalTasks": 100,
      "completedTasks": 75,
      "inProgressTasks": 20,
      "blockedTasks": 5,
      "backlogTasks": 0,
      "avgProgress": 76.5,
      "completionRate": "75.00"
    },
    "attendance": {
      "totalWorkers": 15,
      "totalCheckIns": 450,
      "avgDuration": 8.2,
      "presentDays": 440,
      "absentDays": 10
    },
    "leaves": {
      "totalRequests": 25,
      "approvedLeaves": 20,
      "pendingLeaves": 3,
      "rejectedLeaves": 2
    },
    "reports": [...]
  }
}
```

#### Get Attendance Statistics

```
GET /api/analytics/attendance/:projectId?startDate=2025-01-01&endDate=2025-01-31
```

Returns aggregated attendance metrics for a date range.

#### Get Worker Attendance Breakdown

```
GET /api/analytics/attendance/:projectId/breakdown?startDate=2025-01-01&endDate=2025-01-31
```

Returns per-worker attendance with attendance rates.

#### Get Task Metrics

```
GET /api/analytics/tasks/:projectId
```

Returns task completion statistics and status distribution.

#### Get Leave Statistics

```
GET /api/analytics/leaves?startDate=2025-01-01&endDate=2025-01-31
```

Returns leave approval workflow metrics.

#### Get Project Progress

```
GET /api/analytics/project/:projectId/progress
```

Returns project completion overview.

#### Get Worker Performance

```
GET /api/analytics/worker/:workerId/performance
```

Returns individual worker's 30-day performance metrics.

---

### 2. Real-Time Location Tracking

**Base URL:** `/api/location`

#### Update Worker Location

```
POST /api/location/update
```

**Request Body:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.006,
  "projectId": "project-uuid"
}
```

Call this endpoint periodically while worker is checked in for real-time tracking.

#### Get Active Workers on Project

```
GET /api/location/project/:projectId/active
```

Returns list of all currently active workers with their real-time locations.

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "workerId": "worker-uuid",
      "name": "John Doe",
      "projectId": "project-uuid",
      "latitude": 40.7128,
      "longitude": -74.006,
      "lastUpdated": "2025-01-15T10:30:45.000Z"
    }
  ]
}
```

#### Get All Active Workers

```
GET /api/location/active-workers
```

Returns all active workers across all projects.

#### Get Worker's Current Location

```
GET /api/location/worker/:workerId/current?projectId=project-uuid
```

#### Validate Check-In Location (Geofencing)

```
POST /api/location/validate-checkin
```

**Request Body:**

```json
{
  "checkinLatitude": 40.7128,
  "checkinLongitude": -74.006,
  "projectLatitude": 40.715,
  "projectLongitude": -74.005,
  "radiusKm": 0.5
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "Check-in location verified"
  }
}
```

#### Calculate Distance

```
POST /api/location/distance
```

**Request Body:**

```json
{
  "lat1": 40.7128,
  "lon1": -74.006,
  "lat2": 40.715,
  "lon2": -74.005
}
```

---

### 3. Notification System

**Base URL:** `/api/notifications`

#### Get Notifications

```
GET /api/notifications?limit=20&offset=0&isRead=false
```

Returns paginated notifications for current worker.

#### Get Unread Count

```
GET /api/notifications/count/unread
```

#### Mark as Read

```
PATCH /api/notifications/:notificationId/read
```

#### Mark All as Read

```
PATCH /api/notifications/read-all
```

#### Delete Notification

```
DELETE /api/notifications/:notificationId
```

#### Create Notification (Admin)

```
POST /api/notifications
```

**Request Body:**

```json
{
  "workerId": "worker-uuid",
  "type": "TASK_ASSIGNMENT",
  "payload": {
    "message": "You've been assigned a new task",
    "taskId": "task-uuid"
  }
}
```

#### Broadcast Notification (Admin)

```
POST /api/notifications/broadcast
```

**Request Body:**

```json
{
  "workerIds": ["worker-uuid-1", "worker-uuid-2"],
  "type": "GENERAL",
  "payload": {
    "message": "System maintenance scheduled for tomorrow"
  }
}
```

**Notification Types:**

- `LEAVE_STATUS` - Leave approval/rejection
- `TASK_ASSIGNMENT` - New task assigned
- `SHIFT_SCHEDULED` - Shift schedule updates
- `ATTENDANCE_REMINDER` - Check-in reminders
- `GENERAL` - General announcements

---

### 4. Data Export & Reporting

**Base URL:** `/api/export`

#### Export Attendance as CSV

```
GET /api/export/attendance/:projectId?startDate=2025-01-01&endDate=2025-01-31
```

Downloads CSV file with attendance records.

#### Export Attendance Summary

```
GET /api/export/attendance-summary/:projectId?startDate=2025-01-01&endDate=2025-01-31
```

Downloads JSON with worker-wise attendance rates.

#### Export Tasks

```
GET /api/export/tasks/:projectId
```

Downloads CSV with all tasks.

#### Export Reports

```
GET /api/export/reports/:projectId?startDate=2025-01-01&endDate=2025-01-31
```

Downloads JSON with daily reports.

#### Generate Project Report

```
GET /api/export/project/:projectId
```

Downloads comprehensive project overview.

#### Export Worker Summary

```
GET /api/export/workers/:projectId?startDate=2025-01-01&endDate=2025-01-31
```

Downloads CSV with worker information.

---

## Example Integration - Frontend Dashboard Usage

### Real-Time Dashboard Update

```javascript
// Poll for active workers every 10 seconds
setInterval(async () => {
  const response = await fetch(`/api/location/project/${projectId}/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data: workers } = await response.json();
  // Update map with worker locations
  updateWorkerLocations(workers);
}, 10000);

// Worker sends location every 30 seconds while checked in
setInterval(async () => {
  const location = await getWorkerLocation();
  await fetch("/api/location/update", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      latitude: location.lat,
      longitude: location.lng,
      projectId: currentProjectId,
    }),
  });
}, 30000);
```

### Dashboard Metrics

```javascript
// Load all dashboard metrics on page load
async function loadDashboard(projectId) {
  const dashboard = await fetch(`/api/analytics/dashboard/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

  // Display KPIs
  displayTaskCompletion(dashboard.data.tasks.completionRate);
  displayAttendanceRate(dashboard.data.attendance);
  displayActiveWorkers(dashboard.data.project.activeWorkers);
}
```

---

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

## Implementation Progress

✅ **Completed:**

- Analytics dashboard with key metrics
- Real-time location tracking system
- Geofencing validation
- Notification system (creation, retrieval, marking as read)
- Worker performance metrics
- Attendance statistics and breakdown
- Task completion metrics
- Leave statistics
- Project progress tracking
- Data export (CSV, JSON)

⏳ **In Progress:**

- Frontend dashboard UI components
- WebSocket integration for real-time updates
- Advanced scheduling and resource optimization

---

## Next Steps

1. Build React/Vue dashboard components
2. Implement WebSocket for live location updates
3. Add advanced filters and search
4. Setup caching layer (Redis) for performance
5. Add SMS/Email notification delivery
