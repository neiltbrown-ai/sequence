-- Add unique constraint on subscriptions.user_id
-- Required for the upsert ON CONFLICT (user_id) used by webhook and verify endpoints
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
