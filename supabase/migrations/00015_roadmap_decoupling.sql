-- ============================================
-- Batch B: Roadmap decoupling
-- Allow strategic_plans to be generated from Portfolio Analysis
-- (and future inputs) — not just Assessment / Creative Identity.
-- ============================================

-- 1. Make assessment_id nullable
alter table public.strategic_plans
  alter column assessment_id drop not null;

-- 2. Add source column (which input(s) drove this plan)
alter table public.strategic_plans
  add column if not exists source text not null default 'assessment'
    check (source in ('assessment', 'portfolio', 'combined'));

-- 3. Add portfolio_analysis_id foreign key
alter table public.strategic_plans
  add column if not exists portfolio_analysis_id uuid
    references public.asset_inventory_analyses(id) on delete set null;

-- 4. Index for portfolio-driven plans
create index if not exists idx_strategic_plans_portfolio_analysis_id
  on public.strategic_plans(portfolio_analysis_id);

-- 5. Backfill: existing rows are assessment-driven (default handles this,
--    but be explicit in case the default is changed later)
update public.strategic_plans
  set source = 'assessment'
  where source is null and assessment_id is not null;

-- 6. Sanity constraint: at least one input must be set
alter table public.strategic_plans
  add constraint strategic_plans_input_required
    check (assessment_id is not null or portfolio_analysis_id is not null);

-- Notify PostgREST to pick up schema changes
notify pgrst, 'reload schema';
