-- ============================================
-- Profile social links
-- Add website + per-platform handle columns to profiles so members
-- can surface their public presence from Settings → Profile.
-- All optional; empty strings should be treated as null in the UI.
-- ============================================

alter table public.profiles
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists tiktok text,
  add column if not exists twitter text,
  add column if not exists linkedin text;

comment on column public.profiles.website is 'Member website URL (full https://… preferred)';
comment on column public.profiles.instagram is 'Instagram handle (without leading @)';
comment on column public.profiles.tiktok is 'TikTok handle (without leading @)';
comment on column public.profiles.twitter is 'X / Twitter handle (without leading @)';
comment on column public.profiles.linkedin is 'LinkedIn handle or full profile URL';
