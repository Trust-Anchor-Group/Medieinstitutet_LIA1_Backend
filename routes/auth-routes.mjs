import express from "express";
import { loginLimiter, registerLimiter } from "../middleware/limitHandler.mjs";
import { login, register, verifyEmail } from '../controllers/auth-controller.mjs'

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/verify-email', verifyEmail); // ! Add limiter?

export default router;