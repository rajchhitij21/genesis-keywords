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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const minScore = parseInt(url.searchParams.get('min_score') || '0');
    const sortBy = url.searchParams.get('sort_by') || 'created_at';
    const order = url.searchParams.get('order') || 'desc';

    console.log(`API Request: limit=${limit}, offset=${offset}, category=${category}, min_score=${minScore}`);

    // Build query
    let query = supabase
      .from('keyword_variations')
      .select('id, keyword, category, search_volume, trend_score, growth_rate, competition_score, commercial_intent, status, created_at, total_engagement', { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (minScore > 0) {
      query = query.gte('trend_score', minScore);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'trend_score', 'search_volume', 'total_engagement'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const ascending = order.toLowerCase() === 'asc';
    
    query = query.order(sortColumn, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    console.log(`Found ${count} total keywords, returning ${data?.length || 0} results`);

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: (count || 0) > offset + limit,
        },
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Total-Count': String(count || 0),
        },
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
