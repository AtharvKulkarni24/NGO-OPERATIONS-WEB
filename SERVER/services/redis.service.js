import redis from "redis";

/**
 * Redis Client Service
 * Handles all Redis operations for location caching and real-time data
 */

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient;
let isRedisEnabled = false;

export const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          // Stop trying after 3 attempts
          if (retries > 3) {
            console.log(
              "Redis connection failed after 3 attempts. Disabling Redis."
            );
            isRedisEnabled = false;
            return false; // Stop reconnecting
          }
          return Math.min(retries * 50, 500);
        },
      },
    });

    redisClient.on("error", (err) => {
      if (!isRedisEnabled) {
        // Suppress errors if Redis is disabled
        return;
      }
      console.log("Redis Client Error", err.message);
    });
    redisClient.on("connect", () => {
      console.log("Redis connected");
      isRedisEnabled = true;
    });

    await redisClient.connect();
    isRedisEnabled = true;
    return redisClient;
  } catch (error) {
    isRedisEnabled = false;
    console.log("Redis disabled - continuing without caching");
    return null;
  }
};

export const getRedisClient = () => {
  if (!redisClient || !isRedisEnabled) {
    return null;
  }
  return redisClient;
};

export const redisService = {
  /**
   * Set worker location with expiration (5 minutes)
   */
  setWorkerLocation: async (workerId, projectId, location) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `location:${workerId}:${projectId}`;
    const data = {
      workerId,
      projectId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date().toISOString(),
      lastUpdated: Date.now(),
    };

    await redisClient.setEx(key, 300, JSON.stringify(data)); // 5 minutes expiration
    return data;
  },

  /**
   * Get worker's current location
   */
  getWorkerLocation: async (workerId, projectId) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `location:${workerId}:${projectId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Get all active workers on a project
   */
  getActiveWorkersOnProject: async (projectId) => {
    if (!isRedisEnabled || !redisClient) return [];

    const pattern = `location:*:${projectId}`;
    const keys = await redisClient.keys(pattern);
    const workers = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        workers.push(JSON.parse(data));
      }
    }

    return workers;
  },

  /**
   * Mark worker as inactive
   */
  removeWorkerLocation: async (workerId, projectId) => {
    if (!isRedisEnabled || !redisClient) return;

    const key = `location:${workerId}:${projectId}`;
    await redisClient.del(key);
  },

  /**
   * Store task assignment
   */
  setTaskAssignment: async (taskId, workerId, assignment) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `task:${taskId}:worker:${workerId}`;
    const data = {
      taskId,
      workerId,
      ...assignment,
      assignedAt: new Date().toISOString(),
    };

    await redisClient.set(key, JSON.stringify(data));
    return data;
  },

  /**
   * Get task assignment
   */
  getTaskAssignment: async (taskId, workerId) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `task:${taskId}:worker:${workerId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Get all tasks assigned to a worker
   */
  getWorkerTasks: async (workerId) => {
    if (!isRedisEnabled || !redisClient) return [];

    const pattern = `task:*:worker:${workerId}`;
    const keys = await redisClient.keys(pattern);
    const tasks = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        tasks.push(JSON.parse(data));
      }
    }

    return tasks;
  },

  /**
   * Cache geofence check result
   */
  setCachedGeofenceCheck: async (workerId, projectId, result) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `geofence:${workerId}:${projectId}`;
    await redisClient.setEx(key, 60, JSON.stringify(result)); // 1 minute cache
    return result;
  },

  /**
   * Get cached geofence check
   */
  getCachedGeofenceCheck: async (workerId, projectId) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `geofence:${workerId}:${projectId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Store route optimization result
   */
  setOptimizedRoute: async (workerId, route) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `route:${workerId}`;
    const data = {
      workerId,
      ...route,
      optimizedAt: new Date().toISOString(),
    };

    await redisClient.set(key, JSON.stringify(data));
    return data;
  },

  /**
   * Get optimized route for worker
   */
  getOptimizedRoute: async (workerId) => {
    if (!isRedisEnabled || !redisClient) return null;

    const key = `route:${workerId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Clear all location data (for testing)
   */
  clearAllLocations: async () => {
    if (!isRedisEnabled || !redisClient) return;

    const pattern = "location:*";
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  },

  /**
   * Get Redis stats
   */
  getStats: async () => {
    if (!isRedisEnabled || !redisClient) {
      return {
        activeLocations: 0,
        activeTasks: 0,
        activeRoutes: 0,
        redisEnabled: false,
      };
    }

    const info = await redisClient.info();
    const locationKeys = await redisClient.keys("location:*");
    const taskKeys = await redisClient.keys("task:*");
    const routeKeys = await redisClient.keys("route:*");

    return {
      activeLocations: locationKeys.length,
      activeTasks: taskKeys.length,
      activeRoutes: routeKeys.length,
      info,
    };
  },
};
