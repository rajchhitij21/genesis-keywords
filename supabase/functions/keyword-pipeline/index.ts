import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchAllSources } from '../_shared/sources.ts';
import { getAllBaseKeywords } from '../_shared/base-keywords.ts';
import { generateKeywordVariations } from '../_shared/gemini-client.ts';
import { validateWithSerper, filterTrendingKeywords } from '../_shared/serper-trends.ts';
import { batchEnrichKeywords } from '../_shared/social-signals.ts';

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
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get API keys from environment
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  const serperApiKey = Deno.env.get('SERPER_KEY_1');
  const apifyToken = Deno.env.get('APIFY_KEY_1');
  
  if (!geminiApiKey || !serperApiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing required API keys (GEMINI_API_KEY or SERPER_KEY_1)' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log('\n🚀 KEYWORD PIPELINE STARTED\n');
  console.log('='.repeat(60));
  
  // Create pipeline run record
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
    // STEP 1: Fetch external sources
    console.log('\n📡 STEP 1: Fetching external sources...\n');
    const externalSources = await fetchAllSources(apifyToken);
    
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
      source_item: 'base configuration'
    }));
    
    const allKeywords = [...variations, ...baseKeywordObjects];
    console.log(`Total keywords to validate: ${allKeywords.length}`);
    
    // STEP 4: Validate with Serper (batch to save costs)
    console.log('\n📊 STEP 4: Validating trends with Serper...\n');
    const uniqueKeywords = [...new Set(allKeywords.map(kw => kw.keyword))];
    const trendMap = await validateWithSerper(uniqueKeywords.slice(0, 50), serperApiKey); // Limit to 50 to control costs
    
    // STEP 5: Filter trending keywords
    console.log('\n🔍 STEP 5: Filtering trending keywords...\n');
    const trendingKeywords = filterTrendingKeywords(allKeywords, trendMap, 30);
    console.log(`Found ${trendingKeywords.length} trending keywords`);
    
    // STEP 6: Enrich with social signals (optional, skip to save time)
    console.log('\n🌐 STEP 6: Enriching with social signals (sampling)...\n');
    const toEnrich = trendingKeywords.slice(0, 20); // Only enrich top 20 to save time
    const enriched = await batchEnrichKeywords(toEnrich);
    
    // Combine enriched with non-enriched
    const finalKeywords = [
      ...enriched,
      ...trendingKeywords.slice(20).map(kw => ({
        ...kw,
        twitter_mentions: 0,
        twitter_engagement: 0,
        reddit_mentions: 0,
        reddit_upvotes: 0,
        hn_mentions: 0,
        hn_points: 0
      }))
    ];
    
    // STEP 7: Save to database
    console.log('\n💾 STEP 7: Saving to database...\n');
    const recordsToInsert = finalKeywords.map(kw => ({
      keyword: kw.keyword,
      type: kw.type,
      category: kw.category,
      source: kw.source,
      source_item: kw.source_item,
      trend_score: kw.trend_score || 0,
      growth_rate: kw.growth_rate || 0,
      interest_data: kw.interest_data || {},
      related_queries: kw.related_queries || {},
      twitter_mentions: kw.twitter_mentions || 0,
      twitter_engagement: kw.twitter_engagement || 0,
      reddit_mentions: kw.reddit_mentions || 0,
      reddit_upvotes: kw.reddit_upvotes || 0,
      hn_mentions: kw.hn_mentions || 0,
      hn_points: kw.hn_points || 0,
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
    
    // Rough cost estimation
    const geminiCost = (variations.length / 100) * 0.05; // ~$0.05 per 100 requests
    const serperCost = (trendMap.size * 0.01); // ~$0.01 per search
    const totalCost = geminiCost + serperCost;
    
    await supabase
      .from('pipeline_runs')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        external_sources_fetched: externalSources.length,
        variations_generated: variations.length,
        keywords_checked: allKeywords.length,
        trending_keywords_found: trendingKeywords.length,
        keywords_saved: savedKeywords?.length || 0,
        runtime_seconds: runtimeSeconds,
        cost_usd: totalCost,
        results: {
          sources: externalSources.length,
          variations: variations.length,
          validated: trendMap.size,
          trending: trendingKeywords.length,
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
          external_sources: externalSources.length,
          variations_generated: variations.length,
          keywords_checked: allKeywords.length,
          trending_found: trendingKeywords.length,
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
    
    // Update pipeline run with error
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
