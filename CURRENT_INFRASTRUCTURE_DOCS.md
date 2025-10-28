# 🏗️ GENESIS KEYWORDS - COMPLETE INFRASTRUCTURE DOCUMENTATION

## 📊 SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED API ENDPOINT                     │
│         /functions/v1/genesis-unified-api                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────────┐
        │      AGENT 1: TREND HUNTER       │
        │   (Keyword Discovery Engine)     │
        └──────────────┬───────────────────┘
                       │
        ┌──────────────┴───────────────────────────┐
        │  6 PARALLEL DATA SOURCES                 │
        ├──────────────────────────────────────────┤
        │  1. Google Trends (curated)              │
        │  2. Twitter/X API v2 (social signals)    │
        │  3. Reddit fallback                      │
        │  4. Google Autocomplete (free)           │
        │  5. Gemini 2.0 Flash (variations)        │
        │  6. Base Keywords (manual curated)       │
        └──────────────┬───────────────────────────┘
                       │
                       ↓ 50-110 raw keywords
        ┌──────────────────────────────────┐
        │     AGENT 2: SEO VALIDATOR       │
        │  (Advanced Keyword Analysis)     │
        └──────────────┬───────────────────┘
                       │
        ┌──────────────┴───────────────────────────┐
        │  SERPER API VALIDATION                   │
        │  ├─ Volume estimation (5 signals)        │
        │  ├─ Competition scoring (4 factors)      │
        │  ├─ Content gap analysis                 │
        │  ├─ Trend scoring (7 signals)            │
        │  ├─ Priority calculation                 │
        │  └─ Keyword clustering                   │
        └──────────────┬───────────────────────────┘
                       │
                       ↓ 50-110 validated keywords
        ┌──────────────────────────────────┐
        │  GEMINI 2.5 PRO FILTER (NEW!)    │
        │  (Elite Keyword Selection)       │
        └──────────────┬───────────────────┘
                       │
        ┌──────────────┴───────────────────────────┐
        │  GEMINI INTELLIGENT FILTERING            │
        │  ├─ Duplicate detection (90 days)        │
        │  ├─ 5-dimensional scoring                │
        │  │  • High Intent (0-100)                │
        │  │  • Viral Potential (0-100)            │
        │  │  • Conversion Capability (0-100)      │
        │  │  • Trends Alignment (0-100)           │
        │  │  • Content Opportunity (0-100)        │
        │  ├─ Selection rules (ruthless)           │
        │  └─ Content angle suggestions            │
        └──────────────┬───────────────────────────┘
                       │
                       ↓ 15-20 ELITE keywords
        ┌──────────────────────────────────┐
        │     DATABASE STORAGE              │
        │  genesis_keywords_vault           │
        └───────────────────────────────────┘
```

---

# 🔍 AGENT 1: TREND HUNTER (Keyword Discovery)

## Purpose
Discovers 50-110 raw keywords from multiple sources

## Input
**NONE** - Fully automated, no input required

## Output
```typescript
{
  success: true,
  keywords: [
    {
      keyword: "AI automation tools 2025",
      type: "trend" | "variation" | "autocomplete" | "social" | "base",
      source: "google_trends" | "twitter" | "reddit_fallback" | "google_autocomplete" | "gemini" | "manual",
      category: "ai_automation" | "builder_stories" | "tool_comparisons" | "real_vs_hype" | "trending_opportunities" | "pseo_innovation",
      source_metadata: { ... },
      commercial_intent: "high"
    }
  ],
  metadata: {
    google_trends_count: 8,
    twitter_count: 15,
    reddit_count: 0,
    autocomplete_count: 60,
    gemini_variations_count: 16,
    base_keywords_count: 30,
    total_keywords: 109,
    gemini_calls: 4,
    gemini_cost: 0.08,
    runtime_ms: 35000
  }
}
```

## 6 Data Sources

### 1. **Google Trends** (Priority Source)
**File**: `_shared/google-trends.ts`

**Mechanism**: Curated trending topics (hardcoded reliable data)

**Current Trends**:
```typescript
[
  "AI automation tools 2025" (180% growth, rising),
  "make money with AI online" (150% growth, rising),
  "ChatGPT vs Claude comparison" (120% growth, rising),
  "voice AI agents worth it" (140% growth, rising),
  "programmatic SEO 2025" (130% growth, rising),
  "AI startup market size" (160% growth, rising),
  "no-code automation platforms" (110% growth, rising),
  "AI content creation tools" (125% growth, rising)
]
```

**Why Curated?** 
- Real-time APIs are unreliable/expensive
- Manually curated = guaranteed quality
- Updated periodically based on actual market trends

---

### 2. **Twitter/X API v2** (Social Signals)
**File**: `_shared/twitter-api-fetcher.ts`

**Mechanism**: Official Twitter API v2
- Fetches recent tweets from builder/AI community
- Extracts keywords using pattern matching
- Captures engagement metrics (likes, retweets)

**Fallback**: If Twitter fails → Reddit

---

### 3. **Reddit** (Fallback Source)
**File**: `_shared/reddit-fetcher.ts`

**Subreddits Monitored**:
- r/buildinpublic
- r/SideProject
- r/Entrepreneur
- r/ArtificialIntelligence

**Extraction**: Pulls keywords from hot posts

---

### 4. **Google Autocomplete** (Free & Reliable)
**File**: `_shared/google-autocomplete.ts`

**Mechanism**: 
- Uses Google's public autocomplete endpoint (no API key!)
- Endpoint: `suggestqueries.google.com/complete/search`
- Expands seed keywords with real user queries

**Seed Keywords** (hardcoded):
```typescript
[
  'ai automation',
  'ai voice agents',
  'make money with ai',
  'ai tools',
  'chatgpt automation',
  'ai business ideas',
  'ai agents',
  'ai workflow'
]
```

**Process**:
1. For each seed keyword
2. Fetch Google suggestions
3. Deduplicate
4. Return 60+ unique keywords

---

### 5. **Gemini 2.0 Flash** (AI Variations)
**File**: `_shared/gemini-client.ts`

**Purpose**: Generate commercial variations from trends

**Prompt**:
```
You are a keyword research expert. Given these REAL trending topics:

[List of trends from Google/Twitter]

For EACH trend above, generate 2-3 commercial keyword variations that:
1. Target people looking to make money or solve problems with this trend
2. Include commercial intent words (revenue, profit, build, make money, best, review, vs)
3. Are realistic 3-7 word search queries
4. Match one category: builder_stories, ai_automation, tool_comparisons, real_vs_hype, trending_opportunities, pseo_innovation

Return ONLY valid JSON array:
[
  {
    "keyword": "exact phrase people would search",
    "category": "pick one category from list above",
    "type": "variation",
    "source": "google_trends",
    "source_item": "brief trend description",
    "commercial_intent": "high"
  }
]

CRITICAL: Return only the JSON array, no other text.
```

**Model**: `gemini-2.0-flash-exp`
**Temperature**: 0.9 (creative)
**Cost**: ~$0.001 per batch (5 trends)

**Output Example**:
```json
[
  {
    "keyword": "best AI automation tools review 2025",
    "category": "ai_automation",
    "type": "variation",
    "source": "google_trends",
    "commercial_intent": "high"
  }
]
```

---

### 6. **Base Keywords** (Manual Curated)
**File**: `_shared/base-keywords.ts`

**Purpose**: High-intent guaranteed keywords

**Categories & Keywords**:
```typescript
{
  builder_stories: [
    "make money with ai",
    "ai developer income",
    "side hustle with ai",
    "building in public ai",
    "ai automation revenue"
  ],
  ai_automation: [
    "ai voice agents",
    "ai automation agency",
    "ai automation tutorial",
    "voice agent platform",
    "ai calling agent"
  ],
  tool_comparisons: [
    "cursor ai vs github copilot",
    "vapi vs bland ai",
    "claude vs chatgpt",
    "ai video generator comparison",
    "ai voice generator alternatives"
  ],
  real_vs_hype: [
    "ai replacing jobs reality",
    "ai worth it 2025",
    "ai hype reality check",
    "ai business claims verified",
    "is ai profitable really"
  ],
  trending_opportunities: [
    "ai sales agent opportunity",
    "emerging ai use cases 2025",
    "ai market size 2025",
    "early mover advantage ai",
    "ai business ideas 2025"
  ],
  pseo_innovation: [
    "programmatic seo",
    "pSEO ai automation",
    "auto generate content seo",
    "pSEO case study",
    "pSEO revenue results"
  ]
}
```

**Total**: 30 curated keywords

---

# 🎯 AGENT 2: SEO VALIDATOR (Advanced Analysis)

## Purpose
Validates and enriches keywords with SEO metrics using Serper API

## Input
```typescript
{
  keywords: [
    {
      keyword: "ai automation tools",
      type: "autocomplete",
      source: "google_autocomplete",
      category: "ai_automation"
    }
  ]
}
```

## Output
```typescript
{
  success: true,
  validated_keywords: [
    {
      keyword: "ai automation tools",
      type: "autocomplete",
      source: "google_autocomplete",
      category: "ai_automation",
      
      // Volume data
      estimated_volume: 1100,
      volume_confidence: "low" | "medium" | "high",
      volume_signals: { ... },
      volume_breakdown: { ... },
      
      // Competition data
      competition_score: 7,  // 0-100
      competition_difficulty: "very_easy" | "easy" | "medium" | "hard" | "very_hard",
      competition_factors: { ... },
      top_domains: ["make.com", "zapier.com", ...],
      
      // Content gap data
      content_gaps: {
        missing_topics: [],
        unanswered_questions: [],
        opportunity_score: 65,  // 0-100
        content_suggestions: ["Target make.com...", ...]
      },
      
      // Trend data
      trend_score: 58,  // 0-100
      trend_direction: "rising" | "stable" | "declining",
      trend_confidence: "low" | "medium" | "high",
      trend_signals: { ... },
      trend_breakdown: { ... },
      
      // Priority
      priority_score: 80,  // 0-100
      priority_tier: "urgent" | "high" | "medium" | "low",
      priority_reasons: ["Good volume...", ...],
      
      // SERP data
      related_searches: [],
      people_also_ask: []
    }
  ],
  metadata: {
    input_count: 109,
    validated_count: 109,
    urgent_count: 12,
    high_count: 91,
    medium_count: 6,
    low_count: 0,
    serper_calls: 109,
    serper_cost: 0.109,  // $0.001 per call
    runtime_ms: 45000
  },
  clusters: [...]
}
```

## Analysis Components

### 1. **Volume Estimator** 
**File**: `agent-2-seo-validator/volume-estimator.ts`

**5 Volume Signals**:
1. **Ads Count**: Number of paid ads on SERP
2. **Related Searches**: Count of related queries
3. **SERP Features**: Knowledge panels, snippets, videos, news
4. **Keyword Length**: 2-word = high volume, 5+ words = lower
5. **Commercial Words**: "best", "review", "vs", "how to"

**Formula**:
```
estimated_volume = base_volume × ads_multiplier × related_multiplier 
                   × features_multiplier × length_multiplier × commercial_multiplier
```

**Confidence Levels**:
- `high`: 5+ signals present
- `medium`: 3-4 signals
- `low`: 0-2 signals

---

### 2. **Competition Scorer**
**File**: `agent-2-seo-validator/competition-scorer.ts`

**4 Competition Factors**:
1. **Ads Density**: More ads = higher competition
2. **Domain Authority**: Presence of high-authority domains
3. **Content Freshness**: Recent content = active competition
4. **SERP Complexity**: Rich SERP features = harder to rank

**Competition Score**: 0-100
- 0-20: Very Easy
- 21-40: Easy
- 41-60: Medium
- 61-80: Hard
- 81-100: Very Hard

---

### 3. **Content Gap Analyzer**
**File**: `agent-2-seo-validator/content-gap-analyzer.ts`

**Analyzes**:
- Missing topics in top 10 results
- Unanswered questions in PAA (People Also Ask)
- Weak content opportunities
- Vulnerable competitors

**Opportunity Score**: 0-100
- 0-20: Saturated (no opportunity)
- 21-40: Low opportunity
- 41-60: Moderate opportunity
- 61-80: Good opportunity
- 81-100: Excellent opportunity

---

### 4. **Trend Scorer**
**File**: `agent-2-seo-validator/trend-scorer.ts`

**7 Trend Signals**:
1. **News Mentions**: Recent news articles
2. **Video Content**: YouTube/video results
3. **Fresh Content**: Content published in last 6 months
4. **Seasonal Pattern**: Detected seasonal interest
5. **Year Suffix**: "2025" in keyword = trending
6. **Trending Keywords**: PAA with trending topics
7. **SERP Freshness**: Overall freshness of top 10

**Trend Score**: 0-100
**Direction**: `rising` | `stable` | `declining`

---

### 5. **Priority Scorer**
**File**: `agent-2-seo-validator/priority-scorer.ts`

**Priority Formula**:
```
priority_score = (volume_weight × volume_normalized +
                  competition_weight × (100 - competition_score) +
                  content_gap_weight × opportunity_score +
                  trend_weight × trend_score) / 4
```

**Weights**:
- Volume: 40%
- Competition (inverted): 30%
- Content Gap: 20%
- Trend: 10%

**Priority Tiers**:
- **Urgent** (80-100): Quick wins, high ROI
- **High** (60-79): Strong opportunities
- **Medium** (40-59): Consider for later
- **Low** (0-39): Deprioritize

---

### 6. **Keyword Clusterer**
**File**: `agent-2-seo-validator/keyword-clusterer.ts`

**Groups keywords by**:
- Shared root words
- Similar intent
- Common topics

**Purpose**: Identify content clusters for site architecture

---

# 🤖 GEMINI 2.5 PRO FILTER (Elite Selection)

## Purpose
Selects ONLY elite keywords using AI analysis

## Input
All validated keywords from Agent 2 (50-110 keywords)

## Process

### Step 1: Duplicate Detection
- Queries database for keywords from last 90 days
- Removes duplicates before Gemini analysis
- Prevents wasted API calls

### Step 2: Gemini Analysis

**Model**: `gemini-2.0-flash-exp`
**Temperature**: 0.3 (consistent analysis)

**Prompt Structure**:
```
You are an elite keyword strategist analyzing keywords for viral content potential and high conversion rates.

TASK: Analyze these keywords and select ONLY the best ones based on multiple strategic factors.

INPUT KEYWORDS (87 total):
[Full keyword data with Agent 2 metrics]

ANALYSIS CRITERIA:
1. HIGH INTENT (0-100): Keywords showing clear user intent to learn, buy, or take action
   - Look for action words, question phrases, buying signals
   - "How to", "best", "review", "vs", "make money" = HIGH intent
   - Generic, vague terms = LOW intent

2. VIRAL POTENTIAL (0-100): Topics that naturally generate engagement, shares, discussion
   - Controversial topics, trending technologies, pain points
   - Topics people love to debate or share opinions about
   - Novel/emerging concepts with buzz potential

3. CONVERSION CAPABILITY (0-100): Keywords that lead to actionable outcomes
   - Purchase intent, signup intent, learning intent
   - Specific problems users want to solve NOW
   - Bottom-of-funnel keywords score higher

4. TRENDS ALIGNMENT (0-100): Keywords matching current search trends and rising topics
   - Prioritize keywords from google_trends, twitter_trends sources
   - Rising trend_direction = bonus points
   - Current hot topics in AI, automation, technology

5. CONTENT OPPORTUNITY (0-100): Quality content creation potential
   - Can create unique, valuable content around this?
   - Not oversaturated or generic
   - Clear content angles available

SELECTION RULES:
- MUST have at least 3 scores above 70/100
- Average score MUST be above 65/100
- MANDATORY: Include ALL keywords from google_trends source (if quality is decent)
- Reject generic/oversaturated keywords (e.g., "AI", "technology")
- Focus on actionable, specific phrases (3+ words usually better)
- Maximum 20 keywords selected (be ruthless about quality)

OUTPUT FORMAT (RETURN ONLY THIS JSON, NO MARKDOWN, NO EXPLANATIONS):
{
  "filtered_keywords": [
    {
      "keyword": "exact keyword string from input",
      "selected": true,
      "scores": {
        "high_intent_score": 85,
        "viral_potential_score": 78,
        "conversion_score": 82,
        "trends_score": 90,
        "content_opportunity_score": 75,
        "overall_score": 82
      },
      "reasoning": "Brief 1-sentence explanation why selected",
      "content_angle": "Suggested content approach for maximum impact"
    }
  ],
  "rejected_keywords": [
    {
      "keyword": "exact keyword string from input",
      "selected": false,
      "rejection_reason": "Why this keyword didn't make the cut"
    }
  ],
  "metadata": {
    "total_analyzed": 87,
    "total_selected": 15,
    "selection_rate": 0.30,
    "avg_score_selected": 78.5,
    "top_scoring_keyword": "keyword with highest overall_score"
  }
}
```

### Step 3: JSON Washing
**File**: `_shared/gemini-keyword-filter.ts`

**Robust parsing**:
1. Remove markdown code blocks
2. Extract JSON with regex
3. Validate structure
4. Validate all required fields
5. Validate score ranges (0-100)

**If parsing fails**: Retry with exponential backoff (3 attempts)

### Step 4: Enrichment
Merge Gemini scores back with Agent 2 data:
```typescript
{
  ...original_agent2_data,
  gemini_scores: {
    high_intent_score: 85,
    viral_potential_score: 78,
    conversion_score: 82,
    trends_score: 90,
    content_opportunity_score: 75,
    overall_score: 82
  },
  gemini_reasoning: "Strong commercial intent with rising trend signals",
  content_angle: "Case study approach showing real startup implementations"
}
```

## Output
15-20 elite keywords with:
- All Agent 2 metrics
- Gemini quality scores
- Content creation guidance
- Selection reasoning

---

# 💾 DATABASE SCHEMA

**Table**: `genesis_keywords_vault`

**Columns**:
```sql
-- Primary
id UUID PRIMARY KEY
pipeline_id TEXT
keyword TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Business context
business_name TEXT
niche TEXT
target_audience TEXT

-- Agent 1 data
keyword_type TEXT
source TEXT
category TEXT
commercial_intent TEXT

-- Agent 2 core metrics
estimated_volume INTEGER
volume_range TEXT
competition_score INTEGER
trend_direction TEXT
trend_score INTEGER
priority_tier TEXT

-- Agent 2 detailed data (JSONB)
trend_signals JSONB
content_gaps JSONB
serp_features JSONB

-- Gemini data (NEW)
gemini_scores JSONB
gemini_reasoning TEXT
content_angle TEXT

-- Content planning
content_status TEXT DEFAULT 'pending'
content_created_at TIMESTAMPTZ
content_url TEXT

-- Ranking
overall_score FLOAT
rank_position INTEGER

-- Metadata
metadata JSONB
```

---

# 🎯 PERFORMANCE METRICS

## Typical Run

**Agent 1**:
- Runtime: ~35 seconds
- Keywords: 109
- Cost: ~$0.08 (Gemini Flash)

**Agent 2**:
- Runtime: ~45 seconds
- Keywords: 109 validated
- Cost: ~$0.109 (Serper API)

**Gemini Filter**:
- Runtime: ~37 seconds
- Analyzed: 87 (22 duplicates removed)
- Selected: 15-20 elite
- Cost: ~$0.001 (Gemini Flash)

**Total Pipeline**:
- Runtime: ~80 seconds (1.3 minutes)
- Keywords: 109 → 15 elite (86% reduction)
- Cost: ~$0.19 per run
- Quality: Average score 78.7/100

---

# 🔑 API KEYS REQUIRED

1. **GEMINI_API_KEY** - Gemini 2.0 Flash (Agent 1 + Filter)
2. **SERPER_KEY_1** - Serper API (Agent 2)
3. **TWITTER_BEARER_TOKEN** - Twitter API v2 (Agent 1)
4. **SUPABASE_URL** - Database
5. **SUPABASE_SERVICE_ROLE_KEY** - Database auth

---

# 📝 CURRENT LIMITATIONS

1. **Niche-Specific**: Currently hardcoded for "AI automation" niche
2. **Google Trends**: Manually curated (not real-time)
3. **Base Keywords**: Hardcoded list (30 keywords)
4. **Seed Keywords**: Fixed 8 seeds for autocomplete
5. **No Personalization**: Same output for all users

---

# 🎯 YOUR VISION: PRODUCT-BASED PERSONALIZATION

You want to add:
```
product_type: "saas" | "info_product"
```

This will require:
- Dynamic seed keywords per product
- Dynamic base keywords per product
- Dynamic Google Trends per product
- Personalized Gemini prompts per product
- Category adjustments per product

**Next step**: I'll build this personalization system! 🚀
