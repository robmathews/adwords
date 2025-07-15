// frontend/src/services/LeaderboardService.ts
// Updated service for global MySQL-based leaderboard

import { LeaderboardEntry, TestRun } from '../types';

// Backend API URL
const API_BASE_URL = import.meta.env.PROD
  ? '/api'  // In production, use relative path
  : (import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api');  // In development

// Types for API responses
interface LeaderboardStats {
  totalEntries: number;
  highestRevenue: number;
  averageRevenue: number;
  averageConversionRate: number;
  averageEngagementRate: number;
  topPlayerName: string | null;
  latestEntryDate: Date | null;
}

interface QualificationCheck {
  qualifies: boolean;
  currentEntryCount: number;
  minimumRevenue: number | null;
  projectedRank: number | null;
}

interface PlayerStats {
  playerName: string;
  totalEntries: number;
  bestRevenue: number;
  bestRank: number | null;
  averageRevenue: number;
  averageConversionRate: number;
  latestEntry: Date | null;
  entries: LeaderboardEntry[];
}

export class LeaderboardService {
  /**
   * Load the global leaderboard from the backend
   */
  static async loadLeaderboard(limit: number = 10, offset: number = 0): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      
      // Convert timestamp strings back to Date objects
      return data.data.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load global leaderboard:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Add a new entry to the global leaderboard
   */
  static async addEntry(testRun: TestRun, playerName: string): Promise<LeaderboardEntry[]> {
    try {
      const entryData = {
        playerName: playerName.trim(),
        productDescription: testRun.productDescription,
        tagline: testRun.tagline,
        totalRevenue: testRun.totalRevenue,
        totalProfit: testRun.totalProfit,
        conversionRate: testRun.conversionRate,
        engagementRate: testRun.engagementRate,
        salesPrice: testRun.salesPrice,
        unitCost: testRun.unitCost,
        targetMarket: testRun.targetMarket,
        demographicsCount: testRun.demographics.length,
        totalSimulations: testRun.results.reduce((sum, r) => sum + r.totalSims, 0)
      };

      const response = await fetch(`${API_BASE_URL}/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add entry to leaderboard');
      }

      const data = await response.json();
      
      // Convert timestamps and return updated leaderboard
      return data.data.leaderboard.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.createdAt)
      }));
    } catch (error) {
      console.error('Failed to add entry to global leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard statistics
   */
  static async getLeaderboardStats(): Promise<LeaderboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard statistics');
      }

      const data = await response.json();
      return {
        ...data.data,
        latestEntryDate: data.data.latestEntryDate ? new Date(data.data.latestEntryDate) : null
      };
    } catch (error) {
      console.error('Failed to load leaderboard stats:', error);
      // Return default stats as fallback
      return {
        totalEntries: 0,
        highestRevenue: 0,
        averageRevenue: 0,
        averageConversionRate: 0,
        averageEngagementRate: 0,
        topPlayerName: null,
        latestEntryDate: null
      };
    }
  }

  /**
   * Check if a score qualifies for the leaderboard
   */
  static async qualifiesForLeaderboard(totalRevenue: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/qualify?totalRevenue=${totalRevenue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false; // Assume doesn't qualify if we can't check
      }

      const data = await response.json();
      return data.data.qualifies;
    } catch (error) {
      console.error('Failed to check leaderboard qualification:', error);
      return false;
    }
  }

  /**
   * Get the rank that a score would achieve
   */
  static async getScoreRank(totalRevenue: number): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/qualify?totalRevenue=${totalRevenue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return 999; // Return high rank if we can't determine
      }

      const data = await response.json();
      return data.data.projectedRank || 999;
    } catch (error) {
      console.error('Failed to get score rank:', error);
      return 999;
    }
  }

  /**
   * Get statistics for a specific player
   */
  static async getPlayerStats(playerName: string): Promise<PlayerStats | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/player/${encodeURIComponent(playerName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        ...data.data,
        latestEntry: data.data.latestEntry ? new Date(data.data.latestEntry) : null,
        entries: data.data.entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.createdAt)
        }))
      };
    } catch (error) {
      console.error('Failed to get player stats:', error);
      return null;
    }
  }

  /**
   * Get recent leaderboard entries (activity feed)
   */
  static async getRecentEntries(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/recent?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.data.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.createdAt)
      }));
    } catch (error) {
      console.error('Failed to get recent entries:', error);
      return [];
    }
  }

  /**
   * Get the current leaderboard (alias for loadLeaderboard for backward compatibility)
   */
  static getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.loadLeaderboard(limit, 0);
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get medal emoji for rank
   */
  static getMedalForRank(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  }

  /**
   * Get performance category based on revenue
   */
  static getPerformanceCategory(totalRevenue: number): {
    title: string;
    emoji: string;
    color: string;
  } {
    if (totalRevenue >= 1000000) {
      return { title: 'Marketing Mogul', emoji: '👑', color: 'text-yellow-400' };
    } else if (totalRevenue >= 500000) {
      return { title: 'Revenue Ruler', emoji: '💰', color: 'text-green-400' };
    } else if (totalRevenue >= 100000) {
      return { title: 'Sales Superstar', emoji: '⭐', color: 'text-blue-400' };
    } else if (totalRevenue >= 25000) {
      return { title: 'Marketing Maven', emoji: '📈', color: 'text-purple-400' };
    } else if (totalRevenue >= 10000) {
      return { title: 'Rising Entrepreneur', emoji: '🚀', color: 'text-indigo-400' };
    } else if (totalRevenue >= 1000) {
      return { title: 'Promising Beginner', emoji: '🌱', color: 'text-green-500' };
    } else if (totalRevenue >= 100) {
      return { title: 'Learning the Ropes', emoji: '📚', color: 'text-orange-400' };
    } else if (totalRevenue >= 1) {
      return { title: 'Penny Pusher', emoji: '🪙', color: 'text-amber-600' };
    } else {
      return { title: 'Ramen Noodle Survivor', emoji: '🍜', color: 'text-red-400' };
    }
  }

  // Legacy methods for local storage (kept for fallback)
  private static LEADERBOARD_STORAGE_KEY = 'adwords_tycoon_leaderboard_backup';

  /**
   * Save leaderboard to localStorage as backup
   */
  private static saveLeaderboardBackup(leaderboard: LeaderboardEntry[]): void {
    try {
      localStorage.setItem(this.LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
    } catch (error) {
      console.error('Failed to save leaderboard backup:', error);
    }
  }

  /**
   * Load leaderboard from localStorage backup
   */
  private static loadLeaderboardBackup(): LeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(this.LEADERBOARD_STORAGE_KEY);
      if (saved) {
        const entries = JSON.parse(saved) as LeaderboardEntry[];
        return entries.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load leaderboard backup:', error);
    }
    return [];
  }
}
