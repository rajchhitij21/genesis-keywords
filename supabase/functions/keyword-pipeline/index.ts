import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchGoogleTrends } from '../_shared/google-trends.ts';
import { fetchTwitterTrends, searchTwitterForKeyword } from '../_shared/twitter-trends.ts';
import { getAllBaseKeywords } from '../_shared/base-keywords.ts';
import { generateKeywordVariations } from '../_shared/gemini-client.ts';
import { validateWithSerper, filterValidatedKeywords } from '../_shared/serper-validator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const runId = crypto.randomUUID();
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  const serperApiKey = Deno.env.get('SERPER_KEY_1');
  const apifyToken = Deno.env.get('APIFY_KEY_1');
  
  if (!geminiApiKey || !serperApiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing required API keys (GEMINI_API_KEY or SERPER_KEY_1)' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log('\n🚀 KEYWORD PIPELINE STARTED (Google Trends + X Focus)\n');
  console.log('='.repeat(60));
  
  const { data: pipelineRun, error: insertError } = await supabase
    .from('pipeline_runs')
    .insert({
      id: runId,
      status: 'RUNNING',
      started_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('Failed to create pipeline run:', insertError);
    return new Response(
      JSON.stringify({ error: 'Failed to initialize pipeline' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // STEP 1: Fetch Google Trends + X Trending
    console.log('\n📡 STEP 1: Fetching Google Trends + X...\n');
    const [googleTrends, xTrends] = await Promise.all([
      fetchGoogleTrends(),
      fetchTwitterTrends(apifyToken)
    ]);
    
    // Combine sources for LLM
    const externalSources = [
      ...googleTrends.map(t => ({
        source: 'google_trends',
        item: t.keyword,
        metadata: { category: t.category, growth: t.growth_percentage }
      })),
      ...xTrends.map(t => ({
        source: 'twitter',
        item: t.topic,
        metadata: { category: t.category, volume: t.tweet_volume }
      }))
    ];
    
    console.log(`Total external sources: ${externalSources.length}`);
    
    // STEP 2: Generate keyword variations with Gemini
    console.log('\n🤖 STEP 2: Generating keyword variations...\n');
    const variations = await generateKeywordVariations(externalSources, geminiApiKey);
    
    // STEP 3: Combine with base keywords
    console.log('\n📋 STEP 3: Adding base keywords...\n');
    const baseKeywords = getAllBaseKeywords();
    const baseKeywordObjects = baseKeywords.map(kw => ({
      keyword: kw,
      category: 'base',
      type: 'base',
      source: 'manual',
      source_item: 'base configuration',
      commercial_intent: 'high'
    }));
    
    const allKeywords = [...variations, ...baseKeywordObjects];
    console.log(`Total keywords to validate: ${allKeywords.length}`);
    
    // STEP 4: Validate with Serper (limit to 50 for cost + speed control)
    console.log('\n📊 STEP 4: Validating with Serper...\n');
    const uniqueKeywords = [...new Set(allKeywords.map(kw => kw.keyword))];
    
    // Prioritize high commercial intent keywords
    const priorityKeywords = allKeywords
      .sort((a, b) => {
        const intentScore = { high: 3, medium: 2, low: 1 };
        return (intentScore[b.commercial_intent as keyof typeof intentScore] || 0) - 
               (intentScore[a.commercial_intent as keyof typeof intentScore] || 0);
      })
      .map(kw => kw.keyword)
      .filter((kw, idx, arr) => arr.indexOf(kw) === idx) // Remove duplicates
      .slice(0, 50); // Limit to 50 for speed
    
    console.log(`Validating ${priorityKeywords.length} priority keywords...`);
    const validationMap = await validateWithSerper(priorityKeywords, serperApiKey);
    
    // STEP 5: Filter trending keywords
    console.log('\n🔍 STEP 5: Filtering trending keywords...\n');
    const validatedKeywords = filterValidatedKeywords(validationMap, 30);
    console.log(`Found ${validatedKeywords.length} trending keywords`);
    
    // STEP 6: Enrich top 10 with X engagement (reduced from 20 for speed)
    console.log('\n🌐 STEP 6: Enriching with X signals (top 10)...\n');
    const enrichedKeywords = [];
    
    // Process top 10 in parallel
    const enrichmentPromises = validatedKeywords.slice(0, 10).map(async (validated) => {
      const originalData = allKeywords.find(k => k.keyword === validated.keyword);
      const xData = await searchTwitterForKeyword(validated.keyword, apifyToken);
      
      return {
        ...validated,
        ...originalData,
        twitter_mentions: xData.mentions,
        twitter_engagement: xData.engagement,
        reddit_mentions: 0,
        reddit_upvotes: 0,
        hn_mentions: 0,
        hn_points: 0
      };
    });
    
    const enriched = await Promise.all(enrichmentPromises);
    enrichedKeywords.push(...enriched);
    
    // Add remaining without X enrichment (skip enrichment to save time)
    const finalKeywords = [
      ...enrichedKeywords,
      ...validatedKeywords.slice(10).map(v => {
        const originalData = allKeywords.find(k => k.keyword === v.keyword);
        return {
          ...v,
          ...originalData,
          twitter_mentions: 0,
          twitter_engagement: 0,
          reddit_mentions: 0,
          reddit_upvotes: 0,
          hn_mentions: 0,
          hn_points: 0
        };
      })
    ];
    
    // STEP 7: Save to database
    console.log('\n💾 STEP 7: Saving to database...\n');
    const recordsToInsert = finalKeywords.map(kw => ({
      keyword: kw.keyword,
      type: kw.type || 'variation',
      category: kw.category,
      source: kw.source,
      source_item: kw.source_item,
      trend_score: kw.trend_score || 0,
      growth_rate: 0,
      interest_data: {},
      related_queries: { queries: kw.related_searches || [] },
      twitter_mentions: kw.twitter_mentions || 0,
      twitter_engagement: kw.twitter_engagement || 0,
      reddit_mentions: 0,
      reddit_upvotes: 0,
      hn_mentions: 0,
      hn_points: 0,
      search_volume: kw.search_volume || 0,
      competition_score: kw.competition_score || 0,
      commercial_intent: kw.commercial_intent || 'medium',
      trend_velocity: 'rising',
      serp_features: { features: kw.serp_features || [] },
      status: 'PENDING',
      run_id: runId,
      created_at: new Date().toISOString()
    }));
    
    const { data: savedKeywords, error: saveError } = await supabase
      .from('keyword_variations')
      .insert(recordsToInsert)
      .select();
    
    if (saveError) {
      throw new Error(`Failed to save keywords: ${saveError.message}`);
    }
    
    // STEP 8: Update pipeline run
    const endTime = Date.now();
    const runtimeSeconds = Math.floor((endTime - startTime) / 1000);
    
    const geminiCost = (variations.length / 100) * 0.05;
    const serperCost = (validationMap.size * 0.01);
    const apifyCost = 0.10;
    const totalCost = geminiCost + serperCost + apifyCost;
    
    await supabase
      .from('pipeline_runs')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        external_sources_fetched: externalSources.length,
        variations_generated: variations.length,
        keywords_checked: allKeywords.length,
        trending_keywords_found: validatedKeywords.length,
        keywords_saved: savedKeywords?.length || 0,
        runtime_seconds: runtimeSeconds,
        cost_usd: totalCost,
        results: {
          google_trends: googleTrends.length,
          x_trends: xTrends.length,
          variations: variations.length,
          validated: validationMap.size,
          trending: validatedKeywords.length,
          saved: savedKeywords?.length || 0
        }
      })
      .eq('id', runId);
    
    console.log('\n✅ PIPELINE COMPLETED SUCCESSFULLY\n');
    console.log('='.repeat(60));
    console.log(`Runtime: ${runtimeSeconds}s`);
    console.log(`Cost: $${totalCost.toFixed(4)}`);
    console.log(`Keywords saved: ${savedKeywords?.length || 0}`);
    console.log('='.repeat(60));
    
    return new Response(
      JSON.stringify({
        success: true,
        runId,
        stats: {
          google_trends: googleTrends.length,
          x_trends: xTrends.length,
          variations_generated: variations.length,
          keywords_checked: allKeywords.length,
          trending_found: validatedKeywords.length,
          keywords_saved: savedKeywords?.length || 0,
          runtime_seconds: runtimeSeconds,
          cost_usd: totalCost
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('\n❌ PIPELINE ERROR\n', error);
    
    await supabase
      .from('pipeline_runs')
      .update({
        status: 'FAILED',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_stack: error instanceof Error ? error.stack : ''
      })
      .eq('id', runId);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Pipeline failed',
        runId 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
