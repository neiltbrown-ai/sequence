-- ============================================
-- In Sequence — Phase 3: Deal Evaluator
-- Creates tables for deal evaluations and AI-generated verdicts.
-- ============================================

-- ── Deal evaluations (per-deal, not versioned) ─────────────────────
create table public.deal_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),

  -- Creative context
  creative_mode text
    check (creative_mode in ('maker', 'service', 'hybrid', 'performer', 'builder', 'transition')),
  creative_mode_source text default 'evaluator'
    check (creative_mode_source in ('assessment', 'evaluator')),

  -- Deal identification
  deal_type text
    check (deal_type in ('service', 'equity', 'licensing', 'partnership', 'revenue_share', 'advisory')),
  deal_name text,
  mapped_structures int[] default '{}',

  -- Assessment snapshot (captured at evaluation time)
  assessment_id uuid references public.assessments(id) on delete set null,
  assessment_stage int,
  assessment_flags text[] default '{}',
  archetype_primary text,

  -- Answers per dimension (jsonb, each value: {value, source})
  answers_financial jsonb default '{}',
  answers_career jsonb default '{}',
  answers_partner jsonb default '{}',
  answers_structure jsonb default '{}',
  answers_risk jsonb default '{}',
  answers_legal jsonb default '{}',

  -- Computed scores
  scores jsonb default '{}',
  overall_score numeric(4,2),
  overall_signal text
    check (overall_signal in ('green', 'yellow', 'red')),
  red_flags text[] default '{}',

  -- Progress tracking
  current_dimension int default 0,
  current_question int default 0,

  -- Deal outcome tracking (V2 UI, columns exist for future)
  deal_outcome text
    check (deal_outcome in ('accepted', 'declined', 'renegotiated', 'pending')),
  outcome_notes text,
  outcome_recorded_at timestamptz,

  -- Timestamps
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_deal_evaluations_user_id on public.deal_evaluations(user_id);
create index idx_deal_evaluations_status on public.deal_evaluations(status);
create index idx_deal_evaluations_assessment on public.deal_evaluations(assessment_id);

-- ── Deal verdicts (AI-generated narrative from evaluation) ─────────
create table public.deal_verdicts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  evaluation_id uuid references public.deal_evaluations(id) on delete cascade,
  verdict_content jsonb not null default '{}',
  status text not null default 'generating'
    check (status in ('generating', 'draft', 'published')),
  created_at timestamptz default now()
);

create index idx_deal_verdicts_evaluation on public.deal_verdicts(evaluation_id);

-- ── Row Level Security ─────────────────────────────────────────────

alter table public.deal_evaluations enable row level security;
alter table public.deal_verdicts enable row level security;

-- Members see only their own data
create policy "users_own_evaluations" on public.deal_evaluations
  for all using (auth.uid() = user_id);

create policy "users_own_verdicts" on public.deal_verdicts
  for all using (auth.uid() = user_id);

-- Admins see everything
create policy "admin_all_evaluations" on public.deal_evaluations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_all_verdicts" on public.deal_verdicts
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Notify PostgREST to pick up new tables
notify pgrst, 'reload schema';
