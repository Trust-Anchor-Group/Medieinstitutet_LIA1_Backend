import express from "express";
import { loginLimiter, registerLimiter } from "../middleware/limitHandler.mjs";
import { accountInfo, login, register, verifyEmail } from '../controllers/auth-controller.mjs'
import { protect } from "../middleware/authorization.mjs";

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/verify-email', verifyEmail); // ! Add limiter?
router.get('/account-info', protect, accountInfo);

export default router;