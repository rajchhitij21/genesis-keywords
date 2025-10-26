/**
 * Google Trends Data Fetcher - REAL DATA ENGINE
 * Fetches actual trending searches using Google Trends API
 */

import googleTrends from "https://esm.sh/google-trends-api@4.9.2";

export interface TrendData {
  keyword: string;
  trend_velocity: 'rising' | 'stable' | 'declining';
  growth_percentage: number;
  category: string;
  related_queries: string[];
}

export async function fetchGoogleTrends(): Promise<TrendData[]> {
  console.log('📈 Fetching REAL Google Trends data...\n');
  
  try {
    // Fetch REAL daily trending searches from Google Trends
    const dailyTrendsResult = await googleTrends.dailyTrends({
      geo: 'US',
      category: 'all'
    });
    
    const parsedTrends = JSON.parse(dailyTrendsResult);
    const trendingSearches = parsedTrends.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
    
    console.log(`   ✅ Fetched ${trendingSearches.length} real trending topics from Google\n`);
    
    const trends: TrendData[] = [];
    
    // Process up to 20 trending topics
    for (const trend of trendingSearches.slice(0, 20)) {
      const keyword = trend.title?.query || '';
      if (!keyword) continue;
      
      // Get traffic volume from Google Trends data
      const traffic = parseInt(trend.formattedTraffic?.replace(/[^0-9]/g, '') || '0');
      
      // Calculate growth percentage based on traffic
      let growthPercentage = 100;
      if (traffic > 1000000) growthPercentage = 500;
      else if (traffic > 500000) growthPercentage = 400;
      else if (traffic > 100000) growthPercentage = 300;
      else if (traffic > 50000) growthPercentage = 200;
      
      // Determine category from related articles
      const category = detectCategory(keyword, trend.articles || []);
      
      // Get related queries
      const relatedQueries = trend.relatedQueries?.map((q: any) => q.query).slice(0, 5) || [];
      
      // Determine trend velocity
      const trendVelocity: 'rising' | 'stable' | 'declining' = traffic > 100000 ? 'rising' : 
                           traffic > 50000 ? 'stable' : 'declining';
      
      trends.push({
        keyword,
        trend_velocity: trendVelocity,
        growth_percentage: growthPercentage,
        category,
        related_queries: relatedQueries
      });
    }
    
    console.log(`   ✅ Processed ${trends.length} real trending topics\n`);
    return trends;
    
  } catch (error) {
    console.error('   ❌ Google Trends API error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('   ⚠️ Using fallback trending topics\n');
    
    // Minimal fallback
    const trends: TrendData[] = [
      {
        keyword: 'ai automation 2025',
        trend_velocity: 'rising',
        growth_percentage: 250,
        category: 'ai_automation',
        related_queries: ['best ai automation', 'ai tools']
      },
      {
        keyword: 'make money online',
        trend_velocity: 'rising',
        growth_percentage: 300,
        category: 'builder_stories',
        related_queries: ['side hustle', 'passive income']
      }
    ];
    
    console.log(`   ✅ Using ${trends.length} fallback topics\n`);
    return trends;
  }
}

function detectCategory(keyword: string, articles: any[]): string {
  const lowerKeyword = keyword.toLowerCase();
  const articleText = articles.map((a: any) => (a.title || '') + ' ' + (a.snippet || '')).join(' ').toLowerCase();
  
  // Category detection logic
  if (lowerKeyword.includes('money') || lowerKeyword.includes('revenue') || lowerKeyword.includes('profit') || 
      articleText.includes('entrepreneur') || articleText.includes('business')) {
    return 'builder_stories';
  }
  
  if (lowerKeyword.includes('vs') || lowerKeyword.includes('comparison') || lowerKeyword.includes('alternative') ||
      lowerKeyword.includes('review')) {
    return 'tool_comparisons';
  }
  
  if (lowerKeyword.includes('ai') || lowerKeyword.includes('automation') || lowerKeyword.includes('voice') ||
      articleText.includes('artificial intelligence') || articleText.includes('machine learning')) {
    return 'ai_automation';
  }
  
  if (lowerKeyword.includes('opportunity') || lowerKeyword.includes('emerging') || lowerKeyword.includes('trend') ||
      lowerKeyword.includes('market')) {
    return 'trending_opportunities';
  }
  
  if (lowerKeyword.includes('reality') || lowerKeyword.includes('worth it') || lowerKeyword.includes('hype') ||
      lowerKeyword.includes('verified')) {
    return 'real_vs_hype';
  }
  
  if (lowerKeyword.includes('seo') || lowerKeyword.includes('traffic') || lowerKeyword.includes('content')) {
    return 'pseo_innovation';
  }
  
  return 'trending_opportunities';
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
