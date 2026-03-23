/* Minimal types for Google Maps API used in FindVet page */
declare global {
  interface Window {
    google?: typeof google;
    initFindVetMap?: () => void;
  }
}

export interface PlaceResult {
  place_id: string;
  name?: string;
  vicinity?: string;
  geometry?: { location: { lat: () => number; lng: () => number } };
}

export interface PlaceDetails {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  opening_hours?: {
    weekday_text?: string[];
    open_now?: boolean;
  };
}

export {};
