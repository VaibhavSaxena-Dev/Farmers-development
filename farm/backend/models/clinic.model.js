const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['General Clinic', 'Dental Clinic', 'Eye Clinic', 'Maternity Clinic', 'Pediatric Clinic', 'Orthopedic Clinic', 'Cardiac Clinic', 'Mental Health Clinic', 'Veterinary Clinic', 'Ayurvedic Clinic', 'Primary Health Center']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  contact: {
    phone: String,
    email: String,
    emergency: String
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    duration: Number // in minutes
  }],
  doctors: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    availableDays: [String], // monday, tuesday, etc.
    timings: String
  }],
  facilities: [{
    name: String,
    available: Boolean
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  emergencyServices: {
    available24x7: Boolean,
    emergencyContact: String,
    nearbyHospital: String
  },
  insurance: [{
    provider: String,
    accepted: Boolean
  }],
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, min: 0, default: 0 }
  },
  images: [String], // URLs to clinic images
  description: String,
  website: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
clinicSchema.index({ userId: 1 });
clinicSchema.index({ 'address.coordinates': '2dsphere' });
clinicSchema.index({ type: 1, isActive: 1, isVerified: 1 });

// Virtual for full address
clinicSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.replace(/^,\s*/, ', ');
});

// Static method to find nearby clinics
clinicSchema.statics.findNearbyClinics = function(latitude, longitude, maxDistance = 10) {
  return this.find({
    isActive: true,
    isVerified: true,
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    }
  }).populate('userId', 'name email');
};

module.exports = mongoose.model('Clinic', clinicSchema);
