import express from 'express';
import { verifyOtpHandler } from '../../controllers/auth/verifyOtpController.js';

const router = express.Router();

router.post('/', verifyOtpHandler);

export default router;