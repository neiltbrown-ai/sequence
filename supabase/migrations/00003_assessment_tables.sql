-- ============================================
-- In Sequence — Phase 2: Assessment + Strategic Roadmap
-- Creates tables for the assessment wizard, strategic plans,
-- question bank, and action tracking.
-- ============================================

-- ── Assessment responses (versioned, retakeable) ──────────────────────
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  version integer not null default 1,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),

  -- Section 1: Identity
  discipline text,
  sub_discipline text,
  creative_mode text
    check (creative_mode in ('maker', 'service', 'hybrid', 'performer', 'builder', 'transition')),

  -- Section 2: Feeling + Energy
  energy_ranking jsonb,
  drains text[],
  dream_response text,

  -- Section 3: Current Reality
  income_range text,
  income_structure jsonb,
  what_they_pay_for text,
  equity_positions text,
  demand_level text,
  business_structure text,

  -- Section 4: Adaptive Deep Dive (variable questions)
  stage_questions jsonb default '{}',
  industry_questions jsonb default '{}',
  discernment_questions jsonb default '{}',

  -- Section 5: Vision + Ambition
  three_year_goal text,
  risk_tolerance text,
  constraints text[],
  specific_question text,

  -- Computed / Derived
  detected_stage integer check (detected_stage in (1, 2, 3, 4)),
  stage_score numeric(3,2),
  transition_readiness text
    check (transition_readiness in ('low', 'moderate', 'high')),
  misalignment_flags text[] default '{}',
  archetype_primary text,
  archetype_secondary text,

  -- Progress tracking
  current_section integer default 1,
  current_question integer default 0,

  -- Timestamps
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_assessments_user_id on public.assessments(user_id);
create index idx_assessments_status on public.assessments(status);

-- ── Strategic plans (AI-generated from assessments) ──────────────────────
create table public.strategic_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete cascade,

  plan_content jsonb not null default '{}',
  plan_markdown text,

  status text not null default 'generating'
    check (status in ('generating', 'draft', 'review', 'published', 'rejected')),
  reviewed_by uuid references auth.users(id),
  review_notes text,

  pdf_url text,
  pdf_generated_at timestamptz,

  created_at timestamptz default now(),
  published_at timestamptz
);

create index idx_strategic_plans_user_id on public.strategic_plans(user_id);
create index idx_strategic_plans_assessment_id on public.strategic_plans(assessment_id);
create index idx_strategic_plans_status on public.strategic_plans(status);

-- ── Question bank (schema-ready, populated later if admin UI needed) ──────
create table public.assessment_questions (
  id text primary key,
  section text not null
    check (section in ('identity', 'feeling', 'reality', 'deep_dive', 'ambition')),
  pool text,
  question_text text not null,
  question_text_variants jsonb,
  answer_type text not null
    check (answer_type in ('single_select', 'multi_select', 'rank', 'slider', 'free_text', 'allocation')),
  options jsonb,
  option_variants jsonb,
  scoring jsonb,
  display_order integer,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Action tracking (members mark actions complete) ──────────────────────
create table public.assessment_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references public.strategic_plans(id) on delete cascade,
  action_order integer not null check (action_order in (1, 2, 3)),
  action_type text not null
    check (action_type in ('foundation', 'positioning', 'momentum')),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create index idx_assessment_actions_user_id on public.assessment_actions(user_id);
create index idx_assessment_actions_plan_id on public.assessment_actions(plan_id);

-- ── Auto-update timestamps ──────────────────────
create or replace function public.handle_assessment_updated_at()
returns trigger as $$
begin
  new.started_at = coalesce(new.started_at, old.started_at);
  return new;
end;
$$ language plpgsql;

-- ── Row Level Security ──────────────────────

alter table public.assessments enable row level security;
alter table public.strategic_plans enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_actions enable row level security;

-- Members see only their own data
create policy "users_own_assessments" on public.assessments
  for all using (auth.uid() = user_id);

create policy "users_own_plans" on public.strategic_plans
  for all using (auth.uid() = user_id);

create policy "users_own_actions" on public.assessment_actions
  for all using (auth.uid() = user_id);

-- Question bank is readable by all authenticated users
create policy "authenticated_read_questions" on public.assessment_questions
  for select using (auth.role() = 'authenticated');

-- Admins see everything
create policy "admin_all_assessments" on public.assessments
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_all_plans" on public.strategic_plans
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_all_actions" on public.assessment_actions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_manage_questions" on public.assessment_questions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
