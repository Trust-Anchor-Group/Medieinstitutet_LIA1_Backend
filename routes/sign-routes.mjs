// sign-routes.mjs
import express from "express";
import { protect } from "../middleware/authHandler.mjs";
import { getSigningCredentials } from '../controllers/sign-controller.mjs';

const router = express.Router();

router.get('/signing-credentials', protect, getSigningCredentials);

export default router;