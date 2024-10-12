import express from 'express';
import register from './userRoutes/register.js';
import login from './userRoutes/login.js';
import forgetPassword from './userRoutes/forgetPassword.js';
import resetPassword from './userRoutes/resetPassword.js';
import verifyOtpHandler from './userRoutes/verifyOpt.js';
import verifyEmail from './userRoutes/verifyEmailRoute.js'; 
import logout from './userRoutes/logout.js';
import handleResendOtp from './userRoutes/resendOtp.js'
import refreshToken from './userRoutes/refresh-token.js';

const router = express.Router();

// User routes
router.use('/register', register);
router.use('/login', login);
router.use('/forget-password', forgetPassword);
router.use('/reset-password', resetPassword);
router.use('/verify-otp', verifyOtpHandler);
router.use('/verify-email', verifyEmail);
router.use('/resend-otp', handleResendOtp);
router.use('/refresh-token', refreshToken)
router.use('/logout', logout);

export default router;
