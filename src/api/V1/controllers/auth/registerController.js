import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { sendVerificationEmail } from '../../services/emailService.js';
import { generateAccessToken } from '../../services/tokenService.js'; 
import { registerUserValidation } from '../../validations/registerValidation.js';
import logger from '../../utils/logger.js';
import bcrypt from 'bcryptjs';
import { createClient } from 'redis';

const REGISTRATION_ATTEMPT_LIMIT = 5;
const REGISTRATION_ATTEMPT_EXPIRY = 3600; 

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

export const register = async (req, res) => {
    try {
        const { error } = registerUserValidation.validate(req.body);
        if (error) {
            logger.warn('Registration validation error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }
  
        const { firstName, lastName, email, password, phone, address, roles = [] } = req.body;
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip;

        const registrationAttempts = await redisClient.incr(`registration_attempts:${ipAddress}`);
        if (registrationAttempts === 1) {
            await redisClient.expire(`registration_attempts:${ipAddress}`, REGISTRATION_ATTEMPT_EXPIRY);
        }
        if (registrationAttempts > REGISTRATION_ATTEMPT_LIMIT) {
            logger.warn(`Too many registration attempts from IP: ${ipAddress}`);
            return res.status(429).json({ message: 'Too many registration attempts. Please try again later.' });
        }
  
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn(`Registration attempt with existing email: ${email}`);
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const roleDocs = await Role.find({ name: { $in: roles } });
        const roleIds = roleDocs.map(role => role._id);

        if (roleIds.length !== roles.length) {
            logger.warn(`Invalid roles provided for registration: ${roles}`);
            return res.status(400).json({ message: 'One or more roles are invalid' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            address,
            roles: roleIds,
            isEmailVerified: false,
            devices: [{ userAgent, ipAddress, lastLogin: new Date(), isVerified: false }]
        });
  
        await newUser.save();
  
        const verificationToken = generateAccessToken(newUser._id);
        const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;
  
        await redisClient.setEx(`email_verification:${newUser._id}`, 3600, verificationToken); 

        await sendVerificationEmail(newUser.email, verificationLink, newUser.firstName, newUser.lastName);
  
        logger.info(`New user registered: ${newUser._id}`);
        res.status(201).json({ 
            message: 'User registered successfully. Please check your email for verification.',
            userId: newUser._id
        });
  
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ message: 'An error occurred during registration. Please try again later.' });
    }
};