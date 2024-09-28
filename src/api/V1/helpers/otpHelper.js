import User from '../models/User.js'


const otpStore = new Map(); 

export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
};

export const storeOtp = (userId, otp) => {
    const expires = Date.now() + 5 * 60 * 1000; 
    otpStore.set(userId.toString(), { otp, expires });
};

export const verifyOtp = async (userId, otp) => {
    const storedOtpData = otpStore.get(userId.toString());

    if (!storedOtpData) throw new Error('Invalid OTP');

    const { otp: storedOtp, expires } = storedOtpData;

    // Check if the OTP is expired
    if (Date.now() > expires) {
        otpStore.delete(userId.toString()); 
        throw new Error('OTP expired');
    }

    // Check if the OTP matches
    if (storedOtp !== otp) {
        throw new Error('OTP invalid');
    }

    otpStore.delete(userId.toString());
    return true;
};
