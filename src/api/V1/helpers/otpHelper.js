import User from '../models/User.js';
import { createClient } from 'redis';
import logger from '../utils/logger.js';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

await redisClient.connect();

export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOtp = async (userId, otp) => {
    const key = `otp:${userId}`;
    const expires = 5 * 60; 
    await redisClient.set(key, otp, { EX: expires });
    logger.info(`OTP stored for user: ${userId}`);
};

export const verifyOtp = async (userId, submittedOTP) => {
  const key = `otp:${userId}`;
  const storedOTP = await redisClient.get(key);

  logger.info(`Verifying OTP for user ${userId}. Submitted OTP: ${submittedOTP}, Stored OTP: ${storedOTP}`);

  if (!storedOTP) {
    logger.warn(`No OTP found for user ${userId}`);
    throw new Error('OTP not found or has expired');
  }

  if (submittedOTP !== storedOTP) {
    logger.warn(`Invalid OTP for user ${userId}. Submitted: ${submittedOTP}, Expected: ${storedOTP}`);
    throw new Error('Invalid OTP');
  }

  // Delete the OTP from Redis after successful verification
  await redisClient.del(key);
  logger.info(`OTP verified successfully for user ${userId}`);

  return true;
};