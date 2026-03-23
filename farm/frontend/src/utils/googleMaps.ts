// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Get your API key from: https://console.cloud.google.com/
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // Default map settings
  DEFAULT_CENTER: {
    lat: 12.9716,  // Bangalore
    lng: 77.5946
  },
  DEFAULT_ZOOM: 13,
  
  // Map types
  MAP_TYPES: {
    ROADMAP: 'roadmap',
    SATELLITE: 'satellite',
    HYBRID: 'hybrid',
    TERRAIN: 'terrain'
  },
  
  // Search radius options (in km)
  SEARCH_RADIUS: {
    NEARBY: 5,
    MODERATE: 10,
    FAR: 25,
    VERY_FAR: 50
  },
  
  // Geolocation options
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  },
  
  // Map styling
  MAP_STYLES: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Helper functions for Google Maps
export const createMapUrl = (center: { lat: number; lng: number }, zoom: number, mapType: string) => {
  const { API_KEY } = GOOGLE_MAPS_CONFIG;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=800x600&maptype=${mapType}&key=${API_KEY}`;
};

export const createDirectionsUrl = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
};

export const createPlaceUrl = (lat: number, lng: number) => {
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const { API_KEY } = GOOGLE_MAPS_CONFIG;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const { API_KEY } = GOOGLE_MAPS_CONFIG;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};
