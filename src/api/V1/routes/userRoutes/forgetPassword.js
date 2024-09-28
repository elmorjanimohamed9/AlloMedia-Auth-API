import express from "express";
import { forgetPasswordController } from '../../controllers/auth/forgetPasswordController.js';

const router = express.Router();

router.post('/', forgetPasswordController);

export default  router;