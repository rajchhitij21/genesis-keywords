// Agent 2: SEO Validator
// Validates keywords from Agent 1 with sophisticated multi-factor analysis

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { estimateSearchVolume } from './volume-estimator.ts';
import { scoreCompetition } from './competition-scorer.ts';
import { analyzeContentGaps } from './content-gap-analyzer.ts';
import { clusterKeywords } from './keyword-clusterer.ts';
import { calculatePriority } from './priority-scorer.ts';

interface Agent1Keyword {
  keyword: string;
  type: string;
  source: string;
  category?: string;
  commercial_intent?: string;
}

interface Agent2Result {
  success: boolean;
  validated_keywords: any[];
  metadata: {
    input_count: number;
    validated_count: number;
    urgent_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    serper_calls: number;
    serper_cost: number;
    runtime_ms: number;
  };
  clusters: any[];
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
    console.log('🎯 AGENT 2: SEO VALIDATOR STARTED\n');
    console.log('============================================================\n');
    
    // Parse input
    const { keywords } = await req.json();
    
    if (!keywords || !Array.isArray(keywords)) {
      throw new Error('Invalid input: keywords array required');
    }
    
    console.log(`📥 Received ${keywords.length} keywords from Agent 1\n`);
    
    // STEP 1: Validate with Serper (batch processing)
    console.log('🔍 STEP 1: Validating with Serper API...\n');
    const validatedKeywords = await validateKeywords(keywords);
    console.log(`✅ Validated ${validatedKeywords.length} keywords\n`);
    
    // STEP 2: Cluster keywords
    console.log('🔗 STEP 2: Clustering related keywords...\n');
    const clusters = clusterKeywords(validatedKeywords);
    console.log(`✅ Created ${clusters.size} clusters\n`);
    
    // Calculate metadata
    const urgentCount = validatedKeywords.filter(k => k.priority_tier === 'urgent').length;
    const highCount = validatedKeywords.filter(k => k.priority_tier === 'high').length;
    const mediumCount = validatedKeywords.filter(k => k.priority_tier === 'medium').length;
    const lowCount = validatedKeywords.filter(k => k.priority_tier === 'low').length;
    
    const serperCalls = validatedKeywords.length;
    const serperCost = serperCalls * 0.001; // $0.001 per call
    
    const result: Agent2Result = {
      success: true,
      validated_keywords: validatedKeywords,
      metadata: {
        input_count: keywords.length,
        validated_count: validatedKeywords.length,
        urgent_count: urgentCount,
        high_count: highCount,
        medium_count: mediumCount,
        low_count: lowCount,
        serper_calls: serperCalls,
        serper_cost: serperCost,
        runtime_ms: Date.now() - startTime,
      },
      clusters: Array.from(clusters.values()),
    };
    
    console.log('============================================================');
    console.log('✅ AGENT 2 COMPLETE\n');
    console.log('📊 Results:');
    console.log(`   - Validated: ${validatedKeywords.length}`);
    console.log(`   - Urgent: ${urgentCount}`);
    console.log(`   - High: ${highCount}`);
    console.log(`   - Medium: ${mediumCount}`);
    console.log(`   - Low: ${lowCount}`);
    console.log(`   - Clusters: ${clusters.size}`);
    console.log(`⏱️ Runtime: ${result.metadata.runtime_ms}ms`);
    console.log(`💰 Serper Cost: $${serperCost.toFixed(4)}\n`);
    console.log('============================================================\n');
    
    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
      },
    });
    
  } catch (error) {
    console.error('❌ Agent 2 Error:', error.message);
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

// Main validation function with batching
async function validateKeywords(keywords: Agent1Keyword[]): Promise<any[]> {
  const validatedKeywords: any[] = [];
  
  // Process in batches of 10 for parallel processing
  const batchSize = 10;
  const batches: Agent1Keyword[][] = [];
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    batches.push(keywords.slice(i, i + batchSize));
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    console.log(`\n🔄 Processing batch ${batchIndex + 1}/${batches.length}...\n`);
    
    const batch = batches[batchIndex];
    
    // Process batch in parallel
    const batchPromises = batch.map(async (kw) => {
      try {
        const serpData = await fetchSerp(kw.keyword);
        
        // Run all analyzers
        const volumeEstimate = estimateSearchVolume(serpData);
        const competitionScore = scoreCompetition(serpData);
        const contentGap = analyzeContentGaps(serpData, kw.keyword);
        const priority = calculatePriority(
          volumeEstimate,
          competitionScore,
          contentGap,
          undefined // No trend score from Agent 1 yet
        );
        
        return {
          keyword: kw.keyword,
          type: kw.type,
          source: kw.source,
          category: kw.category,
          
          // Volume data
          estimated_volume: volumeEstimate.estimated_volume,
          volume_confidence: volumeEstimate.confidence,
          volume_signals: volumeEstimate.signals,
          
          // Competition data
          competition_score: competitionScore.score,
          competition_difficulty: competitionScore.difficulty,
          competition_factors: competitionScore.factors,
          top_domains: competitionScore.top_domains,
          
          // Content gap data
          content_gaps: {
            missing_topics: contentGap.missing_topics,
            unanswered_questions: contentGap.unanswered_questions,
            opportunity_score: contentGap.opportunity_score,
            content_suggestions: contentGap.content_suggestions,
          },
          
          // Priority data
          priority_score: priority.score,
          priority_tier: priority.tier,
          priority_reasons: priority.reasons,
          
          // SERP data
          related_searches: (serpData.relatedSearches || []).map((s: any) => s.query).slice(0, 5),
          people_also_ask: (serpData.peopleAlsoAsk || []).map((p: any) => p.question).slice(0, 5),
        };
        
      } catch (error) {
        console.error(`   ❌ Failed to validate "${kw.keyword}":`, error.message);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const result of batchResults) {
      if (result) {
        validatedKeywords.push(result);
        console.log(`   ✓ ${result.keyword}: ${result.priority_tier} priority (${result.priority_score}/100)`);
      }
    }
    
    // Small delay between batches
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return validatedKeywords;
}

// Serper API call with multi-key rotation
const SERPER_KEYS = ['SERPER_KEY_1', 'SERPER_KEY_2', 'SERPER_KEY_3', 'SERPER_KEY_4', 'SERPER_KEY_5', 'SERPER_KEY_6', 'SERPER_KEY_7'];
let currentKeyIndex = 0;

async function fetchSerp(keyword: string): Promise<any> {
  const maxRetries = SERPER_KEYS.length;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const keyName = SERPER_KEYS[currentKeyIndex];
    const apiKey = Deno.env.get(keyName);
    
    if (!apiKey) {
      currentKeyIndex = (currentKeyIndex + 1) % SERPER_KEYS.length;
      continue;
    }
    
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: keyword,
          gl: 'us',
          hl: 'en',
          num: 10
        })
      });
      
      if (response.status === 429) {
        currentKeyIndex = (currentKeyIndex + 1) % SERPER_KEYS.length;
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      currentKeyIndex = (currentKeyIndex + 1) % SERPER_KEYS.length;
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
  
  throw new Error(`All Serper keys exhausted for keyword: ${keyword}`);
}