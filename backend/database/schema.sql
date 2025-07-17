-- backend/database/schema.sql
-- Database schema for AdWords Tycoon global leaderboard

-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    product_description TEXT NOT NULL,
    tagline VARCHAR(200) NOT NULL,
    total_revenue DECIMAL(12, 2) NOT NULL,
    total_profit DECIMAL(12, 2) NOT NULL,
    conversion_rate DECIMAL(8, 4) NOT NULL,
    engagement_rate DECIMAL(8, 4) NOT NULL,
    sales_price DECIMAL(8, 2) NOT NULL,
    unit_cost DECIMAL(8, 2) NOT NULL,
    target_market VARCHAR(100),
    demographics_count INTEGER DEFAULT 0,
    total_simulations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_revenue ON leaderboard(total_revenue DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_player ON leaderboard(player_name);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update the updated_at field
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE
    ON leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO leaderboard (
    player_name,
    product_description,
    tagline,
    total_revenue,
    total_profit,
    conversion_rate,
    engagement_rate,
    sales_price,
    unit_cost,
    target_market,
    demographics_count,
    total_simulations
) VALUES
('Marketing Maven', 'Premium gaming mouse pads with RGB lighting', 'Level up your setup', 125000.00, 85000.00, 8.5, 32.1, 79.99, 22.50, 'PC Gamers', 5, 500),
('Revenue Ruler', 'Artisanal coffee subscription', 'Taste the extraordinary', 98500.00, 67200.00, 12.3, 28.7, 29.99, 12.00, 'Coffee Enthusiasts', 4, 400),
('Sales Superstar', 'Smart fitness tracker with AI coaching', 'Your personal trainer on your wrist', 87300.00, 52000.00, 6.2, 24.8, 199.99, 65.00, 'Fitness Enthusiasts', 6, 600);

-- Query to get top 10 leaderboard (for testing)
-- SELECT * FROM leaderboard ORDER BY total_revenue DESC LIMIT 10;
