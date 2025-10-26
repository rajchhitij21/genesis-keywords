/**
 * X (Twitter) Trending Topics Fetcher
 * Uses Apify Twitter Scraper for real-time viral content
 */

interface TwitterTrend {
  topic: string;
  tweet_volume: number;
  category: string;
  engagement_estimate: number;
}

export async function fetchTwitterTrends(apifyToken?: string): Promise<TwitterTrend[]> {
  console.log("🐦 Fetching REAL X trending topics (via Apify)...\n");

  if (!apifyToken) {
    console.log("   ⚠️ No Apify token provided, using fallback trends\n");
    return getFallbackTrends();
  }

  try {
    // Use high-engagement filters to find viral AI-related tweets
    const searchQueries = [
      { query: "AI automation", minFaves: 100 },
      { query: "make money AI", minFaves: 50 },
      { query: "AI tools 2025", minFaves: 50 },
      { query: "AI business", minFaves: 50 }
    ];

    const allTrends: TwitterTrend[] = [];
    
    for (const { query, minFaves } of searchQueries) {
      try {
        console.log(`   🔍 Searching X for "${query}" (min ${minFaves} likes)...`);
        
        // Call Apify Twitter Scraper API
        const runInput = {
          searchTerms: [query],
          maxTweets: 100,
          minFaves,
          includeSearchTerms: true,
          onlyImage: false,
          onlyQuote: false,
          onlyTwitterBlue: false,
          onlyVerifiedUsers: false
        };

        const response = await fetch(
          'https://api.apify.com/v2/acts/apify~twitter-scraper/run-sync-get-dataset-items',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apifyToken}`
            },
            body: JSON.stringify(runInput),
            signal: AbortSignal.timeout(30000) // 30 second timeout
          }
        );

        if (!response.ok) {
          throw new Error(`Apify API error: ${response.status}`);
        }

        const tweets = await response.json();
        
        if (!Array.isArray(tweets) || tweets.length === 0) {
          console.log(`   ⚠️ No tweets found for "${query}"`);
          continue;
        }

        // Extract trending topics from high-engagement tweets
        const topics = extractTopicsFromTweets(tweets);
        allTrends.push(...topics);
        
        console.log(`   ✅ Extracted ${topics.length} trending topics from ${tweets.length} tweets`);
        
      } catch (error) {
        console.error(`   ❌ Error fetching tweets for "${query}":`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    if (allTrends.length === 0) {
      console.log("   ⚠️ No trends extracted from X, using fallback\n");
      return getFallbackTrends();
    }

    // Deduplicate and sort by engagement
    const uniqueTrends = Array.from(
      new Map(allTrends.map(t => [t.topic.toLowerCase(), t])).values()
    ).sort((a, b) => b.engagement_estimate - a.engagement_estimate);

    console.log(`   ✅ Found ${uniqueTrends.length} unique X trends\n`);
    return uniqueTrends.slice(0, 10);
    
  } catch (error) {
    console.error("   ❌ X trends error:", error instanceof Error ? error.message : 'Unknown error');
    console.log("   ⚠️ Using fallback X trends\n");
    return getFallbackTrends();
  }
}

// Helper function to extract trending topics from tweets (NLP-lite)
function extractTopicsFromTweets(tweets: any[]): TwitterTrend[] {
  const topicMap = new Map<string, { volume: number; engagement: number; category: string }>();

  for (const tweet of tweets) {
    const text = tweet.text || tweet.full_text || '';
    const topics = extractTopicsFromText(text);
    
    const engagement = (tweet.likeCount || 0) + (tweet.retweetCount || 0) * 3 + (tweet.replyCount || 0);

    for (const topic of topics) {
      const existing = topicMap.get(topic) || { volume: 0, engagement: 0, category: 'trending_opportunities' };
      existing.volume += 1;
      existing.engagement += engagement;
      
      // Categorize based on topic keywords
      if (!existing.category || existing.category === 'trending_opportunities') {
        existing.category = categorizeTopic(topic);
      }
      
      topicMap.set(topic, existing);
    }
  }

  // Convert to TwitterTrend array, filter low-quality
  return Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      tweet_volume: data.volume,
      category: data.category,
      engagement_estimate: data.engagement,
    }))
    .filter(t => t.tweet_volume >= 3 && t.topic.length > 5) // At least 3 mentions, 6+ chars
    .sort((a, b) => b.engagement_estimate - a.engagement_estimate);
}

// Extract potential topics from tweet text using NLP-lite
function extractTopicsFromText(text: string): string[] {
  const topics: string[] = [];
  
  // Extract hashtags (remove #)
  const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || [];
  topics.push(...hashtags.map(h => h.slice(1).toLowerCase()));
  
  // Extract multi-word AI/tech phrases
  const patterns = [
    /\b(ai automation|voice agent|ai agent|ai voice|workflow automation)\b/gi,
    /\b(make money|side hustle|passive income|revenue stream)\b/gi,
    /\b(ai tools?|automation tools?|no-code|low-code)\b/gi,
    /\b(business idea|startup idea|saas idea)\b/gi,
    /\b(ai vs|chatgpt vs|claude vs|gemini vs)\b/gi,
    /\b(worth it|reality check|hype|truth)\b/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern) || [];
    topics.push(...matches.map(m => m.toLowerCase().trim()));
  }
  
  // Extract quoted phrases (likely important topics)
  const quotedPhrases = text.match(/"([^"]{5,40})"/g) || [];
  topics.push(...quotedPhrases.map(q => q.replace(/"/g, '').toLowerCase().trim()));
  
  // Remove duplicates, filter out short/generic terms
  return [...new Set(topics)].filter(t => t.length > 4 && !t.match(/^(the|and|for|with)$/));
}

// Categorize topic based on keywords
function categorizeTopic(topic: string): string {
  const lower = topic.toLowerCase();
  
  if (lower.match(/\b(ai|automation|agent|voice|workflow)\b/)) return 'ai_automation';
  if (lower.match(/\b(money|revenue|profit|income|business)\b/)) return 'builder_stories';
  if (lower.match(/\b(vs|versus|alternative|comparison)\b/)) return 'tool_comparisons';
  if (lower.match(/\b(worth|reality|hype|truth)\b/)) return 'real_vs_hype';
  if (lower.match(/\b(seo|content|traffic)\b/)) return 'pseo_innovation';
  
  return 'trending_opportunities';
}

// Fallback trends
function getFallbackTrends(): TwitterTrend[] {
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
