// routes/contract-routes.mjs
import express from "express";
import { protect } from "../middleware/authHandler.mjs";
import { createMicroLoanContract, getContractDetails, getAvailableContracts } from '../controllers/contract-controller.mjs';

const router = express.Router();

router.post('/microloan', protect, createMicroLoanContract);
router.get('/:contractId', protect, getContractDetails);
router.get('/available', protect, getAvailableContracts);

export default router;