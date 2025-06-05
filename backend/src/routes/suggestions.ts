import express from 'express';
import * as suggestionsController from '../controllers/suggestionsController';

const router = express.Router();

// POST /api/suggestions/generate
router.post('/generate', suggestionsController.generateSuggestions);

export default router;
