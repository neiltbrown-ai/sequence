-- ============================================
-- In Sequence — Extend Profiles + Assessment-Ready
-- Phase 1.5: Add missing columns used by onboarding,
-- settings, and future assessment system.
-- ============================================

-- ── Profile extensions ──────────────────────
alter table public.profiles
  add column if not exists bio text,
  add column if not exists disciplines text[] default '{}',
  add column if not exists career_stage text,
  add column if not exists income_range text,
  add column if not exists interests text[] default '{}',
  -- Assessment-ready columns (populated by Phase 2 assessment)
  add column if not exists creative_mode text,
  add column if not exists detected_stage integer check (detected_stage in (1, 2, 3, 4)),
  add column if not exists archetype_primary text,
  add column if not exists assessment_completed_at timestamptz;

comment on column public.profiles.bio is 'User bio from settings';
comment on column public.profiles.disciplines is 'Selected creative disciplines';
comment on column public.profiles.career_stage is 'Self-reported career stage';
comment on column public.profiles.income_range is 'Self-reported income range';
comment on column public.profiles.interests is 'Selected content interests';
comment on column public.profiles.creative_mode is 'From assessment: maker/service/hybrid/performer/builder/transition';
comment on column public.profiles.detected_stage is 'From assessment: 1-4 stage detection';
comment on column public.profiles.archetype_primary is 'From assessment: matched archetype ID';
comment on column public.profiles.assessment_completed_at is 'When most recent assessment was completed';

-- ── Subscription: add stripe_price_id for plan tracking ──
alter table public.subscriptions
  add column if not exists stripe_price_id text;

comment on column public.subscriptions.stripe_price_id is 'Stripe Price ID for the subscribed plan';
