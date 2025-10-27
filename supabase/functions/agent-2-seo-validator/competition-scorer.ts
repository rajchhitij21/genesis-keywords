// Competition scoring system for Agent 2
// Analyzes SERP difficulty using multiple factors

export interface CompetitionScore {
  score: number; // 0-100 (higher = more competitive)
  difficulty: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  factors: {
    ads_density: number; // 0-100
    domain_authority: number; // 0-100
    content_freshness: number; // 0-100
    serp_complexity: number; // 0-100
  };
  top_domains: string[];
}

// Known high-authority domains
const HIGH_AUTHORITY_DOMAINS = [
  'wikipedia.org', 'youtube.com', 'amazon.com', 'reddit.com',
  'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
  'forbes.com', 'nytimes.com', 'wsj.com', 'bbc.com', 'cnn.com',
  'medium.com', 'quora.com', 'stackoverflow.com', 'github.com',
];

export function scoreCompetition(serpData: any): CompetitionScore {
  const organicResults = serpData.organic || [];
  const ads = serpData.ads || [];
  
  // Factor 1: Ads Density (0-100)
  const adsDensity = Math.min((ads.length / 4) * 100, 100);
  
  // Factor 2: Domain Authority (0-100)
  const topDomains = organicResults
    .slice(0, 10)
    .map((r: any) => extractDomain(r.link))
    .filter(Boolean);
  
  const authorityDomainCount = topDomains.filter((domain: string) =>
    HIGH_AUTHORITY_DOMAINS.some(authDomain => domain.includes(authDomain))
  ).length;
  
  const domainAuthority = (authorityDomainCount / 10) * 100;
  
  // Factor 3: Content Freshness (0-100)
  // Check if results have dates and are recent
  const resultsWithDates = organicResults.filter((r: any) => r.date);
  const recentResults = resultsWithDates.filter((r: any) => {
    if (!r.date) return false;
    const dateStr = r.date.toLowerCase();
    return dateStr.includes('hour') || dateStr.includes('day') || dateStr.includes('week');
  });
  
  const contentFreshness = resultsWithDates.length > 0
    ? (recentResults.length / resultsWithDates.length) * 100
    : 50; // Neutral if no dates
  
  // Factor 4: SERP Complexity (0-100)
  const serpFeatures = [
    serpData.knowledgeGraph ? 20 : 0,
    (serpData.peopleAlsoAsk?.length || 0) > 0 ? 20 : 0,
    (serpData.relatedSearches?.length || 0) > 5 ? 20 : 0,
    ads.length > 0 ? 20 : 0,
    organicResults.some((r: any) => r.snippet_highlighted_words?.length > 0) ? 20 : 0,
  ];
  
  const serpComplexity = serpFeatures.reduce((sum, val) => sum + val, 0);
  
  // Calculate overall competition score
  const score = Math.round(
    (adsDensity * 0.3) +
    (domainAuthority * 0.35) +
    (contentFreshness * 0.15) +
    (serpComplexity * 0.2)
  );
  
  // Determine difficulty tier
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

// Helper to extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}