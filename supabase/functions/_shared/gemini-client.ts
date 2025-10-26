import { ExternalSource } from './sources.ts';

interface KeywordVariation {
  keyword: string;
  category: string;
  type: string;
  source: string;
  source_item: string;
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
    
    const prompt = `You are an SEO keyword researcher. Given these trending topics/discussions, generate 3-5 commercial-intent keyword variations for each.

Topics:
${batch.map((s, idx) => `${idx + 1}. [${s.source}] ${s.item}`).join('\n')}

Requirements:
- Focus on commercial intent (people ready to buy/subscribe)
- Use natural search language
- Include comparisons, tutorials, reviews, pricing
- Categorize each keyword: builder_stories, ai_automation, tool_comparisons, real_vs_hype, trending_opportunities, or pseo_innovation

Return ONLY valid JSON array:
[
  {
    "keyword": "example keyword phrase",
    "category": "ai_automation",
    "type": "variation",
    "source": "reddit",
    "source_item": "original topic text"
  }
]`;

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
              temperature: 0.7,
              maxOutputTokens: 2000
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
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const variations = JSON.parse(jsonMatch[0]);
        allVariations.push(...variations);
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Generated ${variations.length} keywords`);
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Gemini batch error:`, error);
    }
  }
  
  console.log(`\n✅ Total variations generated: ${allVariations.length}\n`);
  return allVariations;
}
