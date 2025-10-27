/**
 * Google Autocomplete Fetcher
 * Fetches Google autocomplete suggestions (no API key needed!)
 * Uses Google's public autocomplete endpoint
 */

export interface AutocompleteSuggestion {
  keyword: string;
  source: 'google_autocomplete';
  type: 'autocomplete';
}

/**
 * Fetch autocomplete suggestions for a single keyword
 */
async function fetchAutocomplete(keyword: string): Promise<string[]> {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodedKeyword}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Response format: [query, [suggestion1, suggestion2, ...]]
    if (Array.isArray(data) && data.length >= 2 && Array.isArray(data[1])) {
      return data[1].filter((s: any) => typeof s === 'string');
    }
    
    return [];
    
  } catch (error) {
    console.error(`Failed to fetch autocomplete for "${keyword}":`, error.message);
    return [];
  }
}

/**
 * Expand multiple seed keywords using Google Autocomplete
 */
export async function expandKeywords(seeds: string[]): Promise<AutocompleteSuggestion[]> {
  console.log(`\n🔍 Expanding ${seeds.length} seed keywords with Google Autocomplete...\n`);
  
  const allSuggestions = new Set<string>();
  
  for (const seed of seeds) {
    try {
      const suggestions = await fetchAutocomplete(seed);
      
      suggestions.forEach(s => allSuggestions.add(s.toLowerCase().trim()));
      
      console.log(`  ✓ "${seed}": ${suggestions.length} suggestions`);
      
      // Rate limit: 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`  ✗ "${seed}": failed`);
    }
  }
  
  // Convert Set to array of AutocompleteSuggestion objects
  const results: AutocompleteSuggestion[] = Array.from(allSuggestions).map(kw => ({
    keyword: kw,
    source: 'google_autocomplete',
    type: 'autocomplete'
  }));
  
  console.log(`\n✅ Google Autocomplete: ${results.length} unique suggestions\n`);
  
  return results;
}

/**
 * Get default seed keywords for AI/automation niche
 */
export function getDefaultSeedKeywords(): string[] {
  return [
    'ai automation',
    'ai voice agents',
    'make money with ai',
    'ai tools',
    'chatgpt automation',
    'ai business ideas',
    'ai agents',
    'ai workflow'
  ];
}

/**
 * Enhanced expansion with suffix/prefix variations
 */
export async function expandKeywordsEnhanced(seeds: string[]): Promise<AutocompleteSuggestion[]> {
  console.log(`\n🔍 Enhanced expansion with ${seeds.length} seeds...\n`);
  
  const allSuggestions = new Set<string>();
  
  // Suffixes to add variety
  const suffixes = ['', ' 2025', ' tutorial', ' tools', ' free'];
  
  for (const seed of seeds) {
    for (const suffix of suffixes) {
      const query = seed + suffix;
      
      try {
        const suggestions = await fetchAutocomplete(query);
        suggestions.forEach(s => allSuggestions.add(s.toLowerCase().trim()));
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        // Skip failures
      }
    }
  }
  
  const results: AutocompleteSuggestion[] = Array.from(allSuggestions).map(kw => ({
    keyword: kw,
    source: 'google_autocomplete',
    type: 'autocomplete'
  }));
  
  console.log(`\n✅ Enhanced Autocomplete: ${results.length} unique suggestions\n`);
  
  return results;
}
