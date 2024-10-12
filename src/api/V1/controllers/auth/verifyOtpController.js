import User from '../../models/User.js';
import { verifyOtp } from '../../helpers/otpHelper.js';
import { sendOtp } from '../../services/otpService.js';
import logger from '../../utils/logger.js';
import { generateAccessToken } from '../../services/tokenService.js';

export const verifyOtpHandler = async (req, res) => {

  let { otp } = req.body;
  const userId = req.userId; 

  try {
    const isValidOtp = await verifyOtp(userId, otp);

    if (!isValidOtp) {
      logger.warn(`Invalid OTP attempt for user: ${userId}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    await User.findByIdAndUpdate(userId, {
      $push: {
        devices: { userAgent, ipAddress, isVerified: true, lastLogin: new Date() }
      }
    });

    logger.info(`Device verified for user: ${userId}, IP: ${ipAddress}`);

    const newAccessToken = generateAccessToken(userId);

    logger.info(`OTP verified successfully for user: ${userId}`);

    res.json({ 
      message: 'OTP verified successfully', 
      accessToken: newAccessToken
    });
  } catch (error) {
    logger.error(`Error verifying OTP for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

export const handleResendOtp = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    logger.error('User ID not found in request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  logger.info(`Attempting to resend OTP for user: ${userId}`);

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      logger.error(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    await sendOtp(user.email);
    logger.info(`New OTP sent successfully to user: ${userId}`);
    res.json({ message: 'New OTP sent successfully' });
  } catch (error) {
    logger.error(`Failed to resend OTP for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};