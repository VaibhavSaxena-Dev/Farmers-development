import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';

const ANIMAL_SPECIALIZATION = {
  cattle: 'Livestock & Cattle',
  poultry: 'Poultry',
  goats: 'Livestock & Cattle',
  sheep: 'Livestock & Cattle',
  pigs: 'Livestock & Cattle',
  horses: 'Equine',
  buffalo: 'Livestock & Cattle',
};

const VeterinaryGpsTracking = () => {
  const { t } = useLanguage();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animalType, setAnimalType] = useState('');
  const [range, setRange] = useState(10);
  const [vetResults, setVetResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const vetMarkersRef = useRef([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (window.google?.maps) {
      initMap();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=beta`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, []);

  const initMap = () => {
    if (!mapRef.current || typeof google === 'undefined') return;
    if (googleMapRef.current) return;
    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      mapId: 'DEMO_MAP_ID'
    });
  };

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(location);
            googleMapRef.current.setZoom(14);
            
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            
            markerRef.current = new google.maps.Marker({
              position: location,
              map: googleMapRef.current,
              title: 'Your Location'
            });
          }
          
          setLoading(false);
        },
        (error) => {
          alert('Failed to get location. Please enable location access.');
          setLoading(false);
        }
      );
    }
  };

  const searchVeterinarians = async () => {
    if (!currentLocation) {
      alert('Please get your location first!');
      return;
    }

    setSearching(true);
    setSearched(true);
    setVetResults([]);

    // Clear old vet markers
    vetMarkersRef.current.forEach(m => m.setMap(null));
    vetMarkersRef.current = [];

    try {
      const specialization = animalType ? ANIMAL_SPECIALIZATION[animalType] : '';
      const params = new URLSearchParams({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        maxDistance: range,
        ...(specialization && { specialization }),
      });

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/medical/doctors/nearby?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const doctors = data.doctors || [];
      setVetResults(doctors);

      // Drop markers on map for each result
      if (googleMapRef.current && typeof google !== 'undefined') {
        doctors.forEach(doc => {
          const lat = doc.clinicAddress?.coordinates?.latitude;
          const lng = doc.clinicAddress?.coordinates?.longitude;
          if (!lat || !lng) return;
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: googleMapRef.current,
            title: doc.name,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          });
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${doc.name}</strong><br/>${doc.clinicName}<br/>${doc.specialization}</div>`
          });
          marker.addListener('click', () => infoWindow.open(googleMapRef.current, marker));
          vetMarkersRef.current.push(marker);
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const searchOnGoogleMaps = () => {
    if (!currentLocation) {
      alert('Please get your location first!');
      return;
    }
    const animal = animalType ? `${animalType} ` : '';
    const query = `${animal}veterinarian near me`;
    const zoom = range <= 5 ? 14 : range <= 10 ? 13 : range <= 25 ? 12 : 11;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${currentLocation.lat},${currentLocation.lng},${zoom}z`;
    window.open(url, '_blank');

    // Also drop markers on the embedded live map
    if (!googleMapRef.current || typeof google === 'undefined') return;
    vetMarkersRef.current.forEach(m => m.setMap(null));
    vetMarkersRef.current = [];

    const keyword = animalType ? `${animalType} veterinarian` : 'veterinarian';
    const service = new google.maps.places.PlacesService(googleMapRef.current);
    const location = new google.maps.LatLng(currentLocation.lat, currentLocation.lng);

    service.nearbySearch(
      { location, radius: range * 1000, keyword },
      (results, status) => {
        if (status !== 'OK' || !results?.length) return;
        results.slice(0, 15).forEach((place) => {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: googleMapRef.current,
            title: place.name,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          });
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${place.name}</strong><br/>${place.vicinity || ''}</div>`
          });
          marker.addListener('click', () => infoWindow.open(googleMapRef.current, marker));
          vetMarkersRef.current.push(marker);
        });
        googleMapRef.current.setCenter(currentLocation);
        googleMapRef.current.setZoom(range <= 5 ? 14 : range <= 10 ? 13 : range <= 25 ? 12 : 11);
      }
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4" style={{ paddingTop: '7.5rem' }}>
      <div className="container mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3" style={{ scrollMarginTop: '6.5rem' }}>
            <span className="text-4xl">🐄</span>
            {t('gpsTrackingTitle')}
          </h1>
          <p className="text-gray-600 mt-1">{t('gpsTrackingSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">🗺️ {t('liveMapTitle')}</h2>
          <div ref={mapRef} style={{ width: '100%', height: '400px' }} className="rounded-lg mb-4"></div>
          <button 
            onClick={getLocation}
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? t('gettingLocation') : t('getMyLocation')}
          </button>
          {currentLocation && (
            <div className="bg-green-50 p-3 rounded-lg mt-4">
              <h4 className="font-semibold text-green-800">{t('yourLocation')}:</h4>
              <p className="text-sm text-gray-600">Lat: {currentLocation.lat.toFixed(6)}</p>
              <p className="text-sm text-gray-600">Lng: {currentLocation.lng.toFixed(6)}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">🔍 {t('searchFiltersTitle')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('animalTypeLabel')}</label>
              <select 
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">{t('allAnimals')}</option>
                <option value="cattle">🐄 {t('cattleOption')}</option>
                <option value="poultry">🐔 {t('poultryOption')}</option>
                <option value="goats">🐐 {t('goatsOption')}</option>
                <option value="sheep">🐑 {t('sheepOption')}</option>
                <option value="pigs">🐷 {t('pigsOption')}</option>
                <option value="horses">🐴 {t('horsesOption')}</option>
                <option value="buffalo">🐃 {t('buffaloOption')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('rangeLabel')}: {range} km</label>
              <input
                type="range"
                min="5"
                max="50"
                value={range}
                onChange={(e) => setRange(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 km</span>
                <span>50 km</span>
              </div>
            </div>
            <button
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              onClick={searchVeterinarians}
              disabled={searching || !currentLocation}
            >
              {searching ? `🔍 ${t('searchingText')}` : `🔍 ${t('searchInNetwork')}`}
            </button>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={searchOnGoogleMaps}
              disabled={!currentLocation}
            >
              🗺️ {t('searchOnGoogleMaps')}
            </button>
          </div>
        </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {vetResults.length > 0
                  ? t('foundVetsTitle', { 
                      count: vetResults.length, 
                      s: vetResults.length > 1 ? 's' : '', 
                      animal: animalType || t('allAnimals'), 
                      range 
                    })
                  : t('noVetsFound', { 
                      animal: animalType || t('allAnimals'), 
                      range 
                    })}
              </h2>
              <button
                onClick={searchOnGoogleMaps}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap ml-4"
              >
                🗺️ {t('alsoSearchGoogle')}
              </button>
            </div>
            {vetResults.length === 0 && (
              <p className="text-gray-500 text-sm">{t('tryGoogleMaps')}</p>
            )}
            {vetResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vetResults.map((doc) => (
                  <div key={doc._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">Registered</span>
                    </div>
                    <p className="text-sm text-green-700 font-medium mt-1">{doc.specialization}</p>
                    <p className="text-sm text-gray-600 mt-1">{doc.clinicName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {[doc.clinicAddress?.street, doc.clinicAddress?.city, doc.clinicAddress?.state].filter(Boolean).join(', ')}
                    </p>
                    {doc.phone && (
                      <a href={`tel:${doc.phone}`} className="text-sm text-blue-600 mt-2 block">📞 {doc.phone}</a>
                    )}
                    <p className="text-sm font-medium mt-2">💰 ₹{doc.consultationFee}</p>
                    {doc.clinicAddress?.coordinates?.latitude && (
                      <button
                        className="mt-3 w-full text-sm bg-blue-50 text-blue-700 border border-blue-200 py-1.5 rounded hover:bg-blue-100"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${doc.clinicAddress.coordinates.latitude},${doc.clinicAddress.coordinates.longitude}`, '_blank')}
                      >
                        🧭 Get Directions
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default VeterinaryGpsTracking;
