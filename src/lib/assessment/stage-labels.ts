/**
 * Canonical member-facing stage vocabulary.
 *
 * The internal 4-stage model (detected_stage 1–4, scoring weights, archetype
 * matching) is unchanged — these are PRESENTATION labels only.
 *
 * Renamed 2026-07 per content/reference/simplification-strategy-2026-07.md §7.2:
 * "Execution Excellence / Judgment Positioning / Ownership Accumulation /
 * Capital Formation" → one plain word each, glossed in the member's own
 * economics. Income bands live in help text, never in the label.
 *
 * All UI must import from this module — do not redeclare STAGE_NAMES locally
 * (the old copy-pasted maps are being consolidated here).
 */

export const STAGE_NAMES: Record<number, string> = {
  1: "Making",
  2: "Directing",
  3: "Owning",
  4: "Backing",
};

/** One-line gloss shown as help text / subtitle next to a stage name. */
export const STAGE_GLOSSES: Record<number, string> = {
  1: "You get paid to make things. The money stops when you stop.",
  2: "People pay for your judgment, not just your hands.",
  3: "You keep pieces of what you help build — royalties, shares, rights.",
  4: "You fund and own other people's making.",
};

/** Ordered list for spectrum / band displays. */
export const STAGE_ORDER = [1, 2, 3, 4] as const;
