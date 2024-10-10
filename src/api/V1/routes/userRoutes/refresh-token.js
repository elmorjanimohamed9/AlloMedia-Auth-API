import express from 'express';
import { refreshToken } from '../../controllers/auth/loginController.js';

const router = express.Router();

router.post('/', refreshToken);

export default router;