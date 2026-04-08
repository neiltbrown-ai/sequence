import type {
  StageNumber,
  TransitionReadiness,
  MisalignmentFlag,
  AssessmentAnswers,
  CreativeMode,
} from "@/types/assessment";

// ── Stage score weights (from spec Section 5) ──────────────────

const WEIGHTS = {
  Q6: 0.15,  // income
  Q7: 0.20,  // income structure
  Q8: 0.25,  // what they pay for (strongest signal)
  Q9: 0.15,  // equity positions
  Q10: 0.10, // demand level
  Q11: 0.15, // business structure
};

// ── Score maps: answer value → stage value ──────────────────

const Q6_SCORES: Record<string, number> = {
  under_50k: 1.0,
  "50k_75k": 1.0,
  "75k_100k": 1.5,
  "100k_150k": 2.0,
  "150k_200k": 2.0,
  "200k_300k": 2.5,
  "300k_500k": 3.0,
  "500k_1m": 3.5,
  "1m_plus": 4.0,
  prefer_not: 2.0, // neutral midpoint
};

// Q7 scoring: based on the diversity and passiveness of income structure
function scoreQ7(structure: Record<string, number> | undefined): number {
  if (!structure) return 1.5;

  const salary = structure.salary || 0;
  const fees = structure.fees_sales || 0;
  const retainer = structure.retainer_commission || 0;
  const royalties = structure.royalties || 0;
  const equity = structure.equity || 0;
  const products = structure.products || 0;

  // Heavy salary/fees = Stage 1
  // Mix with retainers = Stage 1.5-2
  // Royalties + equity present = Stage 2.5-3
  // Heavy equity/royalties = Stage 3-4
  const passiveShare = royalties + equity + products;
  const activeShare = salary + fees;

  if (passiveShare >= 50) return 3.5;
  if (passiveShare >= 25) return 3.0;
  if (equity >= 10 || royalties >= 15) return 2.5;
  if (retainer >= 30) return 2.0;
  if (activeShare >= 80) return 1.0;
  return 1.5;
}

const Q8_SCORES: Record<string, number> = {
  execution: 1.0,
  elevation: 1.5,
  solution: 2.5,
  direction: 3.0,
  partnership: 3.5,
};

const Q9_SCORES: Record<string, number> = {
  none: 1.0,
  offered: 1.5,
  one: 2.0,
  few: 3.0,
  portfolio: 4.0,
};

const Q10_SCORES: Record<string, number> = {
  seeking: 1.0,
  some: 1.5,
  steady: 2.5,
  overflow: 3.0,
};

const Q11_SCORES: Record<string, number> = {
  none: 1.0,
  sole_prop: 1.0,
  llc: 1.5,
  llc_scorp: 2.5,
  multi_entity: 3.5,
  corp: 3.0,
  w2: 1.0,
  unknown: 1.0,
};

// ── Stage detection result ──────────────────────────────

export type StageResult = {
  detectedStage: StageNumber;
  stageScore: number;
  transitionReadiness: TransitionReadiness;
  misalignmentFlags: MisalignmentFlag[];
};

// ── Main scoring function ──────────────────────────────

export function computeStageScore(answers: AssessmentAnswers): StageResult {
  const q6Score = Q6_SCORES[answers.income_range || ""] ?? 2.0;
  const q7Score = scoreQ7(answers.income_structure);
  const q8Score = Q8_SCORES[answers.what_they_pay_for || ""] ?? 1.5;
  const q9Score = Q9_SCORES[answers.equity_positions || ""] ?? 1.0;
  const q10Score = Q10_SCORES[answers.demand_level || ""] ?? 1.5;
  const q11Score = Q11_SCORES[answers.business_structure || ""] ?? 1.0;

  // Weighted composite
  const rawScore =
    q6Score * WEIGHTS.Q6 +
    q7Score * WEIGHTS.Q7 +
    q8Score * WEIGHTS.Q8 +
    q9Score * WEIGHTS.Q9 +
    q10Score * WEIGHTS.Q10 +
    q11Score * WEIGHTS.Q11;

  // Round to nearest 0.01
  const stageScore = Math.round(rawScore * 100) / 100;

  // Detect stage (round to nearest integer, clamped 1-4)
  const detectedStage = Math.max(1, Math.min(4, Math.round(stageScore))) as StageNumber;

  // Transition readiness: how many signals point to NEXT stage
  const nextStageSignals = [q6Score, q7Score, q8Score, q9Score, q10Score, q11Score].filter(
    (s) => Math.round(s) > detectedStage
  ).length;
  const transitionReadiness: TransitionReadiness =
    nextStageSignals >= 3 ? "high" : nextStageSignals >= 2 ? "moderate" : "low";

  // Misalignment detection
  const misalignmentFlags = detectMisalignments(answers, {
    q6Score,
    q8Score,
    q9Score,
    q10Score,
    q11Score,
  });

  return { detectedStage, stageScore, transitionReadiness, misalignmentFlags };
}

// ── Misalignment detection ──────────────────────────────

function detectMisalignments(
  answers: AssessmentAnswers,
  scores: {
    q6Score: number;
    q8Score: number;
    q9Score: number;
    q10Score: number;
    q11Score: number;
  }
): MisalignmentFlag[] {
  const flags: MisalignmentFlag[] = [];
  const { q6Score, q8Score, q9Score, q10Score, q11Score } = scores;

  // High income ($300K+) + no entity or sole prop
  const highIncome = ["300k_500k", "500k_1m", "1m_plus"].includes(answers.income_range || "");
  const lowStructure = ["none", "sole_prop", "llc", "w2", "unknown"].includes(
    answers.business_structure || ""
  );
  if (highIncome && lowStructure) {
    flags.push("income_exceeds_structure");
  }

  // Clients pay for direction/judgment but income is mostly fees/salary
  if (q8Score >= 2.5 && answers.income_structure) {
    const activeShare =
      (answers.income_structure.salary || 0) + (answers.income_structure.fees_sales || 0);
    if (activeShare >= 80) {
      flags.push("judgment_not_priced");
    }
  }

  // Long-term relationships (steady/overflow) but no equity
  if (q10Score >= 2.5 && q9Score <= 1.0 && q6Score >= 2.0) {
    flags.push("relationships_not_converted");
  }

  // Owns IP/catalog but no licensing or royalty income
  const creativeMode = answers.creative_mode as CreativeMode;
  const isMakerPerformer = ["maker", "performer"].includes(creativeMode || "");
  if (isMakerPerformer && answers.income_structure) {
    const royaltyShare = (answers.income_structure.royalties || 0) + (answers.income_structure.equity || 0);
    if (royaltyShare < 5) {
      flags.push("ip_not_monetized");
    }
  }

  // High demand (turning down work) but still sole practitioner
  if (q10Score >= 3.0 && q11Score <= 1.5) {
    flags.push("demand_exceeds_capacity");
  }

  // Strong discernment + no business infrastructure
  const disc1 = answers.discernment_questions?.["Q-DISC-1"];
  const disc2 = answers.discernment_questions?.["Q-DISC-2"];
  const discernmentScore =
    (disc1 === "ahead" || disc1 === "defines" ? 3 : 0) +
    (disc2 === "perspective" || disc2 === "influential" ? 3 : 0);
  if (discernmentScore >= 3 && q11Score <= 1.5 && !highIncome) {
    flags.push("talent_without_structure");
  }

  return flags;
}
