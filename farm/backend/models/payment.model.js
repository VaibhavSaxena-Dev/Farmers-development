const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'cash', 'bank_transfer']
  },
  paymentProvider: {
    type: String,
    required: true,
    enum: ['razorpay', 'payu', 'paytm', 'phonepe', 'google_pay', 'cash']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    sparse: true // Allow multiple null values
  },
  signature: {
    type: String,
    sparse: true
  },
  description: {
    type: String,
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: ['subscription', 'premium_feature', 'marketplace', 'consultation', 'certification']
    }
  }],
  subscription: {
    planId: String,
    planName: String,
    duration: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    farmId: String,
    location: String,
    farmerType: String,
    deviceInfo: String
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    refundId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Index for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
