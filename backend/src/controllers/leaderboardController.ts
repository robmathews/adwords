// backend/src/controllers/leaderboardController.ts
// Express controllers for leaderboard API endpoints

import { Request, Response } from 'express';
import * as leaderboardService from '../services/leaderboardService';

/**
 * GET /api/leaderboard - Get the global leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const leaderboard = await leaderboardService.getGlobalLeaderboard(limit, offset);

    return res.status(200).json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * POST /api/leaderboard - Add a new entry to the leaderboard
 */
export const addLeaderboardEntry = async (req: Request, res: Response) => {
  try {
    const entryData = req.body;

    // Validate required fields
    const requiredFields = [
      'playerName', 'productDescription', 'tagline', 'totalRevenue',
      'totalProfit', 'conversionRate', 'engagementRate', 'salesPrice',
      'unitCost', 'demographicsCount', 'totalSimulations'
    ];

    for (const field of requiredFields) {
      if (entryData[field] === undefined || entryData[field] === null) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Add the entry
    const newEntry = await leaderboardService.addLeaderboardEntry(entryData);

    // Get updated leaderboard
    const leaderboard = await leaderboardService.getGlobalLeaderboard(10, 0);

    return res.status(201).json({
      success: true,
      data: {
        entry: newEntry,
        leaderboard: leaderboard
      }
    });

  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding leaderboard entry',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * GET /api/leaderboard/stats - Get leaderboard statistics
 */
export const getLeaderboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await leaderboardService.getLeaderboardStats();

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * GET /api/leaderboard/recent - Get recent entries (activity feed)
 */
export const getRecentEntries = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const recentEntries = await leaderboardService.getRecentEntries(limit);

    return res.status(200).json({
      success: true,
      data: recentEntries
    });

  } catch (error) {
    console.error('Error fetching recent entries:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching recent entries',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * GET /api/leaderboard/qualify - Check if a score qualifies for leaderboard
 */
export const checkQualification = async (req: Request, res: Response) => {
  try {
    const totalRevenue = parseFloat(req.query.totalRevenue as string);

    if (isNaN(totalRevenue)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid totalRevenue parameter'
      });
    }

    const qualification = await leaderboardService.checkQualification(totalRevenue);

    return res.status(200).json({
      success: true,
      data: qualification
    });

  } catch (error) {
    console.error('Error checking qualification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking leaderboard qualification',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * GET /api/leaderboard/player/:playerName - Get stats for a specific player
 */
export const getPlayerStats = async (req: Request, res: Response) => {
  try {
    const playerName = req.params.playerName;

    if (!playerName) {
      return res.status(400).json({
        success: false,
        message: 'Player name is required'
      });
    }

    const playerStats = await leaderboardService.getPlayerStats(playerName);

    if (!playerStats) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: playerStats
    });

  } catch (error) {
    console.error('Error fetching player stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching player statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
