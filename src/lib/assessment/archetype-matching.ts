import type {
  Archetype,
  StageNumber,
  CreativeMode,
  MisalignmentFlag,
} from "@/types/assessment";
import { ARCHETYPES } from "./archetypes";

type MatchResult = {
  primary: Archetype;
  secondary?: Archetype;
};

/**
 * Match a user's assessment results to the best-fitting archetype(s).
 *
 * Scoring:
 * - Stage range fit: +3 points if score is within range
 * - Creative mode match: +2 points if mode is in the archetype's list
 * - Required flags present: +2 points per flag present
 * - Excluded flags present: -10 points per flag present (disqualify)
 */
export function matchArchetype(
  detectedStage: StageNumber,
  stageScore: number,
  creativeMode: CreativeMode,
  misalignmentFlags: MisalignmentFlag[]
): MatchResult {
  const scored = ARCHETYPES.map((archetype) => {
    let score = 0;

    // Stage range fit
    const [low, high] = archetype.stage_range;
    if (stageScore >= low && stageScore <= high) {
      score += 3;
    } else if (Math.abs(stageScore - (low + high) / 2) <= 1) {
      score += 1; // partial fit
    }

    // Creative mode match
    if (archetype.creative_modes.includes(creativeMode)) {
      score += 2;
    }

    // Required flags
    for (const flag of archetype.required_flags) {
      if (misalignmentFlags.includes(flag)) {
        score += 2;
      } else {
        score -= 3; // missing required flag is a significant penalty
      }
    }

    // Excluded flags
    for (const flag of archetype.excluded_flags) {
      if (misalignmentFlags.includes(flag)) {
        score -= 10;
      }
    }

    return { archetype, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const primary = scored[0];
  const secondary = scored.length > 1 && scored[1].score > 0 ? scored[1] : undefined;

  return {
    primary: primary.archetype,
    secondary: secondary?.archetype,
  };
}
