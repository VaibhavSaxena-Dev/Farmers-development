const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables
// Load .env from backend dir first, fallback to parent dir
if (!require('dotenv').config({ path: path.resolve(__dirname, '.env') }).parsed) {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const todoRoutes = require('./routes/todo.routes');
const notificationRoutes = require('./routes/notification.routes');
const paymentRoutes = require('./routes/payment.routes');
const gpsTrackingRoutes = require('./routes/gpsTracking.routes');
const doctorClinicRoutes = require('./routes/doctorClinic.routes');
const appointmentRoutes = require('./routes/appointment.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import services
const notificationService = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080';

// Debug: log env resolution once on startup
const envPath = path.resolve(__dirname, '../.env');
const envExists = fs.existsSync(envPath);
if (!process.env.MONGODB_URI) {
  console.error(`[ENV DEBUG] cwd=${process.cwd()} envPath=${envPath} exists=${envExists}`);
  console.error('Missing required environment variable: MONGODB_URI');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGINS ? process.env.CLIENT_ORIGINS.split(',') : true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      res.status(200).json({ 
        status: 'OK', 
        db: 'Connected',
        database: mongoose.connection.name,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ status: 'Error', db: 'Disconnected' });
    }
  } catch (error) {
    res.status(500).json({ status: 'Error', db: 'Disconnected' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/gps', gpsTrackingRoutes);
app.use('/api/medical', doctorClinicRoutes);
app.use('/api/appointments', appointmentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Farm Management System with Medical, GPS Tracking & Appointments',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      todos: '/api/todos',
      notifications: '/api/notifications',
      payments: '/api/payments',
      gps: '/api/gps',
      medical: '/api/medical',
      appointments: '/api/appointments'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.method + ' ' + req.path });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Start notification scheduler
    notificationService.startScheduler();
    
app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Client origin: ${CLIENT_ORIGIN}`);
      console.log(`🔊 Voice announcements: Enabled`);
      console.log(`📅 Notifications: Enabled`);
      console.log(`🌐 Health check: http://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost'}:${PORT}/health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
