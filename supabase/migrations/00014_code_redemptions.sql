-- ============================================
-- Code Redemptions — audit trail for discount and university code usage
-- ============================================

create table public.code_redemptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  code_type text not null check (code_type in ('discount', 'university')),
  code_id uuid not null,
  code_value text not null,
  redeemed_at timestamptz not null default now()
);

create index idx_code_redemptions_user on public.code_redemptions(user_id);
create index idx_code_redemptions_code on public.code_redemptions(code_id);

alter table public.code_redemptions enable row level security;

create policy "Admins can manage code redemptions"
  on public.code_redemptions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add stripe_coupon_id to university_codes for Stripe coupon sync
alter table public.university_codes
  add column if not exists stripe_coupon_id text;

-- Add provisioned_via to subscriptions to track how subscription was created
alter table public.subscriptions
  add column if not exists provisioned_via text default 'stripe';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
