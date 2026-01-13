import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import {
  workersTable,
  projectsTable,
  tasksTable,
  taskAssignmentsTable,
  taskUpdatesTable,
  attendanceTable,
  shiftsTable,
  leaveRequestsTable,
  dailyReportsTable,
  reportItemsTable,
  eventsTable,
  inventoryTable,
  inventoryLogsTable,
  notificationsTable,
} from "./models/index.js";

const SALT_ROUNDS = 10;

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");

  try {
    await notificationsTable.deleteMany({});
    console.log("   ✓ Cleared notifications");

    await inventoryLogsTable.deleteMany({});
    console.log("   ✓ Cleared inventory logs");

    await inventoryTable.deleteMany({});
    console.log("   ✓ Cleared inventory");

    await eventsTable.deleteMany({});
    console.log("   ✓ Cleared events");

    await reportItemsTable.deleteMany({});
    console.log("   ✓ Cleared report items");

    await dailyReportsTable.deleteMany({});
    console.log("   ✓ Cleared daily reports");

    await leaveRequestsTable.deleteMany({});
    console.log("   ✓ Cleared leave requests");

    await attendanceTable.deleteMany({});
    console.log("   ✓ Cleared attendance");

    await shiftsTable.deleteMany({});
    console.log("   ✓ Cleared shifts");

    await taskUpdatesTable.deleteMany({});
    console.log("   ✓ Cleared task updates");

    await taskAssignmentsTable.deleteMany({});
    console.log("   ✓ Cleared task assignments");

    await tasksTable.deleteMany({});
    console.log("   ✓ Cleared tasks");

    await projectsTable.deleteMany({});
    console.log("   ✓ Cleared projects");

    await workersTable.deleteMany({});
    console.log("   ✓ Cleared workers");

    console.log("✅ Database cleared successfully\n");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
}

async function seedWorkers() {
  console.log("👷 Seeding workers...");

  const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);

  const workers = await workersTable.create([
    // Project 0 - Downtown Hub workers
    {
      firstname: "Priya",
      lastname: "Sharma",
      email: "priya@ecoforce.com",
      phone: "+919876543210",
      passwordHash,
      role: "WORKER",
      department: "Waste Collection",
      status: "ACTIVE",
      skills: JSON.stringify(["Sorting", "Collection", "Awareness"]),
    },
    {
      firstname: "Sunita",
      lastname: "Devi",
      email: "sunita@ecoforce.com",
      phone: "+919876543213",
      passwordHash,
      role: "WORKER",
      department: "Waste Collection",
      status: "ACTIVE",
      skills: JSON.stringify(["Collection", "Sorting"]),
    },
    {
      firstname: "Rajesh",
      lastname: "Kumar",
      email: "rajesh@ecoforce.com",
      phone: "+919876543220",
      passwordHash,
      role: "WORKER",
      department: "Waste Collection",
      status: "ACTIVE",
      skills: JSON.stringify(["Collection", "Vehicle Operation"]),
    },
    // Project 1 - Riverside Zone workers
    {
      firstname: "Rahul",
      lastname: "Patel",
      email: "rahul@ecoforce.com",
      phone: "+919876543212",
      passwordHash,
      role: "WORKER",
      department: "Recycling",
      status: "ACTIVE",
      skills: JSON.stringify(["Recycling", "Education", "Processing"]),
    },
    {
      firstname: "Anita",
      lastname: "Deshmukh",
      email: "anita@ecoforce.com",
      phone: "+919876543221",
      passwordHash,
      role: "WORKER",
      department: "Recycling",
      status: "ACTIVE",
      skills: JSON.stringify(["Material Sorting", "Quality Control"]),
    },
    {
      firstname: "Deepak",
      lastname: "Mehta",
      email: "deepak@ecoforce.com",
      phone: "+919876543222",
      passwordHash,
      role: "WORKER",
      department: "Recycling",
      status: "ACTIVE",
      skills: JSON.stringify(["Processing", "Equipment Operation"]),
    },
    // Project 2 - North Campus workers
    {
      firstname: "Kavita",
      lastname: "Reddy",
      email: "kavita@ecoforce.com",
      phone: "+919876543223",
      passwordHash,
      role: "WORKER",
      department: "Awareness",
      status: "ACTIVE",
      skills: JSON.stringify(["Communication", "Education", "Training"]),
    },
    {
      firstname: "Sanjay",
      lastname: "Rao",
      email: "sanjay@ecoforce.com",
      phone: "+919876543224",
      passwordHash,
      role: "WORKER",
      department: "Awareness",
      status: "ACTIVE",
      skills: JSON.stringify(["Public Speaking", "Event Management"]),
    },
    {
      firstname: "Neha",
      lastname: "Gupta",
      email: "neha@ecoforce.com",
      phone: "+919876543225",
      passwordHash,
      role: "WORKER",
      department: "Awareness",
      status: "ACTIVE",
      skills: JSON.stringify(["Social Media", "Content Creation"]),
    },
    // Project 3 - City-wide workers
    {
      firstname: "Anil",
      lastname: "Joshi",
      email: "anil@ecoforce.com",
      phone: "+919876543226",
      passwordHash,
      role: "WORKER",
      department: "Operations",
      status: "ACTIVE",
      skills: JSON.stringify(["Coordination", "Logistics"]),
    },
    {
      firstname: "Meera",
      lastname: "Iyer",
      email: "meera@ecoforce.com",
      phone: "+919876543227",
      passwordHash,
      role: "WORKER",
      department: "Operations",
      status: "ACTIVE",
      skills: JSON.stringify(["Planning", "Documentation"]),
    },
    {
      firstname: "Ravi",
      lastname: "Nair",
      email: "ravi@ecoforce.com",
      phone: "+919876543228",
      passwordHash,
      role: "WORKER",
      department: "Operations",
      status: "ACTIVE",
      skills: JSON.stringify(["Field Operations", "Team Leadership"]),
    },
    // Management and Admin
    {
      firstname: "Amit",
      lastname: "Verma",
      email: "amit@ecoforce.com",
      phone: "+919876543211",
      passwordHash,
      role: "MANAGER",
      department: "Recycling",
      status: "ACTIVE",
      skills: JSON.stringify([
        "Management",
        "Planning",
        "Recycling",
        "Processing",
        "Education",
      ]),
    },
    {
      firstname: "Priya",
      lastname: "Kapoor",
      email: "priya.kapoor@ecoforce.com",
      phone: "+919876543229",
      passwordHash,
      role: "MANAGER",
      department: "Waste Collection",
      status: "ACTIVE",
      skills: JSON.stringify([
        "Management",
        "Collection",
        "Sorting",
        "Logistics",
        "Vehicle Operation",
      ]),
    },
    {
      firstname: "Rajesh",
      lastname: "Malhotra",
      email: "rajesh.malhotra@ecoforce.com",
      phone: "+919876543230",
      passwordHash,
      role: "MANAGER",
      department: "Awareness",
      status: "ACTIVE",
      skills: JSON.stringify([
        "Management",
        "Communication",
        "Education",
        "Event Management",
        "Training",
      ]),
    },
    {
      firstname: "Vikram",
      lastname: "Singh",
      email: "vikram@ecoforce.com",
      phone: "+919876543214",
      passwordHash,
      role: "ADMIN",
      department: "Operations",
      status: "ACTIVE",
      skills: JSON.stringify(["Supervision", "Coordination", "Management"]),
    },
    {
      firstname: "Admin",
      lastname: "User",
      email: "admin@ecoforce.com",
      phone: "+919876543215",
      passwordHash,
      role: "ADMIN",
      department: "Administration",
      status: "ACTIVE",
      skills: JSON.stringify(["Management", "Administration"]),
    },
  ]);

  console.log(`   ✓ Created ${workers.length} workers`);
  return workers;
}

async function seedProjects(workers) {
  console.log("📁 Creating projects...");

  // Find managers for assignment
  const priyaKapoor = workers.find(
    (w) => w.email === "priya.kapoor@ecoforce.com"
  );
  const amitVerma = workers.find((w) => w.email === "amit@ecoforce.com");
  const rajeshMalhotra = workers.find(
    (w) => w.email === "rajesh.malhotra@ecoforce.com"
  );

  const projects = await projectsTable.create([
    {
      name: "Downtown Hub Waste Collection",
      location: "Downtown Hub",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "ACTIVE",
      description: "Main waste collection and sorting hub in downtown area",
      requiredSkills: JSON.stringify([
        "Collection",
        "Sorting",
        "Vehicle Operation",
      ]),
      projectLeaderId: priyaKapoor?.id || null,
    },
    {
      name: "Riverside Zone Recycling",
      location: "Riverside Zone",
      startDate: "2025-02-01",
      endDate: "2025-12-31",
      status: "ACTIVE",
      description: "Recycling facility near riverside industrial area",
      requiredSkills: JSON.stringify([
        "Recycling",
        "Processing",
        "Education",
      ]),
      projectLeaderId: amitVerma?.id || null,
    },
    {
      name: "North Campus Awareness Drive",
      location: "North Campus",
      startDate: "2025-03-01",
      endDate: "2025-06-30",
      status: "ACTIVE",
      description:
        "Environmental awareness campaign in educational institutions",
      requiredSkills: JSON.stringify([
        "Communication",
        "Education",
        "Event Management",
      ]),
      projectLeaderId: rajeshMalhotra?.id || null,
    },
    {
      name: "City-wide Clean-up Initiative",
      location: "All Locations",
      startDate: "2025-01-15",
      endDate: "2025-12-31",
      status: "ACTIVE",
      description: "Comprehensive city-wide waste management and cleanup",
      requiredSkills: JSON.stringify([
        "Coordination",
        "Logistics",
        "Planning",
      ]),
      projectLeaderId: priyaKapoor?.id || null,
    },
  ]);

  console.log(`   ✓ Created ${projects.length} projects`);
  return projects;
}

async function seedTasks(workers, projects) {
  console.log("📋 Seeding tasks...");

  const managerWorker = workers.find((w) => w.role === "MANAGER");

  const tasks = await tasksTable.create([
    {
      projectId: projects[0].id,
      title: "Daily Waste Collection Route A",
      description: "Collect waste from designated areas in route A",
      category: "Collection",
      priority: "HIGH",
      plannedStart: new Date("2025-12-10T06:00:00Z"),
      plannedEnd: new Date("2025-12-10T14:00:00Z"),
      status: "IN_PROGRESS",
      requiredSkills: JSON.stringify(["Collection", "Vehicle Operation"]),
      createdBy: managerWorker.id,
    },
    {
      projectId: projects[0].id,
      title: "Waste Sorting - Recyclables",
      description: "Sort collected waste and separate recyclable materials",
      category: "Sorting",
      priority: "MEDIUM",
      plannedStart: new Date("2025-12-10T08:00:00Z"),
      plannedEnd: new Date("2025-12-10T16:00:00Z"),
      status: "IN_PROGRESS",
      requiredSkills: JSON.stringify(["Sorting", "Quality Control"]),
      createdBy: managerWorker.id,
    },
    {
      projectId: projects[1].id,
      title: "Community Recycling Workshop",
      description: "Conduct workshop on proper recycling practices",
      category: "Education",
      priority: "MEDIUM",
      plannedStart: new Date("2025-12-11T10:00:00Z"),
      plannedEnd: new Date("2025-12-11T12:00:00Z"),
      status: "BACKLOG",
      requiredSkills: JSON.stringify(["Education", "Public Speaking"]),
      createdBy: managerWorker.id,
    },
    {
      projectId: projects[2].id,
      title: "Campus Bin Installation",
      description: "Install new recycling bins across campus",
      category: "Installation",
      priority: "HIGH",
      plannedStart: new Date("2025-12-12T08:00:00Z"),
      plannedEnd: new Date("2025-12-12T17:00:00Z"),
      status: "TODO",
      requiredSkills: JSON.stringify([
        "Equipment Operation",
        "Field Operations",
      ]),
      createdBy: managerWorker.id,
    },
    {
      projectId: projects[3].id,
      title: "Awareness Material Distribution",
      description: "Distribute flyers and educational materials",
      category: "Awareness",
      priority: "LOW",
      plannedStart: new Date("2025-12-13T09:00:00Z"),
      plannedEnd: new Date("2025-12-13T15:00:00Z"),
      requiredSkills: JSON.stringify(["Communication", "Coordination"]),
      status: "BACKLOG",
      createdBy: managerWorker.id,
    },
  ]);

  console.log(`   ✓ Created ${tasks.length} tasks`);
  return tasks;
}

async function seedTaskAssignments(workers, tasks) {
  console.log("👥 Seeding task assignments...");

  const workerRoles = workers.filter((w) => w.role === "WORKER");

  // Project 0: Priya(0), Sunita(1), Rajesh(2)
  // Project 1: Rahul(3), Anita(4), Deepak(5)
  // Project 2: Kavita(6), Sanjay(7), Neha(8)

  const assignments = await taskAssignmentsTable.create([
    {
      taskId: tasks[0].id, // Project 0 task
      workerId: workerRoles[0].id, // Priya
      roleOnTask: "Lead Collector",
      allocationPercent: 100,
    },
    {
      taskId: tasks[1].id, // Project 0 task
      workerId: workerRoles[1].id, // Sunita
      roleOnTask: "Sorter",
      allocationPercent: 100,
    },
    {
      taskId: tasks[1].id, // Project 0 task
      workerId: workerRoles[2].id, // Rajesh
      roleOnTask: "Collector",
      allocationPercent: 50,
    },
    {
      taskId: tasks[2].id, // Project 1 task
      workerId: workerRoles[3].id, // Rahul
      roleOnTask: "Workshop Coordinator",
      allocationPercent: 100,
    },
    {
      taskId: tasks[2].id, // Project 1 task
      workerId: workerRoles[4].id, // Anita
      roleOnTask: "Assistant Coordinator",
      allocationPercent: 50,
    },
    {
      taskId: tasks[3].id, // Project 2 task
      workerId: workerRoles[6].id, // Kavita
      roleOnTask: "Installation Lead",
      allocationPercent: 100,
    },
    {
      taskId: tasks[3].id, // Project 2 task
      workerId: workerRoles[7].id, // Sanjay
      roleOnTask: "Installation Assistant",
      allocationPercent: 50,
    },
  ]);

  console.log(`   ✓ Created ${assignments.length} task assignments`);
  return assignments;
}

async function seedShifts(projects) {
  console.log("⏰ Seeding shifts...");

  const shifts = await shiftsTable.create([
    {
      projectId: projects[0].id,
      name: "Morning Shift",
      startTime: new Date("2025-12-10T06:00:00Z"),
      endTime: new Date("2025-12-10T14:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
    },
    {
      projectId: projects[0].id,
      name: "Evening Shift",
      startTime: new Date("2025-12-10T14:00:00Z"),
      endTime: new Date("2025-12-10T22:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
    },
    {
      projectId: projects[1].id,
      name: "Day Shift",
      startTime: new Date("2025-12-10T08:00:00Z"),
      endTime: new Date("2025-12-10T16:00:00Z"),
      recurrenceRule: "FREQ=WEEKDAY",
    },
  ]);

  console.log(`   ✓ Created ${shifts.length} shifts`);
  return shifts;
}

async function seedAttendance(workers, projects, shifts) {
  console.log("✅ Seeding attendance records...");

  const workerRoles = workers.filter((w) => w.role === "WORKER");

  // Project-specific workers
  // Project 0: Priya(0), Sunita(1), Rajesh(2)
  // Project 1: Rahul(3), Anita(4), Deepak(5)
  // Project 2: Kavita(6), Sanjay(7), Neha(8)
  // Project 3: Anil(9), Meera(10), Ravi(11)

  const attendance = await attendanceTable.create([
    // Project 0 - Downtown Hub (Priya, Sunita, Rajesh)
    {
      workerId: workerRoles[0].id, // Priya
      projectId: projects[0].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-10T06:05:00Z"),
      checkOutAt: new Date("2025-12-10T14:10:00Z"),
      checkInLat: "28.7041",
      checkInLng: "77.1025",
      checkOutLat: "28.7042",
      checkOutLng: "77.1026",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[1].id, // Sunita
      projectId: projects[0].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-10T06:10:00Z"),
      checkOutAt: new Date("2025-12-10T14:05:00Z"),
      checkInLat: "28.7041",
      checkInLng: "77.1025",
      checkOutLat: "28.7042",
      checkOutLng: "77.1026",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[2].id, // Rajesh
      projectId: projects[0].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-10T06:08:00Z"),
      checkOutAt: new Date("2025-12-10T14:12:00Z"),
      checkInLat: "28.7041",
      checkInLng: "77.1025",
      checkOutLat: "28.7042",
      checkOutLng: "77.1026",
      method: "GPS",
      status: "PRESENT",
    },
    // Project 1 - Riverside Zone (Rahul, Anita, Deepak)
    {
      workerId: workerRoles[3].id, // Rahul
      projectId: projects[1].id,
      shiftId: shifts[2].id,
      checkInAt: new Date("2025-12-11T08:05:00Z"),
      checkOutAt: new Date("2025-12-11T16:10:00Z"),
      checkInLat: "28.6139",
      checkInLng: "77.2090",
      checkOutLat: "28.6140",
      checkOutLng: "77.2091",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[4].id, // Anita
      projectId: projects[1].id,
      shiftId: shifts[2].id,
      checkInAt: new Date("2025-12-11T08:08:00Z"),
      checkOutAt: new Date("2025-12-11T16:05:00Z"),
      checkInLat: "28.6139",
      checkInLng: "77.2090",
      checkOutLat: "28.6140",
      checkOutLng: "77.2091",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[5].id, // Deepak
      projectId: projects[1].id,
      shiftId: shifts[2].id,
      checkInAt: new Date("2025-12-11T08:12:00Z"),
      checkOutAt: new Date("2025-12-11T16:08:00Z"),
      checkInLat: "28.6139",
      checkInLng: "77.2090",
      checkOutLat: "28.6140",
      checkOutLng: "77.2091",
      method: "GPS",
      status: "PRESENT",
    },
    // Project 2 - North Campus (Kavita, Sanjay, Neha)
    {
      workerId: workerRoles[6].id, // Kavita
      projectId: projects[2].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-12T06:05:00Z"),
      checkOutAt: new Date("2025-12-12T14:00:00Z"),
      checkInLat: "28.6863",
      checkInLng: "77.2217",
      checkOutLat: "28.6864",
      checkOutLng: "77.2218",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[7].id, // Sanjay
      projectId: projects[2].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-12T06:08:00Z"),
      checkOutAt: new Date("2025-12-12T14:05:00Z"),
      checkInLat: "28.6863",
      checkInLng: "77.2217",
      checkOutLat: "28.6864",
      checkOutLng: "77.2218",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[8].id, // Neha
      projectId: projects[2].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-12T06:10:00Z"),
      checkOutAt: new Date("2025-12-12T14:08:00Z"),
      checkInLat: "28.6863",
      checkInLng: "77.2217",
      checkOutLat: "28.6864",
      checkOutLng: "77.2218",
      method: "GPS",
      status: "PRESENT",
    },
    // Project 3 - City-wide (Anil, Meera, Ravi)
    {
      workerId: workerRoles[9].id, // Anil
      projectId: projects[3].id,
      shiftId: shifts[1].id,
      checkInAt: new Date("2025-12-14T14:05:00Z"),
      checkOutAt: new Date("2025-12-14T22:00:00Z"),
      checkInLat: "28.6517",
      checkInLng: "77.2219",
      checkOutLat: "28.6518",
      checkOutLng: "77.2220",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[10].id, // Meera
      projectId: projects[3].id,
      shiftId: shifts[1].id,
      checkInAt: new Date("2025-12-14T14:08:00Z"),
      checkOutAt: new Date("2025-12-14T22:05:00Z"),
      checkInLat: "28.6517",
      checkInLng: "77.2219",
      checkOutLat: "28.6518",
      checkOutLng: "77.2220",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[11].id, // Ravi
      projectId: projects[3].id,
      shiftId: shifts[1].id,
      checkInAt: new Date("2025-12-14T14:10:00Z"),
      checkOutAt: new Date("2025-12-14T22:10:00Z"),
      checkInLat: "28.6517",
      checkInLng: "77.2219",
      checkOutLat: "28.6518",
      checkOutLng: "77.2220",
      method: "GPS",
      status: "PRESENT",
    },
    // Additional recent records for today
    {
      workerId: workerRoles[0].id, // Priya on Project 0 (today)
      projectId: projects[0].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-15T06:05:00Z"),
      checkInLat: "28.7041",
      checkInLng: "77.1025",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[1].id, // Sunita on Project 0 (today)
      projectId: projects[0].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-15T06:08:00Z"),
      checkInLat: "28.7041",
      checkInLng: "77.1025",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[3].id, // Rahul on Project 1 (today)
      projectId: projects[1].id,
      shiftId: shifts[2].id,
      checkInAt: new Date("2025-12-15T08:05:00Z"),
      checkInLat: "28.6139",
      checkInLng: "77.2090",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[4].id, // Anita on Project 1 (today)
      projectId: projects[1].id,
      shiftId: shifts[2].id,
      checkInAt: new Date("2025-12-15T08:08:00Z"),
      checkInLat: "28.6139",
      checkInLng: "77.2090",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[6].id, // Kavita on Project 2 (today)
      projectId: projects[2].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-15T06:05:00Z"),
      checkInLat: "28.6863",
      checkInLng: "77.2217",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[7].id, // Sanjay on Project 2 (today)
      projectId: projects[2].id,
      shiftId: shifts[0].id,
      checkInAt: new Date("2025-12-15T06:07:00Z"),
      checkInLat: "28.6863",
      checkInLng: "77.2217",
      method: "GPS",
      status: "PRESENT",
    },
    {
      workerId: workerRoles[9].id, // Anil on Project 3 (today)
      projectId: projects[3].id,
      shiftId: shifts[1].id,
      checkInAt: new Date("2025-12-15T14:05:00Z"),
      checkInLat: "28.6517",
      checkInLng: "77.2219",
      method: "GPS",
      status: "PRESENT",
    },
  ]);

  console.log(`   ✓ Created ${attendance.length} attendance records`);
  return attendance;
}

async function seedLeaveRequests(workers) {
  console.log("📅 Creating leave requests...");

  const workerRoles = workers.filter((w) => w.role === "WORKER");
  const managerWorker = workers.find((w) => w.role === "MANAGER");

  const leaves = await leaveRequestsTable.create([
    {
      workerId: workerRoles[0].id,
      type: "SICK",
      startDate: "2025-12-15",
      endDate: "2025-12-16",
      reason: "Medical appointment",
      status: "APPROVED",
      approvedBy: managerWorker.id,
      approvedAt: new Date("2025-12-05T10:00:00Z"),
    },
    {
      workerId: workerRoles[1].id,
      type: "VACATION",
      startDate: "2025-12-20",
      endDate: "2025-12-27",
      reason: "Holiday vacation",
      status: "PENDING",
    },
  ]);

  console.log(`   ✓ Created ${leaves.length} leave requests`);
  return leaves;
}

async function seedNotifications(workers) {
  console.log("🔔 Seeding notifications...");

  const workerRoles = workers.filter((w) => w.role === "WORKER");

  const notifications = await notificationsTable.create([
    {
      workerId: workerRoles[0].id,
      type: "TASK_ASSIGNED",
      payload: JSON.stringify({
        taskTitle: "Daily Waste Collection Route A",
        priority: "HIGH",
      }),
      sentAt: new Date("2025-12-10T05:00:00Z"),
      readAt: new Date("2025-12-10T05:30:00Z"),
    },
    {
      workerId: workerRoles[1].id,
      type: "SHIFT_REMINDER",
      payload: JSON.stringify({
        shiftName: "Morning Shift",
        startTime: "2025-12-10T06:00:00Z",
      }),
      sentAt: new Date("2025-12-09T20:00:00Z"),
      readAt: null,
    },
  ]);

  console.log(`   ✓ Created ${notifications.length} notifications`);
  return notifications;
}

async function seedDailyReports(workers, projects) {
  console.log("📝 Seeding daily reports...");

  const workerRoles = workers.filter((w) => w.role === "WORKER");
  const managerWorker = workers.find((w) => w.role === "MANAGER");

  const reports = await dailyReportsTable.create([
    // Project 0 - Downtown Hub (Priya, Sunita, Rajesh)
    {
      projectId: projects[0].id,
      date: "2025-12-10",
      submittedBy: workerRoles[0].id, // Priya
      summary:
        "Completed waste collection from 15 residential areas. Sorted recyclables successfully.",
      issues: "Minor delay due to traffic congestion in sector 5",
      risks: "Vehicle maintenance required",
      needs: "Additional bins needed in sector 8",
    },
    {
      projectId: projects[0].id,
      date: "2025-12-14",
      submittedBy: workerRoles[1].id, // Sunita
      summary: "Regular collection and sorting operations completed smoothly",
      issues: "None reported",
      risks: "None",
      needs: "None",
    },
    // Project 1 - Riverside Zone (Rahul, Anita, Deepak)
    {
      projectId: projects[1].id,
      date: "2025-12-11",
      submittedBy: workerRoles[3].id, // Rahul
      summary:
        "Recycling workshop conducted with 45 community members. Great engagement.",
      issues: "None",
      risks: "Need to schedule follow-up sessions",
      needs: "More educational materials",
    },
    {
      projectId: projects[1].id,
      date: "2025-12-13",
      submittedBy: workerRoles[4].id, // Anita
      summary: "Processed 2 tons of recyclable materials",
      issues: "Contamination found in 10% of materials",
      risks: "Need better source separation",
      needs: "Training session for community",
    },
    // Project 2 - North Campus (Kavita, Sanjay, Neha)
    {
      projectId: projects[2].id,
      date: "2025-12-12",
      submittedBy: workerRoles[6].id, // Kavita
      summary: "Installed 25 new recycling bins across campus buildings",
      issues: "Two bins damaged during installation",
      risks: "None",
      needs: "Replacement bins ordered",
    },
    {
      projectId: projects[2].id,
      date: "2025-12-14",
      submittedBy: workerRoles[7].id, // Sanjay
      summary:
        "Awareness session conducted in main auditorium. 200+ students attended.",
      issues: "None",
      risks: "None",
      needs: "More promotional posters",
    },
    // Project 3 - City-wide Initiative (Anil, Meera, Ravi)
    {
      projectId: projects[3].id,
      date: "2025-12-14",
      submittedBy: managerWorker.id,
      summary:
        "Coordinated cleanup across 8 locations. Total waste collected: 5 tons.",
      issues: "Low volunteer turnout in Zone C",
      risks: "Weather forecast shows rain next week",
      needs: "Additional volunteers needed",
    },
    {
      projectId: projects[3].id,
      date: "2025-12-15",
      submittedBy: workerRoles[9].id, // Anil
      summary: "Morning cleanup completed in downtown area. Good progress.",
      issues: "None",
      risks: "None",
      needs: "None",
    },
  ]);

  console.log(`   ✓ Created ${reports.length} daily reports`);
  return reports;
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    await connectDB();
    await clearDatabase();

    const workers = await seedWorkers();
    const projects = await seedProjects(workers);
    const tasks = await seedTasks(workers, projects);
    const taskAssignments = await seedTaskAssignments(workers, tasks);
    const shifts = await seedShifts(projects);
    const attendance = await seedAttendance(workers, projects, shifts);
    const leaveRequests = await seedLeaveRequests(workers);
    const dailyReports = await seedDailyReports(workers, projects);
    const notifications = await seedNotifications(workers);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Workers: ${workers.length}`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Task Assignments: ${taskAssignments.length}`);
    console.log(`   - Shifts: ${shifts.length}`);
    console.log(`   - Attendance: ${attendance.length}`);
    console.log(`   - Leave Requests: ${leaveRequests.length}`);
    console.log(`   - Daily Reports: ${dailyReports.length}`);
    console.log(`   - Notifications: ${notifications.length}`);

    console.log("\n🔑 Test Credentials:");
    console.log("   Email: admin@ecoforce.com");
    console.log("   Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
