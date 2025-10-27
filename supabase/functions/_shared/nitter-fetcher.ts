/**
 * Nitter RSS Fetcher
 * Free alternative to Twitter API - fetches trending tweets via RSS
 */

import Parser from 'rss-parser';

const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.cz',
  'https://nitter.nl'
];

export interface NitterTweet {
  text: string;
  engagement: number;
  link: string;
  date: string;
  author: string;
}

/**
 * Fetch trending tweets from Nitter RSS for given search queries
 */
export async function fetchNitterTrends(queries: string[]): Promise<NitterTweet[]> {
  console.log(`\n🐦 Fetching from Nitter (${queries.length} queries)...\n`);
  
  const allTweets: NitterTweet[] = [];
  
  for (const query of queries) {
    let success = false;
    
    // Try each Nitter instance until one works
    for (const instance of NITTER_INSTANCES) {
      try {
        const rssUrl = `${instance}/search/rss?f=tweets&q=${encodeURIComponent(query)}`;
        
        const parser = new Parser({
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; KeywordBot/1.0)'
          }
        });
        
        const feed = await parser.parseURL(rssUrl);
        
        feed.items.forEach(item => {
          allTweets.push({
            text: item.title || item.content || '',
            engagement: extractEngagement(item.contentSnippet || '', item.title || ''),
            link: item.link || '',
            date: item.pubDate || new Date().toISOString(),
            author: item.creator || 'unknown'
          });
        });
        
        console.log(`  ✅ ${instance}: ${feed.items.length} tweets for "${query}"`);
        success = true;
        break; // Success, don't try other instances
        
      } catch (error) {
        console.log(`  ⚠️ ${instance} failed for "${query}", trying next...`);
        continue;
      }
    }
    
    if (!success) {
      console.log(`  ❌ All Nitter instances failed for "${query}"`);
    }
    
    // Rate limit between queries
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Sort by engagement and return top 20
  const topTweets = allTweets
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 20);
  
  console.log(`\n✅ Fetched ${topTweets.length} top tweets from Nitter\n`);
  
  return topTweets;
}

/**
 * Extract engagement metrics from tweet content
 */
function extractEngagement(snippet: string, title: string): number {
  const text = (snippet + ' ' + title).toLowerCase();
  
  // Try to extract likes/retweets from text
  const likesMatch = text.match(/(\d+)\s*likes?/i);
  const retweetsMatch = text.match(/(\d+)\s*(?:retweets?|rts?)/i);
  const repliesMatch = text.match(/(\d+)\s*replies/i);
  
  const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
  const retweets = retweetsMatch ? parseInt(retweetsMatch[1]) : 0;
  const replies = repliesMatch ? parseInt(repliesMatch[1]) : 0;
  
  // Weighted engagement score (retweets are 3x more valuable)
  return likes + (retweets * 3) + replies;
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
  
  // Take first 50 characters as keyword
  return cleaned.substring(0, 50).trim();
}

/**
 * Get default trending queries for AI/automation topics
 */
export function getDefaultTrendingQueries(): string[] {
  return [
    'AI automation',
    'make money AI',
    'AI agents',
    'build in public',
    'AI tools 2025',
    'ChatGPT automation',
    'AI business',
    'AI monetization'
  ];
}
