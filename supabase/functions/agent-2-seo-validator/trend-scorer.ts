// Enhanced trend scoring module for Agent 2 V3
// Multi-signal trend analysis with sophisticated temporal patterns

export interface TrendScore {
  score: number; // 0-100
  direction: 'rising' | 'stable' | 'declining';
  confidence: 'high' | 'medium' | 'low';
  signals: {
    news_mentions: number;
    video_content: number;
    fresh_content_count: number;
    seasonal_pattern: boolean;
    year_suffix_detected: boolean;
    trending_keywords_count: number;
    serp_freshness_score: number;
  };
  breakdown: {
    base_score: number;
    news_boost: number;
    video_boost: number;
    freshness_boost: number;
    seasonal_boost: number;
    year_suffix_penalty: number;
  };
}

export function scoreTrend(serpData: any, keyword: string): TrendScore {
  console.log(`📈 Analyzing trend for: "${keyword}"`);
  
  let baseScore = 40; // Start slightly below neutral to be realistic
  let newsBoost = 0;
  let videoBoost = 0;
  let freshnessBoost = 0;
  let seasonalBoost = 0;
  let yearSuffixPenalty = 0;
  
  // SIGNAL 1: News Presence (STRONGEST trend indicator)
  const newsCount = (serpData.news || []).length;
  if (newsCount >= 6) {
    newsBoost = 35; // Major news coverage = TRENDING
  } else if (newsCount >= 4) {
    newsBoost = 25; // Good news coverage
  } else if (newsCount >= 2) {
    newsBoost = 15; // Some news coverage
  } else if (newsCount >= 1) {
    newsBoost = 8; // Minimal news
  }
  
  // SIGNAL 2: Video Content (Popular/Viral indicator)
  const videoCount = (serpData.videos || []).length;
  if (videoCount >= 5) {
    videoBoost = 20; // Video carousel = viral potential
  } else if (videoCount >= 3) {
    videoBoost = 15;
  } else if (videoCount >= 1) {
    videoBoost = 8;
  }
  
  // SIGNAL 3: Content Freshness Detection (Multi-layer analysis)
  const organicResults = serpData.organic || [];
  
  // Look for freshness indicators in URLs, titles, dates
  const freshContentIndicators = organicResults.filter((r: any) => {
    const url = (r.link || '').toLowerCase();
    const title = (r.title || '').toLowerCase();
    const snippet = (r.snippet || '').toLowerCase();
    const dateText = (r.date || '').toLowerCase();
    
    // Recent date indicators
    const hasRecentDate = dateText.includes('hour') || dateText.includes('day') || 
                         dateText.includes('2024') || dateText.includes('2025');
    
    // Fresh content keywords in title/snippet
    const freshKeywords = ['updated', 'new', 'latest', '2024', '2025', 'recent'];
    const hasFreshKeywords = freshKeywords.some(kw => title.includes(kw) || snippet.includes(kw));
    
    // URL patterns indicating fresh content
    const hasFreshURL = url.includes('2024') || url.includes('2025') || url.includes('latest');
    
    return hasRecentDate || hasFreshKeywords || hasFreshURL;
  });
  
  const freshContentCount = freshContentIndicators.length;
  if (freshContentCount >= 5) {
    freshnessBoost = 18; // Very fresh SERP
  } else if (freshContentCount >= 3) {
    freshnessBoost = 12;
  } else if (freshContentCount >= 1) {
    freshnessBoost = 6;
  }
  
  // Calculate SERP Freshness Score (0-100)
  const serpFreshnessScore = Math.round((freshContentCount / Math.max(organicResults.length, 1)) * 100);
  
  // SIGNAL 4: Seasonal/Trending Keywords Analysis
  const trendingTerms = ['trending', 'viral', 'hot', 'popular', 'best', 'top', 'new', 'latest'];
  const trendingKeywordsCount = trendingTerms.filter(term => keyword.toLowerCase().includes(term)).length;
  
  if (trendingKeywordsCount >= 2) {
    seasonalBoost = 12; // Multiple trending terms
  } else if (trendingKeywordsCount >= 1) {
    seasonalBoost = 8; // One trending term
  }
  
  // SIGNAL 5: Year Suffix Analysis (2024, 2025, etc.)
  const yearSuffixMatch = keyword.match(/202[4-9]|203[0-9]/);
  const yearSuffixDetected = !!yearSuffixMatch;
  
  if (yearSuffixDetected) {
    yearSuffixPenalty = -8; // Future trend = lower current volume but high potential
  }
  
  // Calculate final trend score
  const finalScore = Math.max(0, Math.min(100, 
    baseScore + newsBoost + videoBoost + freshnessBoost + seasonalBoost + yearSuffixPenalty
  ));
  
  // Determine direction
  let direction: 'rising' | 'stable' | 'declining' = 'stable';
  
  if (finalScore >= 70 && (newsCount >= 3 || videoCount >= 3)) {
    direction = 'rising';
  } else if (finalScore <= 30 && newsCount === 0 && freshContentCount <= 1) {
    direction = 'declining';
  }
  
  // Calculate confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  const strongSignals = (newsCount >= 3 ? 1 : 0) + (videoCount >= 3 ? 1 : 0) + (freshContentCount >= 3 ? 1 : 0);
  
  if (strongSignals >= 2) {
    confidence = 'high';
  } else if (strongSignals >= 1 || (newsCount >= 1 && freshContentCount >= 2)) {
    confidence = 'medium';
  }
  
  console.log(`   📊 Trend score: ${finalScore} (${direction}, ${confidence} confidence)`);
  
  return {
    score: finalScore,
    direction,
    confidence,
    signals: {
      news_mentions: newsCount,
      video_content: videoCount,
      fresh_content_count: freshContentCount,
      seasonal_pattern: trendingKeywordsCount > 0,
      year_suffix_detected: yearSuffixDetected,
      trending_keywords_count: trendingKeywordsCount,
      serp_freshness_score: serpFreshnessScore,
    },
    breakdown: {
      base_score: baseScore,
      news_boost: newsBoost,
      video_boost: videoBoost,
      freshness_boost: freshnessBoost,
      seasonal_boost: seasonalBoost,
      year_suffix_penalty: yearSuffixPenalty
    }
  };
}