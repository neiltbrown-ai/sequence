-- ============================================
-- In Sequence — Phase 3: AI Advisor
-- Creates tables for AI conversations and partial assessments.
-- ============================================

-- ── AI Conversations ──────────────────────
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Conversation metadata
  title text,
  started_at timestamptz not null default now(),
  last_message_at timestamptz,

  -- Mode tracking
  current_mode text not null default 'explore'
    check (current_mode in ('assessment', 'evaluator', 'negotiation', 'library', 'action_coaching', 'explore')),
  modes_used text[] not null default '{}',
  initial_path text
    check (initial_path in ('deal', 'map', 'explore')),

  -- Linked records
  assessment_id uuid references public.assessments(id) on delete set null,
  action_id uuid references public.assessment_actions(id) on delete set null,

  -- Messages stored as JSONB array
  -- Each element: { id, role, content, tool_calls?, mode, timestamp }
  messages jsonb not null default '[]'::jsonb,

  -- Context snapshot for resuming conversations
  context_snapshot jsonb,

  -- Counters
  message_count integer not null default 0,
  is_archived boolean not null default false,

  created_at timestamptz not null default now()
);

create index idx_ai_conversations_user_id on public.ai_conversations(user_id);
create index idx_ai_conversations_last_message on public.ai_conversations(last_message_at desc);
create index idx_ai_conversations_assessment on public.ai_conversations(assessment_id);

-- ── Partial Assessments (data captured from explore or deal eval) ──────────────────────
create table public.partial_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.ai_conversations(id) on delete set null,

  -- Captured assessment-adjacent data
  discipline text,
  sub_discipline text,
  creative_mode text
    check (creative_mode is null or creative_mode in ('maker', 'service', 'hybrid', 'performer', 'builder', 'transition')),
  income_range text,
  business_structure text,

  -- Freeform additional data
  additional_data jsonb default '{}',

  -- Whether this was consumed into a real assessment
  consumed_by_assessment_id uuid references public.assessments(id) on delete set null,

  created_at timestamptz not null default now()
);

create index idx_partial_assessments_user_id on public.partial_assessments(user_id);
create index idx_partial_assessments_conversation on public.partial_assessments(conversation_id);

-- ── Row Level Security ──────────────────────

alter table public.ai_conversations enable row level security;
alter table public.partial_assessments enable row level security;

-- Members see only their own data
create policy "users_own_conversations" on public.ai_conversations
  for all using (auth.uid() = user_id);

create policy "users_own_partials" on public.partial_assessments
  for all using (auth.uid() = user_id);

-- Admins see everything (using is_admin() to avoid RLS recursion)
create policy "admin_all_conversations" on public.ai_conversations
  for all using (public.is_admin());

create policy "admin_all_partials" on public.partial_assessments
  for all using (public.is_admin());
