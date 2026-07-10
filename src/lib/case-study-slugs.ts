/**
 * Canonical case-study slug list, shared by:
 *  - the advisor system prompt (the "use these exact slugs" reference)
 *  - the chat renderer (auto-linking bold case-study names to ref cards)
 *
 * Single source: when a case study ships, add its slug here and both stay
 * in sync. Kept as a hand-maintained list (rather than an fs read) because
 * the chat renderer is a client component.
 */

export const CASE_STUDY_SLUGS = [
  "a24", "aaron-draplin", "artists-equity", "barrel-holdings", "beeple",
  "blumhouse", "bonobo", "brandon-sanderson", "brandon-stanton",
  "brett-williams", "chance-the-rapper", "charli-marie", "chase-jarvis",
  "chris-do", "cleo-abram", "codie-sanchez", "collins", "corbet-fastvold",
  "craig-mod", "david-bowie", "debbie-millman", "defector-media",
  "donald-glover", "george-lucas", "holly-herndon", "issa-rae",
  "jack-butcher", "jeremy-kirkland", "jessica-hische", "jessica-walsh",
  "joey-l", "johan-liden", "johnny-harris", "jordan-peele", "justin-vernon",
  "kristian-andersen", "kyla-scanlon", "lin-manuel-miranda", "maggie-rogers",
  "mark-duplass", "michaela-coel", "mimi-chao", "mrbeast", "mschf",
  "peter-mckinnon", "phoebe-waller-bridge", "pomplamoose",
  "reese-witherspoon", "refik-anadol", "roxane-gay", "ryan-reynolds",
  "simone-giertz", "sylvan-esso", "tara-mcmullin", "tash-sultana",
  "taylor-swift", "temi-coker", "tobias-van-schneider", "tom-cruise",
  "tyler-mitchell", "tyler-the-creator", "virgil-abloh", "wes-kao",
] as const;

const SLUG_SET = new Set<string>(CASE_STUDY_SLUGS);

/** Slugify a display name the same way the corpus slugs are formed. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * If a display name (e.g. "Chance the Rapper", "Justin Vernon") matches a
 * known case-study slug, return the slug; otherwise null.
 */
export function caseSlugForName(name: string): string | null {
  const slug = slugify(name.trim());
  return SLUG_SET.has(slug) ? slug : null;
}
