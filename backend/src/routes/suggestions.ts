import express from 'express';
import * as suggestionsController from '../controllers/suggestionsController';

const router = express.Router();

// POST /api/suggestions/generate - Original A/B testing suggestions
router.post('/generate', suggestionsController.generateSuggestions);

// POST /api/suggestions/optimized - New single optimized suggestion
router.post('/optimized', suggestionsController.generateOptimizedSuggestion);

export default router;
