import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../helpers/jwtHelper.js';
import { sendOtp } from '../../services/otpService.js';
import { verifyOtp } from '../../helpers/otpHelper.js';

export const login = async (req, res) => {
  const { email, password, otp } = req.body;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified. Please check your email to verify your account.' });
    }

    // Check if device is already verified
    const isVerifiedDevice = user.devices.some(device =>
      device.userAgent === userAgent && device.ipAddress === ipAddress
    );

    // If OTP is provided, verify the OTP
    if (otp) {
      const isValidOtp = await verifyOtp(user._id, otp);
      if (!isValidOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

      // Add new device if it is not already verified
      if (!isVerifiedDevice) {
        user.devices.push({ userAgent, ipAddress, isVerified: true, lastLogin: new Date() });
        await user.save();
      }

      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      // Generate and return JWT token with success message
      const token = generateToken(user._id);
      return res.status(200).json({ message: 'Login successful', token });
    }

    // If the device is not verified, send OTP for verification
    if (!isVerifiedDevice) {
      await sendOtp(email, 'login');
      return res.status(200).json({ message: 'OTP sent to your email. Please verify your device.' });
    }

    // If device is already verified, login the user and send success message
    const token = generateToken(user._id);
    return res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.', error: error.message });
  }
};
