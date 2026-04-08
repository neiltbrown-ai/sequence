-- ============================================
-- In Sequence — Tiered Pricing Migration
-- Adds library, full_access, coaching plans
-- Grandfathers existing annual → full_access
-- ============================================

-- 1. Drop old check constraint and add new one with all plan values
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'subscriptions_plan_check'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_plan_check
      CHECK (plan IN ('annual', 'student', 'library', 'full_access', 'coaching'));
  END IF;
END $$;

-- 2. Add stripe_price_id column if missing (already exists, but safe)
-- Already exists from initial schema

-- 3. Grandfather existing annual subscribers as full_access
-- (Run this ONCE during migration — idempotent via WHERE clause)
UPDATE public.subscriptions
  SET plan = 'full_access'
  WHERE plan = 'annual'
    AND status IN ('active', 'trialing');

-- 4. Map student → library access level (student plan stays as-is for tracking,
--    but the plan utility will treat it as library-tier access)

-- 5. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
