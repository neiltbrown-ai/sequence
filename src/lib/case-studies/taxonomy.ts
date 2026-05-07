/**
 * Canonical case-study taxonomy: 16 industries × 10 disciplines.
 *
 * Source of truth for:
 *   - Case study MDX frontmatter (`industries: string[]`, `disciplines: string[]`)
 *   - Filter UI on `/case-studies` and `/library/case-studies`
 *   - (Phase 3) assessment Q1 industry vocabulary
 *
 * Companion doc: `content/reference/case-study-taxonomy.md`. Keep this
 * module and that doc in sync — definitions, scope rules, and worked
 * examples live in the doc.
 *
 * Industries are grouped into 5 domains for cognitive structure in the
 * sidebar UI (filter still surfaces as one flat list; the group label
 * is just a heading above each cluster of checkboxes).
 *
 * The legacy singular `industry: string` field on case studies is
 * deprecated; first item of `industries[]` is the primary.
 */

export const INDUSTRY_GROUPS = [
  { slug: "visual_craft", label: "Visual / craft" },
  { slug: "time_based", label: "Time-based / performing" },
  { slug: "word_editorial", label: "Word / editorial" },
  { slug: "commercial_experiential", label: "Commercial / experiential" },
  { slug: "tech", label: "Tech" },
] as const;

export type IndustryGroupSlug = (typeof INDUSTRY_GROUPS)[number]["slug"];

export const INDUSTRIES = [
  // Visual / craft
  { slug: "visual_art", label: "Visual Art", group: "visual_craft" },
  { slug: "design", label: "Design", group: "visual_craft" },
  { slug: "photography", label: "Photography", group: "visual_craft" },
  { slug: "comics", label: "Comics & Illustration", group: "visual_craft" },
  { slug: "architecture", label: "Architecture", group: "visual_craft" },
  { slug: "fashion", label: "Fashion", group: "visual_craft" },

  // Time-based / performing
  { slug: "film_tv", label: "Film & TV", group: "time_based" },
  { slug: "music", label: "Music", group: "time_based" },
  { slug: "theater", label: "Theater & Performing Arts", group: "time_based" },
  { slug: "comedy", label: "Comedy", group: "time_based" },

  // Word / editorial
  { slug: "writing", label: "Writing & Publishing", group: "word_editorial" },
  { slug: "media", label: "Media & Editorial", group: "word_editorial" },

  // Commercial / experiential
  { slug: "advertising", label: "Advertising", group: "commercial_experiential" },
  { slug: "hospitality", label: "Hospitality", group: "commercial_experiential" },

  // Tech
  { slug: "technology", label: "Technology", group: "tech" },
  { slug: "gaming", label: "Gaming", group: "tech" },
] as const;

export type IndustrySlug = (typeof INDUSTRIES)[number]["slug"];

export const DISCIPLINES = [
  { slug: "direction", label: "Direction" },
  { slug: "production", label: "Production" },
  { slug: "writing", label: "Writing" },
  { slug: "design", label: "Design" },
  { slug: "performance", label: "Performance" },
  { slug: "leadership", label: "Leadership" },
  { slug: "investing", label: "Investing" },
  { slug: "distribution", label: "Distribution" },
  { slug: "education", label: "Education" },
  { slug: "engineering", label: "Engineering" },
] as const;

export type DisciplineSlug = (typeof DISCIPLINES)[number]["slug"];

export const INDUSTRY_SLUGS: readonly IndustrySlug[] = INDUSTRIES.map(
  (i) => i.slug
);

export const DISCIPLINE_SLUGS: readonly DisciplineSlug[] = DISCIPLINES.map(
  (d) => d.slug
);

const INDUSTRY_SLUG_SET = new Set<string>(INDUSTRY_SLUGS);
const DISCIPLINE_SLUG_SET = new Set<string>(DISCIPLINE_SLUGS);

export function isIndustrySlug(value: string): value is IndustrySlug {
  return INDUSTRY_SLUG_SET.has(value);
}

export function isDisciplineSlug(value: string): value is DisciplineSlug {
  return DISCIPLINE_SLUG_SET.has(value);
}

export function getIndustryLabel(slug: IndustrySlug): string {
  return INDUSTRIES.find((i) => i.slug === slug)?.label ?? slug;
}

export function getDisciplineLabel(slug: DisciplineSlug): string {
  return DISCIPLINES.find((d) => d.slug === slug)?.label ?? slug;
}

export function industriesByGroup(): Array<{
  group: (typeof INDUSTRY_GROUPS)[number];
  industries: typeof INDUSTRIES;
}> {
  return INDUSTRY_GROUPS.map((group) => ({
    group,
    industries: INDUSTRIES.filter(
      (i) => i.group === group.slug
    ) as unknown as typeof INDUSTRIES,
  }));
}
