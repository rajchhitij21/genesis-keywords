# 📋 IMPLEMENTATION PLAN: CHUNKS 3 & 4

## Overview
Build Google Autocomplete Fetcher + Agent 1 (Trend Hunter)

---

## CHUNK 3: Google Autocomplete Fetcher ⏱️ 20 min

### Goal
Fetch Google autocomplete suggestions for seed keywords (no API key needed!)

### File to Create
`supabase/functions/_shared/google-autocomplete.ts`

### Implementation Strategy

**Method:** Direct HTTP request to Google's autocomplete endpoint
- Endpoint: `http://suggestqueries.google.com/complete/search`
- Parameters: `client=firefox&q={keyword}`
- Response: JSON array with suggestions

**Features:**
1. Fetch suggestions for a single keyword
2. Batch processing for multiple keywords
3. Deduplication
4. Rate limiting (500ms between requests)
5. Error handling with retries

**Code Structure:**
```typescript
interface AutocompleteSuggestion {
  keyword: string;
  source: 'google_autocomplete';
}

async function fetchAutocomplete(keyword: string): Promise<string[]>
async function expandKeywords(seeds: string[]): Promise<AutocompleteSuggestion[]>
```

### Expected Output
For seed keywords like `["ai automation", "chatgpt"]`:
- Should return 30-50 autocomplete suggestions
- Each suggestion is a real user query

---

## CHUNK 4: Agent 1 (Trend Hunter) ⏱️ 30 min

### Goal
Consolidate all trend sources into one agent that generates 150-180 keywords

### File to Create
`supabase/functions/agent-1-trend-hunter/index.ts`

### Data Sources (in order)

1. **Google Trends RSS** (existing)
   - Use: `fetchGoogleTrends()` from `_shared/google-trends.ts`
   - Expected: 20 trends

2. **Nitter/Twitter** (new - Chunk 2)
   - Use: `fetchNitterTrends()` from `_shared/nitter-fetcher.ts`
   - Queries: Default trending queries
   - Expected: 20 tweets

3. **Google Autocomplete** (new - Chunk 3)
   - Use: `expandKeywords()` from `_shared/google-autocomplete.ts`
   - Seeds: Base keywords
   - Expected: 40-50 suggestions

4. **Gemini Keyword Generation** (existing)
   - Use: `generateKeywordVariations()` from `_shared/gemini-client.ts`
   - Input: Trends + Tweets (batch of 3)
   - Expected: 60 variations

5. **Base Keywords** (existing)
   - Use: `getAllBaseKeywords()` from `_shared/base-keywords.ts`
   - Expected: 62 keywords

### Flow

```
START
  ↓
1. Fetch Google Trends (20)
  ↓
2. Fetch Nitter Tweets (20)
  ↓
3. Extract keywords from tweets (20)
  ↓
4. Fetch Google Autocomplete (40-50)
  ↓
5. Generate Gemini variations from trends + tweets (60)
  ↓
6. Add base keywords (62)
  ↓
COMBINE & DEDUPLICATE
  ↓
OUTPUT: 150-180 keywords with metadata
```

### Output Schema

```typescript
interface Agent1Output {
  success: boolean;
  keywords: Array<{
    keyword: string;
    type: 'base' | 'variation' | 'autocomplete' | 'trend' | 'social';
    source: string;
    category?: string;
    source_metadata?: any;
  }>;
  metadata: {
    google_trends_count: number;
    twitter_count: number;
    autocomplete_count: number;
    gemini_variations_count: number;
    base_keywords_count: number;
    total_keywords: number;
    gemini_calls: number;
    gemini_cost: number;
    runtime_ms: number;
  };
}
```

### API Endpoint
- POST `/functions/v1/agent-1-trend-hunter`
- No parameters needed
- Returns Agent1Output

### Error Handling
- If one source fails, continue with others
- Log failures but don't crash
- Minimum 50 keywords to be considered success

---

## Testing Strategy

### After Chunk 3:
- Quick syntax check (deployment test)

### After Chunk 4:
1. Deploy agent-1-trend-hunter
2. Invoke it
3. Check logs for:
   - All sources fetched
   - Keywords generated
   - No critical errors
4. Verify output structure

### Success Criteria:
- ✅ Agent returns 150-180 keywords
- ✅ All 5 sources contribute
- ✅ Runtime < 20 seconds
- ✅ Gemini cost < $0.10

---

## Implementation Order

1. **Create Chunk 3 file** (google-autocomplete.ts)
2. **Test Chunk 3 syntax** (deploy test)
3. **Create Chunk 4 file** (agent-1-trend-hunter/index.ts)
4. **Deploy Agent 1**
5. **Invoke Agent 1**
6. **Check results**
7. **Fix any issues**
8. **Verify against global plan**

---

## Checklist

### Chunk 3:
- [ ] Create google-autocomplete.ts
- [ ] Implement fetchAutocomplete()
- [ ] Implement expandKeywords()
- [ ] Add error handling
- [ ] Add rate limiting
- [ ] Deploy for syntax check

### Chunk 4:
- [ ] Create agent-1-trend-hunter directory
- [ ] Create index.ts
- [ ] Import all data sources
- [ ] Implement flow (5 sources)
- [ ] Implement deduplication
- [ ] Add logging
- [ ] Deploy Agent 1
- [ ] Test Agent 1
- [ ] Verify output structure

---

## Global Plan Status

✅ **Completed:**
- Chunk 1: Enhanced Serper Rotator
- Chunk 2: Nitter RSS Fetcher

🔄 **In Progress:**
- Chunk 3: Google Autocomplete Fetcher
- Chunk 4: Agent 1 (Trend Hunter)

⬜ **Pending:**
- Chunk 5: Agent 2 Core
- Chunk 6: Advanced Analyzers
- Chunk 7: Main Pipeline
- Chunk 8: Database Schema
- Chunk 9: Deploy & Test
- Chunk 10: Frontend Integration

**Progress: 2/10 chunks (20% → 40% after this round)**

---

🚀 **LET'S BUILD CHUNKS 3 & 4!**
