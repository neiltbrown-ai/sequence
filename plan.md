# Newsletter & Email System — Implementation Plan

## Context

In Sequence has no email sending infrastructure. A newsletter signup form exists on 3 public pages but is non-functional (stub). The goal is to set up:
1. **Free newsletter** for top-of-funnel lead capture (public visitors → subscribers → paid members)
2. **Transactional emails** for members (welcome, payment alerts, new content notifications)
3. **Marketing emails** to both audiences (newsletters composed editorially)

**Approach:** Hybrid — **Resend** for transactional/triggered emails from the app + **Kit (ConvertKit)** for the newsletter/marketing platform. Custom domain: `insequence.so`.

---

## Phase 1: Domain & Account Setup (Manual, No Code)

### 1a. Resend Setup
- Create Resend account at resend.com (free tier: 3,000 emails/mo, 100/day)
- Add and verify domain `insequence.so` — Resend will provide DNS records (SPF, DKIM, DMARC)
- Add DNS records to your domain registrar
- Generate API key → add as `RESEND_API_KEY` in `.env` and Vercel env vars
- Choose sending address: `hello@insequence.so` or `neil@insequence.so`

### 1b. Kit (ConvertKit) Setup
- Create Kit account at kit.com (free up to 10,000 subscribers)
- Verify domain `insequence.so` (Kit also needs DNS records — separate from Resend's)
- Create a "Newsletter Subscribers" tag or segment
- Create a "Paid Members" tag/segment (for syncing later)
- Generate API key + API secret → add as `KIT_API_KEY` and `KIT_API_SECRET` in `.env`
- Set reply-to as `insequence@gmail.com` (so replies go to your inbox)

### 1c. DNS Records Summary
On your domain registrar for `insequence.so`, you'll add:
- Resend: 1 SPF record, 3 DKIM records, 1 DMARC record (for transactional sending)
- Kit: 1 CNAME record (for newsletter sending + tracking links)
- Both services guide you through this in their dashboards

---

## Phase 2: Newsletter Signup (Code Changes)

### 2a. Supabase — `subscribers` table
Create migration `supabase/migrations/00009_newsletter_subscribers.sql`:
```sql
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'website',
  kit_subscriber_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced'))
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage subscribers" ON public.newsletter_subscribers
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own subscription" ON public.newsletter_subscribers
  FOR SELECT USING (auth.uid() = user_id);
```

### 2b. API Route — `/api/newsletter/subscribe`
- Accepts `{ email, name }` POST
- Validates email format
- Inserts into `newsletter_subscribers` table
- Calls Kit API to add subscriber with "Newsletter" tag
- Returns success/error, rate-limited

### 2c. Wire Up Newsletter Form (`src/components/newsletter-form.tsx`)
- Add state management (loading, success, error)
- POST to `/api/newsletter/subscribe` on submit
- Honeypot field for bot prevention

---

## Phase 3: Transactional Emails via Resend

### 3a. Install `resend` + `@react-email/components`

### 3b. Email Templates (`src/lib/email/`)
- `send.ts` — Resend wrapper
- `templates/welcome.tsx` — welcome email (matches design from `content/reference/email-templates.md`)
- `templates/payment-failed.tsx` — payment failure notification

### 3c. Stripe Webhook Integration
- `checkout.session.completed` → welcome email + Kit "Paid Member" tag
- `invoice.payment_failed` → payment failed email
- Log all to `email_log` table

---

## Phase 4: Kit ↔ Supabase Sync
- New members get synced to Kit with plan tier tag
- Free subscribers who become members get `user_id` linked
- Kit unsubscribe webhook updates `newsletter_subscribers.status`

## Phase 5: Admin Visibility (Optional)
- Subscriber count on admin dashboard
- Email log viewer

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/00009_newsletter_subscribers.sql` | Create |
| `src/app/api/newsletter/subscribe/route.ts` | Create |
| `src/components/newsletter-form.tsx` | Modify |
| `src/lib/email/send.ts` | Create |
| `src/lib/email/templates/welcome.tsx` | Create |
| `src/lib/email/templates/payment-failed.tsx` | Create |
| `src/app/api/stripe/webhook/route.ts` | Modify |
| `.env.example` | Modify |
| `package.json` | Modify |

## Cost (Free to Start)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Resend | 3,000 emails/mo | $20/mo (50k) |
| Kit | 10,000 subscribers | $25/mo |
| Google Workspace | N/A | $7/mo (optional) |
