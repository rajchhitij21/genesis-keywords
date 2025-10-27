// Content gap analyzer for Agent 2
// Identifies missing topics and content opportunities

export interface ContentGap {
  missing_topics: string[];
  unanswered_questions: string[];
  opportunity_score: number; // 0-100
  content_suggestions: string[];
}

export function analyzeContentGaps(serpData: any, keyword: string): ContentGap {
  const organicResults = serpData.organic || [];
  const peopleAlsoAsk = serpData.peopleAlsoAsk || [];
  const relatedSearches = serpData.relatedSearches || [];
  
  // Extract all topics from SERP
  const existingTopics = new Set<string>();
  
  // From titles and snippets
  organicResults.forEach((result: any) => {
    const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
    extractTopics(text).forEach(topic => existingTopics.add(topic));
  });
  
  // Identify missing question topics
  const unansweredQuestions = peopleAlsoAsk
    .map((q: any) => q.question || '')
    .filter((q: string) => q.length > 0)
    .slice(0, 5); // Top 5 questions
  
  // Identify missing related topics
  const missingTopics: string[] = [];
  
  relatedSearches.forEach((search: any) => {
    const query = (search.query || '').toLowerCase();
    // Check if this related search covers a different angle
    if (!hasTopicOverlap(query, Array.from(existingTopics))) {
      missingTopics.push(search.query);
    }
  });
  
  // Calculate opportunity score
  // Higher score = more gaps = more opportunity
  const opportunityFactors = [
    unansweredQuestions.length * 10, // Each question = 10 points
    missingTopics.length * 15, // Each missing topic = 15 points
    peopleAlsoAsk.length > 5 ? 20 : 0, // Many questions = high interest
    relatedSearches.length > 8 ? 20 : 0, // Many related = broad topic
  ];
  
  const opportunityScore = Math.min(
    opportunityFactors.reduce((sum, val) => sum + val, 0),
    100
  );
  
  // Generate content suggestions
  const contentSuggestions = generateContentSuggestions(
    keyword,
    missingTopics,
    unansweredQuestions
  );
  
  return {
    missing_topics: missingTopics.slice(0, 5),
    unanswered_questions: unansweredQuestions,
    opportunity_score: opportunityScore,
    content_suggestions: contentSuggestions,
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

// Generate actionable content suggestions
function generateContentSuggestions(
  keyword: string,
  missingTopics: string[],
  questions: string[]
): string[] {
  const suggestions: string[] = [];
  
  // Suggestion 1: FAQ section
  if (questions.length >= 3) {
    suggestions.push(`Create comprehensive FAQ section covering: ${questions.slice(0, 3).join(', ')}`);
  }
  
  // Suggestion 2: Comparison content
  if (missingTopics.some(t => t.includes('vs') || t.includes('versus') || t.includes('alternative'))) {
    suggestions.push(`Add comparison table or "vs" section to address: ${missingTopics.find(t => t.includes('vs') || t.includes('alternative'))}`);
  }
  
  // Suggestion 3: How-to guide
  if (questions.some(q => q.toLowerCase().includes('how'))) {
    suggestions.push(`Create step-by-step guide for: ${questions.find(q => q.toLowerCase().includes('how'))}`);
  }
  
  // Suggestion 4: Related topics expansion
  if (missingTopics.length > 0) {
    suggestions.push(`Expand coverage to include: ${missingTopics.slice(0, 2).join(', ')}`);
  }
  
  // Suggestion 5: Visual content
  if (questions.length > 0 || missingTopics.length > 0) {
    suggestions.push(`Add infographic or video explaining "${keyword}" for better engagement`);
  }
  
  return suggestions.slice(0, 5); // Max 5 suggestions
}