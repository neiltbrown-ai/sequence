-- ============================================
-- Rate limiting — fixed-window counters + atomic check function
-- Backs src/lib/rate-limit.ts. The application fails OPEN if this table /
-- function is absent, so deploying the code before this migration is applied
-- is safe (limits simply aren't enforced until the migration lands).
-- ============================================

create table if not exists public.rate_limit_counters (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

-- Only the service role touches this table (via the SECURITY DEFINER function
-- below and the admin client). Enable RLS with no policies so it is closed to
-- anon/authenticated PostgREST access by default.
alter table public.rate_limit_counters enable row level security;

-- Atomically increment the counter for `p_key` within a `p_window_seconds`
-- fixed window and report whether the caller is still under `p_limit`.
-- Returns TRUE when the request is allowed, FALSE when the limit is exceeded.
-- The whole read-modify-write happens in one INSERT ... ON CONFLICT so
-- concurrent callers can't race past the limit.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit_counters as rlc (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set
      count = case
        when rlc.window_start < now() - make_interval(secs => p_window_seconds)
          then 1
        else rlc.count + 1
      end,
      window_start = case
        when rlc.window_start < now() - make_interval(secs => p_window_seconds)
          then now()
        else rlc.window_start
      end
  returning rlc.count into v_count;

  return v_count <= p_limit;
end;
$$;

-- Allow the service role to execute the checker.
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- Housekeeping index for optional periodic pruning of stale rows.
create index if not exists idx_rate_limit_counters_window
  on public.rate_limit_counters(window_start);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
