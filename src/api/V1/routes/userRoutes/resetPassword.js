import express from "express";
import { resetPasswordController } from '../../controllers/auth/resetPasswordController.js';

const router = express.Router();

router.post('/:token', resetPasswordController);

export default  router ;