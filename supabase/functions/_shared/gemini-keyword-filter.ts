// Gemini 2.5 Pro Keyword Filter
// Filters keywords based on high intent, viral potential, conversion capability, and trends alignment
// Also checks for duplicates in database before final selection

interface KeywordWithAgentData {
  keyword: string;
  // Agent 1 data
  type?: string;
  source?: string;
  category?: string;
  commercial_intent?: string;
  // Agent 2 data
  estimated_volume?: number;
  competition_score?: number;
  trend_direction?: string;
  trend_score?: number;
  priority_tier?: string;
  priority_score?: number;
  trend_signals?: any;
  content_gaps?: any;
  serp_features?: any;
  [key: string]: any;
}

interface GeminiFilterResult {
  success: boolean;
  filtered_keywords: KeywordWithAgentData[];
  rejected_keywords: Array<{
    keyword: string;
    rejection_reason: string;
  }>;
  duplicates_found: string[];
  metadata: {
    total_received: number;
    total_analyzed: number;
    total_selected: number;
    duplicates_removed: number;
    selection_rate: number;
    avg_score_selected: number;
    processing_time_ms: number;
  };
}

/**
 * Main function: Filters keywords with Gemini 2.5 Pro and checks DB duplicates
 */
export async function filterKeywordsWithGemini(
  keywords: KeywordWithAgentData[],
  supabaseClient: any,
  geminiApiKey: string
): Promise<GeminiFilterResult> {
  
  const startTime = Date.now();
  
  console.log(`\n🤖 GEMINI KEYWORD FILTER STARTED`);
  console.log(`📥 Received ${keywords.length} keywords for analysis\n`);
  
  try {
    // STEP 1: Check for duplicates in database
    console.log('🔍 STEP 1: Checking for duplicates in database...');
    const duplicates = await checkDatabaseDuplicates(
      keywords.map(k => k.keyword),
      supabaseClient
    );
    console.log(`   Found ${duplicates.size} duplicates in database\n`);
    
    // Filter out duplicates before sending to Gemini
    const uniqueKeywords = keywords.filter(k => !duplicates.has(k.keyword.toLowerCase()));
    console.log(`   ${uniqueKeywords.length} unique keywords will be analyzed\n`);
    
    if (uniqueKeywords.length === 0) {
      console.log('⚠️  All keywords are duplicates, returning empty result\n');
      return {
        success: true,
        filtered_keywords: [],
        rejected_keywords: [],
        duplicates_found: Array.from(duplicates),
        metadata: {
          total_received: keywords.length,
          total_analyzed: 0,
          total_selected: 0,
          duplicates_removed: duplicates.size,
          selection_rate: 0,
          avg_score_selected: 0,
          processing_time_ms: Date.now() - startTime
        }
      };
    }
    
    // STEP 2: Send to Gemini for intelligent filtering
    console.log('🧠 STEP 2: Analyzing keywords with Gemini 2.5 Pro...');
    const geminiResult = await analyzeKeywordsWithGemini(uniqueKeywords, geminiApiKey);
    console.log(`   ✅ Analysis complete: ${geminiResult.filtered_keywords.length} keywords selected\n`);
    
    // STEP 3: Merge Gemini scores back with original data
    const enrichedKeywords = geminiResult.filtered_keywords.map(filtered => {
      const original = uniqueKeywords.find(k => k.keyword === filtered.keyword);
      return {
        ...original,
        gemini_scores: filtered.scores,
        gemini_reasoning: filtered.reasoning,
        content_angle: filtered.content_angle
      };
    });
    
    const result: GeminiFilterResult = {
      success: true,
      filtered_keywords: enrichedKeywords,
      rejected_keywords: geminiResult.rejected_keywords,
      duplicates_found: Array.from(duplicates),
      metadata: {
        total_received: keywords.length,
        total_analyzed: uniqueKeywords.length,
        total_selected: enrichedKeywords.length,
        duplicates_removed: duplicates.size,
        selection_rate: enrichedKeywords.length / uniqueKeywords.length,
        avg_score_selected: geminiResult.metadata.avg_score_selected,
        processing_time_ms: Date.now() - startTime
      }
    };
    
    console.log('✅ GEMINI FILTER COMPLETE');
    console.log(`   Total Received: ${result.metadata.total_received}`);
    console.log(`   Duplicates Removed: ${result.metadata.duplicates_removed}`);
    console.log(`   Analyzed: ${result.metadata.total_analyzed}`);
    console.log(`   Selected: ${result.metadata.total_selected}`);
    console.log(`   Selection Rate: ${(result.metadata.selection_rate * 100).toFixed(1)}%`);
    console.log(`   Avg Score: ${result.metadata.avg_score_selected.toFixed(1)}\n`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Gemini filter error:', error);
    throw error;
  }
}

/**
 * Check database for duplicate keywords (last 90 days)
 */
async function checkDatabaseDuplicates(
  keywords: string[],
  supabaseClient: any
): Promise<Set<string>> {
  
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabaseClient
      .from('genesis_keywords_vault')
      .select('keyword')
      .gte('created_at', ninetyDaysAgo)
      .in('keyword', keywords);
    
    if (error) {
      console.error('   ⚠️  Duplicate check error:', error.message);
      return new Set(); // Return empty set on error (allow all keywords)
    }
    
    return new Set(data?.map((row: any) => row.keyword.toLowerCase()) || []);
    
  } catch (error) {
    console.error('   ⚠️  Duplicate check failed:', error);
    return new Set();
  }
}

/**
 * Analyze keywords with Gemini 2.5 Pro
 */
async function analyzeKeywordsWithGemini(
  keywords: KeywordWithAgentData[],
  geminiApiKey: string
): Promise<any> {
  
  const maxRetries = 3;
  let attempt = 0;
  
  // Prepare keyword data for Gemini (simplified for prompt)
  const keywordData = keywords.map(k => ({
    keyword: k.keyword,
    type: k.type,
    source: k.source,
    category: k.category,
    volume: k.estimated_volume || 0,
    competition: k.competition_score || 0,
    trend_score: k.trend_score || 0,
    priority: k.priority_tier || 'medium',
    trend_direction: k.trend_direction || 'stable'
  }));
  
  const prompt = buildGeminiPrompt(keywordData);
  
  while (attempt < maxRetries) {
    try {
      console.log(`   🔄 Attempt ${attempt + 1}/${maxRetries}...`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.3, // Lower temperature for consistent analysis
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8000,
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No text in Gemini response');
      }
      
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Wash and parse JSON
      const parsed = washGeminiJSON(rawText);
      
      return parsed;
      
    } catch (error) {
      console.error(`   ❌ Attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
      attempt++;
      
      if (attempt < maxRetries) {
        const delay = 2000 * attempt;
        console.log(`   ⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error(`Gemini analysis failed after ${maxRetries} attempts: ${error}`);
      }
    }
  }
  
  throw new Error('Gemini analysis failed');
}

/**
 * Build comprehensive Gemini prompt
 */
function buildGeminiPrompt(keywords: any[]): string {
  return `You are an elite keyword strategist analyzing keywords for viral content potential and high conversion rates.

TASK: Analyze these keywords and select ONLY the best ones based on multiple strategic factors.

INPUT KEYWORDS (${keywords.length} total):
${JSON.stringify(keywords, null, 2)}

ANALYSIS CRITERIA:
1. HIGH INTENT (0-100): Keywords showing clear user intent to learn, buy, or take action
   - Look for action words, question phrases, buying signals
   - "How to", "best", "review", "vs", "make money" = HIGH intent
   - Generic, vague terms = LOW intent

2. VIRAL POTENTIAL (0-100): Topics that naturally generate engagement, shares, discussion
   - Controversial topics, trending technologies, pain points
   - Topics people love to debate or share opinions about
   - Novel/emerging concepts with buzz potential

3. CONVERSION CAPABILITY (0-100): Keywords that lead to actionable outcomes
   - Purchase intent, signup intent, learning intent
   - Specific problems users want to solve NOW
   - Bottom-of-funnel keywords score higher

4. TRENDS ALIGNMENT (0-100): Keywords matching current search trends and rising topics
   - Prioritize keywords from google_trends, twitter_trends sources
   - Rising trend_direction = bonus points
   - Current hot topics in AI, automation, technology

5. CONTENT OPPORTUNITY (0-100): Quality content creation potential
   - Can create unique, valuable content around this?
   - Not oversaturated or generic
   - Clear content angles available

SELECTION RULES:
- MUST have at least 3 scores above 70/100
- Average score MUST be above 65/100
- MANDATORY: Include ALL keywords from google_trends source (if quality is decent)
- Reject generic/oversaturated keywords (e.g., "AI", "technology")
- Focus on actionable, specific phrases (3+ words usually better)
- Maximum 20 keywords selected (be ruthless about quality)

OUTPUT FORMAT (RETURN ONLY THIS JSON, NO MARKDOWN, NO EXPLANATIONS):
{
  "filtered_keywords": [
    {
      "keyword": "exact keyword string from input",
      "selected": true,
      "scores": {
        "high_intent_score": 85,
        "viral_potential_score": 78,
        "conversion_score": 82,
        "trends_score": 90,
        "content_opportunity_score": 75,
        "overall_score": 82
      },
      "reasoning": "Brief 1-sentence explanation why selected",
      "content_angle": "Suggested content approach for maximum impact"
    }
  ],
  "rejected_keywords": [
    {
      "keyword": "exact keyword string from input",
      "selected": false,
      "rejection_reason": "Why this keyword didn't make the cut"
    }
  ],
  "metadata": {
    "total_analyzed": ${keywords.length},
    "total_selected": 15,
    "selection_rate": 0.30,
    "avg_score_selected": 78.5,
    "top_scoring_keyword": "keyword with highest overall_score"
  }
}

CRITICAL RULES:
1. Return ONLY valid JSON, no markdown code blocks, no extra text
2. Every keyword in input MUST appear in either filtered_keywords OR rejected_keywords
3. Select maximum 20 keywords (top performers only)
4. Be ruthless - quality over quantity
5. Prioritize Google Trends keywords (MANDATORY if quality >= 60)
6. Ensure all scores are integers 0-100
7. Calculate overall_score as average of all 5 scores`;
}

/**
 * Wash and validate Gemini JSON response
 */
function washGeminiJSON(rawResponse: string): any {
  try {
    // Remove markdown code blocks
    let cleaned = rawResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }
    
    // Parse JSON
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.filtered_keywords || !Array.isArray(parsed.filtered_keywords)) {
      throw new Error('Invalid structure: missing filtered_keywords array');
    }
    
    if (!parsed.rejected_keywords || !Array.isArray(parsed.rejected_keywords)) {
      throw new Error('Invalid structure: missing rejected_keywords array');
    }
    
    // Validate each filtered keyword
    for (const kw of parsed.filtered_keywords) {
      if (!kw.keyword || typeof kw.keyword !== 'string') {
        throw new Error(`Invalid keyword structure: missing or invalid keyword field`);
      }
      
      if (!kw.scores || typeof kw.scores !== 'object') {
        throw new Error(`Invalid keyword structure: missing scores object for "${kw.keyword}"`);
      }
      
      const requiredScores = [
        'high_intent_score',
        'viral_potential_score',
        'conversion_score',
        'trends_score',
        'content_opportunity_score',
        'overall_score'
      ];
      
      for (const scoreKey of requiredScores) {
        if (typeof kw.scores[scoreKey] !== 'number') {
          throw new Error(`Invalid keyword structure: missing or invalid ${scoreKey} for "${kw.keyword}"`);
        }
      }
    }
    
    // Validate metadata
    if (!parsed.metadata || typeof parsed.metadata !== 'object') {
      throw new Error('Invalid structure: missing metadata object');
    }
    
    return parsed;
    
  } catch (error) {
    console.error('❌ JSON washing failed:', error);
    console.error('Raw response (first 500 chars):', rawResponse.substring(0, 500));
    throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : error}`);
  }
}
