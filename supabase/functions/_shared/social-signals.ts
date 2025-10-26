export interface SocialSignals {
  twitter_mentions: number;
  twitter_engagement: number;
  reddit_mentions: number;
  reddit_upvotes: number;
  hn_mentions: number;
  hn_points: number;
}

export async function enrichWithSocialSignals(
  keyword: string
): Promise<SocialSignals> {
  const signals: SocialSignals = {
    twitter_mentions: 0,
    twitter_engagement: 0,
    reddit_mentions: 0,
    reddit_upvotes: 0,
    hn_mentions: 0,
    hn_points: 0
  };
  
  // Check Reddit
  try {
    const redditResponse = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=5&sort=relevance`,
      {
        headers: { 'User-Agent': 'KeywordPipeline/1.0' }
      }
    );
    
    if (redditResponse.ok) {
      const data = await redditResponse.json();
      const posts = data?.data?.children || [];
      signals.reddit_mentions = posts.length;
      signals.reddit_upvotes = posts.reduce((sum: number, post: any) => sum + (post.data?.ups || 0), 0);
    }
  } catch (error) {
    console.error(`Reddit enrichment error for "${keyword}":`, error);
  }
  
  // Check HackerNews
  try {
    const hnResponse = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=story&hitsPerPage=5`
    );
    
    if (hnResponse.ok) {
      const data = await hnResponse.json();
      const hits = data?.hits || [];
      signals.hn_mentions = hits.length;
      signals.hn_points = hits.reduce((sum: number, hit: any) => sum + (hit.points || 0), 0);
    }
  } catch (error) {
    console.error(`HN enrichment error for "${keyword}":`, error);
  }
  
  // Twitter would require Apify - skipping for individual enrichment to save costs
  
  return signals;
}

export async function batchEnrichKeywords(
  keywords: any[]
): Promise<any[]> {
  console.log('\n🌐 ENRICHING WITH SOCIAL SIGNALS\n');
  
  const enriched = [];
  const batchSize = 10;
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map(async (kw) => {
        const signals = await enrichWithSocialSignals(kw.keyword);
        return { ...kw, ...signals };
      })
    );
    
    enriched.push(...results);
    console.log(`✅ Enriched batch ${Math.floor(i / batchSize) + 1}`);
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n✅ Total enriched: ${enriched.length}\n`);
  return enriched;
}
