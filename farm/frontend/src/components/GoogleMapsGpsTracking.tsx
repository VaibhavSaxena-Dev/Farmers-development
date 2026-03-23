import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Calendar,
  User,
  Phone,
  Mail,
  Star,
  Search,
  Filter,
  Route,
  Share2,
  Download
} from 'lucide-react';
import { gpsApi } from '@/Backend/api/gpsApi';
import { doctorApi, clinicApi } from '@/Backend/api/medicalApi';
import { toast } from 'sonner';

interface Location {
  _id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  timestamp: string;
  locationType: string;
  address?: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  phone: string;
  email: string;
  clinicName: string;
  clinicAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  consultationFee: number;
  rating: {
    average: number;
    count: number;
  };
  isVerified: boolean;
}

interface Clinic {
  _id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
  };
  rating: {
    average: number;
    count: number;
  };
}

const GoogleMapsGpsTracking: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [nearbyDoctors, setNearbyDoctors] = useState<Doctor[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<Clinic[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default: Bangalore
  const [mapZoom, setMapZoom] = useState(13);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [showBicycling, setShowBicycling] = useState(false);
  const [showWalking, setShowWalking] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | Doctor | Clinic | null>(null);
  const [loading, setLoading] = useState(false);

  // Google Maps API Key (you should get this from Google Cloud Console)
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
  const isApiKeyConfigured = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY' && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  useEffect(() => {
    loadLocationHistory();
    loadNearbyMedical();
  }, []);

  const loadLocationHistory = async () => {
    try {
      const response = await gpsApi.getLocationHistory();
      setLocationHistory(response.locations || []);
    } catch (error) {
      console.error('Failed to load location history:', error);
    }
  };

  const loadNearbyMedical = async () => {
    try {
      const [doctorsResponse, clinicsResponse] = await Promise.all([
        doctorApi.getNearbyDoctors(mapCenter.lat, mapCenter.lng, searchRadius, selectedSpecialization),
        clinicApi.getNearbyClinics(mapCenter.lat, mapCenter.lng, searchRadius)
      ]);
      
      setNearbyDoctors(doctorsResponse.doctors || []);
      setNearbyClinics(clinicsResponse.clinics || []);
    } catch (error) {
      console.error('Failed to load nearby medical facilities:', error);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: Location = {
          _id: Date.now().toString(),
          userId: 'current-user', // This would come from auth context
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          timestamp: new Date().toISOString(),
          locationType: 'current',
          address: await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude)
        };

        setCurrentLocation(location);
        setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setMapZoom(15);
        
        // Save to backend
        try {
          await gpsApi.createLocation(location);
          toast.success('Location saved successfully');
          loadLocationHistory();
        } catch (error) {
          console.error('Failed to save location:', error);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get your location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    toast.success('GPS tracking started');

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location: Location = {
          _id: Date.now().toString(),
          userId: 'current-user',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          timestamp: new Date().toISOString(),
          locationType: 'tracking',
          address: await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude)
        };

        setCurrentLocation(location);
        setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        
        // Save to backend
        try {
          await gpsApi.createLocation(location);
        } catch (error) {
          console.error('Failed to save tracking location:', error);
        }
      },
      (error) => {
        console.error('Tracking error:', error);
        toast.error('GPS tracking error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Store watchId for cleanup
    (window as any).gpsWatchId = watchId;
  };

  const stopTracking = () => {
    setIsTracking(false);
    if ((window as any).gpsWatchId) {
      navigator.geolocation.clearWatch((window as any).gpsWatchId);
      delete (window as any).gpsWatchId;
    }
    toast.success('GPS tracking stopped');
  };

  const getDirections = (destination: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${mapCenter.lat},${mapCenter.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const shareLocation = () => {
    if (currentLocation) {
      const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
      navigator.clipboard.writeText(url);
      toast.success('Location link copied to clipboard');
    }
  };

  const exportLocationData = () => {
    const data = {
      currentLocation,
      locationHistory,
      nearbyDoctors,
      nearbyClinics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gps-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Location data exported successfully');
  };

  const getMapUrl = () => {
    const center = `${mapCenter.lat},${mapCenter.lng}`;
    const zoom = mapZoom;
    const type = mapType;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=800x600&maptype=${type}&key=${GOOGLE_MAPS_API_KEY}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">GPS Tracking with Google Maps</h1>
        <p className="text-gray-600">Real-time location tracking with nearby medical facilities discovery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Maps Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Live Location Map
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={isTracking ? "destructive" : "default"}
                    size="sm"
                    onClick={isTracking ? stopTracking : startTracking}
                  >
                    {isTracking ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                        Stop Tracking
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Start Tracking
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={getCurrentLocation} disabled={loading}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {loading ? 'Getting...' : 'Current Location'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[500px] relative">
              {!isApiKeyConfigured ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center p-8 max-w-md">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Google Maps API Key Required</h3>
                    <p className="text-gray-600 mb-4">
                      To display the map, you need to configure your Google Maps API key.
                    </p>
                    <div className="text-left bg-white p-4 rounded-lg border text-sm space-y-2">
                      <p className="font-medium">Quick Setup:</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700">
                        <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                        <li>Create/select a project</li>
                        <li>Enable Maps JavaScript API</li>
                        <li>Create API Key in Credentials</li>
                        <li>Add key to <code className="bg-gray-100 px-1 rounded">.env</code> file</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {/* Google Maps Iframe */}
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${mapCenter.lat},${mapCenter.lng}&zoom=${mapZoom}&maptype=${mapType}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Map Controls Overlay */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
                <Select value={mapType} onValueChange={(value: any) => setMapType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roadmap">Roadmap</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Current Location Marker */}
              {currentLocation && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <span className="font-medium text-sm">Your Location</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>Lat: {currentLocation.latitude.toFixed(6)}</div>
                    <div>Lng: {currentLocation.longitude.toFixed(6)}</div>
                    <div>Accuracy: ±{currentLocation.accuracy}m</div>
                    {currentLocation.address && (
                      <div className="mt-1 font-medium">{currentLocation.address}</div>
                    )}
                  </div>
                </div>
              )}
              </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls and Info Panel */}
        <div className="space-y-6">
          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="radius">Search Radius (km)</Label>
                <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="specialization">Doctor Specialization</Label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Specializations</SelectItem>
                    <SelectItem value="General Physician">General Physician</SelectItem>
                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                    <SelectItem value="Neurologist">Neurologist</SelectItem>
                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                    <SelectItem value="ENT Specialist">ENT Specialist</SelectItem>
                    <SelectItem value="Ophthalmologist">Ophthalmologist</SelectItem>
                    <SelectItem value="Dentist">Dentist</SelectItem>
                    <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={loadNearbyMedical} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Nearby
              </Button>
            </CardContent>
          </Card>

          {/* Current Location Info */}
          {currentLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-500" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Coordinates:</div>
                  <div className="font-mono text-xs">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </div>
                </div>
                
                {currentLocation.address && (
                  <div className="text-sm">
                    <div className="font-medium">Address:</div>
                    <div className="text-xs text-gray-600">{currentLocation.address}</div>
                  </div>
                )}
                
                <div className="text-sm">
                  <div className="font-medium">Accuracy:</div>
                  <div className="text-xs text-green-600">±{currentLocation.accuracy}m</div>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium">Last Updated:</div>
                  <div className="text-xs text-gray-600">
                    {new Date(currentLocation.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={shareLocation}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportLocationData}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nearby Medical Facilities */}
          {(nearbyDoctors.length > 0 || nearbyClinics.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-500" />
                  Nearby Medical Facilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {nearbyDoctors.slice(0, 3).map((doctor) => (
                  <div key={doctor._id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{doctor.name}</div>
                        <div className="text-xs text-gray-600">{doctor.specialization}</div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="ml-1 text-xs">{doctor.rating.average.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      <div>{doctor.clinicName}</div>
                      <div>{doctor.clinicAddress.street}, {doctor.clinicAddress.city}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-medium">₹{doctor.consultationFee}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => doctor.clinicAddress.coordinates && getDirections(doctor.clinicAddress.coordinates)}
                      >
                        <Route className="h-3 w-3 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                ))}
                
                {nearbyClinics.slice(0, 2).map((clinic) => (
                  <div key={clinic._id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{clinic.name}</div>
                        <div className="text-xs text-gray-600">{clinic.type}</div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="ml-1 text-xs">{clinic.rating.average.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      <div>{clinic.address.street}, {clinic.address.city}</div>
                      <div>{clinic.contact.phone}</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clinic.address.coordinates && getDirections(clinic.address.coordinates)}
                    >
                      <Route className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Location History */}
      {locationHistory.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Location History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locationHistory.slice(0, 10).map((location) => (
                <div key={location._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(location.timestamp).toLocaleString()}
                      </div>
                      {location.address && (
                        <div className="text-xs text-gray-600">{location.address}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {location.locationType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoogleMapsGpsTracking;
