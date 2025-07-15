// backend/src/routes/leaderboard.ts
// API routes for MySQL-based global leaderboard operations

import express from 'express';
import * as leaderboardController from '../controllers/leaderboardController';

const router = express.Router();

// GET /api/leaderboard - Get the global leaderboard
// Query params: limit (default 10, max 100), offset (default 0)
router.get('/', leaderboardController.getLeaderboard);

// POST /api/leaderboard - Add a new entry to the leaderboard
router.post('/', leaderboardController.addLeaderboardEntry);

// GET /api/leaderboard/stats - Get leaderboard statistics
router.get('/stats', leaderboardController.getLeaderboardStats);

// GET /api/leaderboard/recent - Get recent entries (activity feed)
// Query params: limit (default 10, max 50)
router.get('/recent', leaderboardController.getRecentEntries);

// GET /api/leaderboard/qualify - Check if a score qualifies for leaderboard
// Query params: totalRevenue (required)
router.get('/qualify', leaderboardController.checkQualification);

// GET /api/leaderboard/player/:playerName - Get stats for a specific player
router.get('/player/:playerName', leaderboardController.getPlayerStats);

export default router;