const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN, // http://localhost:8080
    credentials: true
}));

// MongoDB Connection using your Atlas URI
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Todo routes will go here
app.use('/api/todos', require('./routes/todos'));

// Auth routes will go here
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend client allowed from: ${process.env.CLIENT_ORIGIN}`);
});