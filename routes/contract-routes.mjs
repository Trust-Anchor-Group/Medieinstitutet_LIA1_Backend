// routes/contract-routes.mjs
import express from "express";
import { protect } from "../middleware/authHandler.mjs";
import { createMicroLoanContract } from '../controllers/contract-controller.mjs';

const router = express.Router();

router.post('/microloan', protect, createMicroLoanContract);

export default router;