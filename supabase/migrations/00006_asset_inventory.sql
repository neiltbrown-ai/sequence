-- ============================================
-- In Sequence — Phase 6: Asset Inventory
-- Tables for cataloging unmonetized IP, judgment,
-- and other structural assets, plus AI analysis results.
-- ============================================

-- ── Inventory items ─────────────────────────────────────────────────
create table public.asset_inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  asset_name text not null,
  asset_type text not null
    check (asset_type in ('ip', 'judgment', 'relationship', 'process', 'audience', 'brand')),
  description text,
  ownership_status text not null
    check (ownership_status in ('own_fully', 'own_partially', 'work_for_hire', 'unclear', 'no_ownership')),
  licensing_potential text not null
    check (licensing_potential in ('high', 'medium', 'low', 'already_licensed', 'not_applicable')),
  notes text,

  -- Display ordering
  sort_order integer not null default 0,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_asset_inventory_user_id on public.asset_inventory_items(user_id);
create index idx_asset_inventory_sort on public.asset_inventory_items(user_id, sort_order);

-- Auto-update updated_at (uses existing function from 00001)
create trigger asset_inventory_updated_at
  before update on public.asset_inventory_items
  for each row execute function public.update_updated_at();

-- ── AI analysis results ─────────────────────────────────────────────
create table public.asset_inventory_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Structured AI output
  analysis_content jsonb not null default '{}',

  -- Snapshot of item count at time of analysis
  item_count integer not null default 0,

  -- Status tracking
  status text not null default 'generating'
    check (status in ('generating', 'completed', 'failed')),

  created_at timestamptz not null default now()
);

create index idx_asset_analyses_user_id on public.asset_inventory_analyses(user_id);
create index idx_asset_analyses_latest on public.asset_inventory_analyses(user_id, created_at desc);

-- ── Row Level Security ──────────────────────────────────────────────
alter table public.asset_inventory_items enable row level security;
alter table public.asset_inventory_analyses enable row level security;

-- Users manage their own inventory items
create policy "users_manage_own_inventory_items" on public.asset_inventory_items
  for all using (auth.uid() = user_id);

-- Users manage their own analyses
create policy "users_manage_own_inventory_analyses" on public.asset_inventory_analyses
  for all using (auth.uid() = user_id);

-- Admins see all
create policy "admin_all_inventory_items" on public.asset_inventory_items
  for all using (public.is_admin());

create policy "admin_all_inventory_analyses" on public.asset_inventory_analyses
  for all using (public.is_admin());

-- Notify PostgREST to pick up new tables
notify pgrst, 'reload schema';
