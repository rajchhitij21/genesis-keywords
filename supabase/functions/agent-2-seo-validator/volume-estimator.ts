// Multi-factor search volume estimator for Agent 2
// Uses SERP signals to estimate monthly search volume

export interface VolumeEstimate {
  estimated_volume: number;
  confidence: 'high' | 'medium' | 'low';
  signals: {
    ads_count: number;
    related_searches_count: number;
    serp_features_count: number;
    has_knowledge_panel: boolean;
    has_featured_snippet: boolean;
  };
}

export function estimateSearchVolume(serpData: any): VolumeEstimate {
  // Extract signals from SERP data
  const adsCount = (serpData.ads || []).length;
  const relatedSearchesCount = (serpData.relatedSearches || []).length;
  const organicResults = serpData.organic || [];
  
  // Detect SERP features
  const hasKnowledgePanel = !!serpData.knowledgeGraph;
  const hasFeaturedSnippet = organicResults.some((r: any) => r.snippet_highlighted_words?.length > 0);
  
  // Count unique SERP features
  const serpFeaturesCount = [
    hasKnowledgePanel,
    hasFeaturedSnippet,
    adsCount > 0,
    relatedSearchesCount > 0,
    serpData.peopleAlsoAsk?.length > 0,
  ].filter(Boolean).length;
  
  // Volume estimation formula
  let estimatedVolume = 0;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  // Base estimate from ads (strong signal)
  if (adsCount >= 4) {
    estimatedVolume = 5000; // High competition = high volume
    confidence = 'high';
  } else if (adsCount >= 2) {
    estimatedVolume = 2000; // Medium competition
    confidence = 'medium';
  } else if (adsCount === 1) {
    estimatedVolume = 1000; // Low competition
    confidence = 'medium';
  } else {
    estimatedVolume = 500; // No ads = niche or low volume
    confidence = 'low';
  }
  
  // Boost for related searches (indicates demand)
  if (relatedSearchesCount >= 8) {
    estimatedVolume *= 1.5;
    confidence = confidence === 'low' ? 'medium' : 'high';
  } else if (relatedSearchesCount >= 4) {
    estimatedVolume *= 1.2;
  }
  
  // Boost for SERP features (indicates Google's interest)
  if (serpFeaturesCount >= 4) {
    estimatedVolume *= 1.3;
    confidence = 'high';
  } else if (serpFeaturesCount >= 2) {
    estimatedVolume *= 1.1;
  }
  
  // Boost for knowledge panel (indicates established topic)
  if (hasKnowledgePanel) {
    estimatedVolume *= 1.2;
  }
  
  // Round to nearest 100
  estimatedVolume = Math.round(estimatedVolume / 100) * 100;
  
  // Cap at reasonable limits
  estimatedVolume = Math.min(estimatedVolume, 50000); // Max 50k
  estimatedVolume = Math.max(estimatedVolume, 100); // Min 100
  
  return {
    estimated_volume: estimatedVolume,
    confidence,
    signals: {
      ads_count: adsCount,
      related_searches_count: relatedSearchesCount,
      serp_features_count: serpFeaturesCount,
      has_knowledge_panel: hasKnowledgePanel,
      has_featured_snippet: hasFeaturedSnippet,
    },
  };
}