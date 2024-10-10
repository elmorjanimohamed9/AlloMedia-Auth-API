import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.js';

export const verifyEmail = async (req, res) => {
    const { token } = req.params;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (!decoded) {
            return res.status(400).json({ verified: false, message: 'Invalid or expired token' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ verified: false, message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({ verified: true, message: 'Email already verified' });
        }

        await User.updateOne({ _id: user._id }, { isEmailVerified: true });

        return res.status(200).json({ verified: true, message: 'Email verified successfully' });
    } catch (error) {
        logger.error('Email verification error:', error);
        return res.status(500).json({ verified: false, message: 'Server error', error: error.message });
    }
};