import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Phone,
  Mail,
  Star,
  Search,
  Route,
  Users,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const VeterinaryGpsTracking: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState(20);
  const [loading, setLoading] = useState(false);
  const [showNearbyVets, setShowNearbyVets] = useState(false);

  // Demo veterinary doctors data
  const demoVeterinarians = [
    {
      _id: '1',
      name: 'Dr. Ramesh Kumar',
      specialization: 'Large Animal Veterinarian',
      qualification: 'BVSc, MVSc, PhD',
      experience: 15,
      phone: '+91-9876543210',
      email: 'ramesh.vet@example.com',
      clinicName: 'City Veterinary Hospital',
      clinicAddress: {
        street: '123 Veterinary Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      },
      consultationFee: 800,
      rating: { average: 4.8, count: 156 },
      isVerified: true,
      services: ['Large Animal Surgery', 'Poultry Health Management', 'Cattle Reproduction', 'Emergency Care'],
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
      },
      animalSpecializations: ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Pigs', 'Horses']
    },
    {
      _id: '2',
      name: 'Dr. Priya Sharma',
      specialization: 'Poultry Specialist',
      qualification: 'BVSc, MVSc',
      experience: 12,
      phone: '+91-9876543211',
      email: 'priya.vet@example.com',
      clinicName: 'Rural Poultry Care Center',
      clinicAddress: {
        street: '456 Poultry Farm Road',
        city: 'Hosur',
        state: 'Karnataka',
        pincode: '562101'
      },
      consultationFee: 600,
      rating: { average: 4.6, count: 89 },
      isVerified: true,
      services: ['Poultry Disease Management', 'Vaccination Programs', 'Biosecurity', 'Nutrition Consulting'],
      availability: {
        monday: { available: true, timings: '8:00 AM - 5:00 PM' },
        tuesday: { available: true, timings: '8:00 AM - 5:00 PM' },
        wednesday: { available: true, timings: '8:00 AM - 5:00 PM' },
        thursday: { available: true, timings: '8:00 AM - 5:00 PM' },
        friday: { available: true, timings: '8:00 AM - 5:00 PM' },
        saturday: { available: true, timings: '9:00 AM - 2:00 PM' },
        sunday: { available: false, timings: 'Closed' }
      },
      emergencyServices: {
        available24x7: true,
        emergencyContact: '+91-9876543211',
        mobileClinic: true
      },
      animalSpecializations: ['Poultry', 'Ducks', 'Turkeys', 'Quails']
    },
    {
      _id: '3',
      name: 'Dr. Amit Patel',
      specialization: 'Cattle Specialist',
      qualification: 'BVSc, MVSc, PhD (Veterinary Science)',
      experience: 18,
      phone: '+91-9876543212',
      email: 'amit.vet@example.com',
      clinicName: 'Mobile Veterinary Services',
      clinicAddress: {
        street: '789 Farm Road',
        city: 'Bangalore Rural',
        state: 'Karnataka',
        pincode: '562103'
      },
      consultationFee: 1000,
      rating: { average: 4.9, count: 203 },
      isVerified: true,
      services: ['Cattle Reproduction', 'Large Animal Surgery', 'Nutrition Consulting', 'Emergency Care'],
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
      },
      animalSpecializations: ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Camels']
    }
  ];

  const [nearbyVets, setNearbyVets] = useState(demoVeterinarians);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
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
        setLoading(false);
        toast.success('Location obtained successfully');
        setShowNearbyVets(true);
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

  const filterVetsByAnimalType = () => {
    let filtered = demoVeterinarians;
    
    if (selectedAnimalType) {
      filtered = filtered.filter(vet => 
        vet.animalSpecializations.includes(selectedAnimalType)
      );
    }
    
    setNearbyVets(filtered);
    setShowNearbyVets(true);
  };

  const getAnimalIcon = (animalType: string) => {
    switch (animalType) {
      case 'Cattle': return '🐄';
      case 'Buffalo': return '🐃';
      case 'Goat': return '🐐';
      case 'Sheep': return '🐑';
      case 'Poultry': return '🐔';
      case 'Pigs': return '🐷';
      case 'Horses': return '🐴';
      default: return '🐾';
    }
  };

  const getTodayTimings = (vet: any) => {
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDay = days[today];
    
    if (vet.availability[todayDay]) {
      return vet.availability[todayDay].timings;
    }
    return 'Closed';
  };

  const openGoogleMaps = (vet: any) => {
    const address = `${vet.clinicAddress.street}, ${vet.clinicAddress.city}, ${vet.clinicAddress.state} ${vet.clinicAddress.pincode}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const callVeterinarian = (vet: any) => {
    window.open(`tel:${vet.phone}`, '_blank');
  };

  const emailVeterinarian = (vet: any) => {
    window.open(`mailto:${vet.email}`, '_blank');
  };

  const bookAppointment = (vet: any) => {
    toast.success(`Appointment booking initiated with ${vet.name}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🐄 Veterinary GPS Tracking</h1>
        <p className="text-gray-600">Find specialized veterinarians for your poultry, cattle, and other farm animals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Maps Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Live Veterinary Map
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
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNearbyVets(!showNearbyVets)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {showNearbyVets ? 'Hide' : 'Show'} Vets
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[500px] relative">
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

        {/* Controls and Veterinarian List */}
        <div className="space-y-6">
          {/* Animal Type Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Animal Type Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="animalType">Select Animal Type</Label>
                <Select value={selectedAnimalType} onValueChange={setSelectedAnimalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Animal Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Animal Types</SelectItem>
                    <SelectItem value="Cattle">🐄 Cattle</SelectItem>
                    <SelectItem value="Buffalo">🐃 Buffalo</SelectItem>
                    <SelectItem value="Goat">🐐 Goat</SelectItem>
                    <SelectItem value="Sheep">🐑 Sheep</SelectItem>
                    <SelectItem value="Poultry">🐔 Poultry</SelectItem>
                    <SelectItem value="Pigs">🐷 Pigs</SelectItem>
                    <SelectItem value="Horses">🐴 Horses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="radius">Search Radius (km)</Label>
                <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="20">20 km</SelectItem>
                    <SelectItem value="30">30 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={filterVetsByAnimalType} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Filter Veterinarians
              </Button>
            </CardContent>
          </Card>

          {/* Nearby Veterinarians */}
          {showNearbyVets && nearbyVets.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Nearby Veterinarians
                    <Badge variant="secondary" className="ml-2">
                      {nearbyVets.length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {nearbyVets.map((vet) => (
                  <div key={vet._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">{vet.name}</div>
                        <div className="text-sm text-gray-600">{vet.specialization}</div>
                        <div className="text-xs text-gray-500">{vet.qualification}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm font-medium">{vet.rating.average.toFixed(1)}</span>
                          <span className="ml-1 text-xs text-gray-500">({vet.rating.count} reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      <div className="font-medium">{vet.clinicName}</div>
                      <div>{vet.clinicAddress.street}, {vet.clinicAddress.city}</div>
                    </div>
                    
                    {/* Animal Specializations */}
                    <div className="mb-2">
                      <div className="text-xs font-medium mb-1">Animal Specializations:</div>
                      <div className="flex flex-wrap gap-1">
                        {vet.animalSpecializations.slice(0, 4).map((animal) => (
                          <Badge key={animal} variant="outline" className="text-xs mr-1">
                            {getAnimalIcon(animal)} {animal}
                          </Badge>
                        ))}
                        {vet.animalSpecializations.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{vet.animalSpecializations.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Services */}
                    <div className="mb-2">
                      <div className="text-xs font-medium mb-1">Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {vet.services.slice(0, 3).map((service) => (
                          <Badge key={service} variant="outline" className="text-xs mb-1">
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
                    
                    {/* Availability */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Today:</span>
                        <Badge variant="default" className="text-xs">
                          {getTodayTimings(vet)}
                        </Badge>
                      </div>
                      {vet.emergencyServices.available24x7 && (
                        <Badge variant="destructive" className="text-xs">
                          🚑 24/7 Emergency
                        </Badge>
                      )}
                    </div>
                    
                    {/* Contact Info */}
                    <div className="text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{vet.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{vet.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">₹{vet.consultationFee}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openGoogleMaps(vet)}
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
                          onClick={() => window.open(`tel:${vet.emergencyServices.emergencyContact}`, '_blank')}
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
          )}

          {/* No Vets Found */}
          {showNearbyVets && nearbyVets.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Veterinarians Found</h3>
                    <p className="text-gray-600 mb-4">
                      Try expanding your search radius or check your location settings.
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">💡 Tip:</span> Make sure GPS is enabled in your browser
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">📍 Location:</span> Veterinarians are shown within {searchRadius}km of your current location
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">🐄 Specialization:</span> Filter by animal type for better results
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeterinaryGpsTracking;
