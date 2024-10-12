import User from '../../models/User.js';
import logger from '../../utils/logger.js';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

export const logout = async (req, res) => {
  try {
    const userId = req.userId; 


    await redisClient.del(`refreshToken:${userId}`);

    await User.findByIdAndUpdate(userId, { $set: { lastLogout: new Date() } });

    logger.info(`User logged out successfully: ${userId}`);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};