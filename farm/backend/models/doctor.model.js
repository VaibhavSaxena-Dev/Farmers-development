const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
  specialization: {
    type: String,
    required: true,
    enum: ['Livestock & Cattle', 'Poultry', 'Small Animals', 'Equine', 'Wildlife', 'Veterinary Surgeon', 'Dairy Animal Health', 'Poultry Disease Specialist', 'Rural Veterinary Practice', 'Veterinary Public Health']
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  previousWorkPlaceName: { type: String, trim: true },
  previousWorkPlaceDetails: { type: String, trim: true },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\d\s+\-()]+$/.test(String(v).trim()) && String(v).replace(/\D/g, '').length >= 10;
      },
      message: 'Phone must contain at least 10 digits (spaces, +, -, () allowed)'
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  clinicName: {
    type: String,
    required: true,
    trim: true
  },
  clinicAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    monday: { available: Boolean, timings: String },
    tuesday: { available: Boolean, timings: String },
    wednesday: { available: Boolean, timings: String },
    thursday: { available: Boolean, timings: String },
    friday: { available: Boolean, timings: String },
    saturday: { available: Boolean, timings: String },
    sunday: { available: Boolean, timings: String }
  },
  services: [{
    type: String,
    trim: true
  }],
  education: {
    degree: String,
    college: String,
    year: Number
  },
  languages: [{
    type: String,
    trim: true
  }],
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, min: 0, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String, // URLs to stored documents
    uploadedAt: Date
  }],
  profileImage: String,
  about: String,
  socialLinks: {
    website: String,
    linkedin: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'clinicAddress.coordinates': '2dsphere' });
doctorSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for full clinic address
doctorSchema.virtual('fullClinicAddress').get(function() {
  const addr = this.clinicAddress;
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.replace(/^,\s*/, ', ');
});

// Static method to find nearby doctors
doctorSchema.statics.findNearbyDoctors = function(latitude, longitude, maxDistance = 10) {
  return this.find({
    isActive: true,
    isVerified: true,
    'clinicAddress.coordinates': {
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

module.exports = mongoose.model('Doctor', doctorSchema);
