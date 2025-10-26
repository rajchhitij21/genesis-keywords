/**
 * Google Trends Data Fetcher
 * Fetches real trending searches and rising queries
 */

interface TrendData {
  keyword: string;
  trend_velocity: 'rising' | 'stable' | 'declining';
  growth_percentage: number;
  category: string;
  related_queries: string[];
}

export async function fetchGoogleTrends(): Promise<TrendData[]> {
  console.log('📈 Fetching Google Trends data...\n');
  
  try {
    // Use Google Trends Daily Trends API (unofficial but works)
    const response = await fetch(
      'https://trends.google.com/trends/api/dailytrends?hl=en&tz=-480&geo=US&ns=15'
    );
    
    if (!response.ok) {
      throw new Error(`Google Trends API error: ${response.status}`);
    }
    
    const text = await response.text();
    // Remove JSONP wrapper )]}',
    const jsonText = text.substring(6);
    const data = JSON.parse(jsonText);
    
    const trendingSearches = data?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
    
    const trends: TrendData[] = [];
    
    for (const search of trendingSearches.slice(0, 30)) {
      const title = search.title?.query || '';
      const relatedQueries = search.relatedQueries?.map((q: any) => q.query) || [];
      
      // Calculate growth from traffic
      const traffic = parseInt(search.formattedTraffic?.replace(/[^0-9]/g, '') || '0');
      const growthPercentage = traffic > 100000 ? 300 : traffic > 50000 ? 200 : traffic > 10000 ? 100 : 50;
      
      // Categorize based on keywords
      let category = 'trending_opportunities';
      if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('automation')) {
        category = 'ai_automation';
      } else if (title.toLowerCase().includes('vs') || title.toLowerCase().includes('comparison')) {
        category = 'tool_comparisons';
      } else if (title.toLowerCase().includes('money') || title.toLowerCase().includes('income')) {
        category = 'builder_stories';
      } else if (title.toLowerCase().includes('seo') || title.toLowerCase().includes('traffic')) {
        category = 'pseo_innovation';
      }
      
      trends.push({
        keyword: title,
        trend_velocity: growthPercentage > 200 ? 'rising' : growthPercentage > 100 ? 'stable' : 'declining',
        growth_percentage: growthPercentage,
        category,
        related_queries: relatedQueries.slice(0, 5)
      });
    }
    
    console.log(`   ✅ Found ${trends.length} trending searches\n`);
    return trends;
    
  } catch (error) {
    console.error('   ❌ Google Trends error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('   ⚠️ Using fallback trending topics\n');
    
    // Fallback: return some AI-related trending topics
    return [
      {
        keyword: 'ai automation tools 2025',
        trend_velocity: 'rising',
        growth_percentage: 250,
        category: 'ai_automation',
        related_queries: ['best ai automation', 'ai tools for business', 'automation software']
      },
      {
        keyword: 'make money with ai',
        trend_velocity: 'rising',
        growth_percentage: 300,
        category: 'builder_stories',
        related_queries: ['ai side hustle', 'ai revenue streams', 'monetize ai']
      }
    ];
  }
}

export async function fetchRelatedQueries(keyword: string): Promise<string[]> {
  console.log(`   🔍 Fetching related queries for "${keyword}"...`);
  
  try {
    // Use Google autocomplete API (free, no key needed)
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const suggestions = data[1]?.slice(0, 10) || [];
    
    console.log(`      ✅ Found ${suggestions.length} related queries`);
    return suggestions;
    
  } catch (error) {
    console.log('      ⚠️ Could not fetch related queries');
    return [];
  }
}
