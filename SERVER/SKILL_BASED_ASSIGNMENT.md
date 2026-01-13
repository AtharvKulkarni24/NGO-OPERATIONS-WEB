# Skill-Based Assignment System

## Overview

The skill-based assignment system allows automatic and manual assignment of managers to projects and workers to tasks based on their skills and the required skills for each project/task.

## Features

### 1. **Project Leader Assignment**

- System automatically matches managers to projects based on skills
- Projects can have required skills defined
- Managers are ranked by skill match score (0-100%)

### 2. **Worker Assignment to Tasks**

- Managers can find suitable workers for tasks based on required skills
- Workers are ranked by how well their skills match the task requirements
- Shows matched skills and missing skills for each candidate

### 3. **Team Composition Tracking**

- View all workers assigned to a project
- See project leader details
- Track team size and composition

## API Endpoints

### Find Suitable Managers

```http
GET /api/assignments/managers/suitable?requiredSkills=Recycling,Processing,Education
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "firstname": "Amit",
      "lastname": "Verma",
      "email": "amit@ecoforce.com",
      "role": "MANAGER",
      "department": "Recycling",
      "skills": [
        "Management",
        "Planning",
        "Recycling",
        "Processing",
        "Education"
      ],
      "matchScore": 100,
      "matchedSkills": ["Recycling", "Processing", "Education"],
      "missingSkills": []
    }
  ],
  "count": 3
}
```

### Assign Project Leader (Manual)

```http
POST /api/assignments/projects/:projectId/leader
Authorization: Bearer <token>
Content-Type: application/json

{
  "managerId": "manager-uuid"
}
```

### Auto-Assign Project Leader

```http
POST /api/assignments/projects/:projectId/auto-assign-leader
Authorization: Bearer <token>
```

Automatically assigns the best matching manager based on project's required skills.

### Find Suitable Workers

```http
GET /api/assignments/workers/suitable?projectId=project-uuid&requiredSkills=Sorting,Collection
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "firstname": "Priya",
      "lastname": "Sharma",
      "email": "priya@ecoforce.com",
      "role": "WORKER",
      "department": "Waste Collection",
      "skills": ["Sorting", "Collection", "Awareness"],
      "matchScore": 100,
      "matchedSkills": ["Sorting", "Collection"],
      "missingSkills": []
    }
  ],
  "count": 5
}
```

### Assign Workers to Task

```http
POST /api/assignments/tasks/:taskId/workers
Authorization: Bearer <token>
Content-Type: application/json

{
  "workerIds": ["worker-uuid-1", "worker-uuid-2"]
}
```

### Get Project Team Composition

```http
GET /api/assignments/projects/:projectId/team
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": {
    "id": "project-uuid",
    "name": "Downtown Hub Waste Collection",
    "requiredSkills": ["Collection", "Sorting", "Vehicle Operation"],
    "projectLeader": {
      "id": "manager-uuid",
      "name": "Priya Kapoor",
      "email": "priya.kapoor@ecoforce.com",
      "role": "MANAGER",
      "department": "Waste Collection",
      "skills": [
        "Management",
        "Collection",
        "Sorting",
        "Logistics",
        "Vehicle Operation"
      ]
    },
    "team": [
      {
        "workerId": "worker-uuid",
        "firstname": "Priya",
        "lastname": "Sharma",
        "email": "priya@ecoforce.com",
        "role": "WORKER",
        "department": "Waste Collection",
        "skills": ["Sorting", "Collection", "Awareness"]
      }
    ],
    "teamCount": 3
  }
}
```

## Database Schema Changes

### Projects Table

- `projectLeaderId` (uuid, nullable): References workers table
- `requiredSkills` (jsonb): Array of required skills

### Tasks Table

- `requiredSkills` (jsonb): Array of required skills for the task

### Workers Table (existing)

- `skills` (jsonb): Array of worker's skills

## Skill Matching Algorithm

The system calculates a **match score** (0-100%) based on:

```
Match Score = (Matched Skills / Required Skills) × 100
```

**Examples:**

- Worker has ["Sorting", "Collection"] and task needs ["Sorting", "Collection"] → **100% match**
- Worker has ["Sorting", "Collection", "Awareness"] and task needs ["Sorting"] → **100% match**
- Worker has ["Sorting"] and task needs ["Sorting", "Collection"] → **50% match**
- Worker has ["Awareness"] and task needs ["Sorting", "Collection"] → **0% match**

## Workflow

### 1. Create Project with Required Skills

```http
POST /api/projects
{
  "name": "New Recycling Project",
  "requiredSkills": ["Recycling", "Processing", "Education"]
}
```

### 2. Auto-Assign Project Leader

```http
POST /api/assignments/projects/{projectId}/auto-assign-leader
```

System finds the manager with the best skill match.

### 3. Manager Creates Tasks

```http
POST /api/tasks
{
  "projectId": "project-uuid",
  "title": "Material Sorting",
  "requiredSkills": ["Sorting", "Quality Control"]
}
```

### 4. Manager Finds Suitable Workers

```http
GET /api/assignments/workers/suitable?requiredSkills=Sorting,Quality Control
```

### 5. Manager Assigns Workers to Task

```http
POST /api/assignments/tasks/{taskId}/workers
{
  "workerIds": ["worker-uuid-1", "worker-uuid-2"]
}
```

## Seeded Data

The system includes:

- **17 Workers**: 12 field workers + 3 managers + 2 admins
- **4 Projects**: Each with required skills and assigned project leaders
- **5 Tasks**: Each with required skills

### Managers:

1. **Amit Verma** - Recycling specialist
   - Skills: Management, Planning, Recycling, Processing, Education
2. **Priya Kapoor** - Waste Collection specialist
   - Skills: Management, Collection, Sorting, Logistics, Vehicle Operation
3. **Rajesh Malhotra** - Awareness specialist
   - Skills: Management, Communication, Education, Event Management, Training

### Example Workers by Department:

- **Waste Collection**: Priya Sharma, Sunita Devi, Rajesh Kumar
- **Recycling**: Rahul Patel, Anita Deshmukh, Deepak Mehta
- **Awareness**: Kavita Reddy, Sanjay Rao, Neha Gupta
- **Operations**: Anil Joshi, Meera Iyer, Ravi Nair

## Frontend Integration Example

```javascript
// Find suitable workers for a task
const response = await apiClient.get("/api/assignments/workers/suitable", {
  params: {
    requiredSkills: "Sorting,Collection",
  },
});

// Show workers sorted by match score
response.data.data.forEach((worker) => {
  console.log(`${worker.firstname} ${worker.lastname}`);
  console.log(`Match: ${worker.matchScore}%`);
  console.log(`Matched Skills: ${worker.matchedSkills.join(", ")}`);
  console.log(`Missing Skills: ${worker.missingSkills.join(", ")}`);
});

// Assign selected workers
await apiClient.post(`/api/assignments/tasks/${taskId}/workers`, {
  workerIds: selectedWorkerIds,
});
```

## Testing

### Test Auto-Assignment

```bash
# Get a project ID
PROJECT_ID=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/projects | jq -r '.data[0].id')

# Auto-assign project leader
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/assignments/projects/$PROJECT_ID/auto-assign-leader
```

### Test Worker Search

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/assignments/workers/suitable?requiredSkills=Sorting,Collection"
```

## Notes

- Workers must have role "WORKER" or "VOLUNTEER" to be assigned to tasks
- Only "MANAGER" or "ADMIN" roles can be project leaders
- Skill matching is case-sensitive
- Empty required skills array means any worker/manager is suitable (100% match)
