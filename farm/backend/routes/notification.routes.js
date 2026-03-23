const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getVoiceAnnouncements,
  triggerVoiceAnnouncement,
  deleteNotification
} = require('../controllers/notification.controller');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Notification routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification); // Add DELETE route

// Voice announcement routes
router.get('/voice', getVoiceAnnouncements);
router.post('/voice/:todoId', triggerVoiceAnnouncement);

module.exports = router;
