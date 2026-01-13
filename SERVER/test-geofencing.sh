#!/bin/bash

# Enhanced Geofencing Test Script
# Tests all geofencing endpoints

BASE_URL="http://localhost:3000"
TOKEN="" # Set your JWT token here
PROJECT_ID="" # Set your project ID here

echo "🧪 Enhanced Geofencing Test Suite"
echo "=================================="
echo ""

# Test 1: Get current geofence configuration
echo "Test 1: Get Geofence Configuration"
curl -X GET "$BASE_URL/api/projects/$PROJECT_ID/geofence" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | json_pp
echo ""
echo ""

# Test 2: Update primary geofence
echo "Test 2: Update Primary Geofence"
curl -X PATCH "$BASE_URL/api/projects/$PROJECT_ID/geofence" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "geofenceRadiusKm": 0.5,
    "geofenceEnabled": true,
    "enforceGeofenceOnCheckIn": true,
    "alertOnGeofenceBreach": true
  }' \
  | json_pp
echo ""
echo ""

# Test 3: Add storage zone
echo "Test 3: Add Geofence Zone (Storage)"
curl -X POST "$BASE_URL/api/projects/$PROJECT_ID/geofence/zones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Equipment Storage",
    "latitude": 40.7140,
    "longitude": -74.0070,
    "radiusKm": 0.2,
    "type": "STORAGE"
  }' \
  | json_pp
echo ""
echo ""

# Test 4: Validate location (inside geofence)
echo "Test 4: Validate Location (Inside)"
curl -X POST "$BASE_URL/api/projects/$PROJECT_ID/geofence/validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7130,
    "longitude": -74.0062
  }' \
  | json_pp
echo ""
echo ""

# Test 5: Validate location (outside geofence)
echo "Test 5: Validate Location (Outside)"
curl -X POST "$BASE_URL/api/projects/$PROJECT_ID/geofence/validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7200,
    "longitude": -74.0100
  }' \
  | json_pp
echo ""
echo ""

# Test 6: Check worker position
echo "Test 6: Check Worker Position"
curl -X POST "$BASE_URL/api/projects/$PROJECT_ID/geofence/check-position" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7135,
    "longitude": -74.0065
  }' \
  | json_pp
echo ""
echo ""

# Test 7: Get geofence statistics
echo "Test 7: Get Geofence Statistics (Last 30 days)"
START_DATE=$(date -u -d '30 days ago' +"%Y-%m-%dT%H:%M:%S.000Z")
END_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.999Z")
curl -X GET "$BASE_URL/api/projects/$PROJECT_ID/geofence/statistics?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN" \
  | json_pp
echo ""
echo ""

# Test 8: Test check-in with geofence (inside)
echo "Test 8: Check-In Inside Geofence"
curl -X POST "$BASE_URL/api/attendance/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workerId": "your-worker-id",
    "projectId": "'$PROJECT_ID'",
    "checkInLat": 40.7130,
    "checkInLng": -74.0062
  }' \
  | json_pp
echo ""
echo ""

# Test 9: Test check-in with geofence (outside)
echo "Test 9: Check-In Outside Geofence (Should fail if enforced)"
curl -X POST "$BASE_URL/api/attendance/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workerId": "your-worker-id",
    "projectId": "'$PROJECT_ID'",
    "checkInLat": 40.7200,
    "checkInLng": -74.0100
  }' \
  | json_pp
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Notes:"
echo "- Update TOKEN and PROJECT_ID variables at the top of this script"
echo "- Adjust coordinates based on your actual project location"
echo "- Review test results above for any errors"
