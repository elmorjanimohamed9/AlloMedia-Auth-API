import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetConfirmationEmail } from '../../services/emailService.js'
import dotenv from 'dotenv';

dotenv.config();

export const resetPasswordController = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Verify the token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        // Find the user by ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password without triggering validation
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } },
            { runValidators: false }
        );

        await sendPasswordResetConfirmationEmail(user.email, user.firstName, user.lastName);

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};