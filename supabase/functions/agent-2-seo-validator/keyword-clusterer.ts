// Keyword clustering system for Agent 2
// Groups semantically similar keywords

export interface KeywordCluster {
  cluster_id: string;
  primary_keyword: string;
  related_keywords: string[];
  cluster_theme: string;
}

export function clusterKeywords(keywords: Array<{ keyword: string; [key: string]: any }>): Map<string, KeywordCluster> {
  const clusters = new Map<string, KeywordCluster>();
  const processed = new Set<string>();
  
  // Sort keywords by length (longer = more specific = better primary)
  const sortedKeywords = [...keywords].sort((a, b) => b.keyword.length - a.keyword.length);
  
  sortedKeywords.forEach((kw, index) => {
    if (processed.has(kw.keyword)) return;
    
    // Create new cluster
    const clusterId = `cluster_${index + 1}`;
    const relatedKeywords: string[] = [];
    
    // Find related keywords using word overlap
    sortedKeywords.forEach(otherKw => {
      if (otherKw.keyword === kw.keyword) return;
      if (processed.has(otherKw.keyword)) return;
      
      if (areKeywordsSimilar(kw.keyword, otherKw.keyword)) {
        relatedKeywords.push(otherKw.keyword);
        processed.add(otherKw.keyword);
      }
    });
    
    // Only create cluster if there are related keywords
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

// Check if two keywords are similar
function areKeywordsSimilar(kw1: string, kw2: string): boolean {
  const words1 = kw1.toLowerCase().split(' ').filter(w => w.length > 2);
  const words2 = kw2.toLowerCase().split(' ').filter(w => w.length > 2);
  
  // Count common words
  const commonWords = words1.filter(w => words2.includes(w)).length;
  
  // Similar if they share 50%+ of words
  const minWords = Math.min(words1.length, words2.length);
  return minWords > 0 && (commonWords / minWords) >= 0.5;
}

// Extract theme from keyword group
function extractClusterTheme(primary: string, related: string[]): string {
  // Find most common words across all keywords
  const allWords = [primary, ...related]
    .join(' ')
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 3);
  
  const wordFreq = new Map<string, number>();
  allWords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  // Get top 2 most frequent words
  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([word]) => word);
  
  return topWords.join(' ') || primary;
}