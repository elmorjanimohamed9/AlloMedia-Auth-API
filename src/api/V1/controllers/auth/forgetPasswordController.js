import User from '../../models/User.js';
import { generateAccessToken } from '../../services/tokenService.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateAccessToken({ userId: user._id }, '1h');
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl, user.firstName, user.lastName);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};