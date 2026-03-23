import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Search,
  Filter,
  Route,
  Share2,
  Users,
  Phone,
  Mail,
  Star,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const SimpleGpsTracking: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nearbyDoctors, setNearbyDoctors] = useState<any[]>([]);
  const [showNearbyDoctors, setShowNearbyDoctors] = useState(false);

  // Demo nearby doctors data
  const demoNearbyDoctors = [
    {
      _id: '1',
      name: 'Dr. Ramesh Kumar',
      specialization: 'General Physician',
      qualification: 'MBBS, MD',
      experience: 12,
      phone: '+91-9876543210',
      email: 'ramesh.kumar@example.com',
      clinicName: 'City Health Center',
      clinicAddress: {
        street: '123 Main Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        coordinates: { latitude: 12.9716, longitude: 77.5946 }
      },
      consultationFee: 500,
      rating: { average: 4.7, count: 156 },
      isVerified: true,
      distance: 2.3 // km from current location
    },
    {
      _id: '2',
      name: 'Dr. Priya Sharma',
      specialization: 'Pediatrician',
      qualification: 'MBBS, DCH',
      experience: 8,
      phone: '+91-9876543211',
      email: 'priya.sharma@example.com',
      clinicName: 'Childrens Hospital',
      clinicAddress: {
        street: '456 Child Care Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560002',
        coordinates: { latitude: 12.9728, longitude: 77.5930 }
      },
      consultationFee: 600,
      rating: { average: 4.5, count: 89 },
      isVerified: true,
      distance: 3.1 // km from current location
    },
    {
      _id: '3',
      name: 'Dr. Amit Patel',
      specialization: 'Cardiologist',
      qualification: 'MD, DM',
      experience: 15,
      phone: '+91-9876543212',
      email: 'amit.patel@example.com',
      clinicName: 'Heart Care Clinic',
      clinicAddress: {
        street: '789 Medical Plaza',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560003',
        coordinates: { latitude: 12.9705, longitude: 77.5965 }
      },
      consultationFee: 800,
      rating: { average: 4.9, count: 203 },
      isVerified: true,
      distance: 4.5 // km from current location
    },
    {
      _id: '4',
      name: 'Dr. Sarah Williams',
      specialization: 'Dermatologist',
      qualification: 'MBBS, DVD',
      experience: 6,
      phone: '+91-9876543213',
      email: 'sarah.williams@example.com',
      clinicName: 'Skin Care Center',
      clinicAddress: {
        street: '321 Beauty Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560004',
        coordinates: { latitude: 12.9695, longitude: 77.5930 }
      },
      consultationFee: 400,
      rating: { average: 4.3, count: 67 },
      isVerified: true,
      distance: 5.2 // km from current location
    }
  ];

  useEffect(() => {
    // Load some demo location history
    const demoHistory = [
      {
        _id: '1',
        latitude: 12.9716,
        longitude: 77.5946,
        timestamp: new Date().toISOString(),
        locationType: 'current',
        address: 'Bangalore, Karnataka, India'
      },
      {
        _id: '2',
        latitude: 12.9728,
        longitude: 77.5930,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        locationType: 'tracking',
        address: 'Indiranagar, Bangalore'
      }
    ];
    setLocationHistory(demoHistory);
    
    // Load nearby doctors when location is available
    if (currentLocation) {
      setNearbyDoctors(demoNearbyDoctors);
      setShowNearbyDoctors(true);
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setLoading(false);
        toast.success('Location obtained successfully');
        
        // Add to history
        const newLocation = {
          _id: Date.now().toString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
          locationType: 'current',
          address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        };
        setLocationHistory(prev => [newLocation, ...prev]);
        
        // Show nearby doctors when location is obtained
        setNearbyDoctors(demoNearbyDoctors);
        setShowNearbyDoctors(true);
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

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    toast.success('GPS tracking started');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        
        // Add to history
        const newLocation = {
          _id: Date.now().toString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
          locationType: 'tracking',
          address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        };
        setLocationHistory(prev => [newLocation, ...prev.slice(0, 19)]); // Keep last 20 locations
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

  const openGoogleMaps = () => {
    if (currentLocation) {
      const url = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  const shareLocation = () => {
    if (currentLocation) {
      const url = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      navigator.clipboard.writeText(url);
      toast.success('Location link copied to clipboard');
    }
  };

  const clearHistory = () => {
    setLocationHistory([]);
    toast.success('Location history cleared');
  };

  const getDirections = (doctor: any) => {
    if (currentLocation && doctor.clinicAddress?.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${doctor.clinicAddress.coordinates.latitude},${doctor.clinicAddress.coordinates.longitude}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  const callDoctor = (doctor: any) => {
    window.open(`tel:${doctor.phone}`, '_blank');
  };

  const emailDoctor = (doctor: any) => {
    window.open(`mailto:${doctor.email}`, '_blank');
  };

  const bookAppointment = (doctor: any) => {
    toast.success(`Appointment booking initiated with ${doctor.name}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📍 GPS Tracking</h1>
        <p className="text-gray-600">Real-time location tracking with nearby doctors discovery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Maps Section */}
        <div className="lg:col-span-2">
          <Card className="h-[500px]">
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
                        Stop
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={loading}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {loading ? 'Getting...' : 'Current'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[400px] relative">
              {/* Google Maps Iframe */}
              <iframe
                src={currentLocation ? 
                  `https://www.google.com/maps/embed/v1/place?q=${currentLocation.lat},${currentLocation.lng}&zoom=15&maptype=roadmap` :
                  `https://www.google.com/maps/embed/v1/place?q=12.9716,77.5946&zoom=12&maptype=roadmap`
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Current Location Info */}
              {currentLocation && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium text-sm">Your Location</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>Lat: {currentLocation.lat.toFixed(6)}</div>
                    <div>Lng: {currentLocation.lng.toFixed(6)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls and Nearby Doctors */}
        <div className="space-y-6">
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
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium">Status:</div>
                  <div className="text-xs text-green-600">
                    {isTracking ? 'Tracking Active' : 'Idle'}
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium">Last Updated:</div>
                  <div className="text-xs text-gray-600">
                    {new Date().toLocaleString()}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={openGoogleMaps}>
                    <Route className="h-4 w-4 mr-1" />
                    Open Maps
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`)}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nearby Doctors */}
          {showNearbyDoctors && nearbyDoctors.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Nearby Doctors
                    <Badge variant="secondary" className="ml-2">
                      {nearbyDoctors.length}
                    </Badge>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNearbyDoctors(!showNearbyDoctors)}
                  >
                    {showNearbyDoctors ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {nearbyDoctors.map((doctor) => (
                  <div key={doctor._id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{doctor.name}</div>
                        <div className="text-xs text-gray-600">{doctor.specialization}</div>
                        <div className="text-xs text-gray-600">{doctor.qualification}</div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="ml-1 text-xs">{doctor.rating.average.toFixed(1)}</span>
                        {doctor.isVerified && (
                          <div className="w-3 h-3 bg-green-500 rounded-full ml-2 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      <div className="font-medium">{doctor.clinicName}</div>
                      <div>{doctor.clinicAddress.street}, {doctor.clinicAddress.city}</div>
                      <div className="text-green-600 font-medium">📍 {doctor.distance} km away</div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-3">
                      <div>📞 {doctor.phone}</div>
                      <div>✉️ {doctor.email}</div>
                      <div>💰 Consultation: ₹{doctor.consultationFee}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => getDirections(doctor)}
                      >
                        <Route className="h-3 w-3 mr-1" />
                        Directions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => callDoctor(doctor)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => emailDoctor(doctor)}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => bookAppointment(doctor)}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Book
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Location History */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Location History
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {locationHistory.length} records
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="max-h-64 overflow-y-auto">
                {locationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p>No location history yet</p>
                    <p className="text-sm">Start tracking to see your location history</p>
                  </div>
                ) : (
                  locationHistory.map((location, index) => (
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleGpsTracking;
