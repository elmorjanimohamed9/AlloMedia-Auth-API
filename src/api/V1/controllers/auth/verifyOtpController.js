import User from '../../models/User.js';
import { verifyOtp } from '../../helpers/otpHelper.js';
import { generateToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

export const verifyOtpHandler = async (req, res) => {
    const { email, otp, action } = req.body;  

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify OTP
        const isOtpValid = await verifyOtp(user._id, otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Determine action based on the 'action' parameter
        if (action === 'login') {
            // If the action is 'login', generate and return a JWT token
            const token = generateToken(user._id);
            return res.status(200).json({ message: 'Login successful', token });
        } else if (action === 'resetPassword') {
            // If the action is 'resetPassword', generate reset token and send reset link via email
            const resetToken = generateToken(user._id);
            const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;

            // Send the reset email with the reset URL
            await sendPasswordResetEmail(user.email, resetUrl, user.firstName, user.lastName);
            return res.status(200).json({ message: 'OTP verified. Password reset email sent' });
        } else {
            // If the action is not recognized, return an error
            return res.status(400).json({ message: 'Invalid action provided' });
        }

    } catch (error) {
        console.error('Error in verifyOtpHandler:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
