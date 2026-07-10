-- ============================================
-- Deal lifecycle — Conversation → Offer → Draft → Signed
-- (simplification strategy §5, Phase 3a)
--
-- A deal is a relationship with a timeline, not a contract to score.
-- The real negotiation happens in texts, emails, and calls before a
-- document exists, so Deal Check now opens at first contact: the
-- advisor creates a living deal_evaluations row (source 'advisor')
-- at the conversation or offer stage and logs positioning notes as
-- the deal moves. Early stages get positioning — what to ask for,
-- what to find out, reply drafts — never a verdict. The scored
-- six-dimension verdict still comes only from the /evaluate wizard,
-- which keeps writing rows exactly the way it always has.
--
-- Additive only. RLS already exists on deal_evaluations (00006b:
-- users_own_evaluations + admin_all_evaluations, FOR ALL) and covers
-- these columns — no new policies needed.
--
-- The advisor tools (start_deal_check / update_deal_stage in
-- src/lib/advisor/tools.ts) and the stage-aware list queries degrade
-- gracefully until this migration is applied.
-- ============================================

-- Where the deal stands on its timeline. Default 'draft': every
-- existing row came through the terms-based wizard, and terms-in-hand
-- is the draft stage — so all existing verdict-bearing rows are
-- correctly classified.
alter table public.deal_evaluations
  add column deal_stage text not null default 'draft'
    check (deal_stage in ('conversation', 'offer', 'draft', 'signed'));

-- The advisor's positioning log per stage: a jsonb array of
-- { stage, at, summary } entries, appended each time the deal moves
-- or gets a meaningful update.
alter table public.deal_evaluations
  add column stage_notes jsonb;

-- Who opened the record: the structured /evaluate wizard or the
-- advisor's pre-contract Deal Check.
alter table public.deal_evaluations
  add column source text not null default 'wizard'
    check (source in ('wizard', 'advisor'));

comment on column public.deal_evaluations.deal_stage is
  'Deal lifecycle stage (strategy §5): conversation → offer → draft → signed. Rows created by the wizard default to draft (real terms exist).';
comment on column public.deal_evaluations.stage_notes is
  'Advisor positioning log: jsonb array of { stage, at, summary } entries appended as the deal progresses.';
comment on column public.deal_evaluations.source is
  'Origin of the record: the /evaluate wizard (scored verdict path) or the advisor (pre-contract Deal Check).';

-- Notify PostgREST to pick up new columns
notify pgrst, 'reload schema';
