import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  TrendingUp
} from 'lucide-react';
import { gpsApi, gpsUtils } from '@/Backend/api/gpsApi';
import { toast } from 'sonner';

interface LocationData {
  _id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp: string;
  locationType: string;
  address?: string;
}

interface GpsTrackingProps {
  todoId?: string;
  onLocationUpdate?: (location: LocationData) => void;
}

export const GpsTracking: React.FC<GpsTrackingProps> = ({ todoId, onLocationUpdate }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadCurrentLocation();
    loadLocationStats();
    return () => {
      if (watchId !== null) {
        gpsUtils.clearWatch(watchId);
      }
    };
  }, []);

  const loadCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await gpsApi.getCurrentLocation();
      setCurrentLocation(location);
      onLocationUpdate?.(location);
      setError(null);
    } catch (err) {
      console.error('Failed to load current location:', err);
      setError('Failed to load current location');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationHistory = async () => {
    try {
      const history = await gpsApi.getLocationHistory({ limit: 10 });
      setLocationHistory(history);
    } catch (err) {
      console.error('Failed to load location history:', err);
    }
  };

  const loadLocationStats = async () => {
    try {
      const statsData = await gpsApi.getLocationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load location stats:', err);
    }
  };

  const getCurrentPosition = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const position = await gpsUtils.getCurrentPosition();
      const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

      // Get address from coordinates
      const address = await gpsUtils.getAddressFromCoordinates(latitude, longitude);

      const locationData = {
        latitude,
        longitude,
        accuracy,
        altitude: altitude || undefined,
        altitudeAccuracy: altitudeAccuracy || undefined,
        heading: heading || undefined,
        speed: speed || undefined,
        todoId,
        locationType: (todoId ? 'todo_location' : 'current') as 'current' | 'todo_location' | 'check_in' | 'check_out',
        address
      };

      const savedLocation = await gpsApi.createRecord(locationData);
      setCurrentLocation(savedLocation);
      onLocationUpdate?.(savedLocation);
      
      toast.success('Location saved successfully');
      loadLocationHistory();
      loadLocationStats();

    } catch (err: any) {
      console.error('Failed to get current position:', err);
      setError(err.message || 'Failed to get current position');
      toast.error('Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = () => {
    try {
      const id = gpsUtils.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy, altitude, speed } = position.coords;
          
          const locationData = {
            latitude,
            longitude,
            accuracy,
            altitude: altitude || undefined,
            speed: speed || undefined,
            todoId,
            locationType: (todoId ? 'todo_location' : 'current') as 'current' | 'todo_location' | 'check_in' | 'check_out'
          };

          try {
            const savedLocation = await gpsApi.createRecord(locationData);
            setCurrentLocation(savedLocation);
            onLocationUpdate?.(savedLocation);
          } catch (err) {
            console.error('Failed to save tracked location:', err);
          }
        },
        (error) => {
          console.error('GPS tracking error:', error);
          setError('GPS tracking error: ' + error.message);
        }
      );

      setWatchId(id);
      setIsTracking(true);
      toast.success('GPS tracking started');

    } catch (err: any) {
      console.error('Failed to start tracking:', err);
      setError(err.message || 'Failed to start tracking');
      toast.error('Failed to start GPS tracking');
    }
  };

  const stopTracking = () => {
    if (watchId !== null) {
      gpsUtils.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
      toast.success('GPS tracking stopped');
    }
  };

  const checkIn = async () => {
    if (!currentLocation) {
      toast.error('No current location available');
      return;
    }

    try {
      await gpsApi.checkInTodo(
        todoId!,
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.address
      );
      toast.success('Checked in successfully');
      loadLocationHistory();
    } catch (err: any) {
      console.error('Failed to check in:', err);
      toast.error('Failed to check in');
    }
  };

  const checkOut = async () => {
    if (!currentLocation) {
      toast.error('No current location available');
      return;
    }

    try {
      await gpsApi.checkOutTodo(
        todoId!,
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.address
      );
      toast.success('Checked out successfully');
      loadLocationHistory();
    } catch (err: any) {
      console.error('Failed to check out:', err);
      toast.error('Failed to check out');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentLocation ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coordinates:</span>
                <span className="text-sm text-gray-600">
                  {gpsUtils.formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                </span>
              </div>
              
              {currentLocation.address && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm text-gray-600">{currentLocation.address}</span>
                </div>
              )}

              {currentLocation.accuracy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Accuracy:</span>
                  <span className="text-sm text-gray-600">
                    {gpsUtils.formatAccuracy(currentLocation.accuracy)}
                  </span>
                </div>
              )}

              {currentLocation.speed && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Speed:</span>
                  <span className="text-sm text-gray-600">
                    {gpsUtils.formatSpeed(currentLocation.speed)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Updated:</span>
                <span className="text-sm text-gray-600">
                  {formatTimestamp(currentLocation.timestamp)}
                </span>
              </div>

              <Badge variant={currentLocation.locationType === 'current' ? 'default' : 'secondary'}>
                {currentLocation.locationType.replace('_', ' ')}
              </Badge>
            </div>
          ) : (
            <p className="text-gray-500">No location data available</p>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              onClick={getCurrentPosition}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isLoading ? 'Getting Location...' : 'Get Current Location'}
            </Button>

            {isTracking ? (
              <Button onClick={stopTracking} variant="destructive">
                Stop Tracking
              </Button>
            ) : (
              <Button onClick={startTracking} variant="outline">
                Start Tracking
              </Button>
            )}
          </div>

          {todoId && (
            <div className="flex gap-2 mt-2">
              <Button onClick={checkIn} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Check In
              </Button>
              <Button onClick={checkOut} variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-1" />
                Check Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Location Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalRecords}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.last24Hours}</div>
                <div className="text-sm text-gray-600">Last 24 Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.last7Days}</div>
                <div className="text-sm text-gray-600">Last 7 Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.uniqueTodos}</div>
                <div className="text-sm text-gray-600">Unique Todos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locationHistory.length > 0 ? (
            <div className="space-y-3">
              {locationHistory.map((location) => (
                <div key={location._id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{location.locationType.replace('_', ' ')}</Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(location.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div>{gpsUtils.formatCoordinates(location.latitude, location.longitude)}</div>
                    {location.address && (
                      <div className="text-gray-600 mt-1">{location.address}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No location history available</p>
          )}
          
          <Button
            onClick={loadLocationHistory}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Refresh History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
