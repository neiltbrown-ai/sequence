/**
 * Canonical income-range vocabulary used by:
 *   - Settings → Profile (writes profiles.income_range)
 *   - Assessment Q6 (writes assessments.income_range; scoring keyed off these values)
 *
 * Keep these values aligned with `Q6_INCOME` in
 * `src/lib/assessment/questions.ts` and the score map in
 * `src/lib/assessment/scoring.ts` (Q6_SCORES). Drift between them
 * silently corrupts stage detection and the deal-evaluator's tax-bucket
 * derivation (deriveF3) — both consume `income_range` as a string key.
 *
 * Pre-2026-05 history: Settings used hyphen-delimited buckets
 * (`under-50k`, `50-75k`, `75-150k`, …) and the now-deleted /onboarding
 * route wrote display labels (`"Under $50K"`, `"$300K+"`). Both have
 * been migrated to the canonical vocabulary below; legacy values are
 * backfilled by migration `00017_normalize_profile_income_range.sql`.
 */

export const INCOME_RANGE_OPTIONS = [
  { value: "under_50k", label: "Under $50K" },
  { value: "50k_75k", label: "$50K – $75K" },
  { value: "75k_100k", label: "$75K – $100K" },
  { value: "100k_150k", label: "$100K – $150K" },
  { value: "150k_200k", label: "$150K – $200K" },
  { value: "200k_300k", label: "$200K – $300K" },
  { value: "300k_500k", label: "$300K – $500K" },
  { value: "500k_1m", label: "$500K – $1M" },
  { value: "1m_plus", label: "$1M+" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

export type IncomeRangeValue =
  (typeof INCOME_RANGE_OPTIONS)[number]["value"];
