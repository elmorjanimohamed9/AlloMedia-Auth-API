import User from '../../models/User.js';
import { verifyOtp } from '../../helpers/otpHelper.js';
import { generateToken } from '../../helpers/jwtHelper.js';

export const verifyOtpHandler = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Verify OTP
        try {
            const isOtpValid = await verifyOtp(user._id, otp);
            if (!isOtpValid) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }
        } catch (otpError) {
            return res.status(400).json({ message: otpError.message });
        }

        const token = generateToken(user._id);

        return res.status(200).json({ message: 'OTP verified, login successful', token });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
