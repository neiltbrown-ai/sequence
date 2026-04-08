/**
 * Plan definitions and access control for tiered pricing.
 *
 * Tiers:
 *   - library:     $12/yr — content library only
 *   - full_access: $19/mo or $190/yr — library + AI tools + assessment
 *   - coaching:    $5K/mo — waitlist only (full_access + 1:1 coaching)
 *
 * Legacy mappings:
 *   - annual  → full_access (grandfathered)
 *   - student → library
 */

export type PlanId = "library" | "full_access" | "coaching" | "annual" | "student";

export type AccessTier = "library" | "full_access" | "coaching";

export interface PlanDef {
  id: PlanId;
  label: string;
  tier: AccessTier;
  price: { monthly?: number; annual: number } | null;
}

export const PLANS: Record<PlanId, PlanDef> = {
  library: {
    id: "library",
    label: "Library",
    tier: "library",
    price: { annual: 12 },
  },
  full_access: {
    id: "full_access",
    label: "Full Access",
    tier: "full_access",
    price: { monthly: 19, annual: 190 },
  },
  coaching: {
    id: "coaching",
    label: "1:1 Coaching",
    tier: "coaching",
    price: null, // waitlist only
  },
  // Legacy plans — mapped to tiers
  annual: {
    id: "annual",
    label: "Full Access (Legacy)",
    tier: "full_access",
    price: { annual: 89 },
  },
  student: {
    id: "student",
    label: "Student",
    tier: "library",
    price: { annual: 0 },
  },
};

/** Resolve a plan ID to its access tier. */
export function planTier(plan: string | null | undefined): AccessTier {
  if (!plan) return "library";
  return PLANS[plan as PlanId]?.tier ?? "library";
}

/** Check if a plan has access to a given tier level. */
export function hasAccess(plan: string | null | undefined, required: AccessTier): boolean {
  const TIER_RANK: Record<AccessTier, number> = {
    library: 1,
    full_access: 2,
    coaching: 3,
  };
  return TIER_RANK[planTier(plan)] >= TIER_RANK[required];
}

/**
 * Routes that require full_access tier (AI tools, assessment, etc.).
 * Library-tier users can access /library/* but not these.
 */
export const FULL_ACCESS_ROUTES = [
  "/advisor",
  "/roadmap",
  "/evaluate",
  "/inventory",
  "/assessment",
];

/**
 * Routes that require at least library tier (any paid subscription).
 */
export const LIBRARY_ROUTES = [
  "/library",
  "/saved",
  "/guides",
];

/** Stripe Price IDs — set in env, referenced here for checkout. */
export const STRIPE_PRICES = {
  library_annual: process.env.STRIPE_PRICE_LIBRARY_ANNUAL,
  full_access_monthly: process.env.STRIPE_PRICE_FULL_ACCESS_MONTHLY,
  full_access_annual: process.env.STRIPE_PRICE_FULL_ACCESS_ANNUAL,
} as const;

/** Map a Stripe price ID back to a plan ID. */
export function priceIdToPlan(priceId: string | null): PlanId {
  if (!priceId) return "library";
  if (priceId === STRIPE_PRICES.library_annual) return "library";
  if (priceId === STRIPE_PRICES.full_access_monthly) return "full_access";
  if (priceId === STRIPE_PRICES.full_access_annual) return "full_access";
  // Legacy single price ID fallback
  if (priceId === process.env.STRIPE_PRICE_ID) return "full_access";
  return "library";
}
