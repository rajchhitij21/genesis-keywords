-- Enable Supabase Realtime for keyword_variations table
ALTER TABLE keyword_variations REPLICA IDENTITY FULL;

-- Enable pg_cron extension for scheduled pipeline runs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule keyword pipeline to run every 15 minutes
SELECT cron.schedule(
  'keyword-pipeline-auto',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://kyeusjkivowioqxzwgpn.supabase.co/functions/v1/keyword-pipeline',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('scheduled', true)
  ) as request_id;
  $$
);

-- Create function to check pipeline health
CREATE OR REPLACE FUNCTION check_pipeline_health()
RETURNS TABLE (
  last_run timestamp with time zone,
  status text,
  keywords_generated integer,
  minutes_since_last_run integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.completed_at as last_run,
    pr.status,
    pr.keywords_saved as keywords_generated,
    EXTRACT(EPOCH FROM (now() - pr.completed_at))/60 as minutes_since_last_run
  FROM pipeline_runs pr
  ORDER BY pr.started_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;