# 🚀 GENESIS KEYWORDS - TWO-AGENT PIPELINE IMPLEMENTATION PLAN

**Start Date:** 2025-10-27  
**Estimated Time:** 4-6 hours  
**Goal:** Build production-ready keyword pipeline with Agent 1 (Trend Hunter) + Agent 2 (SEO Validator)

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites & Environment Setup](#chunk-1-prerequisites--environment-setup)
2. [Supabase Configuration](#chunk-2-supabase-configuration)
3. [Shared Utilities - Part 1 (Nitter + Google Suggestions)](#chunk-3-shared-utilities---part-1)
4. [Shared Utilities - Part 2 (Serper Rotator + Helpers)](#chunk-4-shared-utilities---part-2)
5. [Agent 1: Trend Hunter](#chunk-5-agent-1-trend-hunter)
6. [Agent 2: SEO Validator - Core](#chunk-6-agent-2-seo-validator---core)
7. [Agent 2: SEO Validator - Analyzers](#chunk-7-agent-2-seo-validator---analyzers)
8. [Main Pipeline Orchestrator](#chunk-8-main-pipeline-orchestrator)
9. [Database Schema Updates](#chunk-9-database-schema-updates)
10. [Testing & Deployment](#chunk-10-testing--deployment)
11. [Frontend Integration](#chunk-11-frontend-integration)
12. [Production Readiness](#chunk-12-production-readiness)

---

## CHUNK 1: Prerequisites & Environment Setup
**Time:** 30 minutes  
**Status:** ⬜ Not Started

### 1.1 Verify Supabase CLI
```powershell
# Check if installed
supabase --version

# If not installed, install via PowerShell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 1.2 Logout Current Supabase Account
```powershell
supabase logout
```

### 1.3 Login to Correct Account
```powershell
supabase login
# Browser will open - login with correct credentials
```

### 1.4 Link to Genesis Keywords Project
```powershell
cd C:\Users\user\Documents\genesis-keywords
supabase link --project-ref kyeusjkivowioqxzwgpn
```

### 1.5 Initialize Supabase Functions Directory
```powershell
# Create functions directory if not exists
supabase functions new agent-1-trend-hunter --template=https://deno.land/std@0.168.0/http/server.ts
supabase functions new agent-2-seo-validator --template=https://deno.land/std@0.168.0/http/server.ts

# Create shared utilities directory
New-Item -ItemType Directory -Path "supabase\functions\_shared" -Force
```

### 1.6 Install Node Dependencies (for local testing)
```powershell
npm install rss-parser google-search-suggestions
```

### 1.7 Get API Keys Ready
- [ ] Gemini API Key (already have)
- [ ] Serper API Keys (need 5-7 accounts)
  - Account 1: _____________
  - Account 2: _____________
  - Account 3: _____________
  - Account 4: _____________
  - Account 5: _____________
  - Account 6: _____________
  - Account 7: _____________

**Deliverables:**
- ✅ Supabase CLI installed and logged in
- ✅ Project linked
- ✅ Functions directory structure created
- ✅ API keys documented

---

## CHUNK 2: Supabase Configuration
**Time:** 20 minutes  
**Status:** ⬜ Not Started

### 2.1 Set Environment Secrets
```powershell
# Set secrets via CLI (or use Supabase Dashboard)
supabase secrets set GEMINI_API_KEY="your_key_here"
supabase secrets set SERPER_KEY_1="your_key_1"
supabase secrets set SERPER_KEY_2="your_key_2"
supabase secrets set SERPER_KEY_3="your_key_3"
supabase secrets set SERPER_KEY_4="your_key_4"
supabase secrets set SERPER_KEY_5="your_key_5"
supabase secrets set SERPER_KEY_6="your_key_6"
supabase secrets set SERPER_KEY_7="your_key_7"
```

### 2.2 Create Import Map for Deno
**File:** `supabase/functions/import_map.json`
```json
{
  "imports": {
    "rss-parser": "npm:rss-parser@^3.13.0",
    "google-search-suggestions": "npm:google-search-suggestions@^1.0.3"
  }
}
```

### 2.3 Verify Database Tables Exist
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('keyword_variations', 'pipeline_runs');
```

**Deliverables:**
- ✅ All API keys set as secrets
- ✅ Import map configured
- ✅ Database tables verified

---

## CHUNK 3: Shared Utilities - Part 1
**Time:** 30 minutes  
**Status:** ⬜ Not Started

### 3.1 Create Nitter RSS Fetcher
**File:** `supabase/functions/_shared/nitter-fetcher.ts`

Features:
- Multi-instance fallback (nitter.poast.org, nitter.net, nitter.privacydev.net)
- RSS parsing with timeout
- Engagement score extraction
- Rate limiting

### 3.2 Create Google Suggestions Fetcher
**File:** `supabase/functions/_shared/google-suggestions.ts`

Features:
- Fetch autocomplete suggestions
- Batch processing for multiple keywords
- Deduplication
- Rate limiting

### 3.3 Create Google Trends RSS Fetcher
**File:** `supabase/functions/_shared/google-trends-fetcher.ts`

Features:
- Parse Google Trends RSS feed
- Extract trending topics
- Category filtering

**Deliverables:**
- ✅ `nitter-fetcher.ts` created and tested
- ✅ `google-suggestions.ts` created and tested
- ✅ `google-trends-fetcher.ts` created and tested

---

## CHUNK 4: Shared Utilities - Part 2
**Time:** 30 minutes  
**Status:** ⬜ Not Started

### 4.1 Create Serper Rotator
**File:** `supabase/functions/_shared/serper-rotator.ts`

Features:
- Multi-key rotation (7 keys)
- Rate limit detection (429 handling)
- Exponential backoff
- Key health tracking
- Parallel batch processing

### 4.2 Create Gemini Client
**File:** `supabase/functions/_shared/gemini-client.ts`

Features:
- Batch keyword generation
- JSON parsing with fallbacks
- Error handling
- Cost tracking

### 4.3 Create Utility Functions
**File:** `supabase/functions/_shared/utils.ts`

Features:
- Deduplication
- Keyword normalization
- Text extraction
- Date formatting
- Sleep/delay helpers

**Deliverables:**
- ✅ `serper-rotator.ts` created and tested
- ✅ `gemini-client.ts` created and tested
- ✅ `utils.ts` created

---

## CHUNK 5: Agent 1 (Trend Hunter)
**Time:** 45 minutes  
**Status:** ⬜ Not Started

### 5.1 Create Agent 1 Main File
**File:** `supabase/functions/agent-1-trend-hunter/index.ts`

### 5.2 Implement Data Sources
1. **Google Trends RSS** (20 trends)
2. **Nitter/Twitter** (20 tweets from 4 queries)
3. **Google Suggestions** (50 expanded keywords)
4. **Base Keywords** (62 evergreen keywords)

### 5.3 Implement Gemini Keyword Generation
- Process trends in batches of 3
- Generate 3 variations per input
- Parse JSON responses
- Handle errors gracefully

### 5.4 Implement Output Formatting
```typescript
interface Agent1Output {
  success: boolean;
  keywords: Array<{
    keyword: string;
    type: 'base' | 'variation';
    source: string;
    category?: string;
  }>;
  metadata: {
    google_trends_count: number;
    twitter_count: number;
    suggestions_count: number;
    base_count: number;
    total_keywords: number;
    gemini_calls: number;
    gemini_cost: number;
    runtime_ms: number;
  };
}
```

### 5.5 Add Logging
- Start/end timestamps
- Source fetch status
- Gemini batch progress
- Error details

**Deliverables:**
- ✅ Agent 1 fully implemented
- ✅ Returns 150-180 keywords
- ✅ Runtime < 15 seconds
- ✅ Proper error handling

---

## CHUNK 6: Agent 2 (SEO Validator) - Core
**Time:** 45 minutes  
**Status:** ⬜ Not Started

### 6.1 Create Agent 2 Main File
**File:** `supabase/functions/agent-2-seo-validator/index.ts`

### 6.2 Implement Batch Processor
- Process keywords in batches of 10
- Parallel processing within batches
- Rate limiting between batches
- Progress logging

### 6.3 Implement SERP Data Fetcher
- Call Serper API via rotator
- Extract organic results
- Extract ads
- Extract SERP features
- Extract related searches

### 6.4 Implement Multi-Factor Volume Estimator
**File:** `supabase/functions/agent-2-seo-validator/volume-estimator.ts`

Factors:
- Ads count (4+ ads = 25K+, 3 = 15K, 2 = 8K, 1 = 4K, 0 = 1.5K)
- Related searches count
- SERP features (answer box, knowledge graph)
- Keyword length
- Commercial indicators

### 6.5 Implement Competition Scorer
**File:** `supabase/functions/agent-2-seo-validator/competition-scorer.ts`

Factors:
- Number of ads
- High authority domains (Wikipedia, YouTube, Forbes, etc.)
- Domain authority of top 10
- Content freshness

**Deliverables:**
- ✅ Agent 2 core structure complete
- ✅ Batch processing working
- ✅ Volume estimation accurate
- ✅ Competition scoring functional

---

## CHUNK 7: Agent 2 (SEO Validator) - Analyzers
**Time:** 45 minutes  
**Status:** ⬜ Not Started

### 7.1 Implement Content Gap Analyzer
**File:** `supabase/functions/agent-2-seo-validator/content-gap-analyzer.ts`

Features:
- Extract topics from top 10 results
- Identify missing topics
- Extract "People Also Ask" questions
- Calculate opportunity score

### 7.2 Implement Keyword Clusterer
**File:** `supabase/functions/agent-2-seo-validator/keyword-clusterer.ts`

Features:
- Group semantically similar keywords
- Identify primary keywords
- Generate content strategy
- Calculate cluster size

### 7.3 Implement Priority Scorer
**File:** `supabase/functions/agent-2-seo-validator/priority-scorer.ts`

Scoring formula:
```
priority_score = (
  (volume / 1000) * 0.4 +
  (100 - competition) * 0.3 +
  trend_score * 0.2 +
  intent_score * 0.1
)
```

Tiers:
- Urgent: score > 70
- High: score 50-70
- Medium: score 30-50
- Low: score < 30

### 7.4 Implement Output Formatter
```typescript
interface Agent2Output {
  success: boolean;
  keywords: Array<{
    keyword: string;
    search_volume: number;
    competition_score: number;
    trend_score: number;
    commercial_intent: 'high' | 'medium' | 'low';
    content_gaps: {
      missing_topics: string[];
      missing_questions: string[];
      opportunity_score: number;
    };
    cluster_id?: string;
    is_primary_keyword: boolean;
    related_keywords: string[];
    content_strategy: string;
    priority_score: number;
    priority_tier: string;
    serp_features: object;
    top_10_domains: string[];
    validated_at: string;
    serper_cost: number;
  }>;
  clusters: KeywordCluster[];
  metadata: object;
  recommendations: object;
}
```

**Deliverables:**
- ✅ Content gap analysis working
- ✅ Keyword clustering functional
- ✅ Priority scoring accurate
- ✅ Output properly formatted

---

## CHUNK 8: Main Pipeline Orchestrator
**Time:** 30 minutes  
**Status:** ⬜ Not Started

### 8.1 Update Main Pipeline Function
**File:** `supabase/functions/keyword-pipeline/index.ts`

Features:
- Call Agent 1
- Pass Agent 1 output to Agent 2
- Save results to database
- Generate summary
- Error handling
- Cost tracking

### 8.2 Implement Database Save Logic
```typescript
async function saveToDatabase(agent2Result) {
  // Save to keyword_variations table
  // Save to pipeline_runs table
  // Return saved count
}
```

### 8.3 Add Comprehensive Logging
```
🚀 PIPELINE START
=============================================================

📡 AGENT 1: Trend Hunter
   ✅ Google Trends: 20 items
   ✅ Twitter: 20 items
   ✅ Google Suggestions: 50 items
   ✅ Gemini variations: 60 keywords
   ✅ Total: 150 keywords
   ⏱️ Runtime: 12,345ms

🔍 AGENT 2: SEO Validator
   📊 Processing 150 keywords in 15 batches...
   ✅ Batch 1/15 complete (10 keywords)
   ...
   ✅ Validation complete
   📈 Passed: 52 keywords (score > 40)
   💰 Serper cost: $1.50
   ⏱️ Runtime: 42,567ms

💾 Saving to Database...
   ✅ Saved 52 keywords

=============================================================
✅ PIPELINE COMPLETE

Total Runtime: 54,912ms
Total Cost: $1.52
Keywords Saved: 52

Top 5 Urgent Keywords:
   1. ai automation tools 2025
   2. make money with ai agents
   3. best ai voice agents
   4. ai business ideas 2025
   5. chatgpt automation workflow
```

**Deliverables:**
- ✅ Pipeline orchestrator complete
- ✅ Database save working
- ✅ Logging comprehensive
- ✅ Error handling robust

---

## CHUNK 9: Database Schema Updates
**Time:** 20 minutes  
**Status:** ⬜ Not Started

### 9.1 Update keyword_variations Table
```sql
-- Add new columns for Agent 2 data
ALTER TABLE keyword_variations
ADD COLUMN IF NOT EXISTS search_volume INTEGER,
ADD COLUMN IF NOT EXISTS competition_score INTEGER,
ADD COLUMN IF NOT EXISTS content_gaps JSONB,
ADD COLUMN IF NOT EXISTS cluster_id UUID,
ADD COLUMN IF NOT EXISTS is_primary_keyword BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS related_keywords TEXT[],
ADD COLUMN IF NOT EXISTS content_strategy TEXT,
ADD COLUMN IF NOT EXISTS priority_score INTEGER,
ADD COLUMN IF NOT EXISTS priority_tier TEXT,
ADD COLUMN IF NOT EXISTS serp_features JSONB,
ADD COLUMN IF NOT EXISTS top_10_domains TEXT[],
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS serper_cost NUMERIC(10,4);
```

### 9.2 Create keyword_clusters Table
```sql
CREATE TABLE IF NOT EXISTS keyword_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_name TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  avg_volume INTEGER,
  avg_competition INTEGER,
  content_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9.3 Update pipeline_runs Table
```sql
ALTER TABLE pipeline_runs
ADD COLUMN IF NOT EXISTS agent1_runtime_ms INTEGER,
ADD COLUMN IF NOT EXISTS agent2_runtime_ms INTEGER,
ADD COLUMN IF NOT EXISTS keywords_analyzed INTEGER,
ADD COLUMN IF NOT EXISTS keywords_passed INTEGER,
ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS recommendations JSONB;
```

**Deliverables:**
- ✅ Database schema updated
- ✅ New columns added
- ✅ New tables created

---

## CHUNK 10: Testing & Deployment
**Time:** 45 minutes  
**Status:** ⬜ Not Started

### 10.1 Local Testing
```powershell
# Test Agent 1 locally
supabase functions serve agent-1-trend-hunter

# In another terminal, test it
curl http://localhost:54321/functions/v1/agent-1-trend-hunter

# Test Agent 2 locally (with sample data)
supabase functions serve agent-2-seo-validator
```

### 10.2 Deploy Functions
```powershell
# Deploy Agent 1
supabase functions deploy agent-1-trend-hunter

# Deploy Agent 2
supabase functions deploy agent-2-seo-validator

# Deploy Main Pipeline
supabase functions deploy keyword-pipeline
```

### 10.3 Test Production Endpoints
```powershell
# Get your project URL
$PROJECT_URL = "https://kyeusjkivowioqxzwgpn.supabase.co"

# Test Agent 1
curl -X POST "$PROJECT_URL/functions/v1/agent-1-trend-hunter"

# Test full pipeline
curl -X POST "$PROJECT_URL/functions/v1/keyword-pipeline"
```

### 10.4 Monitor Logs
```powershell
# Watch logs in real-time
supabase functions logs keyword-pipeline --tail
```

### 10.5 Validate Results
```sql
-- Check saved keywords
SELECT COUNT(*) FROM keyword_variations WHERE validated_at > NOW() - INTERVAL '1 hour';

-- Check priority distribution
SELECT priority_tier, COUNT(*) FROM keyword_variations GROUP BY priority_tier;

-- Check latest pipeline run
SELECT * FROM pipeline_runs ORDER BY created_at DESC LIMIT 1;
```

**Deliverables:**
- ✅ All functions deployed
- ✅ Production tests passing
- ✅ Data saving correctly
- ✅ Logs showing proper flow

---

## CHUNK 11: Frontend Integration
**Time:** 30 minutes  
**Status:** ⬜ Not Started

### 11.1 Update Dashboard Page
**File:** `src/pages/Dashboard.tsx`

Add:
- "Run Pipeline" button
- Real-time progress indicator
- Success/error notifications
- Results display

### 11.2 Create Pipeline Trigger Component
**File:** `src/components/PipelineRunner.tsx`

Features:
- Call keyword-pipeline function
- Show loading state
- Display results summary
- Handle errors

### 11.3 Update Keywords Table
Show new columns:
- Search volume
- Competition score
- Priority tier (badge)
- Content strategy
- Related keywords (tooltip)

### 11.4 Add Recommendations Panel
Show:
- Urgent keywords (red badge)
- Quick wins (green badge)
- Content pillar opportunities
- Keywords to avoid

**Deliverables:**
- ✅ Pipeline trigger UI complete
- ✅ Dashboard showing new data
- ✅ Recommendations displayed

---

## CHUNK 12: Production Readiness
**Time:** 30 minutes  
**Status:** ⬜ Not Started

### 12.1 Add Cron Job (Optional)
**File:** `supabase/functions/keyword-pipeline/cron.ts`

Schedule: Every 12 hours

### 12.2 Add Monitoring
- Set up alerts for failed runs
- Track daily keyword count
- Monitor API costs

### 12.3 Documentation
- Update WARP.md with new commands
- Document API endpoints
- Add troubleshooting guide

### 12.4 Cost Optimization
- Review Serper usage
- Optimize batch sizes
- Consider caching strategies

### 12.5 Performance Tuning
- Measure average runtime
- Optimize parallel processing
- Reduce unnecessary API calls

**Deliverables:**
- ✅ Cron job configured
- ✅ Monitoring in place
- ✅ Documentation updated
- ✅ Performance optimized

---

## 📊 SUCCESS METRICS

### After First Run:
- [ ] Agent 1 generates 150-180 keywords
- [ ] Agent 2 validates all keywords
- [ ] 40-60 keywords pass filters (score > 40)
- [ ] Keywords saved to database
- [ ] Total runtime < 60 seconds
- [ ] Total cost < $2.00

### After 1 Week (14 runs):
- [ ] 560-840 keywords validated
- [ ] 150-250 keywords saved
- [ ] 20-40 clusters created
- [ ] Total cost < $28

### After 1 Month (60 runs):
- [ ] 2,400-3,600 keywords validated
- [ ] 600-1,080 keywords saved
- [ ] 80-150 clusters created
- [ ] Total cost < $120

---

## 🔧 TROUBLESHOOTING GUIDE

### Agent 1 Issues:

**Problem:** Gemini returns invalid JSON
```typescript
// Fix: Add JSON extraction from markdown
const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
if (jsonMatch) return JSON.parse(jsonMatch[1]);
```

**Problem:** Nitter instances down
```typescript
// Fix: Add more fallback instances
const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.cz',
  'https://nitter.nl'
];
```

### Agent 2 Issues:

**Problem:** Serper rate limit
```typescript
// Fix: Already handled by rotator
// Add more API keys if needed
```

**Problem:** All volumes same
```typescript
// Fix: Check estimateVolume() logic
console.log('Volume factors:', { adsCount, relatedCount, baseVolume });
```

### Database Issues:

**Problem:** Keywords not saving
```sql
-- Check table exists
\dt keyword_variations

-- Check permissions
GRANT ALL ON keyword_variations TO authenticated;
```

---

## 📝 NOTES

- **Windows PowerShell:** Use `$env:VAR` for environment variables
- **Deno Runtime:** All Supabase functions use Deno (not Node.js)
- **Import Maps:** Required for npm packages in Deno
- **Secrets:** Set via CLI or Supabase Dashboard
- **Testing:** Use `supabase functions serve` for local testing
- **Logs:** Use `supabase functions logs <name> --tail` to debug

---

## ✅ COMPLETION CHECKLIST

- [ ] Chunk 1: Prerequisites & Environment Setup
- [ ] Chunk 2: Supabase Configuration
- [ ] Chunk 3: Shared Utilities - Part 1
- [ ] Chunk 4: Shared Utilities - Part 2
- [ ] Chunk 5: Agent 1 (Trend Hunter)
- [ ] Chunk 6: Agent 2 (SEO Validator) - Core
- [ ] Chunk 7: Agent 2 (SEO Validator) - Analyzers
- [ ] Chunk 8: Main Pipeline Orchestrator
- [ ] Chunk 9: Database Schema Updates
- [ ] Chunk 10: Testing & Deployment
- [ ] Chunk 11: Frontend Integration
- [ ] Chunk 12: Production Readiness

**Total Estimated Time:** 6 hours  
**Target Completion:** Same day

---

**LET'S BUILD THIS! 🚀**
