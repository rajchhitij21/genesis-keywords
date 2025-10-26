-- Add new columns for better keyword tracking
ALTER TABLE keyword_variations 
ADD COLUMN IF NOT EXISTS search_volume INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS competition_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS commercial_intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS trend_velocity VARCHAR(20),
ADD COLUMN IF NOT EXISTS serp_features JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kw_trend_velocity ON keyword_variations(trend_velocity);
CREATE INDEX IF NOT EXISTS idx_kw_search_volume ON keyword_variations(search_volume DESC);
CREATE INDEX IF NOT EXISTS idx_kw_commercial_intent ON keyword_variations(commercial_intent);