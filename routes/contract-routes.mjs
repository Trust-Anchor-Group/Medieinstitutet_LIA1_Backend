// routes/contract-routes.mjs
import express from "express";
import { protect } from "../middleware/authHandler.mjs";
import { createMicroLoanContract, getContractDetails, getAvailableContracts, signContract } from '../controllers/contract-controller.mjs';

const router = express.Router();

router.get('/available', protect, getAvailableContracts);
router.get('/:contractId', protect, getContractDetails);
router.post('/microloan', protect, createMicroLoanContract);
router.post('/sign', protect, signContract);

export default router;