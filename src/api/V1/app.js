// src/app.js

const express = require('express');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/index'); 
const errorMiddleware = require('./middlewares/errorMiddleware'); 

const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(express.json()); 

// Define API routes
app.use('/api', apiRoutes); 

// Error handling middleware
app.use(errorMiddleware); 

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Welcome to AlloMedia Delivery API');
});

module.exports = app;
