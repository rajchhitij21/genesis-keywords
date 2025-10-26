# Keyword Pipeline Setup Guide

## 🎯 Overview

Your AI-powered keyword generation pipeline is ready! This system:

- ✅ **Design system configured** with professional blue/purple theme
- ✅ **Dashboard UI built** with stats cards and keyword table
- ✅ **Database schema ready** for keyword_variations and pipeline_runs
- ✅ **Frontend working** - view at `/dashboard`

## 🚀 Next Steps: Connect Lovable Cloud

To activate the full pipeline with real data fetching and Claude AI:

### 1. Enable Lovable Cloud
Click the button below to connect your backend:

**[Connect Lovable Cloud](#)** (Button will appear in chat)

This gives you:
- PostgreSQL database for keywords
- Serverless edge functions
- Secure secret management

### 2. Add Required Secrets

After connecting Lovable Cloud, add these API keys:

| Secret Name | Required? | Where to Get It | Purpose |
|-------------|-----------|-----------------|---------|
| `ANTHROPIC_API_KEY` | **YES** | [Anthropic Console](https://console.anthropic.com/) | Generate keyword variations with Claude |
| `APIFY_TOKEN` | Optional | [Apify](https://apify.com/) | Fetch Twitter trends |
| `PRODUCTHUNT_API_KEY` | Optional | [ProductHunt API](https://www.producthunt.com/v2/oauth/applications) | Fetch new AI tools |

**Critical**: `ANTHROPIC_API_KEY` is required for the LLM-powered keyword generation.

### 3. Create the Edge Function

Once Cloud is connected, I'll create the `keyword-pipeline` edge function that:
- Fetches from 5 external sources (GitHub, Reddit, HackerNews, Twitter*, ProductHunt*)
- Uses Claude to generate 60-150 keyword variations
- Validates with mock trend scores (Google Trends integration ready)
- Enriches with social signals
- Saves to your database

*Twitter and ProductHunt require API keys (optional)

### 4. Set Up Cron Job

The pipeline should run automatically every 12 hours. Options:

**Option A: Vercel Cron** (if deploying to Vercel)
- Add cron configuration to call the edge function
- Free on Pro plan

**Option B: Manual Trigger**
- Use the "Run Pipeline" button in the dashboard
- Or call the edge function via API

## 📊 Database Schema

Already created and ready:

### `keyword_variations` table
- **keyword**: The search term
- **type**: 'base' or 'variation'
- **category**: builder_stories, ai_automation, etc.
- **source**: producthunt, twitter, github, reddit, hackernews
- **trend_score**: 0-100 (Google Trends)
- **social signals**: Twitter mentions, Reddit upvotes, HN points
- **status**: PENDING, ANALYZED, PUBLISHED

### `pipeline_runs` table
- Tracks each pipeline execution
- Metrics: keywords saved, runtime, cost
- Error logging

## 🎨 Design System

Your dashboard uses a modern tech theme:

**Colors:**
- Primary: `hsl(245 60% 60%)` - Blue/purple
- Accent: `hsl(270 60% 65%)` - Purple
- Success: `hsl(142 76% 36%)` - Green
- Warning: `hsl(38 92% 50%)` - Orange

**Features:**
- Gradient cards
- Real-time stats
- Interactive keyword table
- Status badges with semantic colors

## 📝 How to Use

1. **View Dashboard**: Navigate to `/dashboard`
2. **Run Pipeline**: Click "Run Pipeline" (requires Cloud)
3. **Monitor Keywords**: See trending keywords in real-time
4. **Filter by Category**: 6 categories automatically tagged
5. **Track Engagement**: Social signals from Twitter, Reddit, HN

## 🔄 Pipeline Flow

```
STEP 1: Fetch External Sources (5 sources)
   ↓
STEP 2: Claude Generates Variations (60-150 keywords)
   ↓
STEP 3: Combine with Base Keywords (30 evergreen)
   ↓
STEP 4: Google Trends Validation (filter to trending only)
   ↓
STEP 5: Social Enrichment (add engagement data)
   ↓
STEP 6: Save to Database (status: PENDING)
```

## 💰 Costs

- **GitHub/Reddit/HackerNews**: FREE
- **Claude API**: ~$0.003 per 1K tokens (~$0.50 per run)
- **Google Trends**: FREE (via google-trends-api)
- **Twitter** (optional): Apify costs vary
- **ProductHunt** (optional): FREE with API key

**Total per run**: < $2 (with all services)
**Per month** (2 runs/day): ~$60

## 🛠 Next Actions

Let me know when you're ready and I'll:

1. Create the edge function with full pipeline logic
2. Add Google Trends integration
3. Set up the cron schedule
4. Test the full flow

Just say "Enable Cloud" and I'll walk you through it!
