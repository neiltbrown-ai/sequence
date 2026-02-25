-- ============================================
-- In Sequence — Initial Database Schema
-- Phase 1: Core tables for membership platform
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'admin')),
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profiles extending Supabase auth.users';

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================
-- SUBSCRIPTIONS (Stripe sync)
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'annual' check (plan in ('annual', 'student')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Stripe subscription data synced via webhooks';

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at();

-- ============================================
-- STUDENT VERIFICATIONS
-- ============================================
create table public.student_verifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  edu_email text not null,
  university_name text,
  year text check (year in ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD')),
  verified boolean not null default false,
  verification_code text,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.student_verifications is 'Student .edu email verification records';

-- ============================================
-- UNIVERSITY CODES
-- ============================================
create table public.university_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  university_name text not null,
  discount_percent integer not null default 100,
  max_uses integer,
  current_uses integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.university_codes is 'University partner access codes';

-- ============================================
-- DISCOUNT CODES
-- ============================================
create table public.discount_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  description text,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null,
  max_uses integer,
  current_uses integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.discount_codes is 'Promotional discount codes';

-- ============================================
-- LIBRARY CONTENT
-- ============================================
create table public.library_content (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('structure', 'case_study', 'article', 'guide')),
  title text not null,
  slug text unique not null,
  description text,
  content jsonb,
  cover_image_url text,
  tags text[] default '{}',
  access_level text not null default 'member' check (access_level in ('public', 'member', 'admin')),
  published boolean not null default false,
  published_at timestamptz,
  author text,
  read_time_minutes integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.library_content is 'All content: structures, case studies, articles, guides';

create trigger library_content_updated_at
  before update on public.library_content
  for each row execute function public.update_updated_at();

-- Index for fast lookups
create index idx_library_content_type on public.library_content(type);
create index idx_library_content_slug on public.library_content(slug);
create index idx_library_content_published on public.library_content(published, type);

-- ============================================
-- BOOKMARKS (saved items)
-- ============================================
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.library_content(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, content_id)
);

comment on table public.bookmarks is 'User saved/bookmarked content items';

-- ============================================
-- READING PROGRESS
-- ============================================
create table public.reading_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.library_content(id) on delete cascade not null,
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  completed boolean not null default false,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, content_id)
);

comment on table public.reading_progress is 'Tracks user reading progress per content item';

-- ============================================
-- ADMIN NOTES
-- ============================================
create table public.admin_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  admin_id uuid references public.profiles(id) not null,
  note text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_notes is 'Admin notes about members';

-- ============================================
-- EMAIL LOG
-- ============================================
create table public.email_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  email_type text not null,
  recipient_email text not null,
  subject text,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'failed', 'bounced'))
);

comment on table public.email_log is 'Log of all transactional emails sent';

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Subscriptions
alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Library Content
alter table public.library_content enable row level security;

create policy "Public content is viewable by everyone"
  on public.library_content for select
  using (published = true and access_level = 'public');

create policy "Members can view member content"
  on public.library_content for select
  using (
    published = true
    and access_level in ('public', 'member')
    and auth.uid() is not null
  );

create policy "Admins can manage all content"
  on public.library_content for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Bookmarks
alter table public.bookmarks enable row level security;

create policy "Users can manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id);

-- Reading Progress
alter table public.reading_progress enable row level security;

create policy "Users can manage own reading progress"
  on public.reading_progress for all
  using (auth.uid() = user_id);

-- Admin Notes
alter table public.admin_notes enable row level security;

create policy "Admins can manage admin notes"
  on public.admin_notes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Student Verifications
alter table public.student_verifications enable row level security;

create policy "Users can view own verifications"
  on public.student_verifications for select
  using (auth.uid() = user_id);

create policy "Admins can view all verifications"
  on public.student_verifications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Discount Codes (admin only for writes, anyone can read active codes)
alter table public.discount_codes enable row level security;

create policy "Anyone can validate discount codes"
  on public.discount_codes for select
  using (active = true);

create policy "Admins can manage discount codes"
  on public.discount_codes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- University Codes
alter table public.university_codes enable row level security;

create policy "Anyone can validate university codes"
  on public.university_codes for select
  using (active = true);

create policy "Admins can manage university codes"
  on public.university_codes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Email Log
alter table public.email_log enable row level security;

create policy "Admins can view email log"
  on public.email_log for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
