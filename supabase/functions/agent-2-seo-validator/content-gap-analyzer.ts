// Enhanced content gap analyzer for Agent 2 V3
// Deep analysis of missing topics, weak competitors, and actionable opportunities

export interface ContentGap {
  missing_topics: string[];
  unanswered_questions: string[];
  opportunity_score: number; // 0-100
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

export function analyzeContentGaps(serpData: any, keyword: string): ContentGap {
  console.log(`🔍 Analyzing content gaps for: "${keyword}"`);
  
  const organicResults = serpData.organic || [];
  const peopleAlsoAsk = serpData.peopleAlsoAsk || [];
  const relatedSearches = serpData.relatedSearches || [];
  
  // ANALYSIS 1: Extract existing topics from SERP
  const existingTopics = new Set<string>();
  
  organicResults.forEach((result: any) => {
    const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
    extractTopics(text).forEach(topic => existingTopics.add(topic));
  });
  
  // ANALYSIS 2: Deep PAA Analysis
  const paaAnalysis = analyzePAAGaps(peopleAlsoAsk, organicResults);
  
  // ANALYSIS 3: Weak Competitor Detection
  const weakCompetitors = identifyWeakCompetitors(organicResults);
  
  // ANALYSIS 4: Content Gaps Breakdown
  const contentGapsBreakdown = analyzeContentGapTypes(existingTopics, peopleAlsoAsk, keyword);
  
  // ANALYSIS 5: Missing topics from related searches
  const missingTopics: string[] = [];
  
  relatedSearches.forEach((search: any) => {
    const query = (search.query || '').toLowerCase();
    if (!hasTopicOverlap(query, Array.from(existingTopics))) {
      missingTopics.push(search.query);
    }
  });
  
  // ANALYSIS 6: Enhanced Opportunity Score
  const opportunityFactors = [
    paaAnalysis.gap_percentage, // PAA gaps = big opportunity
    weakCompetitors.length * 15, // Weak competitors = easier to outrank
    missingTopics.length * 12, // Missing topics = content opportunities
    Object.values(contentGapsBreakdown).filter(Boolean).length * 10, // Content type gaps
    peopleAlsoAsk.length > 8 ? 25 : 0, // High question volume = high interest
    relatedSearches.length > 10 ? 20 : 0, // Broad topic = more opportunities
  ];
  
  const opportunityScore = Math.min(
    opportunityFactors.reduce((sum, val) => sum + val, 0),
    100
  );
  
  // ANALYSIS 7: Enhanced content suggestions
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

// Extract key topics from text
function extractTopics(text: string): string[] {
  const topics: string[] = [];
  
  // Common topic indicators
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

// Check if query overlaps with existing topics
function hasTopicOverlap(query: string, existingTopics: string[]): boolean {
  const queryWords = query.split(' ').filter(w => w.length > 3);
  const overlapCount = queryWords.filter(word =>
    existingTopics.some(topic => topic.includes(word))
  ).length;
  
  // Overlap if more than 30% of words match
  return (overlapCount / queryWords.length) > 0.3;
}

// Deep PAA Analysis - identify answered vs unanswered questions
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
  
  // Check which PAA questions are well-answered in organic results
  let answeredQuestions = 0;
  const highPriorityGaps: string[] = [];
  
  peopleAlsoAsk.forEach((paa: any) => {
    const question = paa.question || '';
    const questionWords = question.toLowerCase().split(' ').filter(w => w.length > 3);
    
    // Check if organic results address this question well
    const isWellAnswered = organicResults.some((result: any) => {
      const content = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
      const matchingWords = questionWords.filter(word => content.includes(word));
      return matchingWords.length >= Math.ceil(questionWords.length * 0.6); // 60% word overlap
    });
    
    if (isWellAnswered) {
      answeredQuestions++;
    } else {
      // This is a content gap - add to high priority if it's a valuable question
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
    high_priority_gaps: highPriorityGaps.slice(0, 5) // Top 5 priority gaps
  };
}

// Identify weak competitors that can be outranked
function identifyWeakCompetitors(organicResults: any[]) {
  const weakCompetitors: any[] = [];
  
  organicResults.slice(0, 10).forEach((result: any, index) => { // Top 10 results
    const domain = extractDomain(result.link || '');
    const snippet = result.snippet || '';
    const title = result.title || '';
    
    // Calculate authority score (simplified)
    const authorityScore = calculateDomainAuthority(domain, index);
    
    // Analyze snippet quality
    const snippetQuality = analyzeSnippetQuality(snippet, title);
    
    // Content length estimation
    const contentLength = estimateContentLength(snippet);
    
    // Identify if this is a weak competitor
    const isWeak = authorityScore < 50 || snippetQuality === 'weak' || contentLength < 300;
    
    if (isWeak && index <= 7) { // Only consider top 8 as outrank opportunities
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
  
  return weakCompetitors.slice(0, 3); // Top 3 weak competitors
}

// Analyze specific content gap types
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

// Enhanced content suggestions with specific actionable recommendations
function generateEnhancedContentSuggestions(
  keyword: string,
  missingTopics: string[],
  highPriorityGaps: string[],
  contentGapsBreakdown: any,
  weakCompetitors: any[]
): string[] {
  const suggestions: string[] = [];
  
  // Suggestion 1: Target weak competitors
  if (weakCompetitors.length > 0) {
    const weakest = weakCompetitors[0];
    suggestions.push(`Target ${weakest.domain} (rank ${weakCompetitors.indexOf(weakest) + 1}) - ${weakest.opportunity_reason}`);
  }
  
  // Suggestion 2: Address high priority PAA gaps
  if (highPriorityGaps.length > 0) {
    suggestions.push(`Create FAQ section answering: "${highPriorityGaps[0]}"`);
  }
  
  // Suggestion 3: Fill specific content type gaps
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
  
  // Suggestion 4: Expand to missing topics
  if (missingTopics.length > 0) {
    suggestions.push(`Expand content to cover: ${missingTopics.slice(0, 2).join(', ')}`);
  }
  
  // Suggestion 5: Visual and interactive content
  if (highPriorityGaps.length > 1) {
    suggestions.push(`Create interactive FAQ or video series addressing top questions about ${keyword}`);
  }
  
  return suggestions.slice(0, 5); // Max 5 suggestions
}

// Helper functions
function isHighValueQuestion(question: string): boolean {
  const highValueIndicators = ['how', 'what', 'why', 'best', 'vs', 'cost', 'price', 'benefit', 'work'];
  return highValueIndicators.some(indicator => question.toLowerCase().includes(indicator));
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.split('/')[0] || 'unknown';
  }
}

function calculateDomainAuthority(domain: string, position: number): number {
  // Simplified authority calculation based on known high-authority domains and SERP position
  const highAuthDomains = ['wikipedia.org', 'youtube.com', 'amazon.com', 'reddit.com', 'stackoverflow.com', 'github.com'];
  const mediumAuthDomains = ['medium.com', 'quora.com', 'hubspot.com', 'techcrunch.com', 'forbes.com'];
  
  let baseScore = Math.max(100 - (position * 8), 20); // Position-based scoring
  
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
  // Rough estimation based on snippet richness
  const baseLength = snippet.length * 8; // Assume snippet is ~1/8 of content
  const wordCount = snippet.split(' ').length;
  
  if (wordCount > 30) return Math.max(baseLength, 800); // Rich snippet = longer content
  if (wordCount > 20) return Math.max(baseLength, 500);
  return Math.max(baseLength, 200);
}
