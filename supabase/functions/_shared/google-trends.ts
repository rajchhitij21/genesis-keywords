// Real-time Google Trends data fetcher using RSS feed (100% free)
export interface TrendData {
  keyword: string;
  trend_velocity: 'rising' | 'stable' | 'declining';
  growth_percentage: number;
  category: string;
  related_queries: string[];
}

export async function fetchGoogleTrends(): Promise<TrendData[]> {
  console.log("📈 Fetching REAL Google Trends data (RSS)...\n");
  
  try {
    // Fetch from Google Trends RSS feed (free, no API key)
    const response = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US');
    
    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const trends: TrendData[] = [];
    
    // Parse XML to extract trending searches
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    for (const item of items.slice(0, 20)) {
      // Extract keyword from <title>
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const keyword = titleMatch ? titleMatch[1] : '';
      
      if (!keyword) continue;
      
      // Extract traffic from <ht:approx_traffic>
      const trafficMatch = item.match(/<ht:approx_traffic><!\[CDATA\[(.*?)\]\]><\/ht:approx_traffic>/);
      const traffic = trafficMatch ? trafficMatch[1].replace(/[^0-9]/g, '') : '100';
      
      // Extract news article for category detection
      const newsMatch = item.match(/<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/);
      const newsTitle = newsMatch ? newsMatch[1] : '';
      
      // Fetch related queries using Google Autocomplete (free)
      const relatedQueries = await fetchRelatedQueries(keyword);
      
      trends.push({
        keyword,
        trend_velocity: 'rising',
        growth_percentage: parseInt(traffic) || 100,
        category: detectCategory(keyword, newsTitle),
        related_queries: relatedQueries,
      });
    }
    
    console.log(`   ✅ Fetched ${trends.length} REAL trending topics from RSS\n`);
    return trends;
    
  } catch (error) {
    console.error("   ❌ Google Trends RSS error:", error instanceof Error ? error.message : 'Unknown error');
    console.log("   ⚠️ Using fallback trending topics\n");
    
    return [
      {
        keyword: "AI automation 2025",
        trend_velocity: "rising",
        growth_percentage: 150,
        category: "ai_automation",
        related_queries: ["AI tools 2025", "automation software", "AI agents"],
      },
      {
        keyword: "make money with AI",
        trend_velocity: "rising",
        growth_percentage: 120,
        category: "builder_stories",
        related_queries: ["AI side hustle", "AI business ideas", "passive income AI"],
      },
    ];
  }
}

// Helper function to detect category based on keyword and news context
function detectCategory(keyword: string, newsContext: string): string {
  const lowerKeyword = keyword.toLowerCase();
  const lowerContext = newsContext.toLowerCase();
  const combined = lowerKeyword + ' ' + lowerContext;

  // AI Automation
  if (combined.match(/\b(ai automation|ai agent|voice agent|workflow|n8n|zapier|make\.com)\b/i)) {
    return 'ai_automation';
  }

  // Tool Comparisons
  if (combined.match(/\b(vs|versus|alternative|comparison|better than|compared)\b/i)) {
    return 'tool_comparisons';
  }

  // Builder Stories (money-making)
  if (combined.match(/\b(make money|revenue|profit|income|earn|business idea|side hustle)\b/i)) {
    return 'builder_stories';
  }

  // Real vs Hype
  if (combined.match(/\b(worth it|reality|hype|truth|scam|legit|really work)\b/i)) {
    return 'real_vs_hype';
  }

  // Trending Opportunities
  if (combined.match(/\b(emerging|opportunity|market size|trend|growth|2025|future)\b/i)) {
    return 'trending_opportunities';
  }

  // pSEO Innovation
  if (combined.match(/\b(seo|programmatic|content|ranking|traffic|keyword)\b/i)) {
    return 'pseo_innovation';
  }

  return 'trending_opportunities';
}

// Helper function to fetch related queries using Google Autocomplete (free)
export async function fetchRelatedQueries(keyword: string): Promise<string[]> {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const response = await fetch(
      `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodedKeyword}`,
      { signal: AbortSignal.timeout(5000) } // 5 second timeout
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const suggestions = (data[1] || []).slice(0, 10);
    
    console.log(`   📋 Found ${suggestions.length} related queries for "${keyword}"`);
    return suggestions;
  } catch (error) {
    console.error(`   ❌ Failed to fetch related queries for "${keyword}":`, error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}
