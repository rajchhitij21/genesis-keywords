// Genesis Unified API - Combines Agent 1 & Agent 2 V3 + Database Storage
// Single endpoint for complete keyword analysis pipeline
// STEP 1: Agent 1 → STEP 2: Agent 2 V3 → STEP 3: Save to Database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

interface UnifiedRequest {
  business: string;
  niche: string;
  target_audience: string;
  goals?: string[];
  competitors?: string[];
}

interface UnifiedResponse {
  success: boolean;
  pipeline_id: string;
  runtime_ms: number;
  agent1_results: {
    keywords_found: number;
    categories: any[];
    keyword_types: {
      seed: number;
      competitor: number;
      lsi: number;
      question: number;
      long_tail: number;
    };
    keywords: any[];
  };
  agent2_results: {
    validated_keywords: number;
    priority_distribution: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
    total_estimated_volume: number;
    avg_competition_score: number;
    trending_keywords: number;
    content_opportunities: number;
    validated_keywords_data: any[];
    clusters: any[];
  };
  database_storage: {
    keywords_saved: number;
    table: string;
    status: string;
  };
  executive_summary: {
    top_opportunities: string[];
    volume_insights: string[];
    trend_insights: string[];
    competition_insights: string[];
    content_recommendations: string[];
  };
  cost_breakdown: {
    agent1_cost: number;
    agent2_cost: number;
    total_cost: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
      },
    });
  }

  const pipelineId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  try {
    console.log('🚀 GENESIS UNIFIED API STARTED');
    console.log('=================================');
    console.log(`Pipeline ID: ${pipelineId}`);
    
    // Parse input
    const input: UnifiedRequest = await req.json();
    
    if (!input.business || !input.niche || !input.target_audience) {
      throw new Error('Missing required fields: business, niche, target_audience');
    }
    
    console.log(`📋 Input: ${input.business} | ${input.niche} | ${input.target_audience}`);
    
    // STEP 1: Call Agent 1 (Keyword Discovery)
    console.log('\n🔍 STEP 1: Running Agent 1 - Keyword Discovery...');
    const agent1Response = await callAgent1(input);
    
    if (!agent1Response.success || !agent1Response.keywords?.length) {
      throw new Error('Agent 1 failed or returned no keywords');
    }
    
    console.log(`✅ Agent 1 Complete: ${agent1Response.keywords.length} keywords found`);
    
    // STEP 2: Call Agent 2 (Keyword Validation & Analysis)
    console.log('\n🎯 STEP 2: Running Agent 2 V3 - Advanced Analysis...');
    const agent2Response = await callAgent2(agent1Response.keywords);
    
    if (!agent2Response.success) {
      throw new Error('Agent 2 failed during validation');
    }
    
    console.log(`✅ Agent 2 Complete: ${agent2Response.validated_keywords.length} keywords validated`);
    
    // STEP 3: Save Top Keywords to Database
    console.log('\n💾 STEP 3: Saving Top Keywords to Database...');
    const dbResult = await saveTopKeywordsToDatabase(
      pipelineId,
      input,
      agent1Response.keywords,
      agent2Response.validated_keywords
    );
    console.log(`✅ Database Storage Complete: ${dbResult.keywords_saved} keywords saved`);
    
    // STEP 4: Generate Executive Summary
    console.log('\n📊 STEP 4: Generating Executive Summary...');
    const executiveSummary = generateExecutiveSummary(agent1Response, agent2Response);
    
    // Calculate costs
    const costs = {
      agent1_cost: (agent1Response.metadata?.api_calls || 0) * 0.001,
      agent2_cost: (agent2Response.metadata?.serper_cost || 0),
      total_cost: 0
    };
    costs.total_cost = costs.agent1_cost + costs.agent2_cost;
    
    // Compile unified response
    const unifiedResponse: UnifiedResponse = {
      success: true,
      pipeline_id: pipelineId,
      runtime_ms: Date.now() - startTime,
      agent1_results: {
        keywords_found: agent1Response.keywords.length,
        categories: agent1Response.categories || [],
        keyword_types: agent1Response.keyword_types || {
          seed: 0, competitor: 0, lsi: 0, question: 0, long_tail: 0
        },
        keywords: agent1Response.keywords
      },
      agent2_results: {
        validated_keywords: agent2Response.validated_keywords.length,
        priority_distribution: {
          urgent: agent2Response.metadata?.urgent_count || 0,
          high: agent2Response.metadata?.high_count || 0,
          medium: agent2Response.metadata?.medium_count || 0,
          low: agent2Response.metadata?.low_count || 0
        },
        total_estimated_volume: calculateTotalVolume(agent2Response.validated_keywords),
        avg_competition_score: calculateAvgCompetition(agent2Response.validated_keywords),
        trending_keywords: countTrendingKeywords(agent2Response.validated_keywords),
        content_opportunities: countContentOpportunities(agent2Response.validated_keywords),
        validated_keywords_data: agent2Response.validated_keywords,
        clusters: agent2Response.clusters || []
      },
      database_storage: dbResult,
      executive_summary: executiveSummary,
      cost_breakdown: costs
    };
    
    console.log('\n=================================');
    console.log('✅ GENESIS PIPELINE COMPLETE');
    console.log(`📊 Results: ${unifiedResponse.agent1_results.keywords_found} → ${unifiedResponse.agent2_results.validated_keywords} keywords`);
    console.log(`⏱️ Runtime: ${unifiedResponse.runtime_ms}ms`);
    console.log(`💰 Total Cost: $${costs.total_cost.toFixed(4)}`);
    console.log('=================================');
    
    return new Response(JSON.stringify(unifiedResponse), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
      },
    });
    
  } catch (error) {
    console.error('❌ Genesis Pipeline Error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      pipeline_id: pipelineId,
      error: error.message,
      runtime_ms: Date.now() - startTime
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
      },
    });
  }
});

// Call Agent 1 (Keyword Discovery)
async function callAgent1(input: UnifiedRequest): Promise<any> {
  const agent1Payload = {
    business: input.business,
    niche: input.niche,
    target_audience: input.target_audience,
    goals: input.goals || [],
    competitors: input.competitors || []
  };
  
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/agent-1-trend-hunter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    },
    body: JSON.stringify(agent1Payload)
  });
  
  if (!response.ok) {
    throw new Error(`Agent 1 HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Call Agent 2 V3 (Advanced Analysis)
async function callAgent2(keywords: any[]): Promise<any> {
  const agent2Payload = {
    keywords: keywords.map(k => ({
      keyword: k.keyword,
      type: k.type,
      source: k.source,
      category: k.category,
      commercial_intent: k.commercial_intent
    }))
  };
  
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/agent-2-seo-validator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    },
    body: JSON.stringify(agent2Payload)
  });
  
  if (!response.ok) {
    throw new Error(`Agent 2 HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Generate Executive Summary
function generateExecutiveSummary(agent1Results: any, agent2Results: any) {
  const validatedKeywords = agent2Results.validated_keywords || [];
  const urgentKeywords = validatedKeywords.filter((k: any) => k.priority_tier === 'urgent');
  const highVolumeKeywords = validatedKeywords.filter((k: any) => k.estimated_volume > 10000);
  const trendingKeywords = validatedKeywords.filter((k: any) => k.trend_direction === 'rising');
  const lowCompetitionKeywords = validatedKeywords.filter((k: any) => k.competition_score < 30);
  
  return {
    top_opportunities: [
      ...(urgentKeywords.length > 0 ? [`${urgentKeywords.length} urgent priority keywords identified`] : []),
      ...(highVolumeKeywords.length > 0 ? [`${highVolumeKeywords.length} high-volume opportunities (>10K searches)`] : []),
      ...(trendingKeywords.length > 0 ? [`${trendingKeywords.length} trending keywords with rising interest`] : []),
      ...(lowCompetitionKeywords.length > 0 ? [`${lowCompetitionKeywords.length} low-competition targets`] : [])
    ].slice(0, 5),
    
    volume_insights: [
      `Total estimated monthly volume: ${calculateTotalVolume(validatedKeywords).toLocaleString()}`,
      `Average volume per keyword: ${Math.round(calculateTotalVolume(validatedKeywords) / validatedKeywords.length).toLocaleString()}`,
      `Highest volume keyword: "${validatedKeywords.sort((a: any, b: any) => b.estimated_volume - a.estimated_volume)[0]?.keyword}" (${validatedKeywords[0]?.estimated_volume?.toLocaleString()})`
    ],
    
    trend_insights: [
      `${trendingKeywords.length} keywords showing rising trends`,
      `${validatedKeywords.filter((k: any) => k.trend_signals?.news_mentions > 0).length} keywords with recent news coverage`,
      `${validatedKeywords.filter((k: any) => k.trend_signals?.video_content > 0).length} keywords with video content opportunities`
    ],
    
    competition_insights: [
      `Average competition score: ${calculateAvgCompetition(validatedKeywords)}/100`,
      `${lowCompetitionKeywords.length} low-competition opportunities`,
      `${validatedKeywords.filter((k: any) => k.content_gaps?.weak_competitors?.length > 0).length} keywords with weak competitors to target`
    ],
    
    content_recommendations: validatedKeywords
      .flatMap((k: any) => k.content_gaps?.content_suggestions || [])
      .slice(0, 5)
  };
}

// Helper functions
function calculateTotalVolume(keywords: any[]): number {
  return keywords.reduce((sum, k) => sum + (k.estimated_volume || 0), 0);
}

function calculateAvgCompetition(keywords: any[]): number {
  if (!keywords.length) return 0;
  return Math.round(keywords.reduce((sum, k) => sum + (k.competition_score || 0), 0) / keywords.length);
}

function countTrendingKeywords(keywords: any[]): number {
  return keywords.filter(k => k.trend_direction === 'rising' || k.trend_score > 60).length;
}

function countContentOpportunities(keywords: any[]): number {
  return keywords.filter(k => k.content_gaps?.opportunity_score > 50).length;
}

// STEP 3: Save Top Keywords to Database
async function saveTopKeywordsToDatabase(
  pipelineId: string,
  input: UnifiedRequest,
  agent1Keywords: any[],
  validatedKeywords: any[]
): Promise<{ keywords_saved: number; table: string; status: string }> {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Calculate overall score for each keyword and rank them
    const rankedKeywords = validatedKeywords.map(keyword => {
      const priorityScore = getPriorityScore(keyword.priority_tier);
      const volumeScore = normalizeVolume(keyword.estimated_volume || 0);
      const trendScore = keyword.trend_score || 0;
      const contentOpportunityScore = keyword.content_gaps?.opportunity_score || 0;

      const overallScore = (
        priorityScore * 0.4 +
        volumeScore * 0.3 +
        trendScore * 0.15 +
        contentOpportunityScore * 0.15
      );

      return {
        ...keyword,
        overall_score: parseFloat(overallScore.toFixed(2))
      };
    });

    // Sort by overall_score descending and take top 20
    rankedKeywords.sort((a, b) => b.overall_score - a.overall_score);
    const topKeywords = rankedKeywords.slice(0, 20);

    // Prepare database records
    const dbRecords = topKeywords.map((keyword, index) => {
      // Find original Agent 1 data
      const agent1Data = agent1Keywords.find(k => k.keyword === keyword.keyword) || {};

      return {
        pipeline_id: pipelineId,
        keyword: keyword.keyword,
        
        // Business context
        business_name: input.business,
        niche: input.niche,
        target_audience: input.target_audience,
        
        // Agent 1 data
        keyword_type: agent1Data.type || keyword.type,
        source: agent1Data.source || keyword.source,
        category: agent1Data.category || keyword.category,
        commercial_intent: agent1Data.commercial_intent || keyword.commercial_intent,
        
        // Agent 2 V3 core metrics
        estimated_volume: keyword.estimated_volume || 0,
        volume_range: getVolumeRange(keyword.estimated_volume || 0),
        competition_score: keyword.competition_score || 0,
        trend_direction: keyword.trend_direction || 'stable',
        trend_score: keyword.trend_score || 0,
        priority_tier: keyword.priority_tier,
        
        // Agent 2 V3 detailed data (JSONB)
        trend_signals: keyword.trend_signals || {},
        content_gaps: keyword.content_gaps || {},
        serp_features: keyword.serp_features || {},
        
        // Content planning
        content_status: 'pending',
        
        // Ranking
        overall_score: keyword.overall_score,
        rank_position: index + 1,
        
        // Metadata
        metadata: {
          agent1_metadata: agent1Data,
          agent2_metadata: keyword,
          saved_at: new Date().toISOString()
        }
      };
    });

    // Insert into database
    const { data, error } = await supabase
      .from('genesis_keywords_vault')
      .insert(dbRecords)
      .select();

    if (error) {
      console.error('Database insertion error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`💾 Successfully saved ${data?.length || 0} keywords to database`);

    return {
      keywords_saved: data?.length || 0,
      table: 'genesis_keywords_vault',
      status: 'success'
    };

  } catch (error) {
    console.error('Error saving to database:', error);
    // Don't fail the entire pipeline if database save fails
    return {
      keywords_saved: 0,
      table: 'genesis_keywords_vault',
      status: `error: ${error.message}`
    };
  }
}

// Helper: Get priority score (0-100)
function getPriorityScore(priority: string): number {
  const scores: Record<string, number> = {
    urgent: 100,
    high: 75,
    medium: 50,
    low: 25
  };
  return scores[priority] || 0;
}

// Helper: Normalize volume to 0-100 scale
function normalizeVolume(volume: number): number {
  if (volume >= 100000) return 100;
  if (volume >= 10000) return 80;
  if (volume >= 1000) return 60;
  if (volume >= 100) return 40;
  return 20;
}

// Helper: Get volume range label
function getVolumeRange(volume: number): string {
  if (volume >= 100000) return '100K+';
  if (volume >= 10000) return '10K-100K';
  if (volume >= 1000) return '1K-10K';
  if (volume >= 100) return '100-1K';
  return '0-100';
}
