# 🚀 Developer Cheat Sheet - Quick Reference

## Installation & Setup (Copy-Paste)

```bash
# 1. Install dependencies
npm install express uuid

# 2. Create .env file (copy this)
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/ctc_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
EOF

# 3. Setup database
npx drizzle-kit push

# 4. Start server
npm start
```

---

## Quick API Testing

### 1. Authenticate (Required First)

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "Test123!",
    "firstname": "John",
    "lastname": "Doe",
    "department": "Field Ops"
  }'

# Save the token from response: eyJhbGciOiJIUzI1NiIs...
TOKEN="YOUR_TOKEN_HERE"
```

### 2. Test Analytics

```bash
# Dashboard overview
curl -X GET http://localhost:3000/api/analytics/dashboard/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Task metrics
curl -X GET http://localhost:3000/api/analytics/tasks/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Worker performance
curl -X GET http://localhost:3000/api/analytics/worker/WORKER_ID/performance \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Location Tracking

```bash
# Update location
curl -X POST http://localhost:3000/api/location/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "projectId": "PROJECT_UUID"
  }'

# Get active workers
curl -X GET http://localhost:3000/api/location/project/PROJECT_UUID/active \
  -H "Authorization: Bearer $TOKEN"

# Validate geofence
curl -X POST http://localhost:3000/api/location/validate-checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "checkinLatitude": 40.7128,
    "checkinLongitude": -74.0060,
    "projectLatitude": 40.7150,
    "projectLongitude": -74.0050,
    "radiusKm": 0.5
  }'
```

### 4. Test Notifications

```bash
# Get notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# Mark as read
curl -X PATCH http://localhost:3000/api/notifications/NOTIF_ID/read \
  -H "Authorization: Bearer $TOKEN"

# Get unread count
curl -X GET http://localhost:3000/api/notifications/count/unread \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Test Export

```bash
# Export attendance CSV
curl -X GET "http://localhost:3000/api/export/attendance/PROJECT_ID?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $TOKEN" > attendance.csv

# Export project report JSON
curl -X GET http://localhost:3000/api/export/project/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" > project-report.json
```

---

## File Locations Quick Reference

```
Backend Code
├─ Analytics:       services/analytics.service.js
├─ Location:        services/location-tracking.service.js
├─ Notifications:   services/notification.service.js
├─ Export:          services/export.service.js
└─ Routes:          routes/*

Database
├─ Schema:          models/
└─ Connection:      db/index.js

Configuration
├─ Environment:     .env
├─ Main app:        app.js
└─ Package deps:    package.json

Documentation
├─ API Docs:        API_DOCUMENTATION.md
├─ Architecture:    ARCHITECTURE.md
├─ Quick Start:     QUICK_START.md
└─ Overview:        PROJECT_OVERVIEW.md
```

---

## Database Commands

```bash
# View database UI
npx drizzle-kit studio

# Generate migrations
npx drizzle-kit generate:pg

# Push schema to database
npx drizzle-kit push

# Drop all tables (⚠️ DANGEROUS)
npx drizzle-kit drop
```

---

## Common Error Solutions

| Error                        | Solution                                         |
| ---------------------------- | ------------------------------------------------ |
| Cannot find module 'express' | `npm install express uuid`                       |
| DATABASE_URL not set         | Check .env file exists                           |
| JWT token invalid            | Token may be expired or malformed                |
| Rate limit exceeded          | Wait 15 minutes                                  |
| Project not found            | Verify UUID format: `xxxxx-xxxx-xxxx-xxxx-xxxxx` |
| CORS error                   | Check CORS_ORIGIN in .env                        |
| Connection refused           | Is PostgreSQL running?                           |

---

## Code Patterns

### Creating a New Service Function

```javascript
// services/my.service.js
export const myService = {
  myFunction: async (id) => {
    const result = await db.select().from(myTable).where(eq(myTable.id, id));

    return result[0];
  },
};
```

### Creating a New Controller Endpoint

```javascript
// controllers/my.controller.js
export const myController = {
  getMyData: async (req, res, next) => {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const data = await myService.myFunction(id);

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
```

### Creating a New Route

```javascript
// routes/my.routes.js
import { Router } from "express";
import { myController } from "../controllers/my.controller.js";
import { auth } from "../auth/middleware.js";

const router = Router();
router.use(auth);

router.get("/:id", myController.getMyData);

export default router;
```

### Registering in App

```javascript
// app.js
import myRoutes from "./routes/my.routes.js";
app.use("/api/my", myRoutes);
```

---

## Validation Patterns (Zod)

```javascript
// Simple validation
const schema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
});

// With optional fields
const schema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

// With enums
const schema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

// With custom messages
const schema = z.object({
  email: z.string().email("Invalid email address"),
});

// Parsing in controller
const validated = schema.parse(req.body);
```

---

## Database Query Patterns

```javascript
// SELECT all
const all = await db.select().from(table);

// SELECT with WHERE
const filtered = await db
  .select()
  .from(table)
  .where(eq(table.status, "ACTIVE"));

// SELECT with JOIN
const joined = await db
  .select()
  .from(table1)
  .leftJoin(table2, eq(table1.id, table2.table1Id));

// SELECT with multiple conditions
const complex = await db
  .select()
  .from(table)
  .where(
    and(
      eq(table.status, "ACTIVE"),
      gte(table.createdAt, startDate),
      lte(table.createdAt, endDate)
    )
  );

// INSERT
await db.insert(table).values({ name: "John" });

// UPDATE
await db.update(table).set({ status: "INACTIVE" }).where(eq(table.id, id));

// DELETE
await db.delete(table).where(eq(table.id, id));

// COUNT
const count = await db.select({ count: sql`COUNT(*)` }).from(table);

// GROUP BY
const grouped = await db
  .select({
    status: table.status,
    count: sql`COUNT(*)`,
  })
  .from(table)
  .groupBy(table.status);
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=12h

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Optional
LOG_LEVEL=debug
CACHE_REDIS_URL=redis://localhost:6379
```

---

## Response Format Standard

```javascript
// Success (200, 201)
{
  "success": true,
  "data": { /* response object */ },
  "pagination": { "limit": 20, "offset": 0 } // optional
}

// Error (400, 401, 404, 500)
{
  "success": false,
  "message": "Human-readable error message",
  "details": {
    "field": "Specific validation error"
  },
  "statusCode": 400
}
```

---

## HTTP Methods Quick Reference

| Method | Purpose                 | Example                        |
| ------ | ----------------------- | ------------------------------ |
| GET    | Retrieve data           | `/api/analytics/dashboard/:id` |
| POST   | Create data             | `/api/notifications`           |
| PATCH  | Update specific fields  | `/api/notifications/:id/read`  |
| PUT    | Replace entire resource | `/api/workers/:id`             |
| DELETE | Remove data             | `/api/notifications/:id`       |

---

## Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Parts:
- "Bearer " (literal string with space)
- Token (from login response)
```

---

## Console Debugging

```javascript
// Log with timestamp
console.log(`[${new Date().toISOString()}] Message`);

// Log object with formatting
console.log(JSON.stringify(obj, null, 2));

// Log error with stack
console.error("Error:", error.message, error.stack);

// Conditional logging
if (process.env.LOG_LEVEL === "debug") {
  console.log("Debug info:", data);
}
```

---

## Performance Tips

```javascript
// ✅ Good - Single query with join
const data = await db
  .select()
  .from(attendance)
  .leftJoin(workers, eq(attendance.workerId, workers.id))
  .where(eq(attendance.projectId, projectId));

// ❌ Bad - Multiple queries (N+1)
const attendances = await db.select().from(attendance);
for (const att of attendances) {
  const worker = await db
    .select()
    .from(workers)
    .where(eq(workers.id, att.workerId));
}

// ✅ Good - Aggregate at database
const stats = await db
  .select({
    count: sql`COUNT(*)`,
    avg: sql`AVG(duration)`,
  })
  .from(attendance);

// ❌ Bad - Process in JavaScript
const attendances = await db.select().from(attendance);
const avg =
  attendances.reduce((a, b) => a + b.duration, 0) / attendances.length;
```

---

## Useful npm Scripts

```bash
# Add to package.json scripts
npm run start      # Start development server
npm run test       # Run tests (if configured)
npm run build      # Build for production (if configured)
npm run lint       # Lint code (if configured)
npm run dev        # Watch mode (if configured)

# Or run directly
npm start
npx drizzle-kit push
npx drizzle-kit studio
```

---

## Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Add analytics endpoints"

# Push
git push origin main

# Create branch
git checkout -b feature/my-feature

# Merge
git checkout main
git merge feature/my-feature
```

---

## Deployment Checklist

- [ ] All dependencies installed
- [ ] .env file created with production values
- [ ] Database migrated
- [ ] API tested locally
- [ ] Error handling verified
- [ ] Security headers checked
- [ ] Rate limiting verified
- [ ] CORS configured
- [ ] JWT secret changed
- [ ] Logging setup
- [ ] Database backed up
- [ ] Documentation updated

---

## Useful Links

- Node.js: https://nodejs.org
- Express: https://expressjs.com
- PostgreSQL: https://postgresql.org
- Drizzle ORM: https://orm.drizzle.team
- Zod: https://zod.dev
- JWT: https://jwt.io

---

## Quick Terminal Commands

```bash
# Directory listing
ls -la                          # List files with details
cd path/to/directory            # Change directory
pwd                             # Print working directory
mkdir new-folder                # Create folder
rm file.txt                     # Remove file
rm -rf folder                   # Remove folder (recursive)

# File operations
cat file.txt                    # View file contents
touch file.txt                  # Create empty file
echo "text" > file.txt         # Write to file
grep "search" file.txt         # Search in file

# Git
git status                      # Check status
git add .                       # Stage all changes
git commit -m "message"        # Commit changes
git push                        # Push to remote
git pull                        # Pull from remote
```

---

## REST API Best Practices

```javascript
// ✅ Good
GET    /api/workers
GET    /api/workers/:id
POST   /api/workers
PATCH  /api/workers/:id
DELETE /api/workers/:id

// ❌ Avoid
GET    /api/get-workers
POST   /api/create-worker
PUT    /api/update-worker/:id
GET    /api/deleteWorker/:id
```

---

## Rate Limiting Info

```
General endpoints:  100 requests per 15 minutes
Auth endpoints:     5 requests per 15 minutes

Headers checked:
- X-Forwarded-For (proxy support)
- Authorization (token-based if needed)

Returns on limit:
- Status: 429
- Message: "Too many requests, please try later"
```

---

## Common UUID Format

```
Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Example: 550e8400-e29b-41d4-a716-446655440000
Length: 36 characters (with hyphens)

Validation:
- Exactly 36 characters
- 8-4-4-4-12 character groups
- Lowercase letters and numbers
```

---

**Version**: 1.0
**Last Updated**: December 9, 2025
**Keep this handy while developing!** 📝
