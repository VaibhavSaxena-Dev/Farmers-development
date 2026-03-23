const Notification = require('../models/notification.model');

class VoiceService {
  constructor() {
    this.speechQueue = [];
    this.isProcessing = false;
  }

  // Add todo to voice announcement queue
  async addToVoiceQueue(todo, user) {
    if (!user.preferences.voiceEnabled) return;

    const announcement = {
      todoId: todo._id,
      userId: user._id,
      message: this.generateVoiceMessage(todo),
      priority: todo.priority,
      createdAt: new Date()
    };

    this.speechQueue.push(announcement);
    this.processQueue();
  }

  // Generate voice message for todo
  generateVoiceMessage(todo) {
    let message = `Important todo: ${todo.title}`;
    
    if (todo.description) {
      message += `. Description: ${todo.description}`;
    }
    
    if (todo.due) {
      const dueDate = new Date(todo.due);
      const now = new Date();
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));
      
      if (hoursLeft > 0) {
        message += `. Due in ${hoursLeft} hours`;
      } else {
        message += `. Overdue`;
      }
    }

    if (todo.priority === 'urgent') {
      message = `Urgent! ${message}`;
    }

    return message;
  }

  // Process voice announcement queue
  async processQueue() {
    if (this.isProcessing || this.speechQueue.length === 0) return;

    this.isProcessing = true;

    while (this.speechQueue.length > 0) {
      const announcement = this.speechQueue.shift();
      await this.announceTodo(announcement);
    }

    this.isProcessing = false;
  }

  // Announce todo (placeholder for actual TTS implementation)
  async announceTodo(announcement) {
    try {
      console.log(`🔊 Voice Announcement: ${announcement.message}`);
      
      // In a real implementation, you would:
      // 1. Use Web Speech API on frontend
      // 2. Use a TTS service like AWS Polly, Google TTS, or Azure Speech
      // 3. Send to connected WebSocket clients for real-time voice
      
      // For now, we'll create a notification record
      await Notification.create({
        userId: announcement.userId,
        todoId: announcement.todoId,
        type: 'voice_announcement',
        title: 'Voice Announcement',
        message: announcement.message,
        priority: announcement.priority,
        isSent: true,
        sentAt: new Date()
      });

      // Mark todo as voice announced
      const Todo = require('../models/todo.model');
      await Todo.findByIdAndUpdate(announcement.todoId, {
        voiceAnnounced: true
      });

    } catch (error) {
      console.error('Error in voice announcement:', error);
    }
  }

  // Get voice announcements for user
  async getVoiceAnnouncements(userId, limit = 10) {
    return await Notification.find({
      userId,
      type: 'voice_announcement'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('todoId', 'title description priority');
  }
}

module.exports = new VoiceService();
