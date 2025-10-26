/**
 * Serper API Validator
 * Validates keywords with real search volume and SERP data
 */

interface ValidationResult {
  keyword: string;
  search_volume: number;
  trend_score: number;
  competition_score: number;
  commercial_intent: 'high' | 'medium' | 'low';
  serp_features: string[];
  related_searches: string[];
}

export async function validateWithSerper(
  keywords: string[],
  serperApiKey: string
): Promise<Map<string, ValidationResult>> {
  console.log('\n📊 VALIDATING WITH SERPER API\n');
  console.log(`Processing ${keywords.length} keywords...\n`);
  
  const results = new Map<string, ValidationResult>();
  
  
  // Process in parallel batches for speed
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    batches.push(keywords.slice(i, i + batchSize));
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    // Process batch in parallel
    const batchPromises = batch.map(async (keyword) => {
      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: keyword,
            gl: 'us',
            hl: 'en',
            num: 10
          })
        });
        
        if (!response.ok) {
          return null;
        }
        
        const data = await response.json();
        
        const searchVolume = estimateSearchVolume(data);
        const trendScore = calculateTrendScore(data, searchVolume);
        const competitionScore = calculateCompetition(data);
        const commercialIntent = detectCommercialIntent(keyword, data);
        const serpFeatures = extractSerpFeatures(data);
        const relatedSearches = data.relatedSearches?.map((s: any) => s.query).slice(0, 5) || [];
        
        return {
          keyword,
          result: {
            keyword,
            search_volume: searchVolume,
            trend_score: trendScore,
            competition_score: competitionScore,
            commercial_intent: commercialIntent,
            serp_features: serpFeatures,
            related_searches: relatedSearches
          }
        };
      } catch (error) {
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const item of batchResults) {
      if (item) {
        results.set(item.keyword, item.result);
        console.log(`  ✓ ${item.keyword}: score ${item.result.trend_score}, volume ${item.result.search_volume}, intent ${item.result.commercial_intent}`);
      }
    }
    
    // Small delay between batches only
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n✅ Validated ${results.size} keywords\n`);
  return results;
}

function estimateSearchVolume(serpData: any): number {
  // Estimate based on SERP signals
  const organicResults = serpData.organic?.length || 0;
  const knowledgeGraph = serpData.knowledgeGraph ? 1 : 0;
  const news = serpData.news?.length || 0;
  const relatedSearches = serpData.relatedSearches?.length || 0;
  
  // More SERP features = higher search volume
  let estimate = 1000; // Base estimate
  
  if (organicResults >= 10) estimate += 5000;
  if (knowledgeGraph) estimate += 10000;
  if (news > 0) estimate += news * 2000;
  if (relatedSearches > 5) estimate += relatedSearches * 500;
  
  // Check if there are ads (strong commercial signal)
  if (serpData.ads && serpData.ads.length > 0) {
    estimate += serpData.ads.length * 3000;
  }
  
  return Math.min(estimate, 100000); // Cap at 100k
}

function calculateTrendScore(serpData: any, searchVolume: number): number {
  let score = 0;
  
  // Volume contribution (0-40 points)
  if (searchVolume > 50000) score += 40;
  else if (searchVolume > 20000) score += 30;
  else if (searchVolume > 10000) score += 20;
  else if (searchVolume > 5000) score += 10;
  
  // News/freshness contribution (0-30 points)
  if (serpData.news && serpData.news.length > 0) {
    score += Math.min(serpData.news.length * 10, 30);
  }
  
  // SERP features contribution (0-20 points)
  const features = extractSerpFeatures(serpData);
  score += Math.min(features.length * 5, 20);
  
  // Related searches contribution (0-10 points)
  const relatedCount = serpData.relatedSearches?.length || 0;
  score += Math.min(relatedCount, 10);
  
  return Math.min(score, 100);
}

function calculateCompetition(serpData: any): number {
  let competition = 0;
  
  // Check for ads (high competition)
  if (serpData.ads && serpData.ads.length > 0) {
    competition += serpData.ads.length * 15;
  }
  
  // Check domain authority of top results
  const topDomains = serpData.organic?.slice(0, 3) || [];
  const highAuthDomains = ['wikipedia.org', 'amazon.com', 'youtube.com', 'linkedin.com'];
  
  for (const result of topDomains) {
    const domain = result.link?.split('/')[2] || '';
    if (highAuthDomains.some(d => domain.includes(d))) {
      competition += 20;
    }
  }
  
  return Math.min(competition, 100);
}

function detectCommercialIntent(keyword: string, serpData: any): 'high' | 'medium' | 'low' {
  const keywordLower = keyword.toLowerCase();
  
  // High intent keywords
  const highIntentWords = ['buy', 'price', 'cost', 'purchase', 'deal', 'discount', 'review', 'best', 'top', 'vs'];
  const hasHighIntent = highIntentWords.some(word => keywordLower.includes(word));
  
  // Check for ads (strong commercial signal)
  const hasAds = serpData.ads && serpData.ads.length > 0;
  
  // Check for shopping results
  const hasShopping = serpData.shopping && serpData.shopping.length > 0;
  
  if (hasHighIntent || hasAds || hasShopping) {
    return 'high';
  }
  
  // Medium intent
  const mediumIntentWords = ['how to', 'tutorial', 'guide', 'tips', 'learn', 'comparison'];
  const hasMediumIntent = mediumIntentWords.some(word => keywordLower.includes(word));
  
  if (hasMediumIntent) {
    return 'medium';
  }
  
  return 'low';
}

function extractSerpFeatures(serpData: any): string[] {
  const features: string[] = [];
  
  if (serpData.knowledgeGraph) features.push('knowledge_graph');
  if (serpData.answerBox) features.push('answer_box');
  if (serpData.news && serpData.news.length > 0) features.push('news');
  if (serpData.videos && serpData.videos.length > 0) features.push('videos');
  if (serpData.relatedSearches && serpData.relatedSearches.length > 0) features.push('related_searches');
  if (serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0) features.push('people_also_ask');
  if (serpData.shopping && serpData.shopping.length > 0) features.push('shopping');
  if (serpData.ads && serpData.ads.length > 0) features.push('ads');
  
  return features;
}

export function filterValidatedKeywords(
  validationMap: Map<string, ValidationResult>,
  minScore: number = 30
): ValidationResult[] {
  return Array.from(validationMap.values())
    .filter(result => result.trend_score >= minScore)
    .sort((a, b) => b.trend_score - a.trend_score);
}
