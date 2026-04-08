-- ============================================
-- ADMIN DASHBOARD FUNCTIONS
-- ============================================

-- Weekly/Monthly Active Users — counts distinct users with activity in the last N days
CREATE OR REPLACE FUNCTION public.get_active_users(days integer)
RETURNS bigint AS $$
  SELECT COUNT(DISTINCT user_id) FROM (
    SELECT user_id FROM bookmarks WHERE created_at >= now() - (days || ' days')::interval
    UNION
    SELECT user_id FROM reading_progress WHERE last_read_at >= now() - (days || ' days')::interval
    UNION
    SELECT user_id FROM assessments WHERE started_at >= now() - (days || ' days')::interval
       OR completed_at >= now() - (days || ' days')::interval
    UNION
    SELECT user_id FROM deal_evaluations WHERE started_at >= now() - (days || ' days')::interval
       OR completed_at >= now() - (days || ' days')::interval
    UNION
    SELECT user_id FROM ai_conversations WHERE last_message_at >= now() - (days || ' days')::interval
  ) t
$$ LANGUAGE sql SECURITY DEFINER;

-- Newsletter send batch tracking
CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  audience text NOT NULL,
  total_recipients integer DEFAULT 0,
  successful integer DEFAULT 0,
  failed integer DEFAULT 0,
  sent_by uuid REFERENCES public.profiles(id),
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter sends"
  ON public.newsletter_sends FOR ALL
  USING (public.is_admin());

-- Count total messages across all conversations from jsonb array
CREATE OR REPLACE FUNCTION public.get_total_message_count()
RETURNS bigint AS $$
  SELECT COALESCE(SUM(jsonb_array_length(messages)), 0)
  FROM ai_conversations
$$ LANGUAGE sql SECURITY DEFINER;

-- Backfill message_count from jsonb messages array
-- Run once, then keep message_count in sync via application code
CREATE OR REPLACE FUNCTION public.backfill_message_counts()
RETURNS void AS $$
  UPDATE ai_conversations
  SET message_count = jsonb_array_length(messages)
  WHERE message_count IS NULL OR message_count = 0
$$ LANGUAGE sql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
