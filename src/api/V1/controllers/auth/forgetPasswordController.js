import User from '../../models/User.js';
import { sendOtp } from '../../services/otpService.js';

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendOtp(email, 'forgotPassword');  
    
    res.status(200).json({ message: 'OTP sent to your email for password reset' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
