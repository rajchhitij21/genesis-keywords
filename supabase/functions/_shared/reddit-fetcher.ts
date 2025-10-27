/**
 * Reddit JSON API Fetcher
 * FREE and RELIABLE alternative to Twitter/Nitter
 * No authentication needed!
 */

export interface RedditPost {
  title: string;
  subreddit: string;
  upvotes: number;
  num_comments: number;
  url: string;
  created_utc: number;
}

const SUBREDDITS = [
  'Entrepreneur',
  'SideProject', 
  'buildinpublic',
  'startups',
  'IMadeThis',
  'smallbusiness'
];

/**
 * Fetch hot posts from multiple subreddits
 */
export async function fetchRedditPosts(limit: number = 30): Promise<RedditPost[]> {
  console.log(`\n🔴 Fetching from Reddit (${SUBREDDITS.length} subreddits)...\n`);
  
  const allPosts: RedditPost[] = [];
  
  for (const subreddit of SUBREDDITS) {
    try {
      // Reddit JSON API - completely free, no auth!
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      
      if (!response.ok) {
        console.log(`  ⚠️ r/${subreddit}: HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const posts = data.data?.children || [];
      
      posts.forEach((child: any) => {
        const post = child.data;
        allPosts.push({
          title: post.title,
          subreddit: post.subreddit,
          upvotes: post.ups || 0,
          num_comments: post.num_comments || 0,
          url: `https://reddit.com${post.permalink}`,
          created_utc: post.created_utc
        });
      });
      
      console.log(`  ✅ r/${subreddit}: ${posts.length} posts`);
      
      // Rate limit: be nice to Reddit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ⚠️ r/${subreddit}: ${error.message}`);
    }
  }
  
  // Sort by engagement (upvotes + comments) and return top posts
  const sortedPosts = allPosts
    .sort((a, b) => {
      const scoreA = a.upvotes + (a.num_comments * 2);
      const scoreB = b.upvotes + (b.num_comments * 2);
      return scoreB - scoreA;
    })
    .slice(0, limit);
  
  console.log(`\n✅ Reddit: ${sortedPosts.length} top posts\n`);
  
  return sortedPosts;
}

/**
 * Extract keyword from Reddit post title
 */
export function extractKeywordFromReddit(title: string): string {
  // Clean the title
  let cleaned = title
    .replace(/\[.*?\]/g, '') // Remove [tags]
    .replace(/\(.*?\)/g, '') // Remove (parentheses)
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/[^\w\s]/g, ' ') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Take first 60 characters as keyword
  return cleaned.substring(0, 60).trim();
}
