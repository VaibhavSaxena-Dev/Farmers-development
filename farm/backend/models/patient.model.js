const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    },
    aadhaarNumber: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^[2-9]\d{11}$/.test(v);
        },
        message: 'Invalid Aadhaar number format'
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[0-9+\-?\d]*$/.test(v);
        },
        message: 'Phone number must contain only digits'
      }
    },
    email: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  medicalHistory: {
    allergies: [{
      allergen: String,
      severity: String,
      notes: String
    }],
    chronicDiseases: [{
      name: String,
      diagnosedDate: Date,
      status: String // Active, Controlled, Resolved
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date
    }],
    pastSurgeries: [{
      name: String,
      date: Date,
      hospital: String
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    validUpto: Date,
    coverage: String
  },
  preferences: {
    preferredLanguage: String,
    preferredDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    preferredClinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic'
    }
  },
  lastVisit: {
    date: Date,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic'
    },
    reason: String,
    notes: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
patientSchema.index({ userId: 1 });
patientSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
patientSchema.index({ 'contact.phone': 1 });

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`.trim();
});

// Virtual for age
patientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Static method to find patients by location
patientSchema.statics.findPatientsNearLocation = function(latitude, longitude, maxDistance = 10) {
  return this.find({
    isActive: true,
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

module.exports = mongoose.model('Patient', patientSchema);
