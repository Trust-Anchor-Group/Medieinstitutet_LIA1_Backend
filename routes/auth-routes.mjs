import express from "express";
import { loginLimiter, registerLimiter } from "../middleware/limitHandler.mjs";
import { accountInfo, login, logout, register, verifyEmail, checkSession, refreshToken, getId, ids, getReqIdAttr, getAlgorithms, registerId } from '../controllers/auth-controller.mjs'
import { protect } from "../middleware/authHandler.mjs";

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/verify-email', verifyEmail); // ! Add limiter?
router.post('/id-register', protect, registerId);
router.get('/logout', logout);
router.get('/account-info', protect, accountInfo);
router.get('/session-status', protect, checkSession);
router.get('/refresh', protect, refreshToken);
router.post('/id', protect, getId);
router.get('/ids', protect, ids);
router.get('/id-req-attr', protect, getReqIdAttr);
router.get('/algorithms', protect, getAlgorithms);


export default router;