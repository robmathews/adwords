import express from 'express';
import * as demographicsController from '../controllers/demographicsController';

const router = express.Router();

// POST /api/demographics/generate
router.post('/generate', demographicsController.generateDemographics);

export default router;