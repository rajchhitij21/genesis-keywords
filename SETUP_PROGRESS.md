# 🎉 SETUP PROGRESS - Genesis Keywords Pipeline

## ✅ CHUNK 1 & 2 COMPLETED

### What We've Done:

1. **✅ Installed Scoop Package Manager**
   - Version: Latest
   - Location: `~\scoop`

2. **✅ Installed Supabase CLI**
   - Version: 2.53.6
   - Successfully installed via Scoop

3. **✅ Logged Out Previous Account**
   - Removed old access token

4. **✅ Logged Into Correct Supabase Account**
   - Token: `cli_NEWBORN\user@NEWBORN_1761550138`
   - Status: Successfully authenticated

5. **✅ Linked to Project**
   - Project Ref: `kyeusjkivowioqxzwgpn`
   - Database: Connected
   - Status: ✅ Linked

6. **✅ Created Function Directories**
   - `supabase/functions/agent-1-trend-hunter/` ✅
   - `supabase/functions/agent-2-seo-validator/` ✅
   - `supabase/functions/_shared/` (already existed) ✅

7. **✅ Created Import Map**
   - File: `supabase/functions/import_map.json`
   - Dependencies: rss-parser

8. **✅ Installed NPM Dependencies**
   - rss-parser: ✅ Installed

9. **✅ Verified Database Schema**
   - `keyword_variations` table: ✅ Exists
   - `pipeline_runs` table: ✅ Exists
   - All required columns: ✅ Present

---

## 🔑 API KEYS NEEDED

Before we continue with Chunks 3-4, you need to provide the following API keys:

### REQUIRED (Must Have):

1. **Gemini API Key**
   - Where: https://makersuite.google.com/app/apikey
   - Cost: Free tier available
   - Purpose: Generate keyword variations from trends
   - You mentioned you already have this ✅

2. **Serper API Keys (5-7 accounts recommended)**
   - Where: https://serper.dev/
   - Cost: Free tier = 2,500 queries/month per account
   - Purpose: Get SERP data for keyword validation
   - Why multiple: Rate limiting & parallel processing
   
   **You need to create 5-7 accounts and get API keys:**
   - Account 1: ___________________________
   - Account 2: ___________________________
   - Account 3: ___________________________
   - Account 4: ___________________________
   - Account 5: ___________________________
   - Account 6: (optional) ___________________________
   - Account 7: (optional) ___________________________

### OPTIONAL (Nice to Have):

3. **Twitter/Nitter**
   - We're using free Nitter RSS (no API key needed)
   - Status: ✅ No action required

4. **Google Trends**
   - We're using free RSS feed (no API key needed)
   - Status: ✅ No action required

---

## 📝 NEXT STEP: Set Secrets

Once you have the API keys, run these commands:

```powershell
# Set Gemini Key
supabase secrets set GEMINI_API_KEY="your_gemini_key_here"

# Set Serper Keys (one at a time)
supabase secrets set SERPER_KEY_1="your_serper_key_1"
supabase secrets set SERPER_KEY_2="your_serper_key_2"
supabase secrets set SERPER_KEY_3="your_serper_key_3"
supabase secrets set SERPER_KEY_4="your_serper_key_4"
supabase secrets set SERPER_KEY_5="your_serper_key_5"
supabase secrets set SERPER_KEY_6="your_serper_key_6"  # Optional
supabase secrets set SERPER_KEY_7="your_serper_key_7"  # Optional
```

**OR** set them via Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/kyeusjkivowioqxzwgpn/settings/functions
2. Scroll to "Environment Variables"
3. Click "+ New Secret"
4. Add each key

---

## 🎯 WHAT'S NEXT (After Keys)

### CHUNK 3 & 4: Shared Utilities (60 min)
We'll create:
- Nitter RSS fetcher (Twitter trends)
- Google Trends RSS fetcher
- Google Autocomplete fetcher (using direct HTTP)
- Serper rotator (multi-key management)
- Gemini client (keyword generation)
- Utility functions (deduplication, etc.)

### CHUNK 5: Agent 1 - Trend Hunter (45 min)
- Fetch from 4 sources
- Generate 150-180 keywords
- Cost: ~$0.08/run

### CHUNK 6-7: Agent 2 - SEO Validator (90 min)
- Validate all keywords
- Multi-factor scoring
- Return 40-60 high-quality keywords
- Cost: ~$0.50/run

### CHUNK 8: Main Pipeline (30 min)
- Wire Agent 1 → Agent 2
- Save to database
- Generate recommendations

### CHUNK 9-12: Testing & Deployment (2 hours)
- Local testing
- Deploy to production
- Frontend integration
- Production monitoring

---

## 💰 ESTIMATED COSTS

### Per Run (every 12 hours):
- Gemini API: $0.08
- Serper API: $0.50 (50 keywords × $0.01)
- **Total: $0.58/run**

### Monthly (60 runs):
- **Total: $34.80/month**
- Keywords generated: 2,400-3,600
- Keywords saved: 600-1,080
- ROI: 1,667x (if each keyword = $100 in SEO value)

### With Free Tiers:
- Gemini: 60 requests/min free (enough for us)
- Serper: 2,500/month free per account
- With 5 accounts: 12,500 free queries/month
- **Potentially FREE for first 250 pipeline runs!**

---

## 🚨 ACTION REQUIRED

**Please provide your API keys so we can continue:**

1. Gemini API Key: `________________________`
2. Serper API Keys (5-7): `________________________`

Once you provide these, I'll:
1. Set them as Supabase secrets
2. Continue with Chunks 3-4 (Shared Utilities)
3. Build Agent 1 & Agent 2
4. Deploy and test the full pipeline

**Ready to continue? Just paste your API keys!** 🚀
