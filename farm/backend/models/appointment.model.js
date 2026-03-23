const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: false
  },
  appointmentType: {
    type: String,
    required: true,
    enum: ['Consultation', 'Follow-up', 'Emergency', 'Surgery', 'Vaccination', 'Check-up', 'Online Consultation']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  consultationType: {
    type: String,
    enum: ['In-Person', 'Online', 'Home Visit'],
    default: 'In-Person'
  },
  fee: {
    amount: Number,
    currency: String,
    paid: { type: Boolean, default: false }
  },
  location: {
    type: String,
    enum: ['Clinic', 'Home', 'Online', 'Hospital']
  },
  notes: String,
  prescription: {
    medicines: [{
      name: String,
      dosage: String,
      duration: String,
      instructions: String
    }],
    tests: [{
      name: String,
      result: String,
      normalRange: String
    }],
    advice: String,
    followUpDate: Date
  },
  reminderSettings: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    reminderTime: { type: Number, default: 60 } // minutes before appointment
  },
  gpsLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ patientId: 1, scheduledDate: -1 });
appointmentSchema.index({ doctorId: 1, scheduledDate: -1 });
appointmentSchema.index({ clinicId: 1, scheduledDate: -1 });
appointmentSchema.index({ status: 1, scheduledDate: -1 });

// Virtual for appointment time
appointmentSchema.virtual('appointmentTime').get(function() {
  return `${this.scheduledDate.toTimeString().slice(0, 5)} - ${new Date(this.scheduledDate.getTime() + this.duration * 60000).toTimeString().slice(0, 5)}`;
});

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcomingAppointments = function(userId, limit = 10) {
  const now = new Date();
  return this.find({
    userId: userId,
    scheduledDate: { $gte: now },
    status: { $in: ['Scheduled', 'Confirmed'] }
  }).populate('patientId doctorId clinicId')
    .sort({ scheduledDate: 1 })
    .limit(limit);
};

module.exports = mongoose.model('Appointment', appointmentSchema);
