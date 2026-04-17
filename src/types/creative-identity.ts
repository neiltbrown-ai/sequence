/**
 * Creative Identity snapshot — server-loaded summary of a member's
 * latest assessment, used to render the Settings → Creative Identity tab.
 *
 * "Creative Identity" is the user-facing rebrand of the Assessment system.
 * Internally the data lives in the `assessments` table; this type is a
 * presentation-layer view of it.
 */
export interface CreativeIdentitySnapshot {
  id: string | null;
  /**
   * "empty"        — no assessment row exists yet
   * "in_progress"  — started but not completed
   * "completed"    — finished; full identity profile available
   * "abandoned"    — marked abandoned; treat like empty for CTA purposes
   */
  status: "empty" | "in_progress" | "completed" | "abandoned";
  currentSection: number;
  currentQuestion: number;
  detectedStage: number | null;
  archetypePrimary: string | null;
  creativeMode: string | null;
  discipline: string | null;
  subDiscipline: string | null;
  misalignmentFlags: string[];
  completedAt: string | null;
  updatedAt: string | null;
}

export const CREATIVE_IDENTITY_TOTAL_SECTIONS = 5;
