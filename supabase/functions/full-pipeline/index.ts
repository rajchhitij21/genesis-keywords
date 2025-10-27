// Full Pipeline: Agent 1 (Trend Hunter) → Agent 2 (SEO Validator)
// Complete keyword discovery and validation flow

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface PipelineResult {
  success: boolean;
  agent1_result?: any;
  agent2_result?: any;
  final_keywords: any[];
  metadata: {
    agent1_runtime_ms: number;
    agent2_runtime_ms: number;
    total_runtime_ms: number;
    agent1_keywords_count: number;
    agent2_validated_count: number;
    total_gemini_cost: number;
    total_serper_cost: number;
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

  const startTime = Date.now();
  
  try {
    console.log('🚀 FULL PIPELINE STARTED\n');
    console.log('============================================================\n');
    
    // ============================================
    // STAGE 1: RUN AGENT 1 (TREND HUNTER)
    // ============================================
    console.log('📈 STAGE 1: Running Agent 1 (Trend Hunter)...\n');
    const agent1StartTime = Date.now();
    
    const agent1Response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/agent-1-trend-hunter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
    });
    
    if (!agent1Response.ok) {
      throw new Error(`Agent 1 failed: ${agent1Response.status}`);
    }
    
    const agent1Result = await agent1Response.json();
    
    if (!agent1Result.success) {
      throw new Error(`Agent 1 failed: ${agent1Result.error || 'Unknown error'}`);
    }
    
    const agent1RuntimeMs = Date.now() - agent1StartTime;
    
    console.log('✅ Agent 1 Complete!');
    console.log(`   - Generated: ${agent1Result.metadata.total_keywords} keywords`);
    console.log(`   - Runtime: ${(agent1RuntimeMs / 1000).toFixed(2)}s`);
    console.log(`   - Cost: $${agent1Result.metadata.gemini_cost.toFixed(4)}\n`);
    
    // ============================================
    // STAGE 2: RUN AGENT 2 (SEO VALIDATOR)
    // ============================================
    console.log('🎯 STAGE 2: Running Agent 2 (SEO Validator)...\n');
    const agent2StartTime = Date.now();
    
    // Pass Agent 1 keywords to Agent 2
    const agent2Response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/agent-2-seo-validator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        keywords: agent1Result.keywords
      }),
    });
    
    if (!agent2Response.ok) {
      throw new Error(`Agent 2 failed: ${agent2Response.status}`);
    }
    
    const agent2Result = await agent2Response.json();
    
    if (!agent2Result.success) {
      throw new Error(`Agent 2 failed: ${agent2Result.error || 'Unknown error'}`);
    }
    
    const agent2RuntimeMs = Date.now() - agent2StartTime;
    
    console.log('✅ Agent 2 Complete!');
    console.log(`   - Validated: ${agent2Result.metadata.validated_count} keywords`);
    console.log(`   - Urgent: ${agent2Result.metadata.urgent_count}`);
    console.log(`   - High: ${agent2Result.metadata.high_count}`);
    console.log(`   - Medium: ${agent2Result.metadata.medium_count}`);
    console.log(`   - Low: ${agent2Result.metadata.low_count}`);
    console.log(`   - Runtime: ${(agent2RuntimeMs / 1000).toFixed(2)}s`);
    console.log(`   - Cost: $${agent2Result.metadata.serper_cost.toFixed(4)}\n`);
    
    // ============================================
    // FINAL RESULTS
    // ============================================
    const totalRuntimeMs = Date.now() - startTime;
    const totalGeminiCost = agent1Result.metadata.gemini_cost;
    const totalSerperCost = agent2Result.metadata.serper_cost;
    const totalCost = totalGeminiCost + totalSerperCost;
    
    const result: PipelineResult = {
      success: true,
      agent1_result: agent1Result,
      agent2_result: agent2Result,
      final_keywords: agent2Result.validated_keywords,
      metadata: {
        agent1_runtime_ms: agent1RuntimeMs,
        agent2_runtime_ms: agent2RuntimeMs,
        total_runtime_ms: totalRuntimeMs,
        agent1_keywords_count: agent1Result.metadata.total_keywords,
        agent2_validated_count: agent2Result.metadata.validated_count,
        total_gemini_cost: totalGeminiCost,
        total_serper_cost: totalSerperCost,
        total_cost: totalCost,
      },
    };
    
    console.log('============================================================');
    console.log('✅ FULL PIPELINE COMPLETE\n');
    console.log('📊 Final Results:');
    console.log(`   - Agent 1 Keywords: ${result.metadata.agent1_keywords_count}`);
    console.log(`   - Agent 2 Validated: ${result.metadata.agent2_validated_count}`);
    console.log(`   - Validation Rate: ${((result.metadata.agent2_validated_count / result.metadata.agent1_keywords_count) * 100).toFixed(1)}%`);
    console.log(`\n⏱️ Total Runtime: ${(totalRuntimeMs / 1000).toFixed(2)}s`);
    console.log(`   - Agent 1: ${(agent1RuntimeMs / 1000).toFixed(2)}s`);
    console.log(`   - Agent 2: ${(agent2RuntimeMs / 1000).toFixed(2)}s`);
    console.log(`\n💰 Total Cost: $${totalCost.toFixed(4)}`);
    console.log(`   - Gemini: $${totalGeminiCost.toFixed(4)}`);
    console.log(`   - Serper: $${totalSerperCost.toFixed(4)}`);
    console.log('\n============================================================\n');
    
    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
      },
    });
    
  } catch (error) {
    console.error('❌ Pipeline Error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
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