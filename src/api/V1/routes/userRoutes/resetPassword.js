import express from 'express';
import { resetPasswordController } from '../../controllers/auth/resetPasswordController.js';
import { validateResetPassword } from '../../middlewares/validationMiddleware.js';

const router = express.Router();


router.post('/', validateResetPassword, resetPasswordController);

export default router;