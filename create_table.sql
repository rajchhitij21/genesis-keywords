-- Genesis Keywords Vault Table
-- Stores top 10-20 curated keywords from each pipeline run
-- Optimized for Make.com retrieval and content creation workflow

CREATE TABLE IF NOT EXISTS genesis_keywords_vault (
  -- Primary Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Business Context (from Agent 1 input)
  business_name TEXT,
  niche TEXT,
  target_audience TEXT,
  
  -- Agent 1 Data (Keyword Discovery)
  keyword_type TEXT,
  source TEXT,
  category TEXT,
  commercial_intent TEXT,
  
  -- Agent 2 V3 - Core Metrics
  estimated_volume INTEGER,
  volume_range TEXT,
  competition_score INTEGER,
  trend_direction TEXT,
  trend_score INTEGER,
  priority_tier TEXT,
  
  -- Agent 2 V3 - Trend Signals
  trend_signals JSONB,
  
  -- Agent 2 V3 - Content Gaps
  content_gaps JSONB,
  
  -- Agent 2 V3 - SERP Analysis
  serp_features JSONB,
  
  -- Content Planning
  content_status TEXT DEFAULT 'pending',
  content_created_at TIMESTAMPTZ,
  content_url TEXT,
  
  -- Ranking & Selection
  overall_score FLOAT,
  rank_position INTEGER,
  
  -- Metadata
  metadata JSONB,
  
  -- Constraints
  CONSTRAINT unique_keyword_per_pipeline UNIQUE(pipeline_id, keyword),
  CONSTRAINT valid_priority CHECK (priority_tier IN ('urgent', 'high', 'medium', 'low')),
  CONSTRAINT valid_content_status CHECK (content_status IN ('pending', 'in_progress', 'published', 'archived')),
  CONSTRAINT valid_trend_direction CHECK (trend_direction IN ('rising', 'stable', 'declining')),
  CONSTRAINT valid_scores CHECK (
    competition_score BETWEEN 0 AND 100 AND
    trend_score BETWEEN 0 AND 100 AND
    overall_score >= 0
  )
);

-- Indexes for Make.com fast queries
CREATE INDEX IF NOT EXISTS idx_keywords_vault_created_at ON genesis_keywords_vault(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_pipeline_id ON genesis_keywords_vault(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_priority ON genesis_keywords_vault(priority_tier);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_content_status ON genesis_keywords_vault(content_status);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_keyword ON genesis_keywords_vault(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_volume ON genesis_keywords_vault(estimated_volume DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_score ON genesis_keywords_vault(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_business ON genesis_keywords_vault(business_name);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_trend ON genesis_keywords_vault(trend_direction);

-- GIN index for JSONB columns (for fast JSON queries)
CREATE INDEX IF NOT EXISTS idx_keywords_vault_trend_signals ON genesis_keywords_vault USING GIN(trend_signals);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_content_gaps ON genesis_keywords_vault USING GIN(content_gaps);
CREATE INDEX IF NOT EXISTS idx_keywords_vault_serp_features ON genesis_keywords_vault USING GIN(serp_features);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_genesis_keywords_vault_updated_at ON genesis_keywords_vault;
CREATE TRIGGER update_genesis_keywords_vault_updated_at
  BEFORE UPDATE ON genesis_keywords_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE genesis_keywords_vault ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON genesis_keywords_vault;
DROP POLICY IF EXISTS "Allow all operations for anon users" ON genesis_keywords_vault;

-- Default policy: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON genesis_keywords_vault
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for anon access (for API keys)
CREATE POLICY "Allow all operations for anon users"
  ON genesis_keywords_vault
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
