import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../helpers/jwtHelper.js';
import { sendOtp } from '../../services/otpService.js';
import { verifyOtp } from '../../helpers/otpHelper.js';

export const login = async (req, res) => {
  const { email, password, otp } = req.body;

  try {

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified. Please check your email to verify your account.' });
    }

    if (otp) {
      const isValidOtp = await verifyOtp(user._id, otp);
      if (!isValidOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

      const token = generateToken(user._id);
      return res.status(200).json({ token, user });
    }

    await sendOtp(email, 'login');
    return res.status(200).json({ message: 'OTP sent to your email' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.', error });
  }
};
