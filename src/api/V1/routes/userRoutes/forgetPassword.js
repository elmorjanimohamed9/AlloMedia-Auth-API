import express from 'express';
import { forgotPasswordController } from '../../controllers/auth/forgetPasswordController.js';

const router = express.Router();

router.post('/', forgotPasswordController);


export default router;