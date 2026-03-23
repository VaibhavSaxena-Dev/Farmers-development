const notificationService = require('../services/notificationService');
const voiceService = require('../services/voiceService');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      req.user._id,
      parseInt(limit),
      unreadOnly === 'true'
    );

    res.json(notifications);

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({ unreadCount: count });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    
    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Get voice announcements
const getVoiceAnnouncements = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const announcements = await voiceService.getVoiceAnnouncements(
      req.user._id,
      parseInt(limit)
    );

    res.json(announcements);

  } catch (error) {
    console.error('Get voice announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch voice announcements' });
  }
};

// Trigger voice announcement for specific todo
const triggerVoiceAnnouncement = async (req, res) => {
  try {
    const Todo = require('../models/todo.model');
    
    const todo = await Todo.findOne({
      _id: req.params.todoId,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (!req.user.preferences.voiceEnabled) {
      return res.status(400).json({ error: 'Voice announcements are disabled' });
    }

    await voiceService.addToVoiceQueue(todo, req.user);

    res.json({ message: 'Voice announcement triggered' });

  } catch (error) {
    console.error('Trigger voice announcement error:', error);
    res.status(500).json({ error: 'Failed to trigger voice announcement' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification(
      req.params.id,
      req.user._id
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getVoiceAnnouncements,
  triggerVoiceAnnouncement,
  deleteNotification
};
