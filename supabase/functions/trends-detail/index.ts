import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameter: id',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Fetching keyword details for ID: ${id}`);

    // Fetch keyword details
    const { data: keyword, error: keywordError } = await supabase
      .from('keyword_variations')
      .select('*')
      .eq('id', id)
      .single();

    if (keywordError) {
      if (keywordError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Keyword not found',
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }
      console.error('Database query error:', keywordError);
      throw keywordError;
    }

    // Fetch related keywords (same category, excluding current keyword)
    let relatedKeywords: any[] = [];
    if (keyword.category) {
      const { data: related, error: relatedError } = await supabase
        .from('keyword_variations')
        .select('id, keyword, category, search_volume, trend_score, created_at')
        .eq('category', keyword.category)
        .neq('id', id)
        .order('trend_score', { ascending: false })
        .limit(5);

      if (!relatedError && related) {
        relatedKeywords = related;
      }
    }

    console.log(`Found keyword: ${keyword.keyword}, ${relatedKeywords.length} related keywords`);

    return new Response(
      JSON.stringify({
        success: true,
        data: keyword,
        related_keywords: relatedKeywords,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
