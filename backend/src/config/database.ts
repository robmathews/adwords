import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Initialize database tables
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    // Create leaderboard table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(255) NOT NULL,
        product_description TEXT NOT NULL,
        tagline TEXT NOT NULL,
        total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
        total_profit DECIMAL(15,2) NOT NULL DEFAULT 0,
        conversion_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
        engagement_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
        sales_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
        target_market VARCHAR(500),
        demographics_count INTEGER NOT NULL DEFAULT 0,
        total_simulations INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leaderboard_revenue
      ON leaderboard(total_revenue DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leaderboard_player
      ON leaderboard(player_name)
    `);

    // Create trigger for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard
    `);

    await client.query(`
      CREATE TRIGGER update_leaderboard_updated_at
      BEFORE UPDATE ON leaderboard
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Database tables initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
    throw error;
  }
}

export default pool;
