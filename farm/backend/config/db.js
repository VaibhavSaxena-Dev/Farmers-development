const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Missing required environment variable: MONGODB_URI');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'farm-management', // Use farm-management database
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
