/**
 * Twitter API v2 Fetcher
 * FREE TIER: 500k tweets per month
 * RELIABLE: Official Twitter API
 */

export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  created_at: string;
}

const SEARCH_QUERIES = [
  'AI automation -is:retweet',
  'make money AI -is:retweet',
  'AI voice agents -is:retweet',
  'build in public -is:retweet',
  'AI business -is:retweet',
  'ChatGPT automation -is:retweet'
];

/**
 * Fetch recent tweets using Twitter API v2
 */
export async function fetchTwitterTweets(): Promise<TwitterTweet[]> {
  console.log(`\n🐦 Fetching from Twitter API v2...\\n`);
  
  const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
  
  if (!bearerToken) {
    console.log('⚠️ TWITTER_BEARER_TOKEN not found, skipping Twitter...');
    return [];
  }
  
  const allTweets: TwitterTweet[] = [];
  
  for (const query of SEARCH_QUERIES) {
    try {
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,public_metrics,author_id`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.log(`  ⚠️ Rate limited for "${query}", waiting...`);
          await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
          continue;
        }
        
        console.log(`  ⚠️ "${query}": HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const tweets = data.data || [];
      
      tweets.forEach((tweet: any) => {
        allTweets.push({
          id: tweet.id,
          text: tweet.text,
          author_id: tweet.author_id,
          public_metrics: tweet.public_metrics || {
            retweet_count: 0,
            like_count: 0,
            reply_count: 0,
            quote_count: 0
          },
          created_at: tweet.created_at
        });
      });
      
      console.log(`  ✅ "${query}": ${tweets.length} tweets`);
      
      // Rate limit: Twitter allows 75 requests per 15 minutes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ⚠️ "${query}": ${error.message}`);
    }
  }
  
  // Sort by engagement (likes + retweets) and return top 25
  const sortedTweets = allTweets
    .sort((a, b) => {
      const scoreA = a.public_metrics.like_count + (a.public_metrics.retweet_count * 3);
      const scoreB = b.public_metrics.like_count + (b.public_metrics.retweet_count * 3);
      return scoreB - scoreA;
    })
    .slice(0, 25);
  
  console.log(`\\n✅ Twitter: ${sortedTweets.length} top tweets\\n`);
  
  return sortedTweets;
}

/**
 * Extract keyword from tweet text
 */
export function extractKeywordFromTweet(text: string): string {
  // Clean the text
  let cleaned = text
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/@\w+/g, '') // Remove mentions
    .replace(/#(\w+)/g, '$1') // Keep hashtag content
    .replace(/[^\w\s]/g, ' ') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Take first 60 characters as keyword
  return cleaned.substring(0, 60).trim();
}