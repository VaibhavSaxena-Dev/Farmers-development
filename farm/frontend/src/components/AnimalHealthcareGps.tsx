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
  Phone,
  Mail,
  Star,
  Search,
  Filter,
  Route,
  Share2,
  Download,
  Users,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Veterinarian {
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
  services: string[];
  availability: {
    monday: { available: boolean; timings: string };
    tuesday: { available: boolean; timings: string };
    wednesday: { available: boolean; timings: string };
    thursday: { available: boolean; timings: string };
    friday: { available: boolean; timings: string };
    saturday: { available: boolean; timings: string };
    sunday: { available: boolean; timings: string };
  };
  emergencyServices: {
    available24x7: boolean;
    emergencyContact: string;
    mobileClinic: boolean;
  };
}

interface Animal {
  _id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  weight: string;
  owner: string;
  medicalHistory: string[];
  lastCheckup: string;
  nextVaccination: string;
}

const AnimalHealthcareGps: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyVets, setNearbyVets] = useState<Veterinarian[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [searchRadius, setSearchRadius] = useState(15); // 15km for rural areas
  const [selectedService, setSelectedService] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Bangalore
  const [mapZoom, setMapZoom] = useState(12);
  const [loading, setLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

  // Demo veterinarians data
  const demoVeterinarians: Veterinarian[] = [
    {
      _id: '1',
      name: 'Dr. Ramesh Kumar',
      specialization: 'Veterinarian',
      qualification: 'BVSc, MVSc',
      experience: 12,
      phone: '+91-9876543210',
      email: 'ramesh.vet@example.com',
      clinicName: 'City Animal Hospital',
      clinicAddress: {
        street: '456 Pet Care Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        coordinates: { latitude: 12.9716, longitude: 77.5946 }
      },
      consultationFee: 800,
      rating: { average: 4.7, count: 156 },
      isVerified: true,
      services: ['General Checkup', 'Vaccination', 'Surgery', 'Emergency Care', 'Dental Care'],
      availability: {
        monday: { available: true, timings: '9:00 AM - 6:00 PM' },
        tuesday: { available: true, timings: '9:00 AM - 6:00 PM' },
        wednesday: { available: true, timings: '9:00 AM - 6:00 PM' },
        thursday: { available: true, timings: '9:00 AM - 6:00 PM' },
        friday: { available: true, timings: '9:00 AM - 6:00 PM' },
        saturday: { available: true, timings: '10:00 AM - 4:00 PM' },
        sunday: { available: false, timings: 'Closed' }
      },
      emergencyServices: {
        available24x7: true,
        emergencyContact: '+91-9876543210',
        mobileClinic: true
      }
    },
    {
      _id: '2',
      name: 'Dr. Priya Patel',
      specialization: 'Veterinarian',
      qualification: 'BVSc, MVSc',
      experience: 8,
      phone: '+91-9876543211',
      email: 'priya.vet@example.com',
      clinicName: 'Rural Animal Care Center',
      clinicAddress: {
        street: '101 Village Road',
        city: 'Bangalore Rural',
        state: 'Karnataka',
        pincode: '560004',
        coordinates: { latitude: 12.9695, longitude: 77.5930 }
      },
      consultationFee: 600,
      rating: { average: 4.5, count: 89 },
      isVerified: true,
      services: ['Large Animal Care', 'Poultry Treatment', 'Vaccination Camps', 'Mobile Clinic'],
      availability: {
        monday: { available: true, timings: '8:00 AM - 5:00 PM' },
        tuesday: { available: true, timings: '8:00 AM - 5:00 PM' },
        wednesday: { available: true, timings: '8:00 AM - 5:00 PM' },
        thursday: { available: true, timings: '8:00 AM - 5:00 PM' },
        friday: { available: true, timings: '8:00 AM - 5:00 PM' },
        saturday: { available: true, timings: '10:00 AM - 2:00 PM' },
        sunday: { available: false, timings: 'Closed' }
      },
      emergencyServices: {
        available24x7: true,
        emergencyContact: '+91-9876543211',
        mobileClinic: true
      }
    },
    {
      _id: '3',
      name: 'Dr. Amit Sharma',
      specialization: 'Veterinarian',
      qualification: 'BVSc, MVSc',
      experience: 15,
      phone: '+91-9876543212',
      email: 'amit.vet@example.com',
      clinicName: 'Mobile Veterinary Services',
      clinicAddress: {
        street: '789 Farm Road',
        city: 'Hosur',
        state: 'Karnataka',
        pincode: '562101',
        coordinates: { latitude: 12.9705, longitude: 77.5965 }
      },
      consultationFee: 1000,
      rating: { average: 4.9, count: 203 },
      isVerified: true,
      services: ['Emergency Surgery', 'Farm Visits', 'Animal Surgery', 'Postnatal Care'],
      availability: {
        monday: { available: true, timings: 'Available 24/7' },
        tuesday: { available: true, timings: 'Available 24/7' },
        wednesday: { available: true, timings: 'Available 24/7' },
        thursday: { available: true, timings: 'Available 24/7' },
        friday: { available: true, timings: 'Available 24/7' },
        saturday: { available: true, timings: 'Available 24/7' },
        sunday: { available: true, timings: 'Available 24/7' }
      },
      emergencyServices: {
        available24x7: true,
        emergencyContact: '+91-9876543212',
        mobileClinic: true
      }
    }
  ];

  // Demo animals data
  const demoAnimals: Animal[] = [
    {
      _id: '1',
      name: 'Bholu',
      type: 'Cow',
      breed: 'Holstein Friesian',
      age: '4 years',
      weight: '450 kg',
      owner: 'Farmer Name',
      medicalHistory: ['Vaccinated', 'Regular checkups', 'Dewormed'],
      lastCheckup: '2024-01-15',
      nextVaccination: '2024-03-15'
    },
    {
      _id: '2',
      name: 'Moti',
      type: 'Buffalo',
      breed: 'Murrah',
      age: '6 years',
      weight: '380 kg',
      owner: 'Farmer Name',
      medicalHistory: ['Vaccinated', 'Foot care', 'Regular monitoring'],
      lastCheckup: '2024-01-20',
      nextVaccination: '2024-04-20'
    },
    {
      _id: '3',
      name: 'Mithu',
      type: 'Goat',
      breed: 'Jamnapari',
      age: '2 years',
      weight: '25 kg',
      owner: 'Farmer Name',
      medicalHistory: ['Vaccinated', 'Recent kidding'],
      lastCheckup: '2024-01-10',
      nextVaccination: '2024-02-10'
    }
  ];

  useEffect(() => {
    setNearbyVets(demoVeterinarians);
    setAnimals(demoAnimals);
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

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
        setMapCenter(location);
        setMapZoom(15);
        setLoading(false);
        toast.success('Location updated successfully');
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

  const openGoogleMaps = (vet: Veterinarian) => {
    if (vet.clinicAddress.coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${vet.clinicAddress.coordinates.latitude},${vet.clinicAddress.coordinates.longitude}`;
      window.open(url, '_blank');
    }
  };

  const getDirections = (vet: Veterinarian) => {
    if (currentLocation && vet.clinicAddress.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${vet.clinicAddress.coordinates.latitude},${vet.clinicAddress.coordinates.longitude}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  const callVeterinarian = (vet: Veterinarian) => {
    window.open(`tel:${vet.phone}`, '_blank');
  };

  const emailVeterinarian = (vet: Veterinarian) => {
    window.open(`mailto:${vet.email}`, '_blank');
  };

  const bookAppointment = (vet: Veterinarian) => {
    toast.success(`Appointment booking initiated with ${vet.name}`);
    // Here you would integrate with your appointment booking system
  };

  const emergencyCall = (vet: Veterinarian) => {
    if (vet.emergencyServices.emergencyContact) {
      window.open(`tel:${vet.emergencyServices.emergencyContact}`, '_blank');
      toast.success('Emergency contact called');
    }
  };

  const filterVets = () => {
    let filtered = demoVeterinarians;
    
    if (selectedService) {
      filtered = filtered.filter(vet => 
        vet.services.includes(selectedService)
      );
    }
    
    setNearbyVets(filtered);
  };

  const getAvailabilityStatus = (vet: Veterinarian) => {
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDay = days[today];
    
    if (vet.availability[todayDay as keyof typeof vet.availability]) {
      return vet.availability[todayDay as keyof typeof vet.availability].available;
    }
    return false;
  };

  const getTodayTimings = (vet: Veterinarian) => {
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDay = days[today];
    
    if (vet.availability[todayDay as keyof typeof vet.availability]) {
      return vet.availability[todayDay as keyof typeof vet.availability].timings;
    }
    return 'Closed';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🐄 Animal Healthcare GPS Tracking</h1>
        <p className="text-gray-600">Find nearby veterinarians and track locations for your animals' healthcare needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Maps Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Animal Healthcare Map
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={loading}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {loading ? 'Getting...' : 'My Location'}
                  </Button>
                  <Button
                    variant={showEmergency ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setShowEmergency(!showEmergency)}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Emergency
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[500px] relative">
              {/* Google Maps Iframe */}
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${mapCenter.lat},${mapCenter.lng}&zoom=${mapZoom}&maptype=roadmap`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Current Location Marker */}
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
              
              {/* Emergency Banner */}
              {showEmergency && (
                <div className="absolute top-4 right-4 bg-red-600 text-white rounded-lg shadow-lg p-4 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-bold">Emergency Services</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>🚑 24/7 Emergency Available</div>
                    <div>📞 Call: +91-9876543210</div>
                    <div>🏠 Mobile Clinic Services</div>
                    <div>🐄 Large Animal Care</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls and Veterinarian List */}
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
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="15">15 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="service">Service Type</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Services</SelectItem>
                    <SelectItem value="General Checkup">General Checkup</SelectItem>
                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Emergency Care">Emergency Care</SelectItem>
                    <SelectItem value="Dental Care">Dental Care</SelectItem>
                    <SelectItem value="Large Animal Care">Large Animal Care</SelectItem>
                    <SelectItem value="Poultry Treatment">Poultry Treatment</SelectItem>
                    <SelectItem value="Mobile Clinic">Mobile Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={filterVets} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Nearby Vets
              </Button>
            </CardContent>
          </Card>

          {/* My Animals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                My Animals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {animals.map((animal) => (
                <div key={animal._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm">{animal.name}</div>
                      <div className="text-xs text-gray-600">{animal.type} - {animal.breed}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {animal.age} old
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Weight: {animal.weight}</div>
                    <div>Last Checkup: {animal.lastCheckup}</div>
                    <div>Next Vaccination: {animal.nextVaccination}</div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedAnimal(animal)}
                    className="w-full mt-2"
                  >
                    <Activity className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Nearby Veterinarians */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Nearby Veterinarians
                <Badge variant="secondary" className="ml-2">
                  {nearbyVets.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {nearbyVets.map((vet) => (
                <div key={vet._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm">{vet.name}</div>
                      <div className="text-xs text-gray-600">{vet.specialization}</div>
                      <div className="text-xs text-gray-600">{vet.qualification}</div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="ml-1 text-xs">{vet.rating.average.toFixed(1)}</span>
                      {vet.isVerified && (
                        <CheckCircle className="h-3 w-3 text-green-500 ml-2" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    <div className="font-medium">{vet.clinicName}</div>
                    <div>{vet.clinicAddress.street}, {vet.clinicAddress.city}</div>
                  </div>
                  
                  {/* Availability */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Today:</span>
                      <Badge 
                        variant={getAvailabilityStatus(vet) ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {getAvailabilityStatus(vet) ? getTodayTimings(vet) : 'Closed'}
                      </Badge>
                    </div>
                    {vet.emergencyServices.available24x7 && (
                      <Badge variant="destructive" className="text-xs">
                        🚑 24/7 Emergency
                      </Badge>
                    )}
                  </div>
                  
                  {/* Services */}
                  <div className="mb-2">
                    <div className="text-xs font-medium mb-1">Services:</div>
                    <div className="flex flex-wrap gap-1">
                      {vet.services.slice(0, 3).map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {vet.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vet.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="text-xs text-gray-600 mb-3">
                    <div>📞 {vet.phone}</div>
                    <div>✉️ {vet.email}</div>
                    <div>💰 Consultation: ₹{vet.consultationFee}</div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openGoogleMaps(vet)}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Map
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => getDirections(vet)}
                    >
                      <Route className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => callVeterinarian(vet)}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => emailVeterinarian(vet)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => bookAppointment(vet)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Book
                    </Button>
                    {vet.emergencyServices.available24x7 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => emergencyCall(vet)}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Emergency
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnimalHealthcareGps;
