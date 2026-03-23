const Notification = require('../models/notification.model');
const Todo = require('../models/todo.model');
const User = require('../models/user.model');
const voiceService = require('./voiceService');

class NotificationService {
  // Check for todos that need notifications
  async checkDueNotifications() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find todos due within the next hour
      const todosNeedingNotification = await Todo.find({
        due: { $lte: oneHourFromNow, $gte: now },
        done: false,
        notificationSent: false
      }).populate('userId');

      for (const todo of todosNeedingNotification) {
        await this.sendDueNotification(todo);
      }

      // Check for overdue todos
      const overdueTodos = await Todo.find({
        due: { $lt: now },
        done: false,
        notificationSent: false
      }).populate('userId');

      for (const todo of overdueTodos) {
        await this.sendOverdueNotification(todo);
      }

    } catch (error) {
      console.error('Error checking due notifications:', error);
    }
  }

  // Send due notification
  async sendDueNotification(todo) {
    try {
      const user = todo.userId;
      if (!user.preferences.notificationsEnabled) return;

      const timeUntilDue = todo.due.getTime() - new Date().getTime();
      const minutesLeft = Math.ceil(timeUntilDue / (1000 * 60));

      const notification = await Notification.create({
        userId: user._id,
        todoId: todo._id,
        type: 'due_reminder',
        title: 'Todo Due Soon',
        message: `"${todo.title}" is due in ${minutesLeft} minutes`,
        priority: minutesLeft <= 15 ? 'urgent' : 'high'
      });

      // Mark todo as notification sent
      await Todo.findByIdAndUpdate(todo._id, { notificationSent: true });

      // If important, add to voice queue
      if (todo.isImportant) {
        await voiceService.addToVoiceQueue(todo, user);
      }

      console.log(`📅 Due notification sent: ${notification.message}`);
      return notification;

    } catch (error) {
      console.error('Error sending due notification:', error);
    }
  }

  // Send overdue notification
  async sendOverdueNotification(todo) {
    try {
      const user = todo.userId;
      if (!user.preferences.notificationsEnabled) return;

      const overdueTime = new Date().getTime() - todo.due.getTime();
      const hoursOverdue = Math.floor(overdueTime / (1000 * 60 * 60));

      const notification = await Notification.create({
        userId: user._id,
        todoId: todo._id,
        type: 'overdue',
        title: 'Todo Overdue',
        message: `"${todo.title}" is ${hoursOverdue} hours overdue`,
        priority: 'urgent'
      });

      // Mark todo as notification sent
      await Todo.findByIdAndUpdate(todo._id, { notificationSent: true });

      // Always add overdue important todos to voice queue
      if (todo.isImportant) {
        await voiceService.addToVoiceQueue(todo, user);
      }

      console.log(`⚠️ Overdue notification sent: ${notification.message}`);
      return notification;

    } catch (error) {
      console.error('Error sending overdue notification:', error);
    }
  }

  // Send notification for important todo creation
  async sendImportantTodoNotification(todo, user) {
    try {
      if (!user.preferences.notificationsEnabled) return;

      const notification = await Notification.create({
        userId: user._id,
        todoId: todo._id,
        type: 'important_created',
        title: 'Important Todo Created',
        message: `Important todo "${todo.title}" has been created`,
        priority: 'high'
      });

      // Add to voice queue if voice is enabled
      if (user.preferences.voiceEnabled) {
        await voiceService.addToVoiceQueue(todo, user);
      }

      console.log(`⭐ Important todo notification sent: ${notification.message}`);
      return notification;

    } catch (error) {
      console.error('Error sending important todo notification:', error);
    }
  }

  // Send notification for general todo creation
  async sendTodoCreatedNotification(todo, user) {
    try {
      if (!user.preferences.notificationsEnabled) return;

      const notification = await Notification.create({
        userId: user._id,
        todoId: todo._id,
        type: 'todo_created',
        title: 'New Todo Created',
        message: `Your new todo "${todo.title}" has been added.`,
        priority: 'low'
      });

      console.log(`✅ New todo notification sent: ${notification.message}`);
      return notification;

    } catch (error) {
      console.error('Error sending todo created notification:', error);
    }
  }

  // Get notifications for user
  async getUserNotifications(userId, limit = 20, unreadOnly = false) {
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('todoId', 'title description priority isImportant');
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  // Get notification count for user
  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      userId,
      isRead: false
    });
  }

  // Delete a notification by ID and userId
  async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({ _id: notificationId, userId });
  }

  // Notify all users when a new veterinary doctor is registered
  async notifyVetDoctorRegistered(doctor) {
    const User = require('../models/user.model');
    const users = await User.find({}).select('_id').lean();
    const title = 'New Veterinary Doctor Registered';
    const message = `${doctor.name} (${doctor.specialization}) is now available at ${doctor.clinicName}. Check Find Vet for location.`;
    for (const u of users) {
      await Notification.create({
        userId: u._id,
        type: 'vet_doctor_registered',
        title,
        message,
        priority: 'medium'
      }).catch(err => console.error('Create vet notification for user', u._id, err));
    }
  }

  // Start notification scheduler
  startScheduler() {
    // Check for notifications every 5 minutes
    setInterval(() => {
      this.checkDueNotifications();
    }, 5 * 60 * 1000);

    console.log('📅 Notification scheduler started');
  }
}

module.exports = new NotificationService();
