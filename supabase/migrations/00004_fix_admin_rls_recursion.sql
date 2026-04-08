-- ============================================
-- Fix: infinite recursion in admin RLS policies
--
-- The "Admins can view all profiles" policy on public.profiles
-- references public.profiles itself, causing infinite recursion
-- when any RLS policy checks admin status via profiles.
--
-- Solution: a SECURITY DEFINER function that bypasses RLS
-- to check admin role, then use it in all admin policies.
-- ============================================

-- ── 1. Create helper function (bypasses RLS) ──────────────────────
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ── 2. Fix profiles policies ──────────────────────
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ── 3. Fix policies from 00001 that reference profiles ──────────────────────
drop policy if exists "Admins can view all subscriptions" on public.subscriptions;
create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

drop policy if exists "Admins can manage all content" on public.library_content;
create policy "Admins can manage all content"
  on public.library_content for all
  using (public.is_admin());

drop policy if exists "Admins can manage admin notes" on public.admin_notes;
create policy "Admins can manage admin notes"
  on public.admin_notes for all
  using (public.is_admin());

drop policy if exists "Admins can view all verifications" on public.student_verifications;
create policy "Admins can view all verifications"
  on public.student_verifications for select
  using (public.is_admin());

drop policy if exists "Admins can manage discount codes" on public.discount_codes;
create policy "Admins can manage discount codes"
  on public.discount_codes for all
  using (public.is_admin());

drop policy if exists "Admins can manage university codes" on public.university_codes;
create policy "Admins can manage university codes"
  on public.university_codes for all
  using (public.is_admin());

drop policy if exists "Admins can view email log" on public.email_log;
create policy "Admins can view email log"
  on public.email_log for select
  using (public.is_admin());

-- ── 4. Fix policies from 00003 (assessment tables) ──────────────────────
drop policy if exists "admin_all_assessments" on public.assessments;
create policy "admin_all_assessments" on public.assessments
  for all using (public.is_admin());

drop policy if exists "admin_all_plans" on public.strategic_plans;
create policy "admin_all_plans" on public.strategic_plans
  for all using (public.is_admin());

drop policy if exists "admin_all_actions" on public.assessment_actions;
create policy "admin_all_actions" on public.assessment_actions
  for all using (public.is_admin());

drop policy if exists "admin_manage_questions" on public.assessment_questions;
create policy "admin_manage_questions" on public.assessment_questions
  for all using (public.is_admin());

-- ── 5. Reload PostgREST schema cache ──────────────────────
notify pgrst, 'reload schema';
