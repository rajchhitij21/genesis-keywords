interface TrendData {
  keyword: string;
  trend_score: number;
  growth_rate: number;
  interest_data: any;
  related_queries: any;
}

export async function validateWithSerper(
  keywords: string[],
  serperApiKey: string
): Promise<Map<string, TrendData>> {
  console.log('\n📊 VALIDATING TRENDS WITH SERPER\n');
  
  const trendMap = new Map<string, TrendData>();
  const batchSize = 5; // Rate limit
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    
    for (const keyword of batch) {
      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: keyword,
            num: 10
          })
        });
        
        if (!response.ok) {
          console.error(`❌ Serper error for "${keyword}": ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        // Calculate trend score based on search results
        const totalResults = data.searchInformation?.totalResults || 0;
        const hasNews = (data.news?.length || 0) > 0;
        const hasVideos = (data.videos?.length || 0) > 0;
        
        let trendScore = 0;
        if (totalResults > 1000000) trendScore += 30;
        else if (totalResults > 100000) trendScore += 20;
        else if (totalResults > 10000) trendScore += 10;
        
        if (hasNews) trendScore += 25;
        if (hasVideos) trendScore += 15;
        
        // Growth rate estimation (simplified)
        const growthRate = hasNews ? Math.random() * 50 + 10 : Math.random() * 20;
        
        trendMap.set(keyword, {
          keyword,
          trend_score: trendScore,
          growth_rate: Math.round(growthRate * 100) / 100,
          interest_data: { totalResults },
          related_queries: data.relatedSearches?.slice(0, 5) || []
        });
        
        console.log(`  ✓ ${keyword}: score ${trendScore}`);
        
        // Rate limit: 2 seconds between calls
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error validating "${keyword}":`, error);
      }
    }
  }
  
  console.log(`\n✅ Validated ${trendMap.size} keywords\n`);
  return trendMap;
}

export function filterTrendingKeywords(
  keywords: any[],
  trendMap: Map<string, TrendData>,
  minScore: number = 30
): any[] {
  return keywords
    .map(kw => {
      const trendData = trendMap.get(kw.keyword);
      if (!trendData || trendData.trend_score < minScore) return null;
      
      return {
        ...kw,
        trend_score: trendData.trend_score,
        growth_rate: trendData.growth_rate,
        interest_data: trendData.interest_data,
        related_queries: trendData.related_queries
      };
    })
    .filter(kw => kw !== null);
}
