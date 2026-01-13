import axios from "axios";

/**
 * Google Maps API Service
 * Handles all Google Maps API calls including geofencing, distance matrix, directions
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api";

export const googleMapsService = {
  /**
   * Calculate distance between two coordinates using Distance Matrix API
   */
  getDistance: async (origin, destination) => {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const response = await axios.get(
        `${GOOGLE_MAPS_BASE_URL}/distancematrix/json`,
        {
          params: {
            origins: `${origin.latitude},${origin.longitude}`,
            destinations: `${destination.latitude},${destination.longitude}`,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (response.data.status !== "OK") {
        throw new Error(`Distance Matrix API error: ${response.data.status}`);
      }

      const element = response.data.rows[0].elements[0];
      if (element.status === "ZERO_RESULTS") {
        return null;
      }

      return {
        distanceMeters: element.distance.value,
        distanceKm: element.distance.value / 1000,
        distanceMiles: (element.distance.value / 1000) * 0.621371,
        durationSeconds: element.duration.value,
        durationMinutes: Math.ceil(element.duration.value / 60),
      };
    } catch (error) {
      console.error("Google Maps Distance API error:", error.message);
      throw error;
    }
  },

  /**
   * Get route directions between two points
   */
  getDirections: async (origin, destination, waypoints = []) => {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const params = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        key: GOOGLE_MAPS_API_KEY,
      };

      if (waypoints.length > 0) {
        params.waypoints = waypoints
          .map((wp) => `${wp.latitude},${wp.longitude}`)
          .join("|");
      }

      const response = await axios.get(
        `${GOOGLE_MAPS_BASE_URL}/directions/json`,
        { params }
      );

      if (response.data.status !== "OK") {
        throw new Error(`Directions API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      return {
        polyline: route.overview_polyline.points,
        legs: route.legs.map((leg) => ({
          startLocation: leg.start_location,
          endLocation: leg.end_location,
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps,
        })),
        totalDistance: route.legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        ),
        totalDuration: route.legs.reduce(
          (sum, leg) => sum + leg.duration.value,
          0
        ),
      };
    } catch (error) {
      console.error("Google Maps Directions API error:", error.message);
      throw error;
    }
  },

  /**
   * Geocode address to coordinates
   */
  geocodeAddress: async (address) => {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
        params: {
          address,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.status !== "OK") {
        throw new Error(`Geocoding API error: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    } catch (error) {
      console.error("Google Maps Geocoding API error:", error.message);
      throw error;
    }
  },

  /**
   * Reverse geocode coordinates to address
   */
  reverseGeocode: async (latitude, longitude) => {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.status !== "OK") {
        throw new Error(`Reverse Geocoding API error: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        address: result.formatted_address,
        placeId: result.place_id,
        components: result.address_components,
      };
    } catch (error) {
      console.error("Google Maps Reverse Geocoding API error:", error.message);
      throw error;
    }
  },

  /**
   * Calculate optimized route for multiple waypoints
   */
  optimizeRoute: async (origin, destinations) => {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      // Use Directions API with waypoints for optimization
      const params = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destinations[destinations.length - 1].latitude},${
          destinations[destinations.length - 1].longitude
        }`,
        waypoints: destinations
          .slice(0, -1)
          .map((d) => `${d.latitude},${d.longitude}`)
          .join("|"),
        optimize: true,
        key: GOOGLE_MAPS_API_KEY,
      };

      const response = await axios.get(
        `${GOOGLE_MAPS_BASE_URL}/directions/json`,
        { params }
      );

      if (response.data.status !== "OK") {
        throw new Error(`Optimize Route API error: ${response.data.status}`);
      }

      return {
        optimizedOrder: response.data.routes[0].waypoint_order,
        polyline: response.data.routes[0].overview_polyline.points,
        totalDistance: response.data.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        ),
        totalDuration: response.data.routes[0].legs.reduce(
          (sum, leg) => sum + leg.duration.value,
          0
        ),
      };
    } catch (error) {
      console.error("Google Maps Route Optimization API error:", error.message);
      throw error;
    }
  },
};
