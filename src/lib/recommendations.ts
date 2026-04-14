/**
 * Server-side recommendation engine for library dashboard.
 * Scores content items by profile match — no AI calls.
 */

import type { StructureMeta, CaseStudyMeta, ArticleMeta } from "./content";

export interface RecommendationInput {
  disciplines: string[];
  interests: string[];
  careerStage: string | null;
  bookmarkedSlugs: Set<string>;
}

export interface ScoredItem {
  item: StructureMeta | CaseStudyMeta | ArticleMeta;
  score: number;
  matchReasons: string[];
}

/**
 * Map user interest selections to content tags and structure numbers.
 */
const INTEREST_TAG_MAP: Record<string, { tags: string[]; structureNums?: number[] }> = {
  "Deal Structures": { tags: ["deal", "compensation", "deal-structures"], structureNums: [17, 18, 19, 20, 21] },
  "Revenue Models": { tags: ["revenue", "revenue-share", "profit-participation"], structureNums: [10, 22, 23, 24, 25, 26] },
  "IP Valuation": { tags: ["ip", "catalog", "securitization", "catalog-value"], structureNums: [14, 27, 28, 29, 30, 31] },
  "Catalog Strategy": { tags: ["catalog", "catalog-value", "licensing"], structureNums: [14, 29, 30] },
  "Creative Finance": { tags: ["finance", "capital", "convertible"], structureNums: [21, 14, 33] },
  "Negotiation": { tags: ["negotiation", "milestone", "option"], structureNums: [33, 35] },
  "Equity & Ownership": { tags: ["equity", "ownership", "vesting"], structureNums: [17, 18, 19, 20, 32] },
  "Licensing": { tags: ["licensing", "license", "non-exclusive"], structureNums: [27, 28] },
  "Career Transition": { tags: ["career-transition", "transition", "independence"] },
  "Starting a Business": { tags: ["business-model", "foundation", "startup"], structureNums: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
};

/**
 * Map career stage to structure stage labels.
 */
const STAGE_MAP: Record<string, string[]> = {
  student: ["STAGE 1"],
  "early-career": ["STAGE 1"],
  "mid-career": ["STAGE 2"],
  executive: ["STAGE 3", "STAGE 4"],
  founder: ["STAGE 3", "STAGE 4"],
  investor: ["STAGE 3", "STAGE 4"],
};

/**
 * Map user discipline selections to case study discipline keywords.
 * Case study discipline fields are free-form (e.g., "Film / Production"),
 * so we match by substring.
 */
const DISCIPLINE_KEYWORDS: Record<string, string[]> = {
  Film: ["film", "production", "cinema", "documentary"],
  Music: ["music", "hip-hop", "hip hop", "streaming", "catalog", "songwriter"],
  Design: ["design", "graphic", "branding", "visual"],
  Fashion: ["fashion", "apparel", "clothing"],
  Technology: ["technology", "tech", "digital", "nft", "web3", "dao"],
  Publishing: ["publishing", "author", "book", "writing", "journalism"],
  Sports: ["sports", "athlete"],
  Gaming: ["gaming", "game"],
  Marketing: ["marketing", "content", "creator"],
  Architecture: ["architecture"],
  "Food & Beverage": ["food", "beverage", "restaurant"],
};

function scoreStructure(
  s: StructureMeta,
  input: RecommendationInput,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Interest matching
  for (const interest of input.interests) {
    const map = INTEREST_TAG_MAP[interest];
    if (!map) continue;
    if (map.structureNums?.includes(s.number)) {
      score += 3;
      reasons.push(interest);
    } else if (map.tags.some((t) => s.tags?.some((st) => st.toLowerCase().includes(t)))) {
      score += 1.5;
      reasons.push(interest);
    }
  }

  // Career stage matching
  if (input.careerStage) {
    const stages = STAGE_MAP[input.careerStage];
    if (stages?.some((st) => s.stage?.toUpperCase().includes(st))) {
      score += 2;
      if (!reasons.length) reasons.push("Your career stage");
    }
  }

  return { score, reasons: [...new Set(reasons)] };
}

function scoreCaseStudy(
  cs: CaseStudyMeta,
  input: RecommendationInput,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const discLower = cs.discipline?.toLowerCase() ?? "";
  const industryLower = cs.industry?.toLowerCase() ?? "";

  // Discipline matching
  for (const disc of input.disciplines) {
    const keywords = DISCIPLINE_KEYWORDS[disc];
    if (!keywords) continue;
    if (keywords.some((kw) => discLower.includes(kw) || industryLower.includes(kw))) {
      score += 3;
      reasons.push(disc);
    }
  }

  // Interest matching via tags
  for (const interest of input.interests) {
    const map = INTEREST_TAG_MAP[interest];
    if (!map) continue;
    if (map.tags.some((t) => cs.tags?.some((ct) => ct.toLowerCase().includes(t)))) {
      score += 1.5;
      reasons.push(interest);
    }
  }

  // Featured bonus
  if (cs.featured) score += 0.5;

  return { score, reasons: [...new Set(reasons)] };
}

function scoreArticle(
  a: ArticleMeta,
  input: RecommendationInput,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Interest matching via tags
  for (const interest of input.interests) {
    const map = INTEREST_TAG_MAP[interest];
    if (!map) continue;
    if (map.tags.some((t) => a.tags?.some((at) => at.toLowerCase().includes(t)))) {
      score += 2;
      reasons.push(interest);
    }
  }

  return { score, reasons: [...new Set(reasons)] };
}

/**
 * Get personalized content recommendations.
 * Returns up to `limit` items, mixing structures, case studies, and articles.
 */
export function getRecommendations(
  input: RecommendationInput,
  structures: StructureMeta[],
  caseStudies: CaseStudyMeta[],
  articles: ArticleMeta[],
  limit = 6,
): ScoredItem[] {
  const all: ScoredItem[] = [];

  for (const s of structures) {
    if (input.bookmarkedSlugs.has(s.slug)) continue;
    const { score, reasons } = scoreStructure(s, input);
    if (score > 0) all.push({ item: s, score, matchReasons: reasons });
  }

  for (const cs of caseStudies) {
    if (input.bookmarkedSlugs.has(cs.slug)) continue;
    const { score, reasons } = scoreCaseStudy(cs, input);
    if (score > 0) all.push({ item: cs, score, matchReasons: reasons });
  }

  for (const a of articles) {
    if (input.bookmarkedSlugs.has(a.slug)) continue;
    const { score, reasons } = scoreArticle(a, input);
    if (score > 0) all.push({ item: a, score, matchReasons: reasons });
  }

  // Sort by score descending, then diversify types
  all.sort((a, b) => b.score - a.score);

  // Pick top items with type diversity
  const result: ScoredItem[] = [];
  const typeCounts = { structure: 0, "case-study": 0, article: 0 };
  const maxPerType = Math.ceil(limit / 2); // no more than half from one type

  for (const item of all) {
    if (result.length >= limit) break;
    const t = item.item.type;
    if (typeCounts[t] >= maxPerType) continue;
    result.push(item);
    typeCounts[t]++;
  }

  // If we didn't fill up, add remaining by score regardless of type
  if (result.length < limit) {
    const used = new Set(result.map((r) => `${r.item.type}:${r.item.slug}`));
    for (const item of all) {
      if (result.length >= limit) break;
      const key = `${item.item.type}:${item.item.slug}`;
      if (used.has(key)) continue;
      result.push(item);
    }
  }

  return result;
}

/**
 * Get curated editorial picks (fallback when no profile data).
 */
export function getEditorialPicks(
  structures: StructureMeta[],
  caseStudies: CaseStudyMeta[],
  articles: ArticleMeta[],
  limit = 6,
): ScoredItem[] {
  const result: ScoredItem[] = [];

  // Pick accessible entry-point structures
  const entryStructures = structures.filter((s) => [1, 12, 17, 24].includes(s.number));
  for (const s of entryStructures.slice(0, 2)) {
    result.push({ item: s, score: 0, matchReasons: ["Editor's pick"] });
  }

  // Pick featured case studies
  const featured = caseStudies.filter((cs) => cs.featured);
  const casePicks = featured.length >= 2 ? featured.slice(0, 2) : caseStudies.slice(0, 2);
  for (const cs of casePicks) {
    result.push({ item: cs, score: 0, matchReasons: ["Editor's pick"] });
  }

  // Pick latest articles
  for (const a of articles.slice(0, 2)) {
    result.push({ item: a, score: 0, matchReasons: ["Editor's pick"] });
  }

  return result.slice(0, limit);
}

/**
 * Get recently added/updated content.
 */
export function getNewContent(
  structures: StructureMeta[],
  caseStudies: CaseStudyMeta[],
  articles: ArticleMeta[],
  limit = 3,
): (StructureMeta | CaseStudyMeta | ArticleMeta)[] {
  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  const all = [
    ...structures.map((s) => ({ ...s })),
    ...caseStudies.map((cs) => ({ ...cs })),
    ...articles.map((a) => ({ ...a })),
  ];

  // Sort by updatedAt descending
  all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Try 14-day window first
  let recent = all.filter((item) => now - new Date(item.updatedAt).getTime() < FOURTEEN_DAYS);
  if (recent.length < limit) {
    recent = all.filter((item) => now - new Date(item.updatedAt).getTime() < THIRTY_DAYS);
  }

  return recent.slice(0, limit);
}

// ── Portfolio-aware case study recommendations ─────────────────

/**
 * Map AssetType → interest tags + relevant structure numbers.
 * Used to translate portfolio composition into content matching signals.
 */
const ASSET_TYPE_INTERESTS: Record<string, { tags: string[]; structureNums: number[]; disciplineHints?: string[] }> = {
  ip: {
    tags: ["ip", "catalog", "catalog-value", "licensing", "securitization"],
    structureNums: [14, 27, 28, 29, 30],
  },
  judgment: {
    tags: ["advisory", "consulting", "discernment-premium", "career-transition"],
    structureNums: [4, 17, 18],
  },
  relationship: {
    tags: ["partnership", "joint-venture", "advisory", "co-creation"],
    structureNums: [5, 6, 18],
  },
  process: {
    tags: ["process", "platform", "infrastructure"],
    structureNums: [7, 12],
  },
  audience: {
    tags: ["audience", "creator", "subscription", "newsletter"],
    structureNums: [12, 25],
  },
  brand: {
    tags: ["brand", "licensing", "franchise", "creator-platform"],
    structureNums: [11, 12, 28],
  },
};

interface PortfolioAsset {
  asset_type: string;
}

/**
 * Get top N case studies for a user, prioritizing portfolio composition over profile.
 *
 * Priority order:
 *   1. Portfolio assets (if assets.length > 0) — score by asset type relevance
 *   2. Profile data (if disciplines/interests/stage provided) — use existing scoring
 *   3. Editorial fallback — featured case studies
 */
export function getCaseStudyRecommendationsForUser({
  assets,
  profile,
  caseStudies,
  bookmarkedSlugs = new Set(),
  limit = 3,
}: {
  assets?: PortfolioAsset[];
  profile?: {
    disciplines: string[];
    interests: string[];
    careerStage: string | null;
  };
  caseStudies: CaseStudyMeta[];
  bookmarkedSlugs?: Set<string>;
  limit?: number;
}): CaseStudyMeta[] {
  // Strategy 1: Portfolio-based scoring
  if (assets && assets.length > 0) {
    // Aggregate interest tags from asset types
    const assetTags = new Set<string>();
    const assetStructures = new Set<number>();
    for (const asset of assets) {
      const map = ASSET_TYPE_INTERESTS[asset.asset_type];
      if (!map) continue;
      map.tags.forEach((t) => assetTags.add(t));
      map.structureNums.forEach((n) => assetStructures.add(n));
    }

    const scored = caseStudies
      .filter((cs) => !bookmarkedSlugs.has(cs.slug))
      .map((cs) => {
        let score = 0;
        // Tag match
        const tagsLower = (cs.tags || []).map((t) => t.toLowerCase());
        for (const tag of assetTags) {
          if (tagsLower.some((ct) => ct.includes(tag))) score += 2;
        }
        // Structure references
        for (const num of cs.structures || []) {
          if (assetStructures.has(num)) score += 1.5;
        }
        // Featured tiebreaker
        if (cs.featured) score += 0.5;
        return { cs, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length >= limit) {
      return scored.slice(0, limit).map(({ cs }) => cs);
    }
    // Fall through to profile if not enough portfolio matches
  }

  // Strategy 2: Profile-based scoring
  if (profile && (profile.disciplines.length > 0 || profile.interests.length > 0 || profile.careerStage)) {
    const input: RecommendationInput = {
      disciplines: profile.disciplines,
      interests: profile.interests,
      careerStage: profile.careerStage,
      bookmarkedSlugs,
    };
    const scored = caseStudies
      .filter((cs) => !bookmarkedSlugs.has(cs.slug))
      .map((cs) => ({ cs, score: scoreCaseStudy(cs, input).score }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length >= limit) {
      return scored.slice(0, limit).map(({ cs }) => cs);
    }
  }

  // Strategy 3: Editorial fallback — featured first, then any
  const featured = caseStudies.filter((cs) => cs.featured && !bookmarkedSlugs.has(cs.slug));
  if (featured.length >= limit) return featured.slice(0, limit);

  const fallback = [
    ...featured,
    ...caseStudies.filter(
      (cs) => !cs.featured && !bookmarkedSlugs.has(cs.slug),
    ),
  ];
  return fallback.slice(0, limit);
}
