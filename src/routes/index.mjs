// src/routes/index.mjs
import express from 'express';
import accountRoutes from './accountRoutes.mjs';
import cryptoRoutes from './cryptoRoutes.mjs';
import legalRoutes from './legalRoutes.mjs';

const router = express.Router();

// Account routes
router.use('/account', accountRoutes);

// Crypto routes
router.use('/crypto', cryptoRoutes);

// Legal routes
router.use('/legal', legalRoutes);

export default router;