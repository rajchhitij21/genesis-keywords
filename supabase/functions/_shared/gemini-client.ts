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
  console.log('\n🤖 GENERATING KEYWORD VARIATIONS WITH GEMINI\n');
  
  const allVariations: KeywordVariation[] = [];
  const batchSize = 10;
  
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    
    const prompt = `You are a keyword research expert focusing on commercial, money-making opportunities.

Given these trending topics and tools:

${batch.map((s, idx) => `${idx + 1}. [${s.source}] ${s.item}`).join('\n')}

Generate 3-5 HIGH-VALUE commercial keywords for EACH item above that:
1. Target people looking to MAKE MONEY or BUILD BUSINESSES with these trends
2. Have clear commercial/buying intent (words like "revenue", "profit", "build", "start", "make money")
3. Are realistic search queries people would type
4. Are 3-7 words long
5. Focus on opportunities, not just information

Categories to use:
- builder_stories (making money, income, revenue, building in public)
- ai_automation (automation tools, voice agents, ai systems)
- tool_comparisons (vs, comparison, alternative, best, review)
- real_vs_hype (worth it, reality, claims, verified, actually)
- trending_opportunities (opportunity, emerging, market, advantage, ideas)
- pseo_innovation (seo, traffic, content, programmatic, automation)

Return ONLY a JSON array with this format:
[
  {
    "keyword": "exact keyword phrase",
    "category": "one of the categories above",
    "type": "variation",
    "source": "${batch[0]?.source || 'source'}",
    "source_item": "brief description of what inspired this",
    "commercial_intent": "high"
  }
]

Focus on MONEY-MAKING angles. Every keyword should help someone start or grow a business.`;

    try {
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
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        }
      );
      
      if (!response.ok) {
        console.error(`❌ Gemini API error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const variations = JSON.parse(jsonMatch[0]);
        allVariations.push(...variations);
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Generated ${variations.length} keywords`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Gemini batch error:`, error);
    }
  }
  
  console.log(`\n✅ Total variations generated: ${allVariations.length}\n`);
  return allVariations;
}
