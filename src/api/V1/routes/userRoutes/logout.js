import express from 'express';
import { verifyToken, invalidateRefreshToken } from '../../middlewares/authenticateTokenMiddleware.js';
import { logout } from '../../controllers/auth/logoutController.js';

const router = express.Router();

router.post('/', verifyToken, invalidateRefreshToken, logout);

export default router;