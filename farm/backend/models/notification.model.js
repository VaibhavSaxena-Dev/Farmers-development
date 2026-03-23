const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['due_reminder', 'overdue', 'important_created', 'voice_announcement', 'todo_created', 'vet_doctor_registered'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isSent: 1, createdAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
