const mongoose = require('mongoose');

const gpsTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  todoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo',
    required: false
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  accuracy: {
    type: Number,
    required: false
  },
  altitude: {
    type: Number,
    required: false
  },
  altitudeAccuracy: {
    type: Number,
    required: false
  },
  heading: {
    type: Number,
    required: false,
    min: 0,
    max: 360
  },
  speed: {
    type: Number,
    required: false,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  locationType: {
    type: String,
    enum: ['current', 'todo_location', 'check_in', 'check_out'],
    default: 'current'
  },
  address: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
gpsTrackingSchema.index({ userId: 1, timestamp: -1 });
gpsTrackingSchema.index({ todoId: 1, timestamp: -1 });
gpsTrackingSchema.index({ locationType: 1, timestamp: -1 });

// Virtual for geospatial queries
gpsTrackingSchema.virtual('coordinates').get(function() {
  return {
    latitude: this.latitude,
    longitude: this.longitude
  };
});

// Static method to get user's current location
gpsTrackingSchema.statics.getCurrentLocation = async function(userId) {
  return await this.findOne({ 
    userId, 
    isActive: true,
    locationType: 'current'
  }).sort({ timestamp: -1 });
};

// Static method to get location history
gpsTrackingSchema.statics.getLocationHistory = async function(userId, options = {}) {
  const { limit = 100, startDate, endDate, todoId } = options;
  
  const query = { userId, isActive: true };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  if (todoId) {
    query.todoId = todoId;
  }
  
  return await this.find(query)
    .populate('todoId', 'title description')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get nearby locations
gpsTrackingSchema.statics.getNearbyLocations = async function(userId, radiusKm = 5) {
  const currentLocation = await this.getCurrentLocation(userId);
  if (!currentLocation) return [];
  
  return await this.find({
    userId,
    isActive: true,
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    latitude: {
      $gte: currentLocation.latitude - (radiusKm / 111),
      $lte: currentLocation.latitude + (radiusKm / 111)
    },
    longitude: {
      $gte: currentLocation.longitude - (radiusKm / (111 * Math.cos(currentLocation.latitude * Math.PI / 180))),
      $lte: currentLocation.longitude + (radiusKm / (111 * Math.cos(currentLocation.latitude * Math.PI / 180)))
    }
  }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('GpsTracking', gpsTrackingSchema);
