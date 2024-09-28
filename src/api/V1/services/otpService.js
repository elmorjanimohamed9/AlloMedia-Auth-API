//otpService

import {sendOtpEmail} from '../services/emailService.js'

import User from '../models/User.js';
import { generateOtp, storeOtp } from '../helpers/otpHelper.js';

export const sendOtp = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const otp = generateOtp();
    storeOtp(user._id, otp); 

    await sendOtpEmail(email, otp, user.firstName, user.lastName);
};

