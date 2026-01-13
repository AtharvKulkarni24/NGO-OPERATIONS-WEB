/**
 * Frontend Integration Utilities
 * Client-side helpers for integrating location tracking and task management
 */

export class LocationTracker {
  constructor(apiBaseUrl = "/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.token = localStorage.getItem("token");
    this.workerId = localStorage.getItem("workerId");
    this.projectId = localStorage.getItem("projectId");
    this.updateInterval = null;
  }

  /**
   * Start tracking worker location
   */
  startTracking(updateIntervalSeconds = 30) {
    this.updateInterval = setInterval(() => {
      this.updateLocation();
    }, updateIntervalSeconds * 1000);

    // Initial update
    this.updateLocation();
  }

  /**
   * Stop tracking
   */
  stopTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Get current location from browser geolocation API
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Update location on backend
   */
  async updateLocation() {
    try {
      const location = await this.getCurrentLocation();

      const response = await fetch(`${this.apiBaseUrl}/location/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          projectId: this.projectId,
          accuracy: location.accuracy,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Location update failed:", error);
      throw error;
    }
  }

  /**
   * Get active workers on project
   */
  async getActiveWorkers(projectId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/location/project/${projectId}/active`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch active workers:", error);
      throw error;
    }
  }

  /**
   * Get worker's current location
   */
  async getWorkerLocation(workerId, projectId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/location/worker/${workerId}/current?projectId=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch worker location:", error);
      throw error;
    }
  }

  /**
   * Validate geofence
   */
  async validateGeofence(checkinLocation, projectLocation, radiusKm = 0.5) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/location/validate-checkin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            checkinLatitude: checkinLocation.latitude,
            checkinLongitude: checkinLocation.longitude,
            projectLatitude: projectLocation.latitude,
            projectLongitude: projectLocation.longitude,
            radiusKm,
          }),
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Geofence validation failed:", error);
      throw error;
    }
  }

  /**
   * Calculate distance between two locations
   */
  async getDistance(lat1, lon1, lat2, lon2) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/location/distance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ lat1, lon1, lat2, lon2 }),
      });

      return await response.json();
    } catch (error) {
      console.error("Distance calculation failed:", error);
      throw error;
    }
  }

  /**
   * Get directions with waypoints
   */
  async getDirections(origin, destination, waypoints = []) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/location/directions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          originLat: origin.latitude,
          originLng: origin.longitude,
          destLat: destination.latitude,
          destLng: destination.longitude,
          waypoints,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Directions request failed:", error);
      throw error;
    }
  }

  /**
   * Get optimized route
   */
  async optimizeRoute(workerLocation, tasks) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/location/optimize-route`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            workerLocation,
            tasks,
          }),
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Route optimization failed:", error);
      throw error;
    }
  }

  /**
   * Geocode address
   */
  async geocodeAddress(address) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/location/geocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ address }),
      });

      return await response.json();
    } catch (error) {
      console.error("Geocoding failed:", error);
      throw error;
    }
  }

  /**
   * Reverse geocode
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/location/reverse-geocode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({ latitude, longitude }),
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      throw error;
    }
  }
}

export class TaskManager {
  constructor(apiBaseUrl = "/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.token = localStorage.getItem("token");
  }

  /**
   * Create a new task
   */
  async createTask(projectId, taskData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          projectId,
          ...taskData,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Task creation failed:", error);
      throw error;
    }
  }

  /**
   * Get project tasks
   */
  async getProjectTasks(projectId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/tasks/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, updates) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(updates),
      });

      return await response.json();
    } catch (error) {
      console.error("Task update failed:", error);
      throw error;
    }
  }

  /**
   * Assign task to worker
   */
  async assignTask(taskId, workerId, roleOnTask = "ASSIGNEE") {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          taskId,
          workerId,
          roleOnTask,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Task assignment failed:", error);
      throw error;
    }
  }

  /**
   * Add task update
   */
  async addTaskUpdate(taskId, note, progressPercent = null) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          taskId,
          note,
          progressPercent,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Task update add failed:", error);
      throw error;
    }
  }

  /**
   * Get task updates
   */
  async getTaskUpdates(taskId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/tasks/${taskId}/updates`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch task updates:", error);
      throw error;
    }
  }
}

export class MapVisualization {
  constructor(containerId, mapOptions = {}) {
    this.containerId = containerId;
    this.mapOptions = {
      zoom: mapOptions.zoom || 15,
      center: mapOptions.center || { lat: 0, lng: 0 },
      ...mapOptions,
    };
    this.markers = new Map();
    this.polylines = [];
  }

  /**
   * Initialize map (requires Google Maps API loaded)
   */
  initMap() {
    const container = document.getElementById(this.containerId);
    this.map = new google.maps.Map(container, this.mapOptions);
    return this.map;
  }

  /**
   * Add marker for location
   */
  addMarker(id, location, options = {}) {
    const marker = new google.maps.Marker({
      position: {
        lat: location.latitude,
        lng: location.longitude,
      },
      map: this.map,
      title: options.title || "Location",
      ...options,
    });

    this.markers.set(id, marker);
    return marker;
  }

  /**
   * Update marker position
   */
  updateMarker(id, location) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.setPosition({
        lat: location.latitude,
        lng: location.longitude,
      });
    }
  }

  /**
   * Remove marker
   */
  removeMarker(id) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(id);
    }
  }

  /**
   * Draw circle for geofence
   */
  drawGeofence(center, radiusKm, options = {}) {
    return new google.maps.Circle({
      map: this.map,
      center: {
        lat: center.latitude,
        lng: center.longitude,
      },
      radius: radiusKm * 1000, // Convert km to meters
      fillColor: options.fillColor || "#FF0000",
      fillOpacity: options.fillOpacity || 0.1,
      strokeColor: options.strokeColor || "#FF0000",
      strokeOpacity: options.strokeOpacity || 0.8,
      strokeWeight: options.strokeWeight || 2,
    });
  }

  /**
   * Draw polyline for route
   */
  drawRoute(polylinePoints, options = {}) {
    const polyline = new google.maps.Polyline({
      map: this.map,
      path: polylinePoints,
      geodesic: true,
      strokeColor: options.strokeColor || "#4285F4",
      strokeOpacity: options.strokeOpacity || 0.8,
      strokeWeight: options.strokeWeight || 2,
    });

    this.polylines.push(polyline);
    return polyline;
  }

  /**
   * Fit map to bounds
   */
  fitBounds(markers) {
    const bounds = new google.maps.LatLngBounds();
    for (const marker of markers) {
      bounds.extend(marker.getPosition());
    }
    this.map.fitBounds(bounds);
  }

  /**
   * Clear all polylines
   */
  clearPolylines() {
    this.polylines.forEach((polyline) => polyline.setMap(null));
    this.polylines = [];
  }
}

// Helper utilities
export const LocationUtils = {
  /**
   * Decode polyline string from Google Maps
   */
  decodePolyline: (polylineString) => {
    const points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < polylineString.length) {
      let result = 0,
        shift = 0;
      let byte;

      do {
        byte = polylineString.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      result = 0;
      shift = 0;

      do {
        byte = polylineString.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  },

  /**
   * Calculate bearing between two points
   */
  calculateBearing: (from, to) => {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    return (Math.atan2(y, x) * 180) / Math.PI;
  },

  /**
   * Check if point is in circle (simple geofence check)
   */
  isPointInCircle: (point, center, radiusKm) => {
    const R = 6371; // Earth's radius in km
    const lat1 = (center.latitude * Math.PI) / 180;
    const lat2 = (point.latitude * Math.PI) / 180;
    const dlat = ((point.latitude - center.latitude) * Math.PI) / 180;
    const dlng = ((point.longitude - center.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) * Math.sin(dlng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radiusKm;
  },

  /**
   * Format duration in human-readable format
   */
  formatDuration: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  },

  /**
   * Format distance
   */
  formatDistance: (km) => {
    if (km >= 1) {
      return `${km.toFixed(2)} km`;
    }
    return `${(km * 1000).toFixed(0)} m`;
  },
};
