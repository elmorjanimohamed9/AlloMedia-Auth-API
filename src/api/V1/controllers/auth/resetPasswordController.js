import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetConfirmationEmail } from '../../services/emailService.js';
import mongoose from 'mongoose';

export const resetPasswordController = async (req, res) => {

    try {
      const { token, newPassword } = req.body;
  
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }
  
      const decoded = verifyToken(token.toString());
  
      if (!decoded || !decoded.userId) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      const userId = decoded.userId.userId || decoded.userId;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      try {
        await User.findByIdAndUpdate(user._id, { password: hashedPassword }, { runValidators: false });
      } catch (saveError) {
        console.error('Error saving user:', saveError);
        return res.status(500).json({ message: 'Error updating password', error: saveError.message });
      }
  
      await sendPasswordResetConfirmationEmail(user.email, user.firstName, user.lastName);
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  };