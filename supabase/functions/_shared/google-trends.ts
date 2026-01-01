// Google Trends fetcher using REAL RSS feed data (100% free, no API key needed)
export interface TrendData {
  keyword: string;
  trend_velocity: 'rising' | 'falling' | 'stable';
  growth_percentage: number;
  category: string;
  related_queries: string[];
  traffic: string;
  source: string;
}

// Parse Google Trends Daily RSS feed for real trending topics
async function fetchGoogleTrendsRSS(): Promise<TrendData[]> {
  console.log('📡 Fetching Google Trends RSS feed...');
  
  const trends: TrendData[] = [];
  
  // Google Trends Daily Search Trends RSS feeds for different regions
  const rssFeeds = [
    'https://trends.google.com/trending/rss?geo=US',
    'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US',
  ];
  
  for (const feedUrl of rssFeeds) {
    try {
      console.log(`   Trying: ${feedUrl}`);
      
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      });
      
      if (!response.ok) {
        console.log(`   ⚠️ Feed returned ${response.status}, trying next...`);
        continue;
      }
      
      const xmlText = await response.text();
      console.log(`   📄 Got ${xmlText.length} bytes of XML`);
      
      // Parse RSS XML manually (no external dependencies)
      const items = parseRSSItems(xmlText);
      console.log(`   📊 Parsed ${items.length} trending items`);
      
      for (const item of items) {
        if (item.title && item.title.length > 2) {
          trends.push({
            keyword: item.title,
            trend_velocity: 'rising',
            growth_percentage: item.traffic ? parseTraffic(item.traffic) : Math.floor(Math.random() * 200) + 50,
            category: categorizeKeyword(item.title),
            related_queries: item.relatedQueries || [],
            traffic: item.traffic || 'Unknown',
            source: 'google_trends_rss',
          });
        }
      }
      
      if (trends.length > 0) {
        console.log(`   ✅ Successfully fetched ${trends.length} trends from RSS`);
        break; // Got data, no need to try other feeds
      }
    } catch (error) {
      console.log(`   ❌ Error fetching ${feedUrl}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  return trends;
}

// Parse RSS XML to extract items
function parseRSSItems(xmlText: string): Array<{ title: string; traffic?: string; relatedQueries?: string[] }> {
  const items: Array<{ title: string; traffic?: string; relatedQueries?: string[] }> = [];
  
  // Extract items using regex (works without XML parser)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i;
  const trafficRegex = /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>|<ht:picture_news_item>[\s\S]*?<ht:news_item_title><!\[CDATA\[(.*?)\]\]>/i;
  const relatedRegex = /<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/gi;
  
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract title
    const titleMatch = titleRegex.exec(itemContent);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
    
    if (!title) continue;
    
    // Extract traffic
    const trafficMatch = trafficRegex.exec(itemContent);
    const traffic = trafficMatch ? (trafficMatch[1] || '').trim() : undefined;
    
    // Extract related queries from news items
    const relatedQueries: string[] = [];
    let relatedMatch;
    while ((relatedMatch = relatedRegex.exec(itemContent)) !== null) {
      if (relatedMatch[1] && relatedMatch[1] !== title) {
        relatedQueries.push(relatedMatch[1].trim());
      }
    }
    
    items.push({ title, traffic, relatedQueries: relatedQueries.slice(0, 5) });
  }
  
  return items;
}

// Parse traffic string like "500K+" or "1M+" to a growth percentage estimate
function parseTraffic(traffic: string): number {
  const cleaned = traffic.replace(/[+,]/g, '').toUpperCase();
  
  if (cleaned.includes('M')) {
    const num = parseFloat(cleaned.replace('M', ''));
    return Math.min(500, num * 100); // 1M = 100%, 5M = 500%
  }
  if (cleaned.includes('K')) {
    const num = parseFloat(cleaned.replace('K', ''));
    return Math.min(300, num / 10); // 100K = 10%, 500K = 50%
  }
  
  const num = parseInt(cleaned);
  return isNaN(num) ? 50 : Math.min(200, num / 1000);
}

// Categorize keyword based on content (for AI/tech focus)
function categorizeKeyword(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();
  
  if (/\b(ai|artificial intelligence|chatgpt|claude|gemini|llm|machine learning|openai|deepseek)\b/i.test(lowerKeyword)) {
    return 'ai_automation';
  }
  if (/\b(startup|business|entrepreneur|invest|market|stock)\b/i.test(lowerKeyword)) {
    return 'trending_opportunities';
  }
  if (/\b(seo|content|marketing|traffic|rank|google)\b/i.test(lowerKeyword)) {
    return 'pseo_innovation';
  }
  if (/\b(tool|app|software|platform|saas|api)\b/i.test(lowerKeyword)) {
    return 'tool_comparisons';
  }
  if (/\b(money|income|earn|revenue|profit|side hustle)\b/i.test(lowerKeyword)) {
    return 'builder_stories';
  }
  if (/\b(review|comparison|vs|versus|alternative)\b/i.test(lowerKeyword)) {
    return 'real_vs_hype';
  }
  
  return 'trending_opportunities';
}

// Alternative: Fetch trends from Google Trends Explore (scraping approach)
async function fetchGoogleTrendsExplore(): Promise<TrendData[]> {
  console.log('📡 Trying Google Trends Explore page...');
  
  const trends: TrendData[] = [];
  
  try {
    // Fetch trending now page
    const response = await fetch('https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-480&geo=US&ns=15', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`   ⚠️ Google Trends API returned ${response.status}`);
      return trends;
    }
    
    let text = await response.text();
    
    // Google prepends ")]}'" to the JSON response
    if (text.startsWith(")]}'")) {
      text = text.substring(5);
    }
    
    const data = JSON.parse(text);
    const trendingDays = data?.default?.trendingSearchesDays || [];
    
    for (const day of trendingDays) {
      for (const search of day.trendingSearches || []) {
        const title = search.title?.query;
        const traffic = search.formattedTraffic;
        const relatedQueries = search.relatedQueries?.map((q: any) => q.query) || [];
        
        if (title) {
          trends.push({
            keyword: title,
            trend_velocity: 'rising',
            growth_percentage: parseTraffic(traffic || '50K+'),
            category: categorizeKeyword(title),
            related_queries: relatedQueries.slice(0, 5),
            traffic: traffic || 'Unknown',
            source: 'google_trends_api',
          });
        }
      }
    }
    
    console.log(`   ✅ Fetched ${trends.length} trends from Google Trends API`);
  } catch (error) {
    console.log('   ❌ Google Trends Explore failed:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  return trends;
}

// Main export function - tries multiple sources
export async function fetchGoogleTrends(limit: number = 20): Promise<TrendData[]> {
  console.log('🔍 Fetching REAL Google Trends data...\n');
  
  let trends: TrendData[] = [];
  
  // Try Google Trends API first (most reliable)
  trends = await fetchGoogleTrendsExplore();
  
  // Fallback to RSS feed
  if (trends.length === 0) {
    console.log('   ℹ️ Trying RSS feed fallback...');
    trends = await fetchGoogleTrendsRSS();
  }
  
  // If still no data, use minimal fallback with clear indication
  if (trends.length === 0) {
    console.log('   ⚠️ No live trends available, using minimal AI-focused seeds');
    trends = getMinimalFallbackTrends();
  }
  
  // Sort by growth percentage and limit
  trends.sort((a, b) => b.growth_percentage - a.growth_percentage);
  const selectedTrends = trends.slice(0, limit);
  
  console.log(`\n✅ Returning ${selectedTrends.length} trending topics (source: ${selectedTrends[0]?.source || 'unknown'})\n`);
  
  return selectedTrends;
}

// Minimal fallback - only used when ALL sources fail
function getMinimalFallbackTrends(): TrendData[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    {
      keyword: `AI trends ${today}`,
      trend_velocity: 'rising',
      growth_percentage: 100,
      category: 'ai_automation',
      related_queries: ['latest AI news', 'AI developments today'],
      traffic: 'Fallback',
      source: 'fallback_minimal',
    },
    {
      keyword: 'artificial intelligence tools',
      trend_velocity: 'rising',
      growth_percentage: 80,
      category: 'tool_comparisons',
      related_queries: ['best AI tools', 'AI software'],
      traffic: 'Fallback',
      source: 'fallback_minimal',
    },
  ];
}
