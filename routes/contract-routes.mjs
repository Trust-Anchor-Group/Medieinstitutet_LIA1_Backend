// routes/contract-routes.mjs
import express from "express";
import { protect } from "../middleware/authHandler.mjs";
import { createMicroLoanContract, getContractDetails, getAvailableContracts } from '../controllers/contract-controller.mjs';

const router = express.Router();

router.get('/available', protect, getAvailableContracts);
router.get('/:contractId', protect, getContractDetails);
router.post('/microloan', protect, createMicroLoanContract);

export default router;