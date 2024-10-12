import { sendOtpEmail } from '../services/emailService.js';
import User from '../models/User.js';
import { generateOtp, storeOtp } from '../helpers/otpHelper.js';
import logger from '../utils/logger.js';

export const sendOtp = async (email) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      logger.warn(`User not found for email: ${email}`);
      throw new Error('User not found');
    }

    const otp = generateOtp();
    logger.info(`Generated OTP for ${email}: ${otp}`);

    logger.info(`Storing OTP for user: ${user._id}`);
    await storeOtp(user._id, otp);
    logger.info(`OTP stored successfully`);

    const subject = 'Your OTP Code for Device Verification - AlloMedia';
    const message = `Your OTP code for device verification is <strong>${otp}</strong>. This code will expire in 5 minutes.`;

    await sendOtpEmail(email, subject, message, user.firstName, user.lastName);
    
    logger.info(`OTP sent successfully to ${email}`);
  } catch (error) {
    logger.error('Error in sendOtp:', error);
    throw error;
  }
};