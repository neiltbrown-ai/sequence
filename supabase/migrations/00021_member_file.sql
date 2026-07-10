-- ============================================
-- Member File — durable facts with source + confidence
-- (simplification strategy §2.2, Phase 2a)
--
-- One canonical data object per member: schematized, aggregatable
-- facts about their situation (discipline, what they own, entity
-- setup, income shape, ...). Every fact carries where it came from
-- (stated / inferred / computed / imported) and how sure we are
-- (low / medium / high). The file is member-visible and editable —
-- trust requires visibility — and every fact stays comparable
-- across members for future benchmarks / MCP access.
--
-- The advisor writes through the update_member_file tool
-- (src/lib/advisor/tools.ts); reads go through
-- src/lib/member-file/facts.ts, which degrades gracefully
-- (empty file) until this migration is applied.
-- ============================================

create table public.member_file_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- snake_case fact key, e.g. 'discipline', 'owns_masters', 'entity_setup'
  fact text not null,
  -- string | number | boolean | object
  value jsonb not null,

  -- Where the fact came from:
  --   stated   — the member said it directly
  --   inferred — the advisor deduced it (provenance quotes their words)
  --   computed — deterministic server-side code produced it (scoring.ts etc.)
  --   imported — one-time backfill from assessments / inventory / deals
  source text not null
    check (source in ('stated', 'inferred', 'computed', 'imported')),
  confidence text not null
    check (confidence in ('low', 'medium', 'high')),

  -- e.g. 'inferred from "label owns everything"' or 'imported from assessment'
  provenance text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One row per fact per member — updates overwrite, history lives in provenance
  unique (user_id, fact)
);

comment on table public.member_file_facts is
  'The Member File: durable, schematized facts about a member with source + confidence (simplification strategy §2.2). Member-visible; written by the advisor via update_member_file; aggregatable for future benchmarks.';

create index idx_member_file_facts_user_id on public.member_file_facts(user_id);

-- Auto-update updated_at (uses existing function from 00001)
create trigger member_file_facts_updated_at
  before update on public.member_file_facts
  for each row execute function public.update_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────
alter table public.member_file_facts enable row level security;

-- Users manage their own file
create policy "users_manage_own_member_file_facts" on public.member_file_facts
  for all using (auth.uid() = user_id);

-- Admins see all
create policy "admin_all_member_file_facts" on public.member_file_facts
  for all using (public.is_admin());

-- Notify PostgREST to pick up new table
notify pgrst, 'reload schema';
