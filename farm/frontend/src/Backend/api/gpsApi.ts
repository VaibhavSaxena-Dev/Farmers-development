// GPS Tracking API

import { API_BASE_URL } from '../../config/env';
// Import API configuration from todoApi
const API_BASE = API_BASE_URL;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const gpsApi = {
  // Create new GPS record
  createRecord: async (locationData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
    todoId?: string;
    locationType?: 'current' | 'todo_location' | 'check_in' | 'check_out';
    address?: string;
  }) => {
    const response = await fetch(`${API_BASE}/gps`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create GPS record: ${response.statusText}`);
    }
    return response.json();
  },

  // Get current location
  getCurrentLocation: async () => {
    const response = await fetch(`${API_BASE}/gps/current`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get current location: ${response.statusText}`);
    }
    return response.json();
  },

  // Get location history
  getLocationHistory: async (options: {
    limit?: number;
    startDate?: string;
    endDate?: string;
    todoId?: string;
    locationType?: string;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/gps/history?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get location history: ${response.statusText}`);
    }
    return response.json();
  },

  // Get nearby locations
  getNearbyLocations: async (radiusKm: number = 5) => {
    const response = await fetch(`${API_BASE}/gps/nearby?radiusKm=${radiusKm}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get nearby locations: ${response.statusText}`);
    }
    return response.json();
  },

  // Get location statistics
  getLocationStats: async () => {
    const response = await fetch(`${API_BASE}/gps/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get location statistics: ${response.statusText}`);
    }
    return response.json();
  },

  // Update GPS record
  updateRecord: async (id: string, updateData: Partial<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
    locationType: string;
    address?: string;
    isActive: boolean;
  }>) => {
    const response = await fetch(`${API_BASE}/gps/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update GPS record: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete GPS record
  deleteRecord: async (id: string) => {
    const response = await fetch(`${API_BASE}/gps/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete GPS record: ${response.statusText}`);
    }
    return response.json();
  },

  // Check in at a location for a todo
  checkInTodo: async (todoId: string, latitude: number, longitude: number, address?: string) => {
    const response = await fetch(`${API_BASE}/gps/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ todoId, latitude, longitude, address }),
    });
    if (!response.ok) {
      throw new Error(`Failed to check in: ${response.statusText}`);
    }
    return response.json();
  },

  // Check out from a location for a todo
  checkOutTodo: async (todoId: string, latitude: number, longitude: number, address?: string) => {
    const response = await fetch(`${API_BASE}/gps/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ todoId, latitude, longitude, address }),
    });
    if (!response.ok) {
      throw new Error(`Failed to check out: ${response.statusText}`);
    }
    return response.json();
  }
};

// GPS utility functions
export const gpsUtils = {
  // Get current position from browser
  getCurrentPosition: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  // Watch position changes
  watchPosition: (callback: (position: GeolocationPosition) => void, errorCallback?: (error: GeolocationPositionError) => void): number => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    return navigator.geolocation.watchPosition(
      callback,
      errorCallback || console.error,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );
  },

  // Clear watch
  clearWatch: (watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Get address from coordinates (reverse geocoding)
  getAddressFromCoordinates: async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Farm-Management-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      return data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  },

  // Format coordinates for display
  formatCoordinates: (latitude: number, longitude: number): string => {
    return `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
  },

  // Convert speed from m/s to km/h
  formatSpeed: (speedMs: number): string => {
    const speedKmh = speedMs * 3.6;
    return `${speedKmh.toFixed(1)} km/h`;
  },

  // Format accuracy
  formatAccuracy: (accuracy: number): string => {
    if (accuracy < 10) {
      return `Excellent (${accuracy.toFixed(1)}m)`;
    } else if (accuracy < 50) {
      return `Good (${accuracy.toFixed(1)}m)`;
    } else if (accuracy < 100) {
      return `Fair (${accuracy.toFixed(1)}m)`;
    } else {
      return `Poor (${accuracy.toFixed(1)}m)`;
    }
  }
};
