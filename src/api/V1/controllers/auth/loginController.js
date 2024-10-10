import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { 
  generateAccessToken, 
  generateRefreshToken, 
} from '../../services/tokenService.js';
import { sendOtp } from '../../services/otpService.js';
import { verifyOtp } from '../../helpers/otpHelper.js'
import logger from '../../utils/logger.js';
import { loginValidation } from '../../validations/loginValidation.js';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const { error } = loginValidation.validate({ email, password });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${user._id}, Incorrect password`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      logger.warn(`Login attempt with unverified email: ${email}`);
      return res.status(400).json({ message: 'Email not verified. Please check your email to verify your account.' });
    }

    const isVerifiedDevice = user.devices.some(device =>
      device.userAgent === userAgent && device.ipAddress === ipAddress
    );

    if (!isVerifiedDevice) {
      if (otp) {
        const isValidOtp = await verifyOtp(user._id, otp);
        if (!isValidOtp) {
          logger.warn(`Invalid OTP attempt for user: ${user._id}`);
          return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    
        await User.updateOne(
          { _id: user._id },
          { $push: { devices: { userAgent, ipAddress, isVerified: true, lastLogin: new Date() } } }
        );
      } else {
        await sendOtp(email);
        const accessToken = generateAccessToken(user._id);
        logger.info(`OTP sent for new device. User: ${user._id}`);
        return res.status(200).json({ 
          message: 'OTP sent to your email. Please verify your device.',
          requireOtp: true,
          accessToken,
          userId: user._id  
        });
      }
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    logger.info(`User logged in successfully: ${user._id}`);

    return res.status(200).json({ 
      message: 'Login successful', 
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};