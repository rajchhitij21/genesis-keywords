import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Import all data sources
import { fetchGoogleTrends, TrendData } from '../_shared/google-trends.ts';
import { fetchTwitterTweets, extractKeywordFromTweet, TwitterTweet } from '../_shared/twitter-api-fetcher.ts';
import { fetchRedditPosts, extractKeywordFromReddit, RedditPost } from '../_shared/reddit-fetcher.ts';
import { expandKeywords, getDefaultSeedKeywords, AutocompleteSuggestion } from '../_shared/google-autocomplete.ts';
import { generateKeywordVariations } from '../_shared/gemini-client.ts';
import { getAllBaseKeywords } from '../_shared/base-keywords.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Agent1Keyword {
  keyword: string;
  type: 'base' | 'variation' | 'autocomplete' | 'trend' | 'social';
  source: string;
  category?: string;
  source_metadata?: any;
  commercial_intent?: string;
}

interface Agent1Output {
  success: boolean;
  keywords: Agent1Keyword[];
  metadata: {
    google_trends_count: number;
    twitter_count: number;
    reddit_count: number;
    autocomplete_count: number;
    gemini_variations_count: number;
    base_keywords_count: number;
    total_keywords: number;
    gemini_calls: number;
    gemini_cost: number;
    runtime_ms: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  console.log('\n🚀 AGENT 1: TREND HUNTER\n');
  console.log('='.repeat(60));

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }

    const allKeywords: Agent1Keyword[] = [];
    let googleTrendsCount = 0;
    let twitterCount = 0;
    let redditCount = 0;
    let autocompleteCount = 0;
    let geminiVariationsCount = 0;
    let baseKeywordsCount = 0;

    // ============================================
    // STEP 1: FETCH GOOGLE TRENDS
    // ============================================
    console.log('\n📈 STEP 1: Fetching Google Trends...\n');
    
    let googleTrends: TrendData[] = [];
    try {
      googleTrends = await fetchGoogleTrends();
      
      googleTrends.forEach(trend => {
        allKeywords.push({
          keyword: trend.keyword,
          type: 'trend',
          source: 'google_trends',
          category: trend.category,
          source_metadata: {
            growth: trend.growth_percentage,
            velocity: trend.trend_velocity,
            related_queries: trend.related_queries
          }
        });
      });
      
      googleTrendsCount = googleTrends.length;
      console.log(`✅ Google Trends: ${googleTrendsCount} trends`);
      
    } catch (error) {
      console.error('⚠️  Google Trends failed, continuing...', error.message);
    }

    // ============================================
    // STEP 2: FETCH TWITTER/X TRENDS (PRIMARY)
    // ============================================
    console.log('\n🐦 STEP 2: Fetching Twitter trends...\n');
    
    let twitterTweets: TwitterTweet[] = [];
    try {
      twitterTweets = await fetchTwitterTweets(); // Official Twitter API v2
      
      twitterTweets.forEach(tweet => {
        const extracted = extractKeywordFromTweet(tweet.text);
        if (extracted && extracted.length > 5) {
          allKeywords.push({
            keyword: extracted,
            type: 'social',
            source: 'twitter',
            category: 'builder_stories',
            source_metadata: {
              likes: tweet.public_metrics.like_count,
              retweets: tweet.public_metrics.retweet_count,
              replies: tweet.public_metrics.reply_count,
              tweet_id: tweet.id
            }
          });
        }
      });
      
      twitterCount = twitterTweets.length;
      console.log(`✅ Twitter: ${twitterCount} tweets`);
      
    } catch (error) {
      console.error('⚠️  Twitter failed, trying Reddit fallback...', error.message);
      
      // FALLBACK: Try Reddit if Twitter fails
      try {
        const redditPosts = await fetchRedditPosts(20);
        
        redditPosts.forEach(post => {
          const extracted = extractKeywordFromReddit(post.title);
          if (extracted && extracted.length > 5) {
            allKeywords.push({
              keyword: extracted,
              type: 'social',
              source: 'reddit_fallback',
              category: 'builder_stories',
              source_metadata: {
                upvotes: post.upvotes,
                comments: post.num_comments,
                subreddit: post.subreddit
              }
            });
          }
        });
        
        redditCount = redditPosts.length;
        console.log(`✅ Reddit (fallback): ${redditCount} posts`);
        
      } catch (redditError) {
        console.error('⚠️  Reddit fallback also failed, continuing...', redditError.message);
      }
    }

    // ============================================
    // STEP 3: FETCH GOOGLE AUTOCOMPLETE
    // ============================================
    console.log('\n🔍 STEP 3: Fetching Google Autocomplete suggestions...\n');
    
    let autocompleteSuggestions: AutocompleteSuggestion[] = [];
    try {
      const seeds = getDefaultSeedKeywords().slice(0, 6); // Limit to 6 seeds
      autocompleteSuggestions = await expandKeywords(seeds);
      
      autocompleteSuggestions.forEach(suggestion => {
        allKeywords.push({
          keyword: suggestion.keyword,
          type: 'autocomplete',
          source: 'google_autocomplete'
        });
      });
      
      autocompleteCount = autocompleteSuggestions.length;
      console.log(`✅ Autocomplete: ${autocompleteCount} suggestions`);
      
    } catch (error) {
      console.error('⚠️  Google Autocomplete failed, continuing...', error.message);
    }

    // ============================================
    // STEP 4: GENERATE GEMINI VARIATIONS
    // ============================================
    console.log('\n🤖 STEP 4: Generating keyword variations with Gemini...\n');
    
    let geminiVariations: any[] = [];
    try {
      // Prepare sources for Gemini (trends + social posts)
      const sourcesForGemini = [
        ...googleTrends.map(t => ({
          source: 'google_trends',
          item: t.keyword,
          metadata: { category: t.category }
        })),
        ...twitterTweets.slice(0, 15).map(t => ({
          source: 'twitter',
          item: t.text.substring(0, 100),
          metadata: { likes: t.public_metrics.like_count, retweets: t.public_metrics.retweet_count }
        }))
      ].slice(0, 20); // Up to 20 sources

      if (sourcesForGemini.length > 0) {
        geminiVariations = await generateKeywordVariations(sourcesForGemini, geminiApiKey);
        
        geminiVariations.forEach(variation => {
          allKeywords.push({
            keyword: variation.keyword,
            type: 'variation',
            source: variation.source || 'gemini',
            category: variation.category,
            commercial_intent: variation.commercial_intent
          });
        });
        
        geminiVariationsCount = geminiVariations.length;
        console.log(`✅ Gemini: ${geminiVariationsCount} variations`);
      }
      
    } catch (error) {
      console.error('⚠️  Gemini failed, continuing...', error.message);
    }

    // ============================================
    // STEP 5: ADD BASE KEYWORDS
    // ============================================
    console.log('\n📋 STEP 5: Adding base keywords...\n');
    
    const baseKeywords = getAllBaseKeywords();
    baseKeywords.forEach(kw => {
      allKeywords.push({
        keyword: kw,
        type: 'base',
        source: 'manual',
        commercial_intent: 'high'
      });
    });
    
    baseKeywordsCount = baseKeywords.length;
    console.log(`✅ Base Keywords: ${baseKeywordsCount} keywords`);

    // ============================================
    // STEP 6: DEDUPLICATE
    // ============================================
    console.log('\n🔄 STEP 6: Deduplicating keywords...\n');
    
    const seen = new Set<string>();
    const uniqueKeywords = allKeywords.filter(kw => {
      const normalized = kw.keyword.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

    // ============================================
    // CALCULATE METRICS
    // ============================================
    const runtime = Date.now() - startTime;
    const geminiCalls = Math.ceil(geminiVariationsCount / 5);
    const geminiCost = (geminiCalls * 0.02); // Rough estimate

    const result: Agent1Output = {
      success: true,
      keywords: uniqueKeywords,
      metadata: {
        google_trends_count: googleTrendsCount,
        twitter_count: twitterCount,
        reddit_count: redditCount,
        autocomplete_count: autocompleteCount,
        gemini_variations_count: geminiVariationsCount,
        base_keywords_count: baseKeywordsCount,
        total_keywords: uniqueKeywords.length,
        gemini_calls: geminiCalls,
        gemini_cost: geminiCost,
        runtime_ms: runtime
      }
    };

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ AGENT 1 COMPLETE\n');
    console.log(`📊 Results:`);
    console.log(`   - Google Trends: ${googleTrendsCount}`);
    console.log(`   - Twitter: ${twitterCount}`);
    console.log(`   - Reddit: ${redditCount}`);
    console.log(`   - Autocomplete: ${autocompleteCount}`);
    console.log(`   - Gemini Variations: ${geminiVariationsCount}`);
    console.log(`   - Base Keywords: ${baseKeywordsCount}`);
    console.log(`   - Total Unique: ${uniqueKeywords.length}`);
    console.log(`\n⏱️  Runtime: ${runtime}ms`);
    console.log(`💰 Gemini Cost: $${geminiCost.toFixed(4)}`);
    console.log('='.repeat(60) + '\n');

    return new Response(
      JSON.stringify(result, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('\n❌ AGENT 1 ERROR:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
