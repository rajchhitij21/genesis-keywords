-- Create keyword_variations table
CREATE TABLE IF NOT EXISTS keyword_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Keyword info
  keyword VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'variation',
  category VARCHAR(100),
  
  -- Source tracking
  source VARCHAR(50),
  source_item TEXT,
  source_data JSONB,
  
  -- Trend data
  trend_score INTEGER DEFAULT 0,
  growth_rate DECIMAL(10,2) DEFAULT 0,
  interest_data JSONB,
  related_queries JSONB,
  
  -- Social signals
  twitter_mentions INTEGER DEFAULT 0,
  twitter_engagement INTEGER DEFAULT 0,
  reddit_mentions INTEGER DEFAULT 0,
  reddit_upvotes INTEGER DEFAULT 0,
  hn_mentions INTEGER DEFAULT 0,
  hn_points INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'PENDING',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  run_id UUID,
  notes TEXT
);

-- Create pipeline_runs table
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Run metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'RUNNING',
  
  -- Metrics
  external_sources_fetched INTEGER DEFAULT 0,
  variations_generated INTEGER DEFAULT 0,
  keywords_checked INTEGER DEFAULT 0,
  trending_keywords_found INTEGER DEFAULT 0,
  keywords_saved INTEGER DEFAULT 0,
  
  -- Performance
  runtime_seconds INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  error_stack TEXT,
  
  -- Results
  results JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kv_status ON keyword_variations(status);
CREATE INDEX IF NOT EXISTS idx_kv_trend_score ON keyword_variations(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_kv_created_at ON keyword_variations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kv_category ON keyword_variations(category);
CREATE INDEX IF NOT EXISTS idx_kv_run_id ON keyword_variations(run_id);
CREATE INDEX IF NOT EXISTS idx_kv_pending ON keyword_variations(status, trend_score DESC) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_pr_started_at ON pipeline_runs(started_at DESC);

-- Enable RLS
ALTER TABLE keyword_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - authenticated users)
CREATE POLICY "Allow read access to keyword_variations" ON keyword_variations FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON keyword_variations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON keyword_variations FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON keyword_variations FOR DELETE USING (true);

CREATE POLICY "Allow read access to pipeline_runs" ON pipeline_runs FOR SELECT USING (true);
CREATE POLICY "Allow insert for pipeline runs" ON pipeline_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for pipeline runs" ON pipeline_runs FOR UPDATE USING (true);
CREATE POLICY "Allow delete for pipeline runs" ON pipeline_runs FOR DELETE USING (true);

-- Create stats function
CREATE OR REPLACE FUNCTION get_keyword_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_keywords', COALESCE(COUNT(*), 0),
    'pending', COALESCE(COUNT(*) FILTER (WHERE status = 'PENDING'), 0),
    'analyzed', COALESCE(COUNT(*) FILTER (WHERE status = 'ANALYZED'), 0),
    'published', COALESCE(COUNT(*) FILTER (WHERE status = 'PUBLISHED'), 0),
    'avg_trend_score', COALESCE(ROUND(AVG(trend_score)), 0),
    'top_categories', COALESCE(
      (
        SELECT json_agg(json_build_object('category', category, 'count', count))
        FROM (
          SELECT category, COUNT(*) as count
          FROM keyword_variations
          WHERE category IS NOT NULL
          GROUP BY category
          ORDER BY count DESC
          LIMIT 6
        ) cat_stats
      ),
      '[]'::json
    )
  )
  INTO result
  FROM keyword_variations;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;