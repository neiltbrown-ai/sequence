-- Newsletter subscribers table
-- Stores both free newsletter signups and tracks paid members for Kit sync

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'website',
  user_id UUID REFERENCES auth.users(id),
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced'))
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Admins can manage all subscribers
CREATE POLICY "Admins can manage subscribers" ON public.newsletter_subscribers
  FOR ALL USING (public.is_admin());

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON public.newsletter_subscribers
  FOR SELECT USING (auth.uid() = user_id);

-- Allow anonymous inserts (for the public signup form)
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
