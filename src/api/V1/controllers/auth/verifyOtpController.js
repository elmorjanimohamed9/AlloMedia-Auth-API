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
        if (action === 'changeDevice') {
            const userAgent = req.headers['user-agent'];
            const ipAddress = req.ip;

            // Check if the device is already verified
            const isVerifiedDevice = user.devices.some(device =>
                device.userAgent === userAgent && device.ipAddress === ipAddress
            );

            if (!isVerifiedDevice) {
                user.devices.push({ userAgent, ipAddress, isVerified: true, lastLogin: new Date() });
                await user.save({ validateModifiedOnly: true });
                return res.status(200).json({ message: 'Device verified successfully' });
            }

            return res.status(200).json({ message: 'Device already verified' });

        } else if (action === 'resetPassword') {
            // Handle password reset
            const resetToken = generateToken(user._id);
            const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;

            await sendPasswordResetEmail(user.email, resetUrl, user.firstName, user.lastName);
            return res.status(200).json({ message: 'OTP verified. Password reset email sent' });

        } else {
            return res.status(400).json({ message: 'Invalid action provided' });
        }

    } catch (error) {
        if (error.message === 'OTP expired') {
            return res.status(400).json({ message: 'OTP expired' });
        }
        
        console.error('Error in verifyOtpHandler:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
