// Enhanced 6-signal search volume estimator for Agent 2 V3
// Uses sophisticated SERP analysis to estimate monthly search volume

export interface VolumeEstimate {
  estimated_volume: number;
  confidence: 'high' | 'medium' | 'low';
  signals: {
    ads_count: number;
    related_searches_count: number;
    serp_features_count: number;
    has_knowledge_panel: boolean;
    has_featured_snippet: boolean;
    has_videos: boolean;
    has_news: boolean;
    has_shopping: boolean;
    keyword_length: number;
    commercial_words: number;
    has_year_suffix: boolean;
  };
  breakdown: {
    base_volume: number;
    ads_multiplier: number;
    related_multiplier: number;
    features_multiplier: number;
    length_multiplier: number;
    commercial_multiplier: number;
    year_multiplier: number;
  };
}

export function estimateSearchVolume(serpData: any, keyword: string): VolumeEstimate {
  console.log(`📊 Analyzing volume for: "${keyword}"`);
  
  // Extract all signals from SERP data
  const adsCount = (serpData.ads || []).length;
  const relatedSearchesCount = (serpData.relatedSearches || []).length;
  const organicResults = serpData.organic || [];
  
  // SERP Features Detection
  const hasKnowledgePanel = !!serpData.knowledgeGraph;
  const hasFeaturedSnippet = organicResults.some((r: any) => r.snippet_highlighted_words?.length > 0) || !!serpData.answerBox;
  const hasVideos = !!(serpData.videos && serpData.videos.length > 0);
  const hasNews = !!(serpData.news && serpData.news.length > 0);
  const hasShopping = !!(serpData.shopping && serpData.shopping.length > 0);
  
  const serpFeaturesCount = [
    hasKnowledgePanel,
    hasFeaturedSnippet,
    hasVideos,
    hasNews,
    hasShopping,
    adsCount > 0,
    relatedSearchesCount > 0,
    serpData.peopleAlsoAsk?.length > 0,
  ].filter(Boolean).length;
  
  // Keyword Analysis
  const keywordLength = keyword.split(' ').length;
  const commercialWords = ['best', 'top', 'review', 'vs', 'alternative', 'price', 'cheap', 'buy', 'discount', 'tools'];
  const commercialWordsCount = commercialWords.filter(word => keyword.toLowerCase().includes(word)).length;
  const hasYearSuffix = /202[4-9]|203[0-9]/.test(keyword);
  
  // SIGNAL 1: Base Volume from Ads (YOUR EXACT LOGIC)
  let baseVolume = 800; // Default for educational/niche topics
  
  if (adsCount >= 4) {
    baseVolume = 18000; // "insurance", "credit card" - reduced from 25000
  } else if (adsCount === 3) {
    baseVolume = 12000; // "best laptops" - reduced from 15000
  } else if (adsCount === 2) {
    baseVolume = 6000; // "python tutorial" - reduced from 8000
  } else if (adsCount === 1) {
    baseVolume = 3000; // "ai automation tools" - reduced from 4000
  } else {
    baseVolume = 800; // "how does photosynthesis work" - reduced from 1500
  }
  
  let finalVolume = baseVolume;
  
  // SIGNAL 2: Related Searches Multiplier
  let relatedMultiplier = 1.0;
  if (relatedSearchesCount >= 8) {
    relatedMultiplier = 1.5; // MANY related = MORE volume
  } else if (relatedSearchesCount >= 5) {
    relatedMultiplier = 1.3;
  } else if (relatedSearchesCount >= 3) {
    relatedMultiplier = 1.1;
  }
  finalVolume *= relatedMultiplier;
  
  // SIGNAL 3: SERP Features Multiplier (Additive approach to avoid aggressive compounding)
  let featuresBoost = 0;
  if (hasKnowledgePanel) featuresBoost += 0.3; // Google built Knowledge Graph = BIG keyword
  if (hasFeaturedSnippet) featuresBoost += 0.2; // Direct answer = HIGH volume
  if (hasShopping) featuresBoost += 0.2; // Shopping = commercial = MORE volume
  if (hasVideos) featuresBoost += 0.15; // Video carousel = popular
  if (hasNews) featuresBoost += 0.15; // News = trending
  
  const featuresMultiplier = 1.0 + featuresBoost;
  finalVolume *= featuresMultiplier;
  
  // SIGNAL 4: Keyword Length Multiplier
  let lengthMultiplier = 1.0;
  if (keywordLength <= 2) {
    lengthMultiplier = 1.3; // "AI tools" = HIGH volume
  } else if (keywordLength >= 4) {
    lengthMultiplier = 0.7; // "best AI automation tools for small businesses" = LOW volume
  }
  finalVolume *= lengthMultiplier;
  
  // SIGNAL 5: Commercial Words Multiplier
  let commercialMultiplier = 1.0;
  if (commercialWordsCount > 0) {
    commercialMultiplier = 1.4; // Buying intent = MORE searches
  }
  finalVolume *= commercialMultiplier;
  
  // SIGNAL 6: Year Suffix Multiplier
  let yearMultiplier = 1.0;
  if (hasYearSuffix) {
    yearMultiplier = 0.8; // New trend = LOW volume NOW, but growing
  }
  finalVolume *= yearMultiplier;
  
  // Final calculations
  finalVolume = Math.round(finalVolume / 100) * 100; // Round to nearest 100
  finalVolume = Math.max(100, Math.min(200000, finalVolume)); // Reality check: 100-200K
  
  // Confidence calculation
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  if (adsCount >= 3 && relatedSearchesCount >= 5 && serpFeaturesCount >= 3) {
    confidence = 'high';
  } else if (adsCount >= 2 || (relatedSearchesCount >= 4 && serpFeaturesCount >= 2)) {
    confidence = 'medium';
  }
  
  console.log(`   📈 Estimated volume: ${finalVolume} (${confidence} confidence)`);
  
  return {
    estimated_volume: finalVolume,
    confidence,
    signals: {
      ads_count: adsCount,
      related_searches_count: relatedSearchesCount,
      serp_features_count: serpFeaturesCount,
      has_knowledge_panel: hasKnowledgePanel,
      has_featured_snippet: hasFeaturedSnippet,
      has_videos: hasVideos,
      has_news: hasNews,
      has_shopping: hasShopping,
      keyword_length: keywordLength,
      commercial_words: commercialWordsCount,
      has_year_suffix: hasYearSuffix
    },
    breakdown: {
      base_volume: baseVolume,
      ads_multiplier: 1, // Base from ads
      related_multiplier: relatedMultiplier,
      features_multiplier: featuresMultiplier,
      length_multiplier: lengthMultiplier,
      commercial_multiplier: commercialMultiplier,
      year_multiplier: yearMultiplier
    }
  };
}
