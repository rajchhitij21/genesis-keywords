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

    console.log('Fetching trending keywords statistics...');

    // Fetch overall statistics using the existing database function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_keyword_stats');

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      throw statsError;
    }

    // Fetch top performing keywords
    const { data: topKeywords, error: topError } = await supabase
      .from('keyword_variations')
      .select('id, keyword, category, search_volume, trend_score, total_engagement, created_at')
      .order('trend_score', { ascending: false })
      .limit(10);

    if (topError) {
      console.error('Error fetching top keywords:', topError);
      throw topError;
    }

    // Fetch recent pipeline run info
    const { data: lastRun, error: runError } = await supabase
      .from('pipeline_runs')
      .select('started_at, completed_at, status, keywords_saved')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (runError && runError.code !== 'PGRST116') {
      console.error('Error fetching last run:', runError);
    }

    // Calculate keywords added today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount, error: todayError } = await supabase
      .from('keyword_variations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (todayError) {
      console.error('Error counting today keywords:', todayError);
    }

    console.log(`Statistics compiled: ${stats?.total_keywords || 0} total keywords`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          total_keywords: stats?.total_keywords || 0,
          pending: stats?.pending || 0,
          analyzed: stats?.analyzed || 0,
          published: stats?.published || 0,
          avg_trend_score: stats?.avg_trend_score || 0,
          categories: stats?.top_categories || [],
          top_keywords: topKeywords || [],
          last_pipeline_run: lastRun?.completed_at || lastRun?.started_at || null,
          pipeline_status: lastRun?.status || 'UNKNOWN',
          keywords_added_today: todayCount || 0,
          last_run_keywords: lastRun?.keywords_saved || 0,
        },
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
