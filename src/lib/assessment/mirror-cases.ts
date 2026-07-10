/**
 * Mirror-beat case picks — "These three started where you are."
 *
 * After Q1 (discipline) in the chat assessment flow, the advisor shows
 * three matched case studies before asking anything else about the
 * member (the "mirror" beat from the simplification strategy §4).
 *
 * Hand-curated per industry. Every slug is typed against
 * CASE_STUDY_SLUGS so an entry that isn't a real case study fails the
 * build. Thin industries reuse strong cross-industry cases.
 */

import type { IndustrySlug } from "@/lib/case-studies/taxonomy";
import { CASE_STUDY_SLUGS } from "@/lib/case-study-slugs";

type CaseSlug = (typeof CASE_STUDY_SLUGS)[number];

export interface MirrorCase {
  slug: string;
  name: string;
}

export interface MirrorBeat {
  line: string;
  cases: MirrorCase[];
}

/** Three case-study slugs per industry, compile-time checked. */
const MIRROR_CASES: Record<IndustrySlug, [CaseSlug, CaseSlug, CaseSlug]> = {
  // Visual / craft
  visual_art: ["beeple", "refik-anadol", "temi-coker"],
  design: ["jessica-hische", "collins", "aaron-draplin"],
  photography: ["brandon-stanton", "joey-l", "chase-jarvis"],
  comics: ["mimi-chao", "jessica-hische", "jack-butcher"],
  architecture: ["virgil-abloh", "johan-liden", "kristian-andersen"],
  fashion: ["virgil-abloh", "tyler-the-creator", "charli-marie"],
  // Time-based / performing
  film_tv: ["issa-rae", "mark-duplass", "a24"],
  music: ["chance-the-rapper", "sylvan-esso", "tash-sultana"],
  theater: ["lin-manuel-miranda", "phoebe-waller-bridge", "michaela-coel"],
  comedy: ["jordan-peele", "donald-glover", "phoebe-waller-bridge"],
  // Word / editorial
  writing: ["brandon-sanderson", "roxane-gay", "craig-mod"],
  media: ["defector-media", "johnny-harris", "cleo-abram"],
  // Commercial / experiential
  advertising: ["collins", "jessica-walsh", "chris-do"],
  hospitality: ["mrbeast", "tyler-the-creator", "codie-sanchez"],
  // Tech
  technology: ["refik-anadol", "simone-giertz", "jack-butcher"],
  gaming: ["mschf", "mrbeast", "simone-giertz"],
};

/** One-line mirror openers, phrased per industry (never "You're a Music."). */
const MIRROR_LINES: Record<IndustrySlug, string> = {
  visual_art: "You’re an artist. These three started where you are.",
  design: "You’re a designer. These three started where you are.",
  photography: "You’re a photographer. These three started where you are.",
  comics: "You’re an illustrator. These three started where you are.",
  architecture: "You’re an architect. These three started where you are.",
  fashion: "You work in fashion. These three started where you are.",
  film_tv: "You’re a filmmaker. These three started where you are.",
  music: "You’re a musician. These three started where you are.",
  theater: "You’re a performer. These three started where you are.",
  comedy: "You’re a comedian. These three started where you are.",
  writing: "You’re a writer. These three started where you are.",
  media: "You work in media. These three started where you are.",
  advertising: "You work in advertising. These three started where you are.",
  hospitality: "You work in hospitality. These three started where you are.",
  technology: "You’re a creative technologist. These three started where you are.",
  gaming: "You make games. These three started where you are.",
};

/** Slugs whose display name isn't simple title-casing. */
const NAME_OVERRIDES: Record<string, string> = {
  a24: "A24",
  mrbeast: "MrBeast",
  mschf: "MSCHF",
  "joey-l": "Joey L",
  "lin-manuel-miranda": "Lin-Manuel Miranda",
  "phoebe-waller-bridge": "Phoebe Waller-Bridge",
  "tyler-the-creator": "Tyler, the Creator",
};

/** Derive a display name from a case-study slug. */
export function displayNameForCaseSlug(slug: string): string {
  if (NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Mirror beat for a Q1 discipline value. Returns null for anything
 * outside the 16-industry vocabulary (the flow then skips the beat).
 */
export function getMirrorBeat(discipline: string): MirrorBeat | null {
  const slugs = MIRROR_CASES[discipline as IndustrySlug];
  const line = MIRROR_LINES[discipline as IndustrySlug];
  if (!slugs || !line) return null;
  return {
    line,
    cases: slugs.map((slug) => ({
      slug,
      name: displayNameForCaseSlug(slug),
    })),
  };
}
