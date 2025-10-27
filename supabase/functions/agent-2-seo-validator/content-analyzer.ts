// Advanced content analyzer for Agent 2 V3
// JavaScript equivalent of advertools functionality

import * as natural from 'natural';
import * as compromise from 'compromise';
import * as cheerio from 'cheerio';

export interface ContentAnalysis {
  url: string;
  word_count: number;
  readability_score: number;
  top_keywords: Record<string, number>;
  sentiment_score: number;
  content_quality: 'high' | 'medium' | 'low';
  content_gaps: string[];
}

export interface CompetitorAnalysis {
  avg_word_count: number;
  avg_readability: number;
  common_keywords: string[];
  content_quality_distribution: Record<string, number>;
  identified_gaps: string[];
}

// Initialize Natural.js
const TfIdf = natural.TfIdf;
const SentimentAnalyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new SentimentAnalyzer('English', stemmer, 'afinn');

export async function analyzeCompetitorContent(urls: string[]): Promise<CompetitorAnalysis> {
  console.log(`🧠 Analyzing ${urls.length} competitor pages...`);
  
  const analyses: ContentAnalysis[] = [];
  
  // Process each URL
  for (const url of urls.slice(0, 10)) { // Limit to top 10 for performance
    try {
      const analysis = await analyzeSinglePage(url);
      if (analysis) {
        analyses.push(analysis);
      }
    } catch (error) {
      console.error(`Failed to analyze ${url}:`, error.message);
    }
  }
  
  if (analyses.length === 0) {
    return {
      avg_word_count: 0,
      avg_readability: 0,
      common_keywords: [],
      content_quality_distribution: { high: 0, medium: 0, low: 0 },
      identified_gaps: []
    };
  }
  
  // Aggregate results
  const avgWordCount = analyses.reduce((sum, a) => sum + a.word_count, 0) / analyses.length;
  const avgReadability = analyses.reduce((sum, a) => sum + a.readability_score, 0) / analyses.length;
  
  // Find common keywords using TF-IDF
  const tfidf = new TfIdf();
  analyses.forEach(analysis => {
    const keywords = Object.keys(analysis.top_keywords).join(' ');
    tfidf.addDocument(keywords);
  });
  
  const commonKeywords: string[] = [];
  tfidf.listTerms(0).slice(0, 10).forEach(item => {
    if (item.tfidf > 0.1) { // Filter meaningful terms
      commonKeywords.push(item.term);
    }
  });
  
  // Content quality distribution
  const qualityDistribution = analyses.reduce((dist, analysis) => {
    dist[analysis.content_quality]++;
    return dist;
  }, { high: 0, medium: 0, low: 0 });
  
  // Identify content gaps
  const allGaps = analyses.flatMap(a => a.content_gaps);
  const gapFrequency: Record<string, number> = {};
  allGaps.forEach(gap => {
    gapFrequency[gap] = (gapFrequency[gap] || 0) + 1;
  });
  
  const identifiedGaps = Object.entries(gapFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([gap]) => gap);
  
  console.log(`✅ Analyzed ${analyses.length} pages successfully`);
  
  return {
    avg_word_count: Math.round(avgWordCount),
    avg_readability: Math.round(avgReadability),
    common_keywords: commonKeywords,
    content_quality_distribution: qualityDistribution,
    identified_gaps: identifiedGaps
  };
}

async function analyzeSinglePage(url: string): Promise<ContentAnalysis | null> {
  try {
    // Fetch content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract main content
    $('script, style, nav, header, footer, aside, .advertisement').remove();
    const mainContent = $('main, article, .content, .post, body').first();
    const text = mainContent.length > 0 ? mainContent.text() : $('body').text();
    
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?]/g, '')
      .trim();
    
    if (cleanText.length < 100) {
      return null; // Too little content
    }
    
    // Word count
    const words = cleanText.split(/\s+/).filter(w => w.length > 2);
    const wordCount = words.length;
    
    // Readability score (Flesch Reading Ease approximation)
    const sentences = cleanText.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;
    const avgSyllablesPerWord = calculateAvgSyllables(words);
    
    const fleschScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));
    
    // Keyword extraction using TF-IDF
    const tfidf = new TfIdf();
    tfidf.addDocument(cleanText.toLowerCase());
    
    const topKeywords: Record<string, number> = {};
    tfidf.listTerms(0).slice(0, 20).forEach(item => {
      if (item.term.length > 3 && !isStopWord(item.term)) {
        topKeywords[item.term] = Math.round(item.tfidf * 100) / 100;
      }
    });
    
    // Sentiment analysis
    const doc = compromise(cleanText);
    const sentences_arr = doc.sentences().out('array').slice(0, 10); // Sample first 10 sentences
    const tokens = sentences_arr.join(' ').split(' ').map(w => stemmer.stem(w.toLowerCase()));
    const sentimentScore = analyzer.getSentiment(tokens);
    
    // Content quality assessment
    let contentQuality: 'high' | 'medium' | 'low' = 'low';
    if (wordCount >= 2000 && fleschScore >= 50) {
      contentQuality = 'high';
    } else if (wordCount >= 1000 && fleschScore >= 30) {
      contentQuality = 'medium';
    }
    
    // Identify content gaps using NLP
    const contentGaps = identifyContentGaps(cleanText, doc);
    
    return {
      url,
      word_count: wordCount,
      readability_score: Math.round(fleschScore),
      top_keywords: topKeywords,
      sentiment_score: Math.round(sentimentScore * 100) / 100,
      content_quality: contentQuality,
      content_gaps: contentGaps
    };
    
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error.message);
    return null;
  }
}

function calculateAvgSyllables(words: string[]): number {
  const syllableCounts = words.map(word => {
    // Simple syllable counting heuristic
    const vowels = word.toLowerCase().match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    if (word.endsWith('e')) count--;
    return Math.max(1, count);
  });
  
  return syllableCounts.reduce((sum, count) => sum + count, 0) / words.length;
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 
    'after', 'above', 'below', 'out', 'off', 'over', 'under', 'again', 
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 
    'some', 'such', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 
    'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now'
  ]);
  
  return stopWords.has(word.toLowerCase());
}

function identifyContentGaps(text: string, doc: any): string[] {
  const gaps: string[] = [];
  
  // Check for missing content types
  const hasHowTo = /how\s+to|step\s+by\s+step|guide|tutorial/i.test(text);
  const hasPricing = /price|cost|\$|dollar|expensive|cheap|free/i.test(text);
  const hasComparison = /vs|versus|compare|comparison|better|best|alternative/i.test(text);
  const hasExamples = /example|case\s+study|sample|instance/i.test(text);
  const hasBenefits = /benefit|advantage|pro|good|positive/i.test(text);
  const hasDrawbacks = /drawback|disadvantage|con|bad|negative|problem/i.test(text);
  
  if (!hasHowTo) gaps.push('How-to guides or tutorials');
  if (!hasPricing) gaps.push('Pricing information');
  if (!hasComparison) gaps.push('Product comparisons');
  if (!hasExamples) gaps.push('Real-world examples');
  if (!hasBenefits) gaps.push('Benefits and advantages');
  if (!hasDrawbacks) gaps.push('Limitations or drawbacks');
  
  // Check content depth
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 1500) gaps.push('In-depth content (needs more words)');
  
  // Check for lists and structure
  const hasLists = doc.lists().length > 0 || /^\s*[\-\*\d+]/m.test(text);
  if (!hasLists) gaps.push('Structured lists or bullet points');
  
  return gaps.slice(0, 5); // Return top 5 gaps
}