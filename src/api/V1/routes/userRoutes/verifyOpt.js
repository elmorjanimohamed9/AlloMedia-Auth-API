import express from 'express';
import { verifyOtpHandler } from '../../controllers/auth/verifyOtpController.js';
import { verifyToken } from '../../middlewares/authenticateTokenMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, verifyOtpHandler);

export default router;