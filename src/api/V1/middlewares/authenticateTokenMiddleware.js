import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};


export const invalidateRefreshToken = async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User ID not found' });
  }

  try {
    await redisClient.del(`refreshToken:${userId}`);
    next();
  } catch (error) {
    console.error('Error invalidating refresh token:', error);
    return res.status(500).json({ message: 'Error during logout process' });
  }
};

