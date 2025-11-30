import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use((req , res , next) => {
  console.log(req.body)
  console.log(req.headers)
  next()
})

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Peer-to-peer education system backend is running.' });
});

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import learningGroupRoutes from './routes/learningGroupRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import resourceAnalyticsRoutes from './routes/resourceAnalyticsRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/groups', learningGroupRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/resource-analytics', resourceAnalyticsRoutes);
app.use('/api/sessions', sessionRoutes);

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/p2p_education';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

export default app;
