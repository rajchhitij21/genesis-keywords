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
  keyword_type TEXT, -- seed, competitor, lsi, question, long_tail
  source TEXT, -- user_input, competitor_analysis, serp_analysis, etc.
  category TEXT,
  commercial_intent TEXT, -- high, medium, low
  
  -- Agent 2 V3 - Core Metrics
  estimated_volume INTEGER,
  volume_range TEXT, -- "1K-10K", "10K-100K", etc.
  competition_score INTEGER, -- 0-100
  trend_direction TEXT, -- rising, stable, declining
  trend_score INTEGER, -- 0-100
  priority_tier TEXT, -- urgent, high, medium, low
  
  -- Agent 2 V3 - Trend Signals
  trend_signals JSONB, -- {news_mentions, video_content, shopping_signals, commercial_intent_signals}
  
  -- Agent 2 V3 - Content Gaps
  content_gaps JSONB, -- {opportunity_score, weak_competitors[], content_suggestions[]}
  
  -- Agent 2 V3 - SERP Analysis
  serp_features JSONB, -- {featured_snippets, people_also_ask, related_searches[]}
  
  -- Content Planning
  content_status TEXT DEFAULT 'pending', -- pending, in_progress, published, archived
  content_created_at TIMESTAMPTZ,
  content_url TEXT,
  
  -- Ranking & Selection
  overall_score FLOAT, -- composite score for ranking
  rank_position INTEGER, -- 1-20 for top keywords
  
  -- Metadata
  metadata JSONB, -- additional flexible data
  
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
CREATE INDEX idx_keywords_vault_created_at ON genesis_keywords_vault(created_at DESC);
CREATE INDEX idx_keywords_vault_pipeline_id ON genesis_keywords_vault(pipeline_id);
CREATE INDEX idx_keywords_vault_priority ON genesis_keywords_vault(priority_tier);
CREATE INDEX idx_keywords_vault_content_status ON genesis_keywords_vault(content_status);
CREATE INDEX idx_keywords_vault_keyword ON genesis_keywords_vault(keyword);
CREATE INDEX idx_keywords_vault_volume ON genesis_keywords_vault(estimated_volume DESC);
CREATE INDEX idx_keywords_vault_score ON genesis_keywords_vault(overall_score DESC);
CREATE INDEX idx_keywords_vault_business ON genesis_keywords_vault(business_name);
CREATE INDEX idx_keywords_vault_trend ON genesis_keywords_vault(trend_direction);

-- GIN index for JSONB columns (for fast JSON queries)
CREATE INDEX idx_keywords_vault_trend_signals ON genesis_keywords_vault USING GIN(trend_signals);
CREATE INDEX idx_keywords_vault_content_gaps ON genesis_keywords_vault USING GIN(content_gaps);
CREATE INDEX idx_keywords_vault_serp_features ON genesis_keywords_vault USING GIN(serp_features);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_genesis_keywords_vault_updated_at
  BEFORE UPDATE ON genesis_keywords_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional - for multi-tenant setup)
ALTER TABLE genesis_keywords_vault ENABLE ROW LEVEL SECURITY;

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

-- Comment on table
COMMENT ON TABLE genesis_keywords_vault IS 'Stores top curated keywords from Genesis pipeline for content creation in Make.com';
COMMENT ON COLUMN genesis_keywords_vault.overall_score IS 'Composite score: priority(40%) + volume(30%) + trend(15%) + content_opportunity(15%)';
COMMENT ON COLUMN genesis_keywords_vault.rank_position IS 'Ranking position (1-20) within pipeline batch';
COMMENT ON COLUMN genesis_keywords_vault.content_status IS 'Workflow status for Make.com automation';