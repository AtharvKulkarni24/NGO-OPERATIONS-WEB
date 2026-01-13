# Enhanced Geofencing Implementation Guide

## 🎯 Overview

The enhanced geofencing system provides comprehensive location-based validation and monitoring for field operations. It includes:

- **Primary Project Geofence**: Main project location with configurable radius
- **Multiple Geofence Zones**: Support for parking, storage, office, and secondary zones
- **Check-In Validation**: Automatic location validation during attendance check-in
- **Boundary Crossing Alerts**: Real-time notifications when workers enter/exit zones
- **Flexible Enforcement**: Toggle between strict enforcement and warning-only modes

---

## 🗄️ Database Schema Updates

### Projects Table - New Geofence Fields

```javascript
{
  // Primary geofence coordinates
  latitude: DOUBLE PRECISION,
  longitude: DOUBLE PRECISION,
  geofenceRadiusKm: DOUBLE PRECISION DEFAULT 0.5,

  // Geofence policies
  geofenceEnabled: BOOLEAN DEFAULT true,
  enforceGeofenceOnCheckIn: BOOLEAN DEFAULT true,
  alertOnGeofenceBreach: BOOLEAN DEFAULT true,

  // Additional zones (JSON array)
  geofenceZones: JSONB
}
```

### Migration Command

```bash
# Push schema changes to database
npx drizzle-kit push

# Or generate migration
npx drizzle-kit generate:pg
```

---

## 📡 API Endpoints

### 1. Get Project Geofence Configuration

```http
GET /api/projects/:projectId/geofence
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "projectName": "Clean City Initiative",
    "location": "Downtown Area",
    "primaryGeofence": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "radiusKm": 0.5,
      "enabled": true
    },
    "additionalZones": [
      {
        "id": "zone-123",
        "name": "Equipment Storage",
        "latitude": 40.714,
        "longitude": -74.007,
        "radiusKm": 0.2,
        "type": "STORAGE",
        "active": true
      }
    ],
    "policies": {
      "enforceOnCheckIn": true,
      "alertOnBreach": true
    },
    "totalZones": 2
  }
}
```

---

### 2. Update Project Primary Geofence

```http
PATCH /api/projects/:projectId/geofence
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.006,
  "geofenceRadiusKm": 0.5,
  "geofenceEnabled": true,
  "enforceGeofenceOnCheckIn": true,
  "alertOnGeofenceBreach": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Geofence configuration updated",
  "data": {
    "id": "project-uuid",
    "name": "Clean City Initiative",
    "geofence": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "radiusKm": 0.5,
      "enabled": true,
      "enforceOnCheckIn": true,
      "alertOnBreach": true
    }
  }
}
```

---

### 3. Add Geofence Zone

```http
POST /api/projects/:projectId/geofence/zones
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Equipment Storage",
  "latitude": 40.714,
  "longitude": -74.007,
  "radiusKm": 0.2,
  "type": "STORAGE"
}
```

**Zone Types:**

- `SECONDARY` - Additional work area
- `PARKING` - Parking area
- `STORAGE` - Equipment storage
- `OFFICE` - Site office

**Response:**

```json
{
  "success": true,
  "message": "Geofence zone added",
  "data": {
    "zone": {
      "id": "zone-1702834567-abc123",
      "name": "Equipment Storage",
      "latitude": 40.714,
      "longitude": -74.007,
      "radiusKm": 0.2,
      "type": "STORAGE",
      "createdAt": "2025-12-15T10:30:00.000Z",
      "active": true
    },
    "totalZones": 2
  }
}
```

---

### 4. Remove Geofence Zone

```http
DELETE /api/projects/:projectId/geofence/zones/:zoneId
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Geofence zone removed",
  "data": {
    "remainingZones": 1
  }
}
```

---

### 5. Validate Location

```http
POST /api/projects/:projectId/geofence/validate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "latitude": 40.7135,
  "longitude": -74.0065
}
```

**Response (Inside Geofence):**

```json
{
  "success": true,
  "data": {
    "allowed": true,
    "reason": "Within primary project geofence",
    "zone": "PRIMARY",
    "isInside": true,
    "distanceKm": 0.125,
    "distanceMeters": 125
  }
}
```

**Response (Outside Geofence):**

```json
{
  "success": true,
  "data": {
    "allowed": false,
    "reason": "Outside all project geofence zones",
    "enforced": true,
    "nearestZone": {
      "zoneName": "Primary Zone",
      "distanceKm": "0.875",
      "distanceMeters": 875
    },
    "suggestion": "Move 0.875km closer to Primary Zone"
  }
}
```

---

### 6. Check Worker Position

```http
POST /api/projects/:projectId/geofence/check-position
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "latitude": 40.7135,
  "longitude": -74.0065
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "projectName": "Clean City Initiative",
    "workerLocation": {
      "latitude": 40.7135,
      "longitude": -74.0065
    },
    "isInside": true,
    "matchedZones": [
      {
        "zoneId": "primary",
        "zoneName": "Clean City Initiative (Primary)",
        "zoneType": "PRIMARY",
        "isInside": true,
        "distanceKm": 0.125,
        "distanceMeters": 125
      }
    ],
    "closestZone": {
      "zoneId": "primary",
      "zoneName": "Clean City Initiative (Primary)",
      "distanceKm": 0.125
    },
    "totalZones": 2
  }
}
```

---

### 7. Get Geofence Statistics

```http
GET /api/projects/:projectId/geofence/statistics
    ?startDate=2025-12-01T00:00:00.000Z
    &endDate=2025-12-15T23:59:59.999Z
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalAlerts": 45,
    "exitEvents": 23,
    "entryEvents": 20,
    "deniedCheckIns": 2,
    "dateRange": {
      "start": "2025-12-01T00:00:00.000Z",
      "end": "2025-12-15T23:59:59.999Z"
    }
  }
}
```

---

## 🚀 Enhanced Check-In Flow

### Old Check-In (No Geofence Validation)

```http
POST /api/attendance/checkin
{
  "workerId": "uuid",
  "projectId": "uuid",
  "checkInLat": 40.7135,
  "checkInLng": -74.0065
}
```

### New Check-In (With Geofence Validation)

**Successful Check-In Inside Geofence:**

```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "id": "attendance-uuid",
    "workerId": "uuid",
    "projectId": "uuid",
    "checkInAt": "2025-12-15T08:00:00.000Z"
  },
  "geofenceValidation": {
    "allowed": true,
    "reason": "Within primary project geofence",
    "zone": "PRIMARY",
    "distanceKm": 0.125
  }
}
```

**Check-In Denied (Strict Enforcement):**

```json
{
  "success": false,
  "error": "Check-in location outside project geofence",
  "geofenceValidation": {
    "allowed": false,
    "reason": "Outside all project geofence zones",
    "enforced": true,
    "nearestZone": {
      "zoneName": "Primary Zone",
      "distanceKm": "0.875",
      "distanceMeters": 875
    },
    "suggestion": "Move 0.875km closer to Primary Zone"
  },
  "details": {
    "allowed": false,
    "reason": "Outside all project geofence zones",
    "nearestZone": {...},
    "suggestion": "Move 0.875km closer to Primary Zone"
  }
}
```

**Check-In Warning (Non-Enforced):**

```json
{
  "success": true,
  "message": "Check-in successful but outside geofence (warning only)",
  "data": {...},
  "geofenceValidation": {
    "allowed": false,
    "reason": "Outside all project geofence zones",
    "enforced": false,
    "nearestZone": {...}
  }
}
```

---

## 🔔 Geofence Alerts

### Boundary Crossing Notifications

Workers receive automatic notifications when crossing geofence boundaries:

**Exit Alert (High Priority):**

```json
{
  "type": "GEOFENCE_ALERT",
  "title": "🚨 Geofence Exit Alert",
  "message": "John Doe has exited Clean City Initiative (Primary). Distance: 0.6km",
  "payload": {
    "eventType": "EXIT",
    "zoneName": "Clean City Initiative (Primary)",
    "zoneId": "primary",
    "previousDistance": 0.3,
    "currentDistance": 0.6,
    "projectId": "uuid",
    "projectName": "Clean City Initiative",
    "severity": "HIGH",
    "timestamp": "2025-12-15T14:30:00.000Z"
  }
}
```

**Entry Alert (Info):**

```json
{
  "type": "GEOFENCE_ALERT",
  "title": "✅ Geofence Entry Confirmed",
  "message": "John Doe has entered Equipment Storage",
  "payload": {
    "eventType": "ENTRY",
    "zoneName": "Equipment Storage",
    "zoneId": "zone-123",
    "previousDistance": 0.3,
    "currentDistance": 0.15,
    "severity": "INFO"
  }
}
```

### Alert Cooldown

- Duplicate alerts are suppressed for **5 minutes**
- Prevents notification spam from GPS jitter
- Tracked per worker-zone-event combination

---

## 💡 Usage Examples

### Example 1: Configure New Project with Geofence

```bash
# 1. Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Cleanup",
    "location": "Downtown District",
    "startDate": "2025-12-15",
    "status": "ACTIVE"
  }'

# 2. Set primary geofence
curl -X PATCH http://localhost:3000/api/projects/PROJECT_ID/geofence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "geofenceRadiusKm": 0.5,
    "geofenceEnabled": true,
    "enforceGeofenceOnCheckIn": true,
    "alertOnGeofenceBreach": true
  }'

# 3. Add storage zone
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/geofence/zones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Equipment Storage",
    "latitude": 40.7140,
    "longitude": -74.0070,
    "radiusKm": 0.2,
    "type": "STORAGE"
  }'
```

---

### Example 2: Worker Check-In with Geofence

```bash
# Worker attempts check-in
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workerId": "WORKER_ID",
    "projectId": "PROJECT_ID",
    "checkInLat": 40.7135,
    "checkInLng": -74.0065
  }'

# System automatically:
# 1. Validates location against all project zones
# 2. Allows or denies check-in based on enforcement policy
# 3. Returns detailed validation results
```

---

### Example 3: Real-Time Location with Boundary Monitoring

```bash
# Worker updates location (every 30 seconds)
curl -X POST http://localhost:3000/api/location/update \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7150,
    "longitude": -74.0080,
    "projectId": "PROJECT_ID"
  }'

# System automatically:
# 1. Compares with previous location
# 2. Detects boundary crossings (entry/exit)
# 3. Generates alerts for managers
# 4. Sends notifications to worker
```

---

## ⚙️ Configuration Options

### Geofence Policies

| Policy                     | Default | Description                           |
| -------------------------- | ------- | ------------------------------------- |
| `geofenceEnabled`          | `true`  | Enable/disable all geofence features  |
| `enforceGeofenceOnCheckIn` | `true`  | Block check-ins outside geofence      |
| `alertOnGeofenceBreach`    | `true`  | Send alerts on boundary crossings     |
| `geofenceRadiusKm`         | `0.5`   | Primary geofence radius in kilometers |

### Enforcement Modes

**Strict Mode** (`enforceGeofenceOnCheckIn: true`):

- Check-ins outside geofence are **blocked**
- Returns HTTP 403 with detailed error
- Worker must move inside geofence to check-in

**Warning Mode** (`enforceGeofenceOnCheckIn: false`):

- Check-ins outside geofence are **allowed**
- Returns validation warning in response
- Useful for transitional periods

**Disabled** (`geofenceEnabled: false`):

- All geofence checks skipped
- Legacy behavior maintained

---

## 🔍 Monitoring & Analytics

### View Geofence Statistics

```bash
curl -X GET "http://localhost:3000/api/projects/PROJECT_ID/geofence/statistics?startDate=2025-12-01&endDate=2025-12-15" \
  -H "Authorization: Bearer $TOKEN"
```

### Check Worker Position

```bash
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/geofence/check-position \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7135,
    "longitude": -74.0065
  }'
```

---

## 🐛 Troubleshooting

### Check-In Fails with "Outside geofence"

1. **Verify project has geofence configured:**

   ```bash
   GET /api/projects/:projectId/geofence
   ```

2. **Check worker's distance from zone:**

   ```bash
   POST /api/projects/:projectId/geofence/validate
   ```

3. **Options to resolve:**
   - Increase `geofenceRadiusKm`
   - Add additional zones
   - Temporarily disable enforcement
   - Worker moves closer to site

### No Boundary Alerts Generated

1. **Check alert policy:**

   - Ensure `alertOnGeofenceBreach: true`

2. **Verify location updates:**

   - Worker must send location updates
   - Needs previous location to detect crossings

3. **Check alert cooldown:**
   - Duplicate alerts suppressed for 5 minutes

---

## 🚀 Best Practices

1. **Start with Warning Mode**

   - Set `enforceGeofenceOnCheckIn: false` initially
   - Monitor false positives
   - Switch to strict mode after validation

2. **Use Appropriate Radius**

   - Urban areas: 0.3 - 0.5 km
   - Rural areas: 0.5 - 1.0 km
   - Account for GPS accuracy (~10-50m)

3. **Multiple Zones for Complex Sites**

   - Primary zone for main work area
   - Storage zone for equipment
   - Parking zone for vehicles
   - Office zone for admin tasks

4. **Monitor Statistics Regularly**
   - Track denied check-ins
   - Identify problem areas
   - Adjust boundaries as needed

---

## 📊 Database Maintenance

### Update Existing Projects

```sql
-- Add geofence to existing project
UPDATE projects
SET
  latitude = 40.7128,
  longitude = -74.0060,
  geofence_radius_km = 0.5,
  geofence_enabled = true,
  enforce_geofence_on_checkin = true,
  alert_on_geofence_breach = true
WHERE id = 'project-uuid';
```

### Query Geofence Violations

```sql
-- Find check-ins outside geofence (if logged)
SELECT * FROM attendance
WHERE geofence_validation::json->>'allowed' = 'false'
ORDER BY check_in_at DESC;
```

---

## 🎓 Summary

The enhanced geofencing system provides:

✅ **Flexible Configuration** - Primary + multiple zones
✅ **Automatic Validation** - Check-in location verification  
✅ **Real-Time Alerts** - Boundary crossing notifications
✅ **Enforcement Options** - Strict, warning, or disabled
✅ **Comprehensive API** - Full CRUD for geofences
✅ **Analytics** - Breach statistics and monitoring

**Next Steps:**

1. Run database migrations
2. Configure project geofences
3. Test with workers in the field
4. Monitor alerts and adjust boundaries
5. Enable strict enforcement when ready
