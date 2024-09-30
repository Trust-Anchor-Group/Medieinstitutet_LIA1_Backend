// src/routes/accountRoutes.mjs
import express from 'express';
import { accountController } from '../controllers/accountController.mjs';

const router = express.Router();

router.get('/domain-info', accountController.domainInfo);
router.post('/create', accountController.createAccount);
router.get('/session-token', accountController.getSessionToken);
router.post('/verify-email', accountController.verifyEmail);
router.post('/login', accountController.login);
router.post('/quick-login', accountController.quickLogin);
router.post('/refresh', accountController.refresh);
router.post('/logout', accountController.logout);
router.post('/recover', accountController.recover);
router.post('/authenticate-jwt', accountController.authenticateJwt);

export default router;