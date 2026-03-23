const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  done: {
    type: Boolean,
    default: false
  },
  due: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isImportant: {
    type: Boolean,
    default: false
  },
  voiceAnnounced: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for userId for efficient queries
todoSchema.index({ userId: 1 });
todoSchema.index({ userId: 1, done: 1 });
todoSchema.index({ userId: 1, due: 1 });
todoSchema.index({ userId: 1, isImportant: 1 });

// Virtual for overdue todos
todoSchema.virtual('isOverdue').get(function() {
  return this.due && this.due < new Date() && !this.done;
});

// Method to check if todo needs notification
todoSchema.methods.needsNotification = function() {
  if (!this.due || this.done || this.notificationSent) return false;
  
  const now = new Date();
  const timeUntilDue = this.due.getTime() - now.getTime();
  const oneHour = 60 * 60 * 1000;
  
  // Notify 1 hour before due date
  return timeUntilDue <= oneHour && timeUntilDue > 0;
};

// Method to check if todo needs voice announcement
todoSchema.methods.needsVoiceAnnouncement = function() {
  return this.isImportant && !this.voiceAnnounced && !this.done;
};

module.exports = mongoose.model('Todo', todoSchema);
