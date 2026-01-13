# System Architecture - Field Operations Management System

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web Dashboard│  │  Mobile App  │  │  Field App   │      │
│  │   (React)    │  │   (RN/Dart)  │  │  (Workers)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│            API GATEWAY / LOAD BALANCER                       │
│                    (Express.js)                              │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  REST API    │  │  WebSocket   │  │   Auth       │
│  Endpoints   │  │  Server      │  │   Service    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   SERVICE LAYER          │  │   CACHING LAYER          │
├──────────────────────────┤  ├──────────────────────────┤
│ • Analytics Service      │  │ • Redis Cache            │
│ • Location Tracking      │  │ • Session Cache          │
│ • Notification Service   │  │ • Query Cache            │
│ • Export Service         │  │ • Active Workers Cache   │
│ • Attendance Service     │  └──────────────────────────┘
│ • Task Service           │
│ • Leave Service          │
│ • Project Service        │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   DATA ACCESS LAYER      │
├──────────────────────────┤
│ Drizzle ORM              │
│ • Attendance Model       │
│ • Worker Model           │
│ • Task Model             │
│ • Project Model          │
│ • Leave Request Model    │
│ • Notification Model     │
│ • Daily Report Model     │
│ • Event Model            │
│ • Inventory Model        │
│ • Shift Model            │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   DATABASE LAYER         │
├──────────────────────────┤
│ PostgreSQL               │
│ • Persistent storage     │
│ • ACID transactions      │
│ • JSON columns (JSONB)   │
└──────────────────────────┘
```

---

## Request Flow Diagram

```
CLIENT REQUEST
      │
      ▼
┌─────────────────────┐
│ MIDDLEWARE LAYER    │
├─────────────────────┤
│ • CORS Handler      │
│ • Request Logger    │
│ • Rate Limiter      │
│ • Auth Middleware   │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ ROUTE HANDLER       │
├─────────────────────┤
│ /api/analytics/*    │
│ /api/location/*     │
│ /api/notifications/*│
│ /api/export/*       │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ CONTROLLER          │
├─────────────────────┤
│ • Input Validation  │
│ • Zod Schema        │
│ • Business Logic    │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ SERVICE             │
├─────────────────────┤
│ • Data Processing   │
│ • Database Queries  │
│ • Calculations      │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ DATABASE            │
├─────────────────────┤
│ • Query Execution   │
│ • Transaction Mgmt  │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ JSON RESPONSE       │
├─────────────────────┤
│ {                   │
│   success: boolean  │
│   data: object      │
│ }                   │
└─────────────────────┘
      │
      ▼
CLIENT
```

---

## Module Architecture

### Analytics Module

```
┌─────────────────────────────────────┐
│  ANALYTICS MODULE                   │
├─────────────────────────────────────┤
│ routes/analytics.routes.js          │
│        ↓                             │
│ controllers/analytics.controller.js │
│        ↓                             │
│ services/analytics.service.js       │
│        ↓                             │
│ DATABASE QUERIES                    │
│ • Attendance stats                  │
│ • Task completion rates             │
│ • Leave statistics                  │
│ • Project progress                  │
│ • Worker performance                │
└─────────────────────────────────────┘
```

### Location Tracking Module

```
┌──────────────────────────────────────┐
│  LOCATION TRACKING MODULE            │
├──────────────────────────────────────┤
│ routes/location.routes.js            │
│        ↓                              │
│ controllers/location-tracking...     │
│        ↓                              │
│ services/location-tracking...        │
│        ↓                              │
│ ACTIVE WORKERS MAP (In-Memory)       │
│ • Real-time locations                │
│ • Last update timestamp              │
│ • Geofence validation                │
│ • Distance calculations              │
└──────────────────────────────────────┘
```

### Notification Module

```
┌────────────────────────────────────┐
│  NOTIFICATION MODULE               │
├────────────────────────────────────┤
│ routes/notification.routes.js      │
│        ↓                            │
│ controllers/notification...        │
│        ↓                            │
│ services/notification.service.js   │
│        ↓                            │
│ DATABASE - Notifications Table     │
│ • Message storage                  │
│ • Read/unread tracking             │
│ • Worker-specific routing          │
│ • Broadcast support                │
│        ↓                            │
│ DELIVERY CHANNELS (Future)         │
│ • Email (SendGrid)                 │
│ • SMS (Twilio)                     │
│ • Push (Firebase)                  │
└────────────────────────────────────┘
```

### Export Module

```
┌────────────────────────────────────┐
│  EXPORT MODULE                     │
├────────────────────────────────────┤
│ routes/export.routes.js            │
│        ↓                            │
│ controllers/export.controller.js   │
│        ↓                            │
│ services/export.service.js         │
│        ↓                            │
│ DATA FORMATTERS                    │
│ • CSV Converter                    │
│ • JSON Generator                   │
│ • Summary Builder                  │
│        ↓                            │
│ FILE RESPONSE                      │
│ • HTTP Headers                     │
│ • Download Headers                 │
│ • Content-Type                     │
└────────────────────────────────────┘
```

---

## Data Flow - Attendance Tracking

```
WORKER                          SYSTEM
   │                               │
   ├──── Check-In (GPS) ──────────→│
   │                               ├─→ attendance.checkinTime
   │                               ├─→ attendance.checkinLat
   │                               ├─→ attendance.checkinLon
   │                               ├─→ validate geofence
   │                               ├─→ create record
   │                               │
   ├─ Location Update ────────────→│
   │ (every 30s)                   ├─→ locationTrackingService
   │                               ├─→ update activeWorkers map
   │                               │
   ├─ Still Active ────────────────│
   │                               │
   ├──── Check-Out (GPS) ─────────→│
   │                               ├─→ attendance.checkoutTime
   │                               ├─→ attendance.checkoutLat
   │                               ├─→ attendance.checkoutLon
   │                               ├─→ calculate duration
   │                               ├─→ mark inactive
   │                               │
   ├─ View Analytics ──────────────│
   │                               ├─→ analyticsService
   │                               ├─→ aggregate stats
   │                               └─→ return KPIs
```

---

## Database Schema Relationships

```
WORKERS (1)
    │
    ├─→ (Many) ATTENDANCE
    │
    ├─→ (Many) TASKS (via task_assignments)
    │
    ├─→ (Many) LEAVE_REQUESTS
    │
    ├─→ (Many) NOTIFICATIONS
    │
    └─→ (Many) DAILY_REPORTS

PROJECTS (1)
    │
    ├─→ (Many) ATTENDANCE
    │
    ├─→ (Many) TASKS
    │
    ├─→ (Many) EVENTS
    │
    ├─→ (Many) SHIFTS
    │
    ├─→ (Many) DAILY_REPORTS
    │
    └─→ (Many) INVENTORY

TASKS (1)
    │
    └─→ (Many) TASK_UPDATES
        (progress tracking)

TASKS (1)
    │
    └─→ (Many) TASK_ASSIGNMENTS
        (workers assigned to task)
```

---

## Real-Time Location System Architecture

```
FIELD WORKERS
    │
    ├─→ Send location every 30s
    │       │
    │       └─→ POST /api/location/update
    │
LOCATION TRACKING SERVICE
    │
    ├─→ Update activeWorkers Map
    │   (in-memory, key: workerId-projectId)
    │
    ├─→ Store: {
    │   workerId: uuid,
    │   projectId: uuid,
    │   latitude: number,
    │   longitude: number,
    │   lastUpdated: timestamp,
    │   isActive: boolean
    │ }
    │
DASHBOARD
    │
    ├─→ Poll /api/location/project/:id/active
    │   (every 10s for updates)
    │
    ├─→ Render on map:
    │   • Worker markers
    │   • Project boundaries (geofence)
    │   • Connection lines to tasks
    │   • Inactive badge
    │
ADMIN VIEW
    │
    └─→ See all active workers in real-time
        • Count per project
        • Last update time
        • Geofence violations
```

---

## Security Architecture

```
REQUEST
    │
    ▼
┌──────────────────────────────┐
│ RATE LIMITING                │
│ • 100 req/15min (general)    │
│ • 5 req/15min (auth)         │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ CORS VALIDATION              │
│ • Check origin               │
│ • Allow credentials          │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ JWT AUTHENTICATION           │
│ • Parse token                │
│ • Verify signature           │
│ • Check expiration (12h)     │
│ • Extract workerId & role    │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ AUTHORIZATION                │
│ • Check role permissions     │
│ • Verify resource ownership  │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ INPUT VALIDATION             │
│ • Zod schema parsing         │
│ • Type checking              │
│ • Range validation           │
│ • Format validation          │
└──────────────────────────────┘
    │
    ▼
PROCESS REQUEST
```

---

## Deployment Architecture (Recommended)

```
┌─────────────────────────────────────────────────┐
│          CDN (CloudFlare)                       │
└─────────────────────────────────────────────────┘
    │                           │
    ▼                           ▼
┌──────────────────┐  ┌──────────────────────┐
│ Static Assets    │  │ API Requests         │
│ (React Build)    │  │ (Express Backend)    │
│ Vercel/Netlify   │  │ Railway/Render       │
└──────────────────┘  └──────────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  PostgreSQL DB   │
                    │  (Managed)       │
                    │  AWS RDS/Neon    │
                    └──────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  Redis Cache     │
                    │  (Optional)      │
                    └──────────────────┘
```

---

## Performance Optimization Strategy

```
REQUEST OPTIMIZATION
├─ Query Optimization
│  └─ Database indexes on frequently filtered columns
│
├─ Caching Strategy
│  ├─ In-memory cache for active workers
│  ├─ Redis for session data
│  └─ Client-side cache for static data
│
├─ Pagination
│  ├─ Limit list endpoints to 50 items
│  └─ Offset-based pagination
│
└─ Compression
   └─ GZIP compression on responses
```

---

## Error Handling Flow

```
ERROR OCCURS
    │
    ▼
┌────────────────────────┐
│ Error Type?            │
├────────────────────────┤
│ • Validation Error     │
│ • Database Error       │
│ • Auth Error           │
│ • Server Error         │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│ Format Error Response  │
├────────────────────────┤
│ {                      │
│   success: false,      │
│   message: "Error",    │
│   statusCode: 4xx/5xx  │
│   details: { ... }     │
│ }                      │
└────────────────────────┘
    │
    ▼
┌────────────────────────┐
│ Log Error              │
├────────────────────────┤
│ • Stack trace          │
│ • Request details      │
│ • User info            │
└────────────────────────┘
    │
    ▼
RETURN ERROR RESPONSE
```

---

## Scalability Roadmap

```
PHASE 1 (Current - MVP)
├─ Single server deployment
├─ PostgreSQL main database
├─ In-memory active workers cache
└─ Basic monitoring

PHASE 2 (Growth)
├─ Redis for caching
├─ Load balancer (Nginx)
├─ Multiple app servers
├─ Database replication
└─ Enhanced monitoring

PHASE 3 (Scale)
├─ Microservices architecture
├─ Message queue (RabbitMQ/Kafka)
├─ Elasticsearch for search
├─ Distributed tracing
└─ Auto-scaling
```

---

**Architecture Design**: Event-driven, Service-oriented
**Database**: Relational (PostgreSQL)
**Caching**: In-memory + Redis (optional)
**Authentication**: JWT with role-based access
**Rate Limiting**: Token bucket algorithm
**Error Handling**: Centralized global handler
