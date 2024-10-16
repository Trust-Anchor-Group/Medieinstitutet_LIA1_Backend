import express from "express";
import { loginLimiter, registerLimiter } from "../middleware/limitHandler.mjs";
import { accountInfo, login, logout, register, verifyEmail, checkSession, refreshToken } from '../controllers/auth-controller.mjs'
import { protect } from "../middleware/authHandler.mjs";

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/logout', logout);
router.post('/verify-email', verifyEmail); // ! Add limiter?
router.get('/account-info', protect, accountInfo);
router.get('/session-status', protect, checkSession);
router.get('/refresh', protect, refreshToken);

export default router;