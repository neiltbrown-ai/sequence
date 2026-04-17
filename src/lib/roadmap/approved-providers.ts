/**
 * Approved service-provider whitelist for roadmap action cards.
 *
 * Claude is allowed to recommend providers in the generated roadmap, but
 * it frequently hallucinates URLs or suggests generic categories ("find a
 * tax accountant") that can't be linked. We only render providers that
 * match this whitelist, and we substitute the CANONICAL URL we know is
 * real — not whatever URL Claude generated.
 *
 * To add a provider: add an entry here with the canonical name, the real
 * URL, and lowercase match tokens Claude might produce.
 *
 * Keep this list tight — better to show zero providers than a broken
 * one. Later we'll have a properly-curated partner directory.
 */

export interface ApprovedProvider {
  /** Canonical display name */
  name: string;
  /** Verified real URL — this is what actually gets linked */
  url: string;
  /** Lowercase tokens that, if present in Claude's provider name, match */
  matches: string[];
  /** Short category label for display (optional) */
  category?: "entity" | "ip" | "legal" | "finance";
}

export const APPROVED_PROVIDERS: ApprovedProvider[] = [
  // ── Entity formation ──
  {
    name: "LegalZoom",
    url: "https://www.legalzoom.com",
    matches: ["legalzoom", "legal zoom"],
    category: "entity",
  },
  {
    name: "Clerky",
    url: "https://www.clerky.com",
    matches: ["clerky"],
    category: "entity",
  },
  {
    name: "Tailor Brands",
    url: "https://www.tailorbrands.com",
    matches: ["tailor brands", "tailorbrands"],
    category: "entity",
  },
  {
    name: "Stripe Atlas",
    url: "https://stripe.com/atlas",
    matches: ["stripe atlas"],
    category: "entity",
  },
  {
    name: "Firstbase",
    url: "https://firstbase.io",
    matches: ["firstbase"],
    category: "entity",
  },
  {
    name: "Bizee",
    url: "https://bizee.com",
    matches: ["bizee", "incfile"],
    category: "entity",
  },
  {
    name: "ZenBusiness",
    url: "https://www.zenbusiness.com",
    matches: ["zenbusiness", "zen business"],
    category: "entity",
  },
  {
    name: "Northwest Registered Agent",
    url: "https://www.northwestregisteredagent.com",
    matches: ["northwest registered agent", "northwest agent"],
    category: "entity",
  },

  // ── IP / legal ──
  {
    name: "USPTO",
    url: "https://www.uspto.gov",
    matches: ["uspto", "u.s. patent and trademark", "us patent"],
    category: "ip",
  },
  {
    name: "U.S. Copyright Office",
    url: "https://www.copyright.gov",
    matches: ["copyright.gov", "u.s. copyright office", "us copyright"],
    category: "ip",
  },
  {
    name: "Rocket Lawyer",
    url: "https://www.rocketlawyer.com",
    matches: ["rocket lawyer", "rocketlawyer"],
    category: "legal",
  },
  {
    name: "LegalTemplates",
    url: "https://legaltemplates.net",
    matches: ["legaltemplates", "legal templates"],
    category: "legal",
  },

  // ── Creative rights / contracts ──
  {
    name: "Creative Commons",
    url: "https://creativecommons.org",
    matches: ["creative commons"],
    category: "ip",
  },
];

/**
 * Given a provider entry from the AI output, return a safe display
 * version (canonical name + verified URL) or null if it doesn't match
 * any approved provider.
 */
export function resolveApprovedProvider(input: {
  name: string;
  url?: string;
}): ApprovedProvider | null {
  const haystack = `${input.name} ${input.url ?? ""}`.toLowerCase();
  for (const provider of APPROVED_PROVIDERS) {
    if (provider.matches.some((token) => haystack.includes(token))) {
      return provider;
    }
  }
  return null;
}
