# 🚀 Quick Setup: Gemini Filter

## ⚡ 3-Step Setup

### Step 1: Get Gemini API Key (Free)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Add to Supabase

**Option A: Dashboard**
```
1. Open Supabase Dashboard
2. Your Project → Settings → Edge Functions
3. Add Secret:
   - Key: GEMINI_API_KEY
   - Value: [paste your API key]
4. Save
```

**Option B: CLI**
```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...your_key_here
```

### Step 3: Deploy Updated Functions

```bash
# Deploy the updated unified API
supabase functions deploy genesis-unified-api

# Verify deployment
supabase functions list
```

## ✅ Verify It's Working

Run your pipeline and check logs for:

```
🤖 STEP 2.5: Filtering Keywords with Gemini 2.5 Pro...
🔍 STEP 1: Checking for duplicates in database...
   Found 0 duplicates in database
   50 unique keywords will be analyzed
🧠 STEP 2: Analyzing keywords with Gemini 2.5 Pro...
   🔄 Attempt 1/3...
   ✅ Analysis complete: 18 keywords selected
✅ GEMINI FILTER COMPLETE
   Total Received: 50
   Duplicates Removed: 0
   Analyzed: 50
   Selected: 18
   Selection Rate: 36.0%
   Avg Score: 78.2
```

## 🎉 Done!

Your pipeline now:
- ✅ Filters keywords with AI
- ✅ Checks for duplicates
- ✅ Saves only elite keywords
- ✅ Includes content creation guidance

---

## 🔧 Troubleshooting

**"GEMINI_API_KEY not set, skipping Gemini filter"**
- Key not added to Supabase secrets
- Re-check Step 2 above

**"Gemini filter failed, using Agent 2 results"**
- API key might be invalid
- Check Supabase logs for detailed error
- Verify API key at https://aistudio.google.com/app/apikey

**No Gemini filter in response?**
- Check if function was redeployed after adding key
- Look for `gemini_filter_results` in API response

---

## 💰 Cost (Almost Free)

- **Gemini 2.0 Flash**: ~$0.001 per analysis
- **50 runs/month**: ~$0.05
- **Essentially free for indie hackers** 🎯

---

## 📊 What You Get

**Every keyword now includes:**
```json
{
  "keyword": "ai automation roi calculator",
  "gemini_scores": {
    "high_intent_score": 88,
    "viral_potential_score": 72,
    "conversion_score": 85,
    "trends_score": 81,
    "content_opportunity_score": 76,
    "overall_score": 80.4
  },
  "gemini_reasoning": "Strong purchase intent with clear ROI focus",
  "content_angle": "Interactive calculator with case studies"
}
```

**Pass this data to your content agent** → Better articles! 🚀
