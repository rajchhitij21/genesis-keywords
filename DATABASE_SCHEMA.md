# Genesis Keywords - Database Schema Design

## 📊 Keywords Vault Table

**Table Name:** `genesis_keywords_vault`

### Purpose
Store top 10-20 curated keywords from each pipeline run with complete Agent 1 & Agent 2 V3 analysis data for easy retrieval in Make.com

### Schema Design

```sql
CREATE TABLE genesis_keywords_vault (
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
  
  -- Indexes for fast retrieval
  CONSTRAINT unique_keyword_per_pipeline UNIQUE(pipeline_id, keyword)
);

-- Indexes for Make.com queries
CREATE INDEX idx_keywords_vault_created_at ON genesis_keywords_vault(created_at DESC);
CREATE INDEX idx_keywords_vault_pipeline_id ON genesis_keywords_vault(pipeline_id);
CREATE INDEX idx_keywords_vault_priority ON genesis_keywords_vault(priority_tier);
CREATE INDEX idx_keywords_vault_content_status ON genesis_keywords_vault(content_status);
CREATE INDEX idx_keywords_vault_keyword ON genesis_keywords_vault(keyword);
CREATE INDEX idx_keywords_vault_volume ON genesis_keywords_vault(estimated_volume DESC);
CREATE INDEX idx_keywords_vault_score ON genesis_keywords_vault(overall_score DESC);
CREATE INDEX idx_keywords_vault_business ON genesis_keywords_vault(business_name);

-- Enable Row Level Security (optional)
ALTER TABLE genesis_keywords_vault ENABLE ROW LEVEL SECURITY;
```

## 🎯 Selection Criteria for Top Keywords

The pipeline will automatically select top 10-20 keywords based on:

1. **Priority Tier** (40% weight)
   - Urgent: 100 points
   - High: 75 points
   - Medium: 50 points
   - Low: 25 points

2. **Estimated Volume** (30% weight)
   - Normalized score based on volume range

3. **Trend Score** (15% weight)
   - Rising trends get bonus points

4. **Content Opportunity** (15% weight)
   - Based on content_gaps.opportunity_score

**Overall Score Formula:**
```
overall_score = (priority_weight * 0.4) + 
                (volume_weight * 0.3) + 
                (trend_score * 0.15) + 
                (content_opportunity * 0.15)
```

## 📥 Make.com Retrieval Examples

### 1. Get Pending Keywords (No Content Yet)
```sql
SELECT * FROM genesis_keywords_vault
WHERE content_status = 'pending'
ORDER BY overall_score DESC
LIMIT 10;
```

### 2. Get High-Priority Urgent Keywords
```sql
SELECT * FROM genesis_keywords_vault
WHERE priority_tier = 'urgent'
AND content_status = 'pending'
ORDER BY estimated_volume DESC;
```

### 3. Get Keywords by Business
```sql
SELECT * FROM genesis_keywords_vault
WHERE business_name ILIKE '%your_business%'
ORDER BY created_at DESC;
```

### 4. Get Trending Keywords
```sql
SELECT * FROM genesis_keywords_vault
WHERE trend_direction = 'rising'
AND content_status = 'pending'
ORDER BY trend_score DESC
LIMIT 20;
```

### 5. Get Single Keyword by ID
```sql
SELECT * FROM genesis_keywords_vault
WHERE id = 'keyword-uuid-here';
```

## 🔄 Pipeline Flow (Step 3)

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Agent 1 V2 - Keyword Discovery                  │
│ ├─ Generate 100-150 keywords                            │
│ └─ Categorize and analyze intent                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Agent 2 V3 - Advanced Analysis                  │
│ ├─ Validate all keywords                                │
│ ├─ Add volume, trends, competition                      │
│ ├─ Generate content suggestions                         │
│ └─ Calculate priority tiers                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Database Storage (NEW!)                         │
│ ├─ Rank keywords by overall_score                       │
│ ├─ Select top 10-20 keywords                            │
│ ├─ Insert into genesis_keywords_vault                   │
│ └─ Return confirmation with database IDs                │
└─────────────────────────────────────────────────────────┘
```

## 📊 Sample Data Structure

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pipeline_id": "gen_1234567890_abc123",
  "keyword": "ai project management software",
  "business_name": "AI-powered project management platform",
  "niche": "productivity software",
  "target_audience": "small business owners",
  
  "keyword_type": "seed",
  "source": "user_input",
  "category": "software",
  "commercial_intent": "high",
  
  "estimated_volume": 8500,
  "volume_range": "1K-10K",
  "competition_score": 42,
  "trend_direction": "rising",
  "trend_score": 78,
  "priority_tier": "urgent",
  
  "trend_signals": {
    "news_mentions": 15,
    "video_content": 8,
    "shopping_signals": 3,
    "commercial_intent_signals": 12
  },
  
  "content_gaps": {
    "opportunity_score": 85,
    "weak_competitors": ["competitor1.com", "competitor2.com"],
    "content_suggestions": [
      "Comprehensive guide comparing AI project management tools",
      "Case study: How AI improves project delivery times"
    ]
  },
  
  "serp_features": {
    "featured_snippets": true,
    "people_also_ask": [
      "What is AI project management?",
      "How does AI help in project management?"
    ],
    "related_searches": [
      "best ai project management software",
      "ai project management tools"
    ]
  },
  
  "content_status": "pending",
  "overall_score": 87.5,
  "rank_position": 1,
  
  "created_at": "2025-10-27T14:30:00Z"
}
```

## 🔌 Make.com Integration

### Supabase Module Settings
- **Module:** Search Rows
- **Connection:** Your Supabase connection
- **Table:** genesis_keywords_vault
- **Limit:** 1-20 (configurable)
- **Order by:** overall_score DESC or created_at DESC

### Common Filters
- content_status = 'pending'
- priority_tier = 'urgent' or 'high'
- trend_direction = 'rising'
- estimated_volume > 5000

### Next Steps in Make.com
1. Search for pending keywords
2. Select one keyword
3. Generate content using AI (ChatGPT/Claude)
4. Publish to WordPress/Medium/etc
5. Update row: content_status = 'published', content_url = [published_url]
