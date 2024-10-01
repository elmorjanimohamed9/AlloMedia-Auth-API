import express from 'express';
import authenticateToken from '../../middlewares/authenticateTokenMiddleware.js';
import { logout } from '../../controllers/auth/logoutController.js';

const router = express.Router();

router.post('/', authenticateToken, logout);

export default router;