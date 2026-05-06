-- ============================================
-- Normalize profiles.income_range to canonical vocabulary.
--
-- Pre-2026-05 history: Settings form wrote hyphen-delimited buckets
-- (`under-50k`, `50-75k`, `75-150k`, `150-300k`, `300-500k`, `500k-plus`,
-- `other`); Onboarding wrote display labels (`Under $50K`, `$50K–$100K`,
-- `$100K–$150K`, `$150K–$200K`, `$200K–$300K`, `$300K+`). Neither
-- matched the assessment's canonical vocabulary keyed off
-- `Q6_INCOME` / `Q6_SCORES` (under_50k, 50k_75k, 75k_100k, …,
-- 500k_1m, 1m_plus, prefer_not).
--
-- This migration backfills any legacy values to canonical so admin
-- displays and any future cross-table consumers see a single vocab.
-- Where a legacy bracket spans two canonical brackets (e.g. settings
-- `75-150k` covers both `75k_100k` and `100k_150k`), we map to the
-- LOWER bound — conservative, won't over-state stated income.
--
-- Idempotent: scoped by IN-list of legacy values; re-running is a no-op.
-- The en-dash in onboarding labels is U+2013 — file is UTF-8.
-- ============================================

update public.profiles
set income_range = case income_range
  -- Settings legacy (hyphen delimiter)
  when 'under-50k'  then 'under_50k'
  when '50-75k'     then '50k_75k'
  when '75-150k'    then '75k_100k'   -- lossy: lower bound of $75–150K
  when '150-300k'   then '150k_200k'  -- lossy: lower bound of $150–300K
  when '300-500k'   then '300k_500k'
  when '500k-plus'  then '500k_1m'    -- lossy: lower bound of open $500K+
  when 'other'      then 'prefer_not'
  -- Onboarding legacy (display labels)
  when 'Under $50K'    then 'under_50k'
  when '$50K–$100K'    then '50k_75k'   -- lossy: lower bound of $50–100K
  when '$100K–$150K'   then '100k_150k'
  when '$150K–$200K'   then '150k_200k'
  when '$200K–$300K'   then '200k_300k'
  when '$300K+'        then '300k_500k' -- lossy: lower bound of open $300K+
end
where income_range in (
  -- Settings legacy
  'under-50k', '50-75k', '75-150k', '150-300k', '300-500k', '500k-plus', 'other',
  -- Onboarding legacy
  'Under $50K', '$50K–$100K', '$100K–$150K', '$150K–$200K', '$200K–$300K', '$300K+'
);
