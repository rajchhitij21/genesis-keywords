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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting cleanup of old hardcoded keywords...');

    // Delete all keywords with hardcoded search_volume = 8000
    const { data: deletedData, error: deleteError, count } = await supabase
      .from('keyword_variations')
      .delete({ count: 'exact' })
      .eq('search_volume', 8000);

    if (deleteError) {
      console.error('Error deleting old keywords:', deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted ${count} old keywords with hardcoded data`);

    // Get current keyword count
    const { count: remainingCount, error: countError } = await supabase
      .from('keyword_variations')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting remaining keywords:', countError);
      throw countError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database cleanup completed',
        deleted_count: count || 0,
        remaining_count: remainingCount || 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
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
