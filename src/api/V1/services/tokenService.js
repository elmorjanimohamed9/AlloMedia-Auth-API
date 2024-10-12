import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient();

async function initializeRedis() {
  await redisClient.connect();
}

initializeRedis().catch(console.error);

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = async (userId) => {
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    try {
      await redisClient.set(`refreshToken:${userId}`, refreshToken, {
        EX: 7 * 24 * 60 * 60 
      });
      return refreshToken;
    } catch (error) {
      logger.error('Error storing refresh token in Redis:', error);
      throw new Error('Failed to generate refresh token');
    }
  };

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    return storedToken === refreshToken ? decoded : null;
  } catch (error) {
    return null;
  }
};