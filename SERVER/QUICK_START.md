# Quick Start Guide - Field Operations Management System

## Setup Instructions

### 1. Install Dependencies

```bash
cd D:\CTC
npm install express uuid
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ctc_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 3. Setup Database

```bash
# Push schema to database
npx drizzle-kit push

# (Optional) View database UI
npx drizzle-kit studio
```

### 4. Start Server

```bash
npm start
```

Server will run at: `http://localhost:3000`

---

## Testing the API

### Authentication (First - Required for all endpoints)

**Register a new worker:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@example.com",
    "phone": "9876543210",
    "password": "SecurePassword123",
    "firstname": "John",
    "lastname": "Doe",
    "department": "Field Operations"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "worker-uuid",
    "token": "jwt-token-here",
    "worker": {
      "firstname": "John",
      "lastname": "Doe",
      "email": "worker@example.com"
    }
  }
}
```

Save the token for subsequent requests.

---

### 1. Test Analytics Dashboard

**Get complete dashboard overview:**

```bash
curl -X GET http://localhost:3000/api/analytics/dashboard/PROJECT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get task metrics:**

```bash
curl -X GET http://localhost:3000/api/analytics/tasks/PROJECT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get attendance statistics (last 30 days):**

```bash
curl -X GET "http://localhost:3000/api/analytics/attendance/PROJECT_UUID?startDate=2024-12-10&endDate=2025-01-10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Test Real-Time Location Tracking

**Update worker location (call periodically while checked in):**

```bash
curl -X POST http://localhost:3000/api/location/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "projectId": "PROJECT_UUID"
  }'
```

**Get all active workers on a project:**

```bash
curl -X GET http://localhost:3000/api/location/project/PROJECT_UUID/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validate check-in location (geofencing):**

```bash
curl -X POST http://localhost:3000/api/location/validate-checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "checkinLatitude": 40.7128,
    "checkinLongitude": -74.0060,
    "projectLatitude": 40.7150,
    "projectLongitude": -74.0050,
    "radiusKm": 0.5
  }'
```

**Get active worker count:**

```bash
curl -X GET http://localhost:3000/api/location/project/PROJECT_UUID/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Test Notifications

**Get your notifications:**

```bash
curl -X GET "http://localhost:3000/api/notifications?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get unread notification count:**

```bash
curl -X GET http://localhost:3000/api/notifications/count/unread \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Mark notification as read:**

```bash
curl -X PATCH http://localhost:3000/api/notifications/NOTIFICATION_UUID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create notification (admin only):**

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "workerId": "WORKER_UUID",
    "type": "TASK_ASSIGNMENT",
    "payload": {
      "message": "You have been assigned to Task X",
      "taskId": "TASK_UUID"
    }
  }'
```

**Broadcast notification to multiple workers:**

```bash
curl -X POST http://localhost:3000/api/notifications/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "workerIds": ["WORKER_UUID_1", "WORKER_UUID_2"],
    "type": "GENERAL",
    "payload": {
      "message": "System maintenance scheduled for tomorrow 2-4 PM"
    }
  }'
```

---

### 4. Test Data Export

**Export attendance as CSV:**

```bash
curl -X GET "http://localhost:3000/api/export/attendance/PROJECT_UUID?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > attendance.csv
```

**Export attendance summary as JSON:**

```bash
curl -X GET "http://localhost:3000/api/export/attendance-summary/PROJECT_UUID?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > attendance-summary.json
```

**Export tasks as CSV:**

```bash
curl -X GET http://localhost:3000/api/export/tasks/PROJECT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > tasks.csv
```

**Generate project report:**

```bash
curl -X GET http://localhost:3000/api/export/project/PROJECT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > project-report.json
```

---

## Architecture Overview

```
├── routes/              # API endpoints
│   ├── analytics.routes.js
│   ├── location.routes.js
│   ├── notification.routes.js
│   ├── export.routes.js
│   └── ... (other routes)
├── controllers/         # Business logic handlers
│   ├── analytics.controller.js
│   ├── location-tracking.controller.js
│   ├── notification.controller.js
│   ├── export.controller.js
│   └── ... (other controllers)
├── services/           # Data access & processing
│   ├── analytics.service.js
│   ├── location-tracking.service.js
│   ├── notification.service.js
│   ├── export.service.js
│   └── ... (other services)
├── models/            # Database schemas
├── auth/              # Authentication
├── middlewares/       # Global & route middlewares
└── app.js            # Express app configuration
```

---

## Key Features Overview

### 📊 Analytics Module

- Real-time dashboard with KPIs
- Worker performance metrics
- Project progress tracking
- Task completion rates
- Leave approval statistics

### 📍 Location Tracking

- Live worker location updates
- Active workers on project
- Geofencing validation
- Distance calculation

### 🔔 Notifications

- Create & broadcast notifications
- Read/unread tracking
- Type-specific templates
- Pagination support

### 📁 Data Export

- CSV exports for attendance/tasks
- JSON reports
- Summary dashboards
- Automatic formatting

---

## API Response Format

All endpoints follow this format:

**Success (2xx):**

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "pagination": {
    /* optional */
  }
}
```

**Error (4xx/5xx):**

```json
{
  "success": false,
  "message": "Error description",
  "details": {
    /* error details */
  }
}
```

---

## Common Issues & Solutions

| Issue                           | Solution                                              |
| ------------------------------- | ----------------------------------------------------- |
| `Cannot find package 'express'` | Run `npm install express uuid`                        |
| `Database connection failed`    | Check `DATABASE_URL` in `.env`                        |
| `JWT token invalid`             | Ensure token is not expired (12 hour expiration)      |
| `Cannot POST /api/analytics`    | Ensure JWT token is in Authorization header           |
| `Project not found`             | Verify `projectId` UUID format and exists in database |

---

## Next Steps

1. ✅ Backend API is ready
2. 🔄 Build frontend dashboard (React/Vue)
3. 🔄 Add WebSocket for real-time updates
4. 🔄 Deploy to cloud platform
5. 🔄 Add mobile app

---

## Support

- Check `API_DOCUMENTATION.md` for detailed endpoint documentation
- Check `IMPLEMENTATION_STATUS.md` for project status
- View code comments in service files for logic details

---

**Last Updated**: December 9, 2025
