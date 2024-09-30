import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { sendVerificationEmail } from '../../services/emailService.js';
import { generateToken } from '../../helpers/jwtHelper.js'; 
import { registerUserValidation } from '../../validations/registerValidation.js';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
    const { error } = registerUserValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
  
    const { firstName, lastName, email, password, phone, address, roles = [] } = req.body;

    // Get user agent and IP address
    const userAgent = req.headers['user-agent']; 
    const ipAddress = req.ip; 
  
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Ensure roles are valid and exist in the Role collection
        const validRoles = await Role.find({ _id: { $in: roles } });
        if (validRoles.length !== roles.length) {
            return res.status(400).json({ message: 'One or more roles are invalid' });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            address,
            roles,
            isVerified: false,
            devices: [{ userAgent, ipAddress, lastLogin: new Date(), isVerified: false }]
        });
  
        await newUser.save();
  
        // Generate email verification token
        const verificationToken = generateToken(newUser._id);
  
        // Create verification link
        const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}?email=${encodeURIComponent(email)}`;
  
        // Send verification email
        await sendVerificationEmail(newUser.email, verificationLink, newUser.firstName, newUser.lastName);
  
        res.status(201).json({ 
            message: 'User registered successfully. Please check your email for verification.',
            verificationToken 
        });
  
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
