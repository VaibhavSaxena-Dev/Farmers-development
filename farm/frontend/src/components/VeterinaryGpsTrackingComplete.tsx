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
  Calendar,
  Clock,
  CheckCircle,
  Filter,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';

const VeterinaryGpsTracking: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filteredVets, setFilteredVets] = useState<any[]>([]);

  // Extended veterinary doctors data with different distances
  const allVeterinarians = [
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
      distance: 2.3,
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
      distance: 3.1,
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
      distance: 4.5,
      animalSpecializations: ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Camels']
    },
    {
      _id: '4',
      name: 'Dr. Sarah Williams',
      specialization: 'Mixed Animal Veterinarian',
      qualification: 'BVSc, MVSc',
      experience: 10,
      phone: '+91-9876543213',
      email: 'sarah.vet@example.com',
      clinicName: 'Comprehensive Animal Care',
      clinicAddress: {
        street: '101 Village Road',
        city: 'Bangalore Rural',
        state: 'Karnataka',
        pincode: '562104'
      },
      consultationFee: 750,
      rating: { average: 4.7, count: 67 },
      isVerified: true,
      distance: 7.8,
      animalSpecializations: ['Goat', 'Sheep', 'Poultry', 'Ducks', 'Rabbits', 'Pigs']
    },
    {
      _id: '5',
      name: 'Dr. Michael Johnson',
      specialization: 'Large Animal Surgeon',
      qualification: 'BVSc, MVSc, PhD',
      experience: 20,
      phone: '+91-9876543214',
      email: 'michael.vet@example.com',
      clinicName: 'Advanced Veterinary Surgery Center',
      clinicAddress: {
        street: '555 Medical Complex',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560099'
      },
      consultationFee: 1200,
      rating: { average: 4.9, count: 178 },
      isVerified: true,
      distance: 8.2,
      animalSpecializations: ['Cattle', 'Horses', 'Buffalo', 'Goat', 'Sheep']
    },
    {
      _id: '6',
      name: 'Dr. Anita Desai',
      specialization: 'Poultry Health Expert',
      qualification: 'BVSc, MVSc',
      experience: 14,
      phone: '+91-9876543215',
      email: 'anita.vet@example.com',
      clinicName: 'Poultry Wellness Center',
      clinicAddress: {
        street: '777 Farm Estate',
        city: 'Bangalore Rural',
        state: 'Karnataka',
        pincode: '562105'
      },
      consultationFee: 650,
      rating: { average: 4.5, count: 94 },
      isVerified: true,
      distance: 12.5,
      animalSpecializations: ['Poultry', 'Ducks', 'Turkeys', 'Quails']
    },
    {
      _id: '7',
      name: 'Dr. Rajesh Kumar',
      specialization: 'Goat and Sheep Specialist',
      qualification: 'BVSc, MVSc',
      experience: 11,
      phone: '+91-9876543216',
      email: 'rajesh.vet@example.com',
      clinicName: 'Small Ruminant Care Center',
      clinicAddress: {
        street: '888 Grazing Fields',
        city: 'Hosur',
        state: 'Karnataka',
        pincode: '562106'
      },
      consultationFee: 550,
      rating: { average: 4.4, count: 112 },
      isVerified: true,
      distance: 15.3,
      animalSpecializations: ['Goat', 'Sheep', 'Rabbits']
    },
    {
      _id: '8',
      name: 'Dr. Lakshmi Narayan',
      specialization: 'Buffalo Specialist',
      qualification: 'BVSc, MVSc',
      experience: 16,
      phone: '+91-9876543217',
      email: 'lakshmi.vet@example.com',
      clinicName: 'Buffalo Health Center',
      clinicAddress: {
        street: '999 Dairy Farm Road',
        city: 'Bangalore Rural',
        state: 'Karnataka',
        pincode: '562107'
      },
      consultationFee: 700,
      rating: { average: 4.6, count: 145 },
      isVerified: true,
      distance: 18.7,
      animalSpecializations: ['Buffalo', 'Cattle', 'Goat']
    },
    {
      _id: '9',
      name: 'Dr. Suresh Babu',
      specialization: 'Pig Health Specialist',
      qualification: 'BVSc, MVSc',
      experience: 9,
      phone: '+91-9876543218',
      email: 'suresh.vet@example.com',
      clinicName: 'Swine Care Clinic',
      clinicAddress: {
        street: '111 Piggery Road',
        city: 'Hosur',
        state: 'Karnataka',
        pincode: '562108'
      },
      consultationFee: 580,
      rating: { average: 4.3, count: 78 },
      isVerified: true,
      distance: 22.1,
      animalSpecializations: ['Pigs', 'Goat', 'Sheep']
    },
    {
      _id: '10',
      name: 'Dr. Meera Reddy',
      specialization: 'Equine Veterinarian',
      qualification: 'BVSc, MVSc, PhD',
      experience: 13,
      phone: '+91-9876543219',
      email: 'meera.vet@example.com',
      clinicName: 'Equine Medical Center',
      clinicAddress: {
        street: '222 Horse Farm Avenue',
        city: 'Bangalore Rural',
        state: 'Karnataka',
        pincode: '562109'
      },
      consultationFee: 900,
      rating: { average: 4.7, count: 89 },
      isVerified: true,
      distance: 25.4,
      animalSpecializations: ['Horses', 'Cattle', 'Goat']
    },
    {
      _id: '11',
      name: 'Dr. Prakash Sharma',
      specialization: 'General Farm Animal Vet',
      qualification: 'BVSc',
      experience: 8,
      phone: '+91-9876543220',
      email: 'prakash.vet@example.com',
      clinicName: 'Rural Veterinary Clinic',
      clinicAddress: {
        street: '333 Village Center',
        city: 'Hosur',
        state: 'Karnataka',
        pincode: '562110'
      },
      consultationFee: 450,
      rating: { average: 4.2, count: 156 },
      isVerified: true,
      distance: 31.2,
      animalSpecializations: ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry']
    },
    {
      _id: '12',
      name: 'Dr. Anjali Patel',
      specialization: 'Camel and Exotic Animals',
      qualification: 'BVSc, MVSc',
      experience: 7,
      phone: '+91-9876543221',
      email: 'anjali.vet@example.com',
      clinicName: 'Exotic Animal Care',
      clinicAddress: {
        street: '444 Safari Road',
        city: 'Bangalore Rural',
        state: 'Karnataka',
        pincode: '562111'
      },
      consultationFee: 1100,
      rating: { average: 4.8, count: 45 },
      isVerified: true,
      distance: 38.9,
      animalSpecializations: ['Camels', 'Horses', 'Goat', 'Sheep']
    }
  ];

  useEffect(() => {
    // Initialize with all veterinarians within default radius
    filterVeterinarians();
    
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
        toast.success(`Location obtained! Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get your location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.error(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const filterVeterinarians = () => {
    let filtered = allVeterinarians;
    
    // Filter by animal type
    if (selectedAnimalType) {
      filtered = filtered.filter(vet => 
        vet.animalSpecializations.some(animal => 
          animal.toLowerCase().includes(selectedAnimalType.toLowerCase())
        )
      );
      toast.success(`Found ${filtered.length} veterinarians for ${selectedAnimalType}`);
    }
    
    // Filter by distance
    filtered = filtered.filter(vet => vet.distance <= searchRadius);
    
    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);
    
    setFilteredVets(filtered);
    
    if (filtered.length === 0) {
      toast.info(`No veterinarians found within ${searchRadius}km${selectedAnimalType ? ` for ${selectedAnimalType}` : ''}`);
    } else {
      toast.success(`Showing ${filtered.length} veterinarians within ${searchRadius}km`);
    }
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
      case 'Ducks': return '🦆';
      case 'Turkeys': return '🦃';
      case 'Quails': return '🐦';
      case 'Camels': return '🐪';
      case 'Rabbits': return '🐰';
      default: return '🐾';
    }
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 rounded-lg mb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🐄</span>
                Veterinary GPS Tracking
              </h1>
              <p className="text-gray-600 mt-1">Find specialized veterinarians for your farm animals</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                {filteredVets.length} Vets Found
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Google Maps Section */}
          <div className="lg:col-span-2">
            <Card className="h-[500px] shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-6 w-6" />
                    Live Veterinary Map
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={loading}
                      className="bg-white text-green-600 hover:bg-gray-100"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      {loading ? 'Getting...' : 'My Location'}
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
                  <div className="absolute top-4 left-4 bg-white rounded-xl shadow-2xl p-4 max-w-xs border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-semibold text-sm">Your Location</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="font-mono">Lat: {currentLocation.lat.toFixed(6)}</div>
                      <div className="font-mono">Lng: {currentLocation.lng.toFixed(6)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls and Veterinarian List */}
          <div className="space-y-6">
            {/* Animal Type Filter */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filter Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <Label htmlFor="animalType" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Animal Type
                  </Label>
                  <Select value={selectedAnimalType} onValueChange={setSelectedAnimalType}>
                    <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-green-500">
                      <SelectValue placeholder="🐾 All Animal Types" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200">
                      <SelectItem value="">
                        <div className="flex items-center gap-2">
                          <span>🐾</span>
                          <span>All Animal Types</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cattle">
                        <div className="flex items-center gap-2">
                          <span>🐄</span>
                          <span>Cattle</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Buffalo">
                        <div className="flex items-center gap-2">
                          <span>🐃</span>
                          <span>Buffalo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Goat">
                        <div className="flex items-center gap-2">
                          <span>🐐</span>
                          <span>Goat</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Sheep">
                        <div className="flex items-center gap-2">
                          <span>🐑</span>
                          <span>Sheep</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Poultry">
                        <div className="flex items-center gap-2">
                          <span>🐔</span>
                          <span>Poultry</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Pigs">
                        <div className="flex items-center gap-2">
                          <span>🐷</span>
                          <span>Pigs</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Horses">
                        <div className="flex items-center gap-2">
                          <span>🐴</span>
                          <span>Horses</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="radius" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Search Radius: {searchRadius} km
                  </Label>
                  <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(parseInt(value))}>
                    <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200">
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="30">30 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={filterVeterinarians} 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search {filteredVets.length} Vets
                </Button>
              </CardContent>
            </Card>

            {/* Nearby Veterinarians */}
            {filteredVets.length > 0 && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Nearby Veterinarians
                    </CardTitle>
                    <Badge variant="secondary" className="bg-white text-green-600">
                      {filteredVets.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6 max-h-96 overflow-y-auto">
                  {filteredVets.map((vet) => (
                    <div key={vet._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-green-300">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-lg text-gray-900">{vet.name}</div>
                          <div className="text-sm text-gray-600 font-medium">{vet.specialization}</div>
                          <div className="text-xs text-gray-500">{vet.qualification}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm font-semibold">{vet.rating.average.toFixed(1)}</span>
                            <span className="ml-1 text-xs text-gray-500">({vet.rating.count} reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-3">
                        <div className="font-semibold text-gray-700">{vet.clinicName}</div>
                        <div>{vet.clinicAddress.street}, {vet.clinicAddress.city}</div>
                      </div>
                      
                      {/* Animal Specializations */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Specializations:</div>
                        <div className="flex flex-wrap gap-1">
                          {vet.animalSpecializations.slice(0, 3).map((animal) => (
                            <Badge key={animal} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                              {getAnimalIcon(animal)} {animal}
                            </Badge>
                          ))}
                          {vet.animalSpecializations.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                              +{vet.animalSpecializations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="text-xs text-gray-600 mb-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{vet.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">₹{vet.consultationFee}</span>
                          <span className="text-gray-400">consultation fee</span>
                        </div>
                      </div>
                      
                      {/* Distance Badge */}
                      <div className="mb-3">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Route className="h-3 w-3 mr-1" />
                          {vet.distance.toFixed(1)} km away
                        </Badge>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openGoogleMaps(vet)}
                          className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Route className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => callVeterinarian(vet)}
                          className="h-8 border-green-200 text-green-600 hover:bg-green-50"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => emailVeterinarian(vet)}
                          className="h-8 border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => bookAppointment(vet)}
                          className="h-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Book
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryGpsTracking;
