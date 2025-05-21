import express from 'express';
import * as simulationController from '../controllers/simulationController';

const router = express.Router();

// POST /api/simulation/response
router.post('/response', simulationController.simulateResponse);

// POST /api/simulation/batch
router.post('/batch', simulationController.simulateBatch);

export default router;