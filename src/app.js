import express from 'express';
import connectDB from './config/database.js'; 
import userRoutes from './api/V1/routes/index.js';
import roleRoutes from './api/V1/routes/roleRoutes/roleRoutes.js'


const app = express();

// Connect to the database
connectDB();

// Middleware setup
app.use(express.json());

// Use routes
app.use('/api/auth', userRoutes);
app.use('/api/roles', roleRoutes);

// Export the app for use in server.js
export default app;