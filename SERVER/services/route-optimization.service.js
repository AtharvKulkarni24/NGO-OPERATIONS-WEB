import { googleMapsService } from "./google-maps.service.js";

/**
 * Route Optimization Service
 * Handles task sequencing, route planning, and worker assignment
 */

export const routeOptimizationService = {
  /**
   * Generate optimized route for worker with assigned tasks
   */
  generateOptimizedRoute: async (workerLocation, tasks) => {
    if (!tasks || tasks.length === 0) {
      return {
        route: [],
        totalDistance: 0,
        totalDuration: 0,
        message: "No tasks to optimize",
      };
    }

    try {
      // Start from worker's current location
      const origin = {
        latitude: workerLocation.latitude,
        longitude: workerLocation.longitude,
      };

      // Sort tasks by priority and proximity
      const sortedTasks = tasks.sort((a, b) => {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );
      });

      // Create destinations from tasks
      const destinations = sortedTasks.map((task) => ({
        taskId: task.id,
        latitude: task.location.latitude,
        longitude: task.location.longitude,
        address: task.location.address,
        priority: task.priority,
        estimatedDuration: task.estimatedDurationMinutes,
      }));

      // Get optimized route from Google Maps
      const routeData = await googleMapsService.optimizeRoute(
        origin,
        destinations
      );

      return {
        optimizedOrder: routeData.optimizedOrder,
        polyline: routeData.polyline,
        totalDistance: routeData.totalDistance,
        totalDistanceKm: (routeData.totalDistance / 1000).toFixed(2),
        totalDuration: routeData.totalDuration,
        totalDurationMinutes: Math.ceil(routeData.totalDuration / 60),
        tasks: destinations.map((dest, idx) => ({
          ...dest,
          sequenceOrder: routeData.optimizedOrder[idx] || idx,
        })),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Route optimization error:", error.message);
      throw error;
    }
  },

  /**
   * Assign tasks to worker based on location and capacity
   */
  assignTasksToWorker: async (
    worker,
    availableTasks,
    maxTasksPerWorker = 5
  ) => {
    const workerLocation = {
      latitude: worker.lastKnownLat,
      longitude: worker.lastKnownLng,
    };

    // Filter tasks that worker is qualified for
    const qualifiedTasks = availableTasks.filter((task) => {
      if (!task.requiredSkills || task.requiredSkills.length === 0) {
        return true;
      }

      const workerSkills = worker.skills || [];
      return task.requiredSkills.every((skill) => workerSkills.includes(skill));
    });

    if (qualifiedTasks.length === 0) {
      return {
        assigned: [],
        reason: "No qualified tasks available",
      };
    }

    // Sort by distance and priority
    const tasksWithDistance = await Promise.all(
      qualifiedTasks.slice(0, maxTasksPerWorker).map(async (task) => {
        try {
          const distance = await googleMapsService.getDistance(workerLocation, {
            latitude: task.location.latitude,
            longitude: task.location.longitude,
          });

          return {
            ...task,
            distance: distance.distanceKm,
            duration: distance.durationMinutes,
          };
        } catch {
          return {
            ...task,
            distance: Infinity,
            duration: 0,
          };
        }
      })
    );

    // Sort by distance (closest first)
    const assignedTasks = tasksWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Math.min(3, maxTasksPerWorker));

    return {
      assigned: assignedTasks,
      workerId: worker.id,
      assignedAt: new Date().toISOString(),
      totalDistance: assignedTasks.reduce((sum, t) => sum + t.distance, 0),
      estimatedCompletionTime: assignedTasks.reduce(
        (sum, t) => sum + t.duration,
        0
      ),
    };
  },

  /**
   * Calculate optimal break locations
   */
  calculateBreakPoints: (route, maxDrivingHours = 4) => {
    const maxDrivingMinutes = maxDrivingHours * 60;
    let accumulatedTime = 0;
    const breakPoints = [];
    let currentSegment = 0;

    for (const task of route.tasks) {
      accumulatedTime += task.estimatedDuration || 30; // Default 30 min per task

      if (accumulatedTime > maxDrivingMinutes) {
        breakPoints.push({
          after: currentSegment,
          reason: "Extended driving duration",
          suggestedDuration: 15, // minutes
        });
        accumulatedTime = 0;
      }

      currentSegment++;
    }

    return breakPoints;
  },

  /**
   * Estimate task completion time
   */
  estimateCompletionTime: async (workerLocation, tasks) => {
    if (!tasks || tasks.length === 0) {
      return {
        estimatedMinutes: 0,
        estimatedHours: 0,
        breakdown: [],
      };
    }

    let totalTravelTime = 0;
    let totalTaskTime = 0;
    const breakdown = [];

    let currentLocation = workerLocation;

    for (const task of tasks) {
      try {
        const distance = await googleMapsService.getDistance(currentLocation, {
          latitude: task.location.latitude,
          longitude: task.location.longitude,
        });

        const travelTime = distance.durationMinutes || 0;
        const taskTime = task.estimatedDurationMinutes || 30;

        totalTravelTime += travelTime;
        totalTaskTime += taskTime;

        breakdown.push({
          taskId: task.id,
          title: task.title,
          travelTimeMinutes: travelTime,
          taskTimeMinutes: taskTime,
          totalMinutes: travelTime + taskTime,
        });

        currentLocation = {
          latitude: task.location.latitude,
          longitude: task.location.longitude,
        };
      } catch {
        console.error(`Error calculating time for task ${task.id}`);
      }
    }

    const totalMinutes = totalTravelTime + totalTaskTime;

    return {
      estimatedMinutes: totalMinutes,
      estimatedHours: (totalMinutes / 60).toFixed(1),
      travelMinutes: totalTravelTime,
      taskMinutes: totalTaskTime,
      breakdown,
      completionTime: new Date(Date.now() + totalMinutes * 60000).toISOString(),
    };
  },

  /**
   * Validate route feasibility
   */
  validateRoute: (route, constraints = {}) => {
    const {
      maxDistanceKm = 100,
      maxDurationHours = 8,
      maxTasksPerRoute = 10,
    } = constraints;

    const errors = [];
    const warnings = [];

    if (route.totalDistanceKm > maxDistanceKm) {
      errors.push(
        `Route distance (${route.totalDistanceKm}km) exceeds maximum (${maxDistanceKm}km)`
      );
    }

    if (route.totalDurationMinutes > maxDurationHours * 60) {
      errors.push(
        `Route duration exceeds maximum of ${maxDurationHours} hours`
      );
    }

    if (route.tasks.length > maxTasksPerRoute) {
      warnings.push(
        `Route has ${route.tasks.length} tasks, recommended maximum is ${maxTasksPerRoute}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },
};
