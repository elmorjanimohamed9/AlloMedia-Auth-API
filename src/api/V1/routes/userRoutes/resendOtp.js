import express from 'express';
import { handleResendOtp } from '../../controllers/auth/verifyOtpController.js';
import { verifyToken } from '../../middlewares/authenticateTokenMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, handleResendOtp);

export default router;
