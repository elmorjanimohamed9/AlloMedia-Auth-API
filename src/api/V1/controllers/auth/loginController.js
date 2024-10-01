import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../helpers/jwtHelper.js';
import { sendOtp } from '../../services/otpService.js';
import { verifyOtp } from '../../helpers/otpHelper.js';

export const login = async (req, res) => {
  const { email, password, otp, rememberMe } = req.body;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;

  try {

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified. Please check your email to verify your account.' });
    }

    const isVerifiedDevice = user.devices.some(device =>
      device.userAgent === userAgent && device.ipAddress === ipAddress
    );

    if (otp) {
      const isValidOtp = await verifyOtp(user._id, otp);
      if (!isValidOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

      if (!isVerifiedDevice) {
        user.devices.push({ userAgent, ipAddress, isVerified: true, lastLogin: new Date() });
        await user.save();
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      return res.status(200).json({ message: 'Login successful', token });
    }

    if (!isVerifiedDevice) {
      await sendOtp(email, 'login');
      return res.status(200).json({ message: 'OTP sent to your email. Please verify your device.' });
    }

    if (rememberMe) {
      const rememberMeToken = generateToken(user._id, '30d');
      return res.status(200).json({ 
        message: 'Login successful', 
        token, 
        rememberMeToken,
        user: user.toJSON() 
      });
    }

    const token = generateToken(user._id);
    return res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });


  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.', error: error.message });
  }
};

export const rememberMe = async (req, res) => {
  const { email } = req.body;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deviceIndex = user.devices.findIndex(device =>
      device.userAgent === userAgent && device.ipAddress === ipAddress
    );

    if (deviceIndex === -1) {
      user.devices.push({ userAgent, ipAddress, isVerified: true, lastLogin: new Date() });
    } else {
      user.devices[deviceIndex].isVerified = true;
      user.devices[deviceIndex].lastLogin = new Date();
    }

    await user.save();

    const token = generateToken(user._id, '7d');

    res.status(200).json({ message: 'Device remembered', token });
  } catch (error) {
    console.error('Remember Me error:', error);
    res.status(500).json({ message: 'Server error during Remember Me', error: error.message });
  }
};
