// src/routes/cryptoRoutes.mjs
import express from 'express';
import { cryptoController } from '../controllers/cryptoController.mjs';

const router = express.Router();

router.get('/algorithms', cryptoController.getAlgorithms);
router.post('/create-key', cryptoController.createKey);
router.get('/public-key', cryptoController.getPublicKey);

export default router;
