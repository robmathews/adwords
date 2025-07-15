import pool from '../config/database';

// Types for leaderboard entries
export interface LeaderboardEntry {
  id: number;
  playerName: string;
  productDescription: string;
  tagline: string;
  totalRevenue: number;
  totalProfit: number;
  conversionRate: number;
  engagementRate: number;
  salesPrice: number;
  unitCost: number;
  targetMarket: string | null;
  demographicsCount: number;
  totalSimulations: number;
  createdAt: Date;
  updatedAt: Date;
  rank?: number;
}

export interface LeaderboardEntryInput {
  playerName: string;
  productDescription: string;
  tagline: string;
  totalRevenue: number;
  totalProfit: number;
  conversionRate: number;
  engagementRate: number;
  salesPrice: number;
  unitCost: number;
  targetMarket: string | null;
  demographicsCount: number;
  totalSimulations: number;
}

export interface LeaderboardStats {
  totalEntries: number;
  highestRevenue: number;
  averageRevenue: number;
  averageConversionRate: number;
  averageEngagementRate: number;
  topPlayerName: string | null;
  latestEntryDate: Date | null;
}

export interface PlayerStats {
  playerName: string;
  totalEntries: number;
  bestRevenue: number;
  bestRank: number | null;
  averageRevenue: number;
  averageConversionRate: number;
  latestEntry: Date | null;
  entries: LeaderboardEntry[];
}

export interface QualificationCheck {
  qualifies: boolean;
  currentEntryCount: number;
  minimumRevenue: number | null;
  projectedRank: number | null;
}

/**
 * Get the global leaderboard with rankings
 */
export async function getGlobalLeaderboard(limit: number = 10, offset: number = 0): Promise<LeaderboardEntry[]> {
  const client = await pool.connect();

  try {
    const query = `
      SELECT
        id,
        player_name as "playerName",
        product_description as "productDescription",
        tagline,
        total_revenue as "totalRevenue",
        total_profit as "totalProfit",
        conversion_rate as "conversionRate",
        engagement_rate as "engagementRate",
        sales_price as "salesPrice",
        unit_cost as "unitCost",
        target_market as "targetMarket",
        demographics_count as "demographicsCount",
        total_simulations as "totalSimulations",
        created_at as "createdAt",
        updated_at as "updatedAt",
        ROW_NUMBER() OVER (ORDER BY total_revenue DESC) as rank
      FROM leaderboard
      ORDER BY total_revenue DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await client.query(query, [limit, offset]);
    return result.rows.map(row => ({
      ...row,
      totalRevenue: parseFloat(row.totalRevenue) || 0,
      totalProfit: parseFloat(row.totalProfit) || 0,
      conversionRate: parseFloat(row.conversionRate) || 0,
      engagementRate: parseFloat(row.engagementRate) || 0,
      salesPrice: parseFloat(row.salesPrice) || 0,
      unitCost: parseFloat(row.unitCost) || 0,
      demographicsCount: parseInt(row.demographicsCount) || 0,
      totalSimulations: parseInt(row.totalSimulations) || 0,
      rank: offset + parseInt(row.rank)
    }));

  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    // Always return an empty array on error
    return [];
  } finally {
    client.release();
  }
}

/**
 * Add a new entry to the leaderboard
 */
export async function addLeaderboardEntry(entry: LeaderboardEntryInput): Promise<LeaderboardEntry> {
  const client = await pool.connect();

  try {
    const query = `
      INSERT INTO leaderboard (
        player_name, product_description, tagline, total_revenue, total_profit,
        conversion_rate, engagement_rate, sales_price, unit_cost, target_market,
        demographics_count, total_simulations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        player_name as "playerName",
        product_description as "productDescription",
        tagline,
        total_revenue as "totalRevenue",
        total_profit as "totalProfit",
        conversion_rate as "conversionRate",
        engagement_rate as "engagementRate",
        sales_price as "salesPrice",
        unit_cost as "unitCost",
        target_market as "targetMarket",
        demographics_count as "demographicsCount",
        total_simulations as "totalSimulations",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      entry.playerName,
      entry.productDescription,
      entry.tagline,
      entry.totalRevenue,
      entry.totalProfit,
      entry.conversionRate,
      entry.engagementRate,
      entry.salesPrice,
      entry.unitCost,
      entry.targetMarket,
      entry.demographicsCount,
      entry.totalSimulations
    ];

    const result = await client.query(query, values);
    return result.rows[0];

  } finally {
    client.release();
  }
}

/**
 * Get leaderboard statistics
 */
export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  const client = await pool.connect();

  try {
    const query = `
      SELECT
        COUNT(*) as "totalEntries",
        COALESCE(MAX(total_revenue), 0) as "highestRevenue",
        COALESCE(AVG(total_revenue), 0) as "averageRevenue",
        COALESCE(AVG(conversion_rate), 0) as "averageConversionRate",
        COALESCE(AVG(engagement_rate), 0) as "averageEngagementRate",
        (SELECT player_name FROM leaderboard ORDER BY total_revenue DESC LIMIT 1) as "topPlayerName",
        MAX(created_at) as "latestEntryDate"
      FROM leaderboard
    `;

    const result = await client.query(query);
    return result.rows[0];

  } finally {
    client.release();
  }
}

/**
 * Get recent leaderboard entries
 */
export async function getRecentEntries(limit: number = 10): Promise<LeaderboardEntry[]> {
  const client = await pool.connect();

  try {
    const query = `
      SELECT
        id,
        player_name as "playerName",
        product_description as "productDescription",
        tagline,
        total_revenue as "totalRevenue",
        total_profit as "totalProfit",
        conversion_rate as "conversionRate",
        engagement_rate as "engagementRate",
        sales_price as "salesPrice",
        unit_cost as "unitCost",
        target_market as "targetMarket",
        demographics_count as "demographicsCount",
        total_simulations as "totalSimulations",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leaderboard
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await client.query(query, [limit]);
    return result.rows;

  } finally {
    client.release();
  }
}

/**
 * Check if a score qualifies for the leaderboard
 */
export async function checkQualification(totalRevenue: number): Promise<QualificationCheck> {
  const client = await pool.connect();

  try {
    // Get current number of entries
    const countQuery = 'SELECT COUNT(*) as count FROM leaderboard';
    const countResult = await client.query(countQuery);
    const currentEntryCount = parseInt(countResult.rows[0].count);
    // If leaderboard has less than 100 entries, always qualifies
    if (currentEntryCount < 100) {
      return {
        qualifies: true,
        currentEntryCount,
        minimumRevenue: null,
        projectedRank: currentEntryCount
      };
    }

    // Get the minimum revenue to qualify (100th place)
    const minQuery = `
      SELECT total_revenue as "minimumRevenue"
      FROM leaderboard
      ORDER BY total_revenue DESC
      LIMIT 1 OFFSET 99
    `;
    const minResult = await client.query(minQuery);
    const minimumRevenue = parseFloat(minResult.rows[0]?.minimumRevenue || '0');

    // Calculate projected rank
    const rankQuery = `
      SELECT COUNT(*) + 1 as "projectedRank"
      FROM leaderboard
      WHERE total_revenue > $1
    `;
    const rankResult = await client.query(rankQuery, [totalRevenue]);
    const projectedRank = parseInt(rankResult.rows[0].projectedRank);

    return {
      qualifies: totalRevenue > minimumRevenue,
      currentEntryCount,
      minimumRevenue,
      projectedRank
    };

  } finally {
    client.release();
  }
}

/**
 * Get statistics for a specific player
 */
export async function getPlayerStats(playerName: string): Promise<PlayerStats | null> {
  const client = await pool.connect();

  try {
    // Get player entries
    const entriesQuery = `
      SELECT
        id,
        player_name as "playerName",
        product_description as "productDescription",
        tagline,
        total_revenue as "totalRevenue",
        total_profit as "totalProfit",
        conversion_rate as "conversionRate",
        engagement_rate as "engagementRate",
        sales_price as "salesPrice",
        unit_cost as "unitCost",
        target_market as "targetMarket",
        demographics_count as "demographicsCount",
        total_simulations as "totalSimulations",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leaderboard
      WHERE LOWER(player_name) = LOWER($1)
      ORDER BY total_revenue DESC
    `;

    const entriesResult = await client.query(entriesQuery, [playerName]);

    if (entriesResult.rows.length === 0) {
      return null;
    }

    const entries = entriesResult.rows;

    // Calculate stats
    const totalEntries = entries.length;
    const bestRevenue = Math.max(...entries.map(e => parseFloat(e.totalRevenue)));
    const averageRevenue = entries.reduce((sum, e) => sum + parseFloat(e.totalRevenue), 0) / totalEntries;
    const averageConversionRate = entries.reduce((sum, e) => sum + parseFloat(e.conversionRate), 0) / totalEntries;
    const latestEntry = new Date(Math.max(...entries.map(e => new Date(e.createdAt).getTime())));

    // Get best rank
    const rankQuery = `
      SELECT rank FROM (
        SELECT
          player_name,
          total_revenue,
          ROW_NUMBER() OVER (ORDER BY total_revenue DESC) as rank
        FROM leaderboard
      ) ranked
      WHERE LOWER(player_name) = LOWER($1)
      ORDER BY rank ASC
      LIMIT 1
    `;

    const rankResult = await client.query(rankQuery, [playerName]);
    const bestRank = rankResult.rows[0]?.rank || null;

    return {
      playerName,
      totalEntries,
      bestRevenue,
      bestRank: bestRank ? parseInt(bestRank) : null,
      averageRevenue,
      averageConversionRate,
      latestEntry,
      entries
    };

  } finally {
    client.release();
  }
}
