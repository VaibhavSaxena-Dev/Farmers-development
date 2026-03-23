const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../backend/models/user.model');
const Todo = require('../backend/models/todo.model');
const Notification = require('../backend/models/notification.model');
const Payment = require('../backend/models/payment.model');
const Subscription = require('../backend/models/subscription.model');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@farm.com',
    password: 'admin123',
    role: 'admin',
    preferences: {
      notificationsEnabled: true,
      voiceEnabled: true,
      language: 'en'
    }
  },
  {
    name: 'Farmer John',
    email: 'farmer@farm.com',
    password: 'farmer123',
    role: 'farmer',
    preferences: {
      notificationsEnabled: true,
      voiceEnabled: true,
      language: 'hi'
    }
  }
];

const sampleTodos = [
  {
    title: 'Daily Cleaning',
    description: 'Clean and disinfect poultry house',
    priority: 'high',
    isImportant: true,
    due: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    category: 'hygiene'
  },
  {
    title: 'Vaccination Schedule',
    description: 'Administer Newcastle disease vaccine',
    priority: 'urgent',
    isImportant: true,
    due: new Date(Date.now() + 1000 * 60 * 60 * 48), // Day after tomorrow
    category: 'vaccination'
  }
];

const sampleNotifications = [
  {
    type: 'due_reminder',
    title: 'Daily Cleaning Due',
    message: 'Daily cleaning schedule is due for completion.',
    priority: 'high',
    isSent: true,
    sentAt: new Date()
  },
  {
    type: 'important_created',
    title: 'Vaccination Schedule Created',
    message: 'Important vaccination schedule has been created.',
    priority: 'urgent',
    isSent: true,
    sentAt: new Date()
  }
];

const sampleMarketplaceItems = [
  {
    name: 'Premium Poultry Feed',
    description: 'High-quality feed for healthy poultry growth with essential nutrients',
    price: 850,
    category: 'feed',
    seller: {
      name: 'Green Farm Supplies',
      location: 'Pune, Maharashtra',
      rating: 4.8,
      phone: '+91 9876543210'
    },
    inStock: true,
    deliveryAvailable: true,
    features: ['25kg bag', 'Protein rich', 'Organic ingredients', 'Fast delivery']
  },
  {
    name: 'Vaccine for Newcastle Disease',
    description: 'Effective vaccine for preventing Newcastle disease in poultry',
    price: 1200,
    category: 'medicine',
    seller: {
      name: 'VetCare Solutions',
      location: 'Mumbai, Maharashtra',
      rating: 4.9,
      phone: '+91 9876543211'
    },
    inStock: true,
    deliveryAvailable: true,
    features: ['100 doses', 'Cold chain maintained', 'Veterinary approved', 'Express delivery']
  }
];

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'farm-management'
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Todo.deleteMany({});
    await Notification.deleteMany({});
    await Payment.deleteMany({});
    await Subscription.deleteMany({});
    
    // Create sample users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User({
        name: userData.name,
        email: userData.email,
        pwdHash: userData.password, // Will be hashed by pre-save middleware
        preferences: userData.preferences
      });
      await user.save();
      createdUsers.push(user);
      console.log(`   ✅ Created user: ${userData.name} (${userData.email})`);
    }
    
    // Create sample todos
    console.log('📝 Creating sample todos...');
    for (const todoData of sampleTodos) {
      const todo = new Todo({
        ...todoData,
        userId: createdUsers[1]._id // Assign to farmer
      });
      await todo.save();
      console.log(`   ✅ Created todo: ${todoData.title}`);
    }
    
    // Create sample notifications
    console.log('🔔 Creating sample notifications...');
    const createdTodos = await Todo.find({ userId: createdUsers[1]._id });
    
    for (let i = 0; i < sampleNotifications.length; i++) {
      const notificationData = sampleNotifications[i];
      const todo = createdTodos[i % createdTodos.length]; // Cycle through todos
      
      const notification = new Notification({
        ...notificationData,
        userId: createdUsers[1]._id, // Assign to farmer
        todoId: todo._id // Link to a todo
      });
      await notification.save();
      console.log(`   ✅ Created notification: ${notificationData.title}`);
    }
    
    // Create sample subscription
    console.log('💳 Creating sample subscription...');
    const subscription = new Subscription({
      userId: createdUsers[1]._id,
      planId: 'premium_monthly',
      planName: 'premium',
      duration: 'monthly',
      price: 599,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      autoRenew: true,
      status: 'active',
      features: [
        { name: 'advanced_disease_info', limit: -1 },
        { name: 'hygiene_assessment', limit: -1 },
        { name: 'voice_notifications', limit: -1 },
        { name: 'expert_consultation', limit: 2 },
        { name: 'marketplace_access', limit: -1 }
      ]
    });
    await subscription.save();
    console.log('   ✅ Created premium subscription for farmer');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Todos: ${sampleTodos.length}`);
    console.log(`   - Notifications: ${sampleNotifications.length}`);
    console.log(`   - Subscriptions: 1`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@farm.com / admin123');
    console.log('   Farmer: farmer@farm.com / farmer123');
    
    console.log('\n🚀 You can now start the application with:');
    console.log('   npm run dev:full');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

// Run setup
setupDatabase();
