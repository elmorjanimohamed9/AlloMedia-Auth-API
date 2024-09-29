import { sendOtpEmail } from './emailService.js';
import User from '../models/User.js';
import { generateOtp, storeOtp } from '../helpers/otpHelper.js';

export const sendOtp = async (email, reason = 'login') => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // Generate OTP and store it
  const otp = generateOtp();
  storeOtp(user._id, otp); 

  // Determine the email subject and body based on reason
  let subject, message;
  if (reason === 'login') {
    subject = 'Your OTP Code for Login - AlloMedia';
    message = `Your OTP code for logging in is <strong>${otp}</strong>.`;
  } else if (reason === 'forgotPassword') {
    subject = 'Your OTP Code for Password Reset - AlloMedia';
    message = `Your OTP code for resetting your password is <strong>${otp}</strong>.`;
  }

  // Send the OTP email
  await sendOtpEmail(email, subject, message, user.firstName, user.lastName);
};
