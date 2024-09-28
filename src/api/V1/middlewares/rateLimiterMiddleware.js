import rateLimit from 'express-rate-limit';

export const otpRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 3, 
    message: 'Too many OTP requests from this IP, please try again later.',
});