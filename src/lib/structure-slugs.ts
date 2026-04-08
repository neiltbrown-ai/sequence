/** Canonical slugs for the 35 deal structures, indexed by structure number. */
const STRUCTURE_SLUGS: Record<number, string> = {
  1: "premium-service-model",
  2: "retainer-bonus-model",
  3: "project-equity-model",
  4: "advisory-consultant-model",
  5: "co-creation-joint-venture",
  6: "product-partnership-model",
  7: "platform-cooperative-model",
  8: "creative-collective-studio",
  9: "holding-company-model",
  10: "diversified-revenue-streams",
  11: "franchise-licensing-model",
  12: "creator-as-platform-model",
  13: "constraint-based-production",
  14: "catalog-ip-securitization",
  15: "dao-web3-governance",
  16: "ai-augmented-studio-model",
  17: "equity-for-services",
  18: "founder-co-founder-equity",
  19: "vesting-equity",
  20: "performance-equity",
  21: "convertible-notes",
  22: "gross-participation",
  23: "net-profit-participation",
  24: "revenue-share-partnership",
  25: "royalty-structures",
  26: "hybrid-fee-backend",
  27: "non-exclusive-licensing",
  28: "exclusive-licensing",
  29: "rights-reversion-clauses",
  30: "subsidiary-rights-retention",
  31: "territory-media-rights-splitting",
  32: "royalty-equity-hybrid",
  33: "milestone-payment-structures",
  34: "profit-participation-management-fee",
  35: "option-agreements",
};

/**
 * Resolve a structure slug from various input formats:
 * - numeric ID (17) → "equity-for-services"
 * - numbered slug ("17-equity-for-services") → "equity-for-services"
 * - clean slug ("equity-for-services") → "equity-for-services"
 */
export function resolveStructureSlug(input: string | number): string {
  // Numeric ID
  if (typeof input === "number") {
    return STRUCTURE_SLUGS[input] ?? String(input);
  }

  // Try as numeric string
  const num = parseInt(input, 10);
  if (!isNaN(num) && STRUCTURE_SLUGS[num] && String(num) === input) {
    return STRUCTURE_SLUGS[num];
  }

  // Strip leading number prefix (e.g. "17-equity-for-services" → "equity-for-services")
  return input.replace(/^\d+-/, "");
}

/**
 * Get the structure number from a slug.
 * Returns 0 if not found.
 */
export function getStructureNumber(slug: string): number {
  const clean = slug.replace(/^\d+-/, "");
  for (const [num, s] of Object.entries(STRUCTURE_SLUGS)) {
    if (s === clean) return parseInt(num, 10);
  }
  return 0;
}

export { STRUCTURE_SLUGS };
