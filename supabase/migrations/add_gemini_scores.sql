-- Add Gemini Filter Scores to genesis_keywords_vault
-- Stores AI analysis scores and content recommendations

-- Add JSONB column for Gemini scores
ALTER TABLE genesis_keywords_vault 
ADD COLUMN IF NOT EXISTS gemini_scores JSONB;

-- Add text columns for Gemini insights
ALTER TABLE genesis_keywords_vault 
ADD COLUMN IF NOT EXISTS gemini_reasoning TEXT;

ALTER TABLE genesis_keywords_vault 
ADD COLUMN IF NOT EXISTS content_angle TEXT;

-- Create index for querying by Gemini scores
CREATE INDEX IF NOT EXISTS idx_keywords_vault_gemini_scores 
ON genesis_keywords_vault USING GIN(gemini_scores);

-- Add comment explaining the columns
COMMENT ON COLUMN genesis_keywords_vault.gemini_scores IS 
'Gemini 2.5 Pro analysis scores: high_intent_score, viral_potential_score, conversion_score, trends_score, content_opportunity_score, overall_score (0-100)';

COMMENT ON COLUMN genesis_keywords_vault.gemini_reasoning IS 
'Brief explanation from Gemini why this keyword was selected';

COMMENT ON COLUMN genesis_keywords_vault.content_angle IS 
'Suggested content approach for maximum impact from Gemini analysis';

-- Example Gemini scores structure:
-- {
--   "high_intent_score": 85,
--   "viral_potential_score": 78,
--   "conversion_score": 82,
--   "trends_score": 90,
--   "content_opportunity_score": 75,
--   "overall_score": 82
-- }
