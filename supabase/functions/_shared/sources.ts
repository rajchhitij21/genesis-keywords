export interface ExternalSource {
  source: string;
  item: string;
  metadata?: any;
}

export async function fetchGitHub(): Promise<ExternalSource[]> {
  console.log('📦 Fetching GitHub trending...');
  try {
    const response = await fetch(
      'https://api.github.com/search/repositories?q=topic:ai+stars:>100+pushed:>2024-01-01&sort=stars&order=desc&per_page=15',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'KeywordPipeline/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    
    const data = await response.json();
    const repos = (data.items || []).map((repo: any) => ({
      source: 'github',
      item: `${repo.name}: ${repo.description || ''}`.substring(0, 200),
      metadata: { stars: repo.stargazers_count, url: repo.html_url }
    }));
    
    console.log(`✅ GitHub: ${repos.length} repos`);
    return repos;
  } catch (error) {
    console.error('❌ GitHub error:', error);
    return [];
  }
}

export async function fetchReddit(): Promise<ExternalSource[]> {
  console.log('🤖 Fetching Reddit discussions...');
  const subreddits = ['LangChain', 'LocalLLaMA', 'ArtificialIntelligence', 'SaaS', 'buildinpublic'];
  let allPosts: ExternalSource[] = [];
  
  for (const sub of subreddits) {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=4`,
        {
          headers: { 'User-Agent': 'KeywordPipeline/1.0' }
        }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const posts = (data?.data?.children || []).map((post: any) => ({
        source: 'reddit',
        item: post.data.title,
        metadata: { 
          subreddit: sub, 
          upvotes: post.data.ups,
          comments: post.data.num_comments 
        }
      }));
      
      allPosts = allPosts.concat(posts);
      await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
    } catch (error) {
      console.error(`❌ Reddit ${sub} error:`, error);
    }
  }
  
  console.log(`✅ Reddit: ${allPosts.length} discussions`);
  return allPosts;
}

export async function fetchHackerNews(): Promise<ExternalSource[]> {
  console.log('📰 Fetching HackerNews...');
  try {
    const response = await fetch(
      'https://hn.algolia.com/api/v1/search?query=AI%20OR%20automation%20OR%20LLM&tags=story&numericFilters=points>50&hitsPerPage=15'
    );
    
    if (!response.ok) throw new Error(`HN API error: ${response.status}`);
    
    const data = await response.json();
    const stories = (data.hits || []).map((story: any) => ({
      source: 'hackernews',
      item: story.title,
      metadata: { 
        points: story.points, 
        comments: story.num_comments,
        url: story.url 
      }
    }));
    
    console.log(`✅ HackerNews: ${stories.length} stories`);
    return stories;
  } catch (error) {
    console.error('❌ HackerNews error:', error);
    return [];
  }
}

export async function fetchTwitterViaApify(apifyToken: string): Promise<ExternalSource[]> {
  console.log('🐦 Fetching Twitter trends via Apify...');
  try {
    // Using Twitter Scraper actor
    const actorId = 'apidojo/tweet-scraper';
    
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchTerms: ['#buildinpublic', '#AIautomation', 'AI agents'],
          maxTweets: 30,
          sort: 'Latest'
        })
      }
    );
    
    if (!runResponse.ok) {
      console.log('⚠️ Twitter scraping skipped (Apify error)');
      return [];
    }
    
    const runData = await runResponse.json();
    const runId = runData.data.id;
    
    // Wait for scrape completion (max 20 seconds)
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items`,
      {
        headers: { 'Authorization': `Bearer ${apifyToken}` }
      }
    );
    
    if (!resultsResponse.ok) return [];
    
    const tweets = await resultsResponse.json();
    const filtered = (tweets || [])
      .filter((t: any) => (t.likes || 0) > 50)
      .slice(0, 15)
      .map((tweet: any) => ({
        source: 'twitter',
        item: tweet.text || tweet.full_text || '',
        metadata: { 
          engagement: (tweet.likes || 0) + (tweet.retweets || 0),
          author: tweet.author?.userName || tweet.user?.screen_name 
        }
      }));
    
    console.log(`✅ Twitter: ${filtered.length} trending tweets`);
    return filtered;
  } catch (error) {
    console.error('❌ Twitter error:', error);
    return [];
  }
}

export async function fetchProductHunt(): Promise<ExternalSource[]> {
  console.log('🚀 Fetching ProductHunt (optional)...');
  // ProductHunt requires API key - skip for now or add to secrets
  console.log('⚠️ ProductHunt skipped (no API key configured)');
  return [];
}

export async function fetchAllSources(apifyToken?: string): Promise<ExternalSource[]> {
  console.log('\n📡 FETCHING ALL EXTERNAL SOURCES\n');
  
  const [github, reddit, hackernews, twitter, producthunt] = await Promise.all([
    fetchGitHub(),
    fetchReddit(),
    fetchHackerNews(),
    apifyToken ? fetchTwitterViaApify(apifyToken) : Promise.resolve([]),
    fetchProductHunt()
  ]);
  
  const allSources = [...github, ...reddit, ...hackernews, ...twitter, ...producthunt];
  
  console.log(`\n✅ Total sources fetched: ${allSources.length}\n`);
  return allSources;
}
