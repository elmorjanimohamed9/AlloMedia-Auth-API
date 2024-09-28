import User from '../../models/User.js';
import { verifyToken } from '../../helpers/jwtHelper.js'; 

export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    const decoded = verifyToken(token);
    if (!decoded) return res.status(400).json({ message: 'Invalid or expired token' });

    try {
        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.isEmailVerified) return res.status(400).json({ message: 'User is already verified' });

        user.isEmailVerified = true; 
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Error during email verification:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};



