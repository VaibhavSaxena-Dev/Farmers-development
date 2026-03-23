const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'enterprise', 'veterinary_pro']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'cancelled', 'suspended'],
    default: 'active'
  },
  duration: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'yearly']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'cash']
  },
  features: [{
    name: String,
    enabled: {
      type: Boolean,
      default: true
    },
    limit: Number,
    used: {
      type: Number,
      default: 0
    }
  }],
  notifications: {
    renewalReminder: {
      type: Boolean,
      default: true
    },
    expiryWarning: {
      type: Boolean,
      default: true
    },
    featureLimit: {
      type: Boolean,
      default: true
    }
  },
  cancellation: {
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundProcessed: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ planId: 1 });

// Update the updatedAt field before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endDate > new Date();
});

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const diffTime = this.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
