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
    // Use Apify's Twitter Scraper to search for trending AI topics
    const actorId = 'apify/twitter-scraper';
    
    console.log('   Starting Twitter search...');
    
    
    // Start the scraper to find trending AI topics
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchTerms: ['#AI', '#AIautomation', '#buildinpublic', 'AI agents'],
          maxTweets: 30,
          sort: 'Top'
        })
      }
    );
    
    if (!runResponse.ok) {
      throw new Error(`Apify API error: ${runResponse.status}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.data.id;
    
    // Wait for scraper to complete
    console.log('   ⏳ Waiting for Twitter scraper...');
    await new Promise(resolve => setTimeout(resolve, 12000));
    
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
    
    // Process tweets and extract trending topics
    const trends: TwitterTrend[] = [];
    const topicCounts = new Map<string, number>();
    
    for (const tweet of results.slice(0, 50)) {
      const text = tweet.text || tweet.full_text || '';
      const engagement = (tweet.likes || 0) + (tweet.retweets || 0);
      
      // Extract hashtags and topics
      const hashtags = text.match(/#\w+/g) || [];
      for (const tag of hashtags) {
        const topic = tag.replace('#', '').toLowerCase();
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + engagement);
      }
    }
    
    // Convert to trending topics
    for (const [topic, volume] of Array.from(topicCounts.entries()).slice(0, 20)) {
      const isRelevant = 
        topic.includes('ai') ||
        topic.includes('automation') ||
        topic.includes('build') ||
        topic.includes('tech') ||
        topic.includes('dev');
      
      if (isRelevant) {
        let category = 'trending_opportunities';
        if (topic.includes('ai') || topic.includes('automation')) {
          category = 'ai_automation';
        } else if (topic.includes('build')) {
          category = 'builder_stories';
        }
        
        trends.push({
          topic,
          tweet_volume: volume,
          category,
          engagement_estimate: volume * 10
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
