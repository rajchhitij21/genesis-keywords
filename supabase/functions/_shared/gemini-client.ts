import { ExternalSource } from './sources.ts';

interface KeywordVariation {
  keyword: string;
  category: string;
  type: string;
  source: string;
  source_item: string;
  commercial_intent?: string;
}

export async function generateKeywordVariations(
  sources: ExternalSource[],
  geminiApiKey: string
): Promise<KeywordVariation[]> {
  console.log('\n🤖 GENERATING KEYWORD VARIATIONS WITH GEMINI (REAL DATA)\n');
  
  const allVariations: KeywordVariation[] = [];
  const batchSize = 5; // Reduced batch size for better reliability
  const maxRetries = 3;
  
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    
    const prompt = `You are a keyword research expert. Given these REAL trending topics:

${batch.map((s, idx) => `${idx + 1}. [${s.source}] ${s.item}`).join('\n')}

For EACH trend above, generate 2-3 commercial keyword variations that:
1. Target people looking to make money or solve problems with this trend
2. Include commercial intent words (revenue, profit, build, make money, best, review, vs)
3. Are realistic 3-7 word search queries
4. Match one category: builder_stories, ai_automation, tool_comparisons, real_vs_hype, trending_opportunities, pseo_innovation

Return ONLY valid JSON array:
[
  {
    "keyword": "exact phrase people would search",
    "category": "pick one category from list above",
    "type": "variation",
    "source": "${batch[0]?.source || 'google_trends'}",
    "source_item": "brief trend description",
    "commercial_intent": "high"
  }
]

CRITICAL: Return only the JSON array, no other text.`;

    let success = false;
    let retryCount = 0;
    
    while (!success && retryCount < maxRetries) {
      try {
        console.log(`   🔄 Processing batch ${Math.floor(i / batchSize) + 1} (attempt ${retryCount + 1})...`);
        
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
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1500,
              }
            })
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`   ❌ Gemini API HTTP error: ${response.status}`);
          console.error(`   Error details: ${errorText}`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          continue;
        }
        
        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error('   ❌ No text in Gemini response');
          console.error('   Response:', JSON.stringify(data, null, 2));
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          continue;
        }
        
        const text = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error('   ❌ No JSON array found in response');
          console.error('   Response text:', text);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          continue;
        }
        
        const variations = JSON.parse(jsonMatch[0]);
        
        if (!Array.isArray(variations) || variations.length === 0) {
          console.error('   ❌ Invalid variations format');
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          continue;
        }
        
        allVariations.push(...variations);
        console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}: Generated ${variations.length} keywords`);
        success = true;
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`   ❌ Gemini batch error (attempt ${retryCount + 1}):`, error instanceof Error ? error.message : error);
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
      }
    }
    
    if (!success) {
      console.error(`   ⚠️ Failed to process batch ${Math.floor(i / batchSize) + 1} after ${maxRetries} attempts`);
    }
  }
  
  console.log(`\n✅ Total variations generated: ${allVariations.length}\n`);
  return allVariations;
}
