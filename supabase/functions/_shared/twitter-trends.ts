/**
 * X (Twitter) Trending Topics Fetcher
 * Uses Apify Twitter Trends scraper
 */

interface TwitterTrend {
  topic: string;
  tweet_volume: number;
  category: string;
  engagement_estimate: number;
}

export async function fetchTwitterTrends(apifyToken?: string): Promise<TwitterTrend[]> {
  console.log('🐦 Fetching X trending topics...\n');
  
  if (!apifyToken) {
    console.log('   ⚠️ No Apify token provided, skipping X trends\n');
    return [];
  }
  
  try {
    // Use Apify's Twitter Trends scraper
    const actorId = 'clockworks/twitter-trends-scraper';
    
    // Start the scraper
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: ['United States'],
          maxTrends: 30
        })
      }
    );
    
    if (!runResponse.ok) {
      throw new Error(`Apify API error: ${runResponse.status}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.data.id;
    
    // Wait for scraper to complete (usually 10-15 seconds)
    console.log('   ⏳ Waiting for X trends scraper...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Get results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items`,
      {
        headers: {
          'Authorization': `Bearer ${apifyToken}`
        }
      }
    );
    
    if (!resultsResponse.ok) {
      throw new Error(`Failed to get results: ${resultsResponse.status}`);
    }
    
    const results = await resultsResponse.json();
    
    // Process trends
    const trends: TwitterTrend[] = [];
    
    for (const item of results.slice(0, 30)) {
      const topic = item.name || item.trend || '';
      const volume = item.tweet_volume || item.volume || 0;
      
      // Filter for AI/business/tech relevance
      const topicLower = topic.toLowerCase();
      const isRelevant = 
        topicLower.includes('ai') ||
        topicLower.includes('automation') ||
        topicLower.includes('tech') ||
        topicLower.includes('business') ||
        topicLower.includes('startup') ||
        topicLower.includes('build') ||
        topicLower.includes('code') ||
        topicLower.includes('dev');
      
      if (isRelevant && topic.length > 3) {
        let category = 'trending_opportunities';
        if (topicLower.includes('ai') || topicLower.includes('automation')) {
          category = 'ai_automation';
        } else if (topicLower.includes('build') || topicLower.includes('launch')) {
          category = 'builder_stories';
        }
        
        trends.push({
          topic: topic.replace('#', ''),
          tweet_volume: volume,
          category,
          engagement_estimate: volume * 10 // Rough estimate
        });
      }
    }
    
    console.log(`   ✅ Found ${trends.length} relevant X trends\n`);
    return trends;
    
  } catch (error) {
    console.error('   ❌ X trends error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('   ⚠️ Using fallback X trends\n');
    
    // Fallback: some popular AI-related topics
    return [
      {
        topic: 'AI agents',
        tweet_volume: 50000,
        category: 'ai_automation',
        engagement_estimate: 500000
      },
      {
        topic: 'build in public',
        tweet_volume: 30000,
        category: 'builder_stories',
        engagement_estimate: 300000
      }
    ];
  }
}

export async function searchTwitterForKeyword(keyword: string, apifyToken?: string): Promise<{
  mentions: number;
  engagement: number;
  top_tweets: string[];
}> {
  console.log(`   🔍 Searching X for "${keyword}"...`);
  
  if (!apifyToken) {
    return { mentions: 0, engagement: 0, top_tweets: [] };
  }
  
  try {
    // Use Apify Twitter search scraper
    const actorId = 'apify/twitter-scraper';
    
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchTerms: [keyword],
          maxTweets: 20,
          sort: 'Top'
        })
      }
    );
    
    if (!runResponse.ok) {
      return { mentions: 0, engagement: 0, top_tweets: [] };
    }
    
    const runData = await runResponse.json();
    const runId = runData.data.id;
    
    // Wait for scraper
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Get results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items`,
      {
        headers: {
          'Authorization': `Bearer ${apifyToken}`
        }
      }
    );
    
    if (!resultsResponse.ok) {
      return { mentions: 0, engagement: 0, top_tweets: [] };
    }
    
    const tweets = await resultsResponse.json();
    
    const mentions = tweets.length;
    const engagement = tweets.reduce((sum: number, t: any) => 
      sum + (t.likes || 0) + (t.retweets || 0), 0
    );
    const topTweets = tweets
      .slice(0, 3)
      .map((t: any) => t.text || t.full_text || '');
    
    console.log(`      ✅ Found ${mentions} mentions, ${engagement} engagement`);
    return { mentions, engagement, top_tweets: topTweets };
    
  } catch (error) {
    console.log('      ⚠️ Could not search X');
    return { mentions: 0, engagement: 0, top_tweets: [] };
  }
}
