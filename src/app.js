import express from 'express';
import connectDB from './config/database.js';
import userRoutes from './api/V1/routes/index.js';
import roleRoutes from './api/V1/routes/roleRoutes/roleRoutes.js'
import cors from 'cors';


const app = express();

// Connect to the database
connectDB();

// Middleware setup
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true, 
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Use routes
app.use('/api/auth', userRoutes);
app.use('/api/roles', roleRoutes);

export default app;