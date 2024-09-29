import express from 'express';
import { forgotPasswordController } from '../../controllers/auth/forgetPasswordController.js';
import { validateForgotPassword } from '../../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', validateForgotPassword, forgotPasswordController);


export default router;