// Agent 2: SEO Validator - Consolidated
// All modules inlined to avoid Supabase Edge Function deployment issues

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

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

interface VolumeEstimate {
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

interface CompetitionScore {
  score: number;
  difficulty: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  factors: {
    ads_density: number;
    domain_authority: number;
    content_freshness: number;
    serp_complexity: number;
  };
  top_domains: string[];
}

interface ContentGap {
  missing_topics: string[];
  unanswered_questions: string[];
  opportunity_score: number;
  content_suggestions: string[];
  weak_competitors: {
    domain: string;
    authority_score: number;
    snippet_quality: 'weak' | 'medium' | 'strong';
    content_length: number;
    opportunity_reason: string;
  }[];
  paa_analysis: {
    total_questions: number;
    answered_questions: number;
    gap_percentage: number;
    high_priority_gaps: string[];
  };
  content_gaps_breakdown: {
    tutorial_gap: boolean;
    comparison_gap: boolean;
    pricing_gap: boolean;
    examples_gap: boolean;
    benefits_gap: boolean;
    problems_gap: boolean;
  };
}

interface TrendScore {
  score: number;
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

interface PriorityScore {
  score: number;
  tier: 'urgent' | 'high' | 'medium' | 'low';
  reasons: string[];
}

interface KeywordCluster {
  cluster_id: string;
  primary_keyword: string;
  related_keywords: string[];
  cluster_theme: string;
}

// ============================================================
// VOLUME ESTIMATOR
// ============================================================

function estimateSearchVolume(serpData: any, keyword: string): VolumeEstimate {
  console.log(`📊 Analyzing volume for: "${keyword}"`);
  
  const adsCount = (serpData.ads || []).length;
  const relatedSearchesCount = (serpData.relatedSearches || []).length;
  const organicResults = serpData.organic || [];
  
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
  
  const keywordLength = keyword.split(' ').length;
  const commercialWords = ['best', 'top', 'review', 'vs', 'alternative', 'price', 'cheap', 'buy', 'discount', 'tools'];
  const commercialWordsCount = commercialWords.filter(word => keyword.toLowerCase().includes(word)).length;
  const hasYearSuffix = /202[4-9]|203[0-9]/.test(keyword);
  
  let baseVolume = 800;
  
  if (adsCount >= 4) {
    baseVolume = 18000;
  } else if (adsCount === 3) {
    baseVolume = 12000;
  } else if (adsCount === 2) {
    baseVolume = 6000;
  } else if (adsCount === 1) {
    baseVolume = 3000;
  } else {
    baseVolume = 800;
  }
  
  let finalVolume = baseVolume;
  
  let relatedMultiplier = 1.0;
  if (relatedSearchesCount >= 8) {
    relatedMultiplier = 1.5;
  } else if (relatedSearchesCount >= 5) {
    relatedMultiplier = 1.3;
  } else if (relatedSearchesCount >= 3) {
    relatedMultiplier = 1.1;
  }
  finalVolume *= relatedMultiplier;
  
  let featuresBoost = 0;
  if (hasKnowledgePanel) featuresBoost += 0.3;
  if (hasFeaturedSnippet) featuresBoost += 0.2;
  if (hasShopping) featuresBoost += 0.2;
  if (hasVideos) featuresBoost += 0.15;
  if (hasNews) featuresBoost += 0.15;
  
  const featuresMultiplier = 1.0 + featuresBoost;
  finalVolume *= featuresMultiplier;
  
  let lengthMultiplier = 1.0;
  if (keywordLength <= 2) {
    lengthMultiplier = 1.3;
  } else if (keywordLength >= 4) {
    lengthMultiplier = 0.7;
  }
  finalVolume *= lengthMultiplier;
  
  let commercialMultiplier = 1.0;
  if (commercialWordsCount > 0) {
    commercialMultiplier = 1.4;
  }
  finalVolume *= commercialMultiplier;
  
  let yearMultiplier = 1.0;
  if (hasYearSuffix) {
    yearMultiplier = 0.8;
  }
  finalVolume *= yearMultiplier;
  
  finalVolume = Math.round(finalVolume / 100) * 100;
  finalVolume = Math.max(100, Math.min(200000, finalVolume));
  
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
      ads_multiplier: 1,
      related_multiplier: relatedMultiplier,
      features_multiplier: featuresMultiplier,
      length_multiplier: lengthMultiplier,
      commercial_multiplier: commercialMultiplier,
      year_multiplier: yearMultiplier
    }
  };
}

// ============================================================
// COMPETITION SCORER
// ============================================================

const HIGH_AUTHORITY_DOMAINS = [
  'wikipedia.org', 'youtube.com', 'amazon.com', 'reddit.com',
  'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
  'forbes.com', 'nytimes.com', 'wsj.com', 'bbc.com', 'cnn.com',
  'medium.com', 'quora.com', 'stackoverflow.com', 'github.com',
];

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.split('/')[0] || 'unknown';
  }
}

function scoreCompetition(serpData: any): CompetitionScore {
  const organicResults = serpData.organic || [];
  const ads = serpData.ads || [];
  
  const adsDensity = Math.min((ads.length / 4) * 100, 100);
  
  const topDomains = organicResults
    .slice(0, 10)
    .map((r: any) => extractDomain(r.link))
    .filter(Boolean);
  
  const authorityDomainCount = topDomains.filter((domain: string) =>
    HIGH_AUTHORITY_DOMAINS.some(authDomain => domain.includes(authDomain))
  ).length;
  
  const domainAuthority = (authorityDomainCount / 10) * 100;
  
  const resultsWithDates = organicResults.filter((r: any) => r.date);
  const recentResults = resultsWithDates.filter((r: any) => {
    if (!r.date) return false;
    const dateStr = r.date.toLowerCase();
    return dateStr.includes('hour') || dateStr.includes('day') || dateStr.includes('week');
  });
  
  const contentFreshness = resultsWithDates.length > 0
    ? (recentResults.length / resultsWithDates.length) * 100
    : 50;
  
  const serpFeatures = [
    serpData.knowledgeGraph ? 20 : 0,
    (serpData.peopleAlsoAsk?.length || 0) > 0 ? 20 : 0,
    (serpData.relatedSearches?.length || 0) > 5 ? 20 : 0,
    ads.length > 0 ? 20 : 0,
    organicResults.some((r: any) => r.snippet_highlighted_words?.length > 0) ? 20 : 0,
  ];
  
  const serpComplexity = serpFeatures.reduce((sum, val) => sum + val, 0);
  
  const score = Math.round(
    (adsDensity * 0.3) +
    (domainAuthority * 0.35) +
    (contentFreshness * 0.15) +
    (serpComplexity * 0.2)
  );
  
  let difficulty: CompetitionScore['difficulty'];
  if (score >= 80) difficulty = 'very_hard';
  else if (score >= 60) difficulty = 'hard';
  else if (score >= 40) difficulty = 'medium';
  else if (score >= 20) difficulty = 'easy';
  else difficulty = 'very_easy';
  
  return {
    score,
    difficulty,
    factors: {
      ads_density: Math.round(adsDensity),
      domain_authority: Math.round(domainAuthority),
      content_freshness: Math.round(contentFreshness),
      serp_complexity: Math.round(serpComplexity),
    },
    top_domains: topDomains.slice(0, 10),
  };
}

// ============================================================
// CONTENT GAP ANALYZER
// ============================================================

function extractTopics(text: string): string[] {
  const topics: string[] = [];
  const topicKeywords = [
    'guide', 'tutorial', 'how to', 'best', 'top',
    'review', 'comparison', 'vs', 'versus',
    'tips', 'tricks', 'examples', 'tools',
    'benefits', 'advantages', 'pros', 'cons',
  ];
  
  topicKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      topics.push(keyword);
    }
  });
  
  return topics;
}

function hasTopicOverlap(query: string, existingTopics: string[]): boolean {
  const queryWords = query.split(' ').filter(w => w.length > 3);
  const overlapCount = queryWords.filter(word =>
    existingTopics.some(topic => topic.includes(word))
  ).length;
  
  return (overlapCount / queryWords.length) > 0.3;
}

function isHighValueQuestion(question: string): boolean {
  const highValueIndicators = ['how', 'what', 'why', 'best', 'vs', 'cost', 'price', 'benefit', 'work'];
  return highValueIndicators.some(indicator => question.toLowerCase().includes(indicator));
}

function calculateDomainAuthority(domain: string, position: number): number {
  const highAuthDomains = ['wikipedia.org', 'youtube.com', 'amazon.com', 'reddit.com', 'stackoverflow.com', 'github.com'];
  const mediumAuthDomains = ['medium.com', 'quora.com', 'hubspot.com', 'techcrunch.com', 'forbes.com'];
  
  let baseScore = Math.max(100 - (position * 8), 20);
  
  if (highAuthDomains.includes(domain)) baseScore += 30;
  else if (mediumAuthDomains.includes(domain)) baseScore += 15;
  else if (domain.includes('.edu') || domain.includes('.gov')) baseScore += 25;
  
  return Math.min(baseScore, 100);
}

function analyzeSnippetQuality(snippet: string, title: string): 'weak' | 'medium' | 'strong' {
  const content = `${snippet} ${title}`;
  const wordCount = content.split(' ').length;
  const hasNumbers = /\d/.test(content);
  const hasActionWords = /\b(how|why|best|top|guide|tutorial|steps)\b/i.test(content);
  
  if (wordCount < 15 || (!hasNumbers && !hasActionWords)) return 'weak';
  if (wordCount < 25 || !hasActionWords) return 'medium';
  return 'strong';
}

function estimateContentLength(snippet: string): number {
  const baseLength = snippet.length * 8;
  const wordCount = snippet.split(' ').length;
  
  if (wordCount > 30) return Math.max(baseLength, 800);
  if (wordCount > 20) return Math.max(baseLength, 500);
  return Math.max(baseLength, 200);
}

function analyzePAAGaps(peopleAlsoAsk: any[], organicResults: any[]) {
  const totalQuestions = peopleAlsoAsk.length;
  
  if (totalQuestions === 0) {
    return {
      total_questions: 0,
      answered_questions: 0,
      gap_percentage: 0,
      high_priority_gaps: []
    };
  }
  
  let answeredQuestions = 0;
  const highPriorityGaps: string[] = [];
  
  peopleAlsoAsk.forEach((paa: any) => {
    const question = paa.question || '';
    const questionWords = question.toLowerCase().split(' ').filter((w: string) => w.length > 3);
    
    const isWellAnswered = organicResults.some((result: any) => {
      const content = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
      const matchingWords = questionWords.filter((word: string) => content.includes(word));
      return matchingWords.length >= Math.ceil(questionWords.length * 0.6);
    });
    
    if (isWellAnswered) {
      answeredQuestions++;
    } else {
      if (isHighValueQuestion(question)) {
        highPriorityGaps.push(question);
      }
    }
  });
  
  const gapPercentage = Math.round(((totalQuestions - answeredQuestions) / totalQuestions) * 100);
  
  return {
    total_questions: totalQuestions,
    answered_questions: answeredQuestions,
    gap_percentage: gapPercentage,
    high_priority_gaps: highPriorityGaps.slice(0, 5)
  };
}

function identifyWeakCompetitors(organicResults: any[]) {
  const weakCompetitors: any[] = [];
  
  organicResults.slice(0, 10).forEach((result: any, index) => {
    const domain = extractDomain(result.link || '');
    const snippet = result.snippet || '';
    const title = result.title || '';
    
    const authorityScore = calculateDomainAuthority(domain, index);
    const snippetQuality = analyzeSnippetQuality(snippet, title);
    const contentLength = estimateContentLength(snippet);
    
    const isWeak = authorityScore < 50 || snippetQuality === 'weak' || contentLength < 300;
    
    if (isWeak && index <= 7) {
      let opportunityReason = '';
      
      if (authorityScore < 30) opportunityReason += 'Low domain authority. ';
      if (snippetQuality === 'weak') opportunityReason += 'Poor content quality. ';
      if (contentLength < 200) opportunityReason += 'Thin content. ';
      
      weakCompetitors.push({
        domain,
        authority_score: authorityScore,
        snippet_quality: snippetQuality,
        content_length: contentLength,
        opportunity_reason: opportunityReason.trim()
      });
    }
  });
  
  return weakCompetitors.slice(0, 3);
}

function analyzeContentGapTypes(existingTopics: Set<string>, peopleAlsoAsk: any[], keyword: string) {
  const allContent = Array.from(existingTopics).join(' ') + ' ' + 
                    peopleAlsoAsk.map((p: any) => p.question || '').join(' ') + ' ' + 
                    keyword;
  const contentLower = allContent.toLowerCase();
  
  return {
    tutorial_gap: !contentLower.includes('how to') && !contentLower.includes('tutorial') && !contentLower.includes('guide'),
    comparison_gap: !contentLower.includes('vs') && !contentLower.includes('versus') && !contentLower.includes('compare') && !contentLower.includes('alternative'),
    pricing_gap: !contentLower.includes('price') && !contentLower.includes('cost') && !contentLower.includes('pricing') && !contentLower.includes('free'),
    examples_gap: !contentLower.includes('example') && !contentLower.includes('case study') && !contentLower.includes('demo'),
    benefits_gap: !contentLower.includes('benefit') && !contentLower.includes('advantage') && !contentLower.includes('pros'),
    problems_gap: !contentLower.includes('problem') && !contentLower.includes('issue') && !contentLower.includes('cons') && !contentLower.includes('disadvantage')
  };
}

function generateEnhancedContentSuggestions(
  keyword: string,
  missingTopics: string[],
  highPriorityGaps: string[],
  contentGapsBreakdown: any,
  weakCompetitors: any[]
): string[] {
  const suggestions: string[] = [];
  
  if (weakCompetitors.length > 0) {
    const weakest = weakCompetitors[0];
    suggestions.push(`Target ${weakest.domain} (rank ${weakCompetitors.indexOf(weakest) + 1}) - ${weakest.opportunity_reason}`);
  }
  
  if (highPriorityGaps.length > 0) {
    suggestions.push(`Create FAQ section answering: "${highPriorityGaps[0]}"`);
  }
  
  if (contentGapsBreakdown.tutorial_gap) {
    suggestions.push(`Add comprehensive "How to ${keyword}" tutorial with step-by-step instructions`);
  }
  
  if (contentGapsBreakdown.comparison_gap) {
    suggestions.push(`Create comparison section: "${keyword} vs alternatives" with pros/cons table`);
  }
  
  if (contentGapsBreakdown.pricing_gap) {
    suggestions.push(`Add pricing information and cost breakdown for ${keyword}`);
  }
  
  if (contentGapsBreakdown.examples_gap) {
    suggestions.push(`Include real-world examples and case studies of ${keyword}`);
  }
  
  if (missingTopics.length > 0) {
    suggestions.push(`Expand content to cover: ${missingTopics.slice(0, 2).join(', ')}`);
  }
  
  if (highPriorityGaps.length > 1) {
    suggestions.push(`Create interactive FAQ or video series addressing top questions about ${keyword}`);
  }
  
  return suggestions.slice(0, 5);
}

function analyzeContentGaps(serpData: any, keyword: string): ContentGap {
  console.log(`🔍 Analyzing content gaps for: "${keyword}"`);
  
  const organicResults = serpData.organic || [];
  const peopleAlsoAsk = serpData.peopleAlsoAsk || [];
  const relatedSearches = serpData.relatedSearches || [];
  
  const existingTopics = new Set<string>();
  
  organicResults.forEach((result: any) => {
    const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
    extractTopics(text).forEach(topic => existingTopics.add(topic));
  });
  
  const paaAnalysis = analyzePAAGaps(peopleAlsoAsk, organicResults);
  const weakCompetitors = identifyWeakCompetitors(organicResults);
  const contentGapsBreakdown = analyzeContentGapTypes(existingTopics, peopleAlsoAsk, keyword);
  
  const missingTopics: string[] = [];
  
  relatedSearches.forEach((search: any) => {
    const query = (search.query || '').toLowerCase();
    if (!hasTopicOverlap(query, Array.from(existingTopics))) {
      missingTopics.push(search.query);
    }
  });
  
  const opportunityFactors = [
    paaAnalysis.gap_percentage,
    weakCompetitors.length * 15,
    missingTopics.length * 12,
    Object.values(contentGapsBreakdown).filter(Boolean).length * 10,
    peopleAlsoAsk.length > 8 ? 25 : 0,
    relatedSearches.length > 10 ? 20 : 0,
  ];
  
  const opportunityScore = Math.min(
    opportunityFactors.reduce((sum, val) => sum + val, 0),
    100
  );
  
  const contentSuggestions = generateEnhancedContentSuggestions(
    keyword,
    missingTopics,
    paaAnalysis.high_priority_gaps,
    contentGapsBreakdown,
    weakCompetitors
  );
  
  console.log(`   📊 Content gaps found: ${missingTopics.length} topics, ${paaAnalysis.gap_percentage}% PAA gaps, ${weakCompetitors.length} weak competitors`);
  
  return {
    missing_topics: missingTopics.slice(0, 5),
    unanswered_questions: paaAnalysis.high_priority_gaps,
    opportunity_score: opportunityScore,
    content_suggestions: contentSuggestions,
    weak_competitors: weakCompetitors,
    paa_analysis: paaAnalysis,
    content_gaps_breakdown: contentGapsBreakdown,
  };
}

// ============================================================
// TREND SCORER
// ============================================================

function scoreTrend(serpData: any, keyword: string): TrendScore {
  console.log(`📈 Analyzing trend for: "${keyword}"`);
  
  let baseScore = 40;
  let newsBoost = 0;
  let videoBoost = 0;
  let freshnessBoost = 0;
  let seasonalBoost = 0;
  let yearSuffixPenalty = 0;
  
  const newsCount = (serpData.news || []).length;
  if (newsCount >= 6) {
    newsBoost = 35;
  } else if (newsCount >= 4) {
    newsBoost = 25;
  } else if (newsCount >= 2) {
    newsBoost = 15;
  } else if (newsCount >= 1) {
    newsBoost = 8;
  }
  
  const videoCount = (serpData.videos || []).length;
  if (videoCount >= 5) {
    videoBoost = 20;
  } else if (videoCount >= 3) {
    videoBoost = 15;
  } else if (videoCount >= 1) {
    videoBoost = 8;
  }
  
  const organicResults = serpData.organic || [];
  
  const freshContentIndicators = organicResults.filter((r: any) => {
    const url = (r.link || '').toLowerCase();
    const title = (r.title || '').toLowerCase();
    const snippet = (r.snippet || '').toLowerCase();
    const dateText = (r.date || '').toLowerCase();
    
    const hasRecentDate = dateText.includes('hour') || dateText.includes('day') || 
                         dateText.includes('2024') || dateText.includes('2025');
    
    const freshKeywords = ['updated', 'new', 'latest', '2024', '2025', 'recent'];
    const hasFreshKeywords = freshKeywords.some(kw => title.includes(kw) || snippet.includes(kw));
    
    const hasFreshURL = url.includes('2024') || url.includes('2025') || url.includes('latest');
    
    return hasRecentDate || hasFreshKeywords || hasFreshURL;
  });
  
  const freshContentCount = freshContentIndicators.length;
  if (freshContentCount >= 5) {
    freshnessBoost = 18;
  } else if (freshContentCount >= 3) {
    freshnessBoost = 12;
  } else if (freshContentCount >= 1) {
    freshnessBoost = 6;
  }
  
  const serpFreshnessScore = Math.round((freshContentCount / Math.max(organicResults.length, 1)) * 100);
  
  const trendingTerms = ['trending', 'viral', 'hot', 'popular', 'best', 'top', 'new', 'latest'];
  const trendingKeywordsCount = trendingTerms.filter(term => keyword.toLowerCase().includes(term)).length;
  
  if (trendingKeywordsCount >= 2) {
    seasonalBoost = 12;
  } else if (trendingKeywordsCount >= 1) {
    seasonalBoost = 8;
  }
  
  const yearSuffixMatch = keyword.match(/202[4-9]|203[0-9]/);
  const yearSuffixDetected = !!yearSuffixMatch;
  
  if (yearSuffixDetected) {
    yearSuffixPenalty = -8;
  }
  
  const finalScore = Math.max(0, Math.min(100, 
    baseScore + newsBoost + videoBoost + freshnessBoost + seasonalBoost + yearSuffixPenalty
  ));
  
  let direction: 'rising' | 'stable' | 'declining' = 'stable';
  
  if (finalScore >= 70 && (newsCount >= 3 || videoCount >= 3)) {
    direction = 'rising';
  } else if (finalScore <= 30 && newsCount === 0 && freshContentCount <= 1) {
    direction = 'declining';
  }
  
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

// ============================================================
// PRIORITY SCORER
// ============================================================

function calculatePriority(
  volumeEstimate: VolumeEstimate,
  competitionScore: CompetitionScore,
  contentGap: ContentGap,
  trendScoreData?: TrendScore
): PriorityScore {
  const reasons: string[] = [];
  let score = 0;
  
  const volume = volumeEstimate.estimated_volume;
  const competition = competitionScore.score;
  
  if (volume >= 2000 && competition <= 40) {
    score += 40;
    reasons.push('High volume with low competition - prime opportunity');
  } else if (volume >= 1000 && competition <= 60) {
    score += 30;
    reasons.push('Good volume with manageable competition');
  } else if (volume >= 500) {
    score += 20;
    reasons.push('Moderate volume opportunity');
  } else {
    score += 10;
  }
  
  const gapScore = contentGap.opportunity_score;
  if (gapScore >= 70) {
    score += 30;
    reasons.push('Significant content gaps identified');
  } else if (gapScore >= 50) {
    score += 20;
    reasons.push('Notable content opportunities available');
  } else if (gapScore >= 30) {
    score += 10;
  }
  
  if (competition <= 30) {
    score += 20;
    reasons.push('Very low competition');
  } else if (competition <= 50) {
    score += 15;
  } else if (competition <= 70) {
    score += 10;
  } else {
    score += 5;
    reasons.push('High competition - requires strong content');
  }
  
  if (trendScoreData !== undefined) {
    const trendScore = trendScoreData.score;
    if (trendScore >= 80) {
      score += 10;
      reasons.push('Rapidly trending topic');
    } else if (trendScore >= 60) {
      score += 7;
    } else if (trendScore >= 40) {
      score += 5;
    }
  }
  
  if (volume >= 1000 && competition <= 30 && gapScore >= 50) {
    score += 10;
    reasons.push('QUICK WIN: High ROI opportunity');
  }
  
  score = Math.min(score, 100);
  
  let tier: PriorityScore['tier'];
  if (score >= 80) {
    tier = 'urgent';
  } else if (score >= 60) {
    tier = 'high';
  } else if (score >= 40) {
    tier = 'medium';
  } else {
    tier = 'low';
  }
  
  if (reasons.length === 0) {
    reasons.push(`Score: ${score}/100 based on volume and competition analysis`);
  }
  
  return {
    score,
    tier,
    reasons,
  };
}

// ============================================================
// KEYWORD CLUSTERER
// ============================================================

function areKeywordsSimilar(kw1: string, kw2: string): boolean {
  const words1 = kw1.toLowerCase().split(' ').filter(w => w.length > 2);
  const words2 = kw2.toLowerCase().split(' ').filter(w => w.length > 2);
  
  const commonWords = words1.filter(w => words2.includes(w)).length;
  
  const minWords = Math.min(words1.length, words2.length);
  return minWords > 0 && (commonWords / minWords) >= 0.5;
}

function extractClusterTheme(primary: string, related: string[]): string {
  const allWords = [primary, ...related]
    .join(' ')
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 3);
  
  const wordFreq = new Map<string, number>();
  allWords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([word]) => word);
  
  return topWords.join(' ') || primary;
}

function clusterKeywords(keywords: Array<{ keyword: string; [key: string]: any }>): Map<string, KeywordCluster> {
  const clusters = new Map<string, KeywordCluster>();
  const processed = new Set<string>();
  
  const sortedKeywords = [...keywords].sort((a, b) => b.keyword.length - a.keyword.length);
  
  sortedKeywords.forEach((kw, index) => {
    if (processed.has(kw.keyword)) return;
    
    const clusterId = `cluster_${index + 1}`;
    const relatedKeywords: string[] = [];
    
    sortedKeywords.forEach(otherKw => {
      if (otherKw.keyword === kw.keyword) return;
      if (processed.has(otherKw.keyword)) return;
      
      if (areKeywordsSimilar(kw.keyword, otherKw.keyword)) {
        relatedKeywords.push(otherKw.keyword);
        processed.add(otherKw.keyword);
      }
    });
    
    if (relatedKeywords.length > 0) {
      processed.add(kw.keyword);
      
      clusters.set(clusterId, {
        cluster_id: clusterId,
        primary_keyword: kw.keyword,
        related_keywords: relatedKeywords,
        cluster_theme: extractClusterTheme(kw.keyword, relatedKeywords),
      });
    }
  });
  
  return clusters;
}

// ============================================================
// SERPER API
// ============================================================

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

// ============================================================
// MAIN VALIDATION FUNCTION
// ============================================================

async function validateKeywords(keywords: Agent1Keyword[]): Promise<any[]> {
  const validatedKeywords: any[] = [];
  
  const batchSize = 10;
  const batches: Agent1Keyword[][] = [];
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    batches.push(keywords.slice(i, i + batchSize));
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    console.log(`\n🔄 Processing batch ${batchIndex + 1}/${batches.length}...\n`);
    
    const batch = batches[batchIndex];
    
    const batchPromises = batch.map(async (kw) => {
      try {
        const serpData = await fetchSerp(kw.keyword);
        
        const volumeEstimate = estimateSearchVolume(serpData, kw.keyword);
        const competitionScore = scoreCompetition(serpData);
        const contentGap = analyzeContentGaps(serpData, kw.keyword);
        const trendScoreData = scoreTrend(serpData, kw.keyword);
        const priority = calculatePriority(
          volumeEstimate,
          competitionScore,
          contentGap,
          trendScoreData
        );
        
        return {
          keyword: kw.keyword,
          type: kw.type,
          source: kw.source,
          category: kw.category,
          
          estimated_volume: volumeEstimate.estimated_volume,
          volume_confidence: volumeEstimate.confidence,
          volume_signals: volumeEstimate.signals,
          volume_breakdown: volumeEstimate.breakdown,
          
          competition_score: competitionScore.score,
          competition_difficulty: competitionScore.difficulty,
          competition_factors: competitionScore.factors,
          top_domains: competitionScore.top_domains,
          
          content_gaps: {
            missing_topics: contentGap.missing_topics,
            unanswered_questions: contentGap.unanswered_questions,
            opportunity_score: contentGap.opportunity_score,
            content_suggestions: contentGap.content_suggestions,
          },
          
          trend_score: trendScoreData.score,
          trend_direction: trendScoreData.direction,
          trend_confidence: trendScoreData.confidence,
          trend_signals: trendScoreData.signals,
          trend_breakdown: trendScoreData.breakdown,
          
          priority_score: priority.score,
          priority_tier: priority.tier,
          priority_reasons: priority.reasons,
          
          related_searches: (serpData.relatedSearches || []).map((s: any) => s.query).slice(0, 5),
          people_also_ask: (serpData.peopleAlsoAsk || []).map((p: any) => p.question).slice(0, 5),
        };
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Failed to validate "${kw.keyword}":`, errorMsg);
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
    
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return validatedKeywords;
}

// ============================================================
// MAIN SERVER
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    console.log('🎯 AGENT 2: SEO VALIDATOR STARTED\n');
    console.log('============================================================\n');
    
    const { keywords } = await req.json();
    
    if (!keywords || !Array.isArray(keywords)) {
      throw new Error('Invalid input: keywords array required');
    }
    
    console.log(`📥 Received ${keywords.length} keywords from Agent 1\n`);
    
    console.log('🔍 STEP 1: Validating with Serper API...\n');
    const validatedKeywords = await validateKeywords(keywords);
    console.log(`✅ Validated ${validatedKeywords.length} keywords\n`);
    
    console.log('🔗 STEP 2: Clustering related keywords...\n');
    const clusters = clusterKeywords(validatedKeywords);
    console.log(`✅ Created ${clusters.size} clusters\n`);
    
    const urgentCount = validatedKeywords.filter(k => k.priority_tier === 'urgent').length;
    const highCount = validatedKeywords.filter(k => k.priority_tier === 'high').length;
    const mediumCount = validatedKeywords.filter(k => k.priority_tier === 'medium').length;
    const lowCount = validatedKeywords.filter(k => k.priority_tier === 'low').length;
    
    const serperCalls = validatedKeywords.length;
    const serperCost = serperCalls * 0.001;
    
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
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Agent 2 Error:', errorMsg);
    return new Response(JSON.stringify({
      success: false,
      error: errorMsg
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
