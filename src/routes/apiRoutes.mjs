// src/routes/apiRoutes.mjs
import express from 'express';
import { createAccountController } from '../controllers/accountController.mjs';

const router = express.Router();

router.post('/create-account', createAccountController);  // Route for account creation

export default router;