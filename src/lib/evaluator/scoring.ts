// ── Deal Evaluator Scoring Engine ───────────────────────────────────
// Pure functions for computing dimension scores, overall scores,
// red flags, misalignment warnings, and roadmap alignment.

import type {
  DealType,
  DimensionKey,
  DimensionScore,
  EvaluationScores,
  EvalAssessmentContext,
  EvalAnswer,
  DimensionAnswers,
  RedFlag,
  SignalColor,
  WeightMatrix,
  StructureMapping,
  MisalignmentWarning,
  RoadmapAlignment,
  MisalignmentFlag,
} from '@/types/evaluator';
import type { EvalQuestion } from '@/types/evaluator';
import { ALL_EVAL_QUESTIONS } from './questions';

// ── Weight Matrix ──────────────────────────────────────────────────
// Dimension weights by deal type. Each row sums to 1.0.

export const WEIGHT_MATRIX: WeightMatrix = {
  service:       { financial: 0.20, career: 0.25, partner: 0.20, structure: 0.20, risk: 0.10, legal: 0.05 },
  equity:        { financial: 0.30, career: 0.20, partner: 0.25, structure: 0.15, risk: 0.20, legal: 0.10 },
  licensing:     { financial: 0.15, career: 0.20, partner: 0.15, structure: 0.30, risk: 0.10, legal: 0.10 },
  partnership:   { financial: 0.25, career: 0.20, partner: 0.25, structure: 0.25, risk: 0.15, legal: 0.10 },
  revenue_share: { financial: 0.25, career: 0.15, partner: 0.20, structure: 0.25, risk: 0.15, legal: 0.05 },
  advisory:      { financial: 0.15, career: 0.30, partner: 0.15, structure: 0.15, risk: 0.10, legal: 0.05 },
};

// ── Structure Mapping ──────────────────────────────────────────────
// Deal type → relevant In Sequence structure IDs.

export const STRUCTURE_MAP: Record<DealType, StructureMapping> = {
  service:       { primary: [1, 2],                   secondary: [26] },
  equity:        { primary: [3, 17, 18, 19, 20],      secondary: [21] },
  licensing:     { primary: [27, 28, 29, 30, 31],     secondary: [25] },
  partnership:   { primary: [5, 6, 8],                secondary: [7] },
  revenue_share: { primary: [22, 23, 24, 25],         secondary: [34] },
  advisory:      { primary: [4],                      secondary: [2, 26] },
};

// ── Signal Helpers ─────────────────────────────────────────────────

export function scoreToSignal(score: number): SignalColor {
  if (score >= 8.0) return 'green';
  if (score >= 5.0) return 'yellow';
  return 'red';
}

// ── Per-Question Scoring ───────────────────────────────────────────
// Maps a raw answer value to a 0–10 score using the question's
// scoringLogic. Handles special markers for computed scores.

export function scoreAnswer(question: EvalQuestion, value: unknown): number {
  const logic = question.scoringLogic;

  // Currency ratio (F1/F2) — handled in scoreDimension
  if ('_ratio' in logic) return 5; // neutral default, ratio computed separately

  // Free text — no direct score
  if ('_text' in logic) return 5; // neutral

  // Auto-calculated — no direct score
  if ('_auto' in logic) return 5;

  // Multi-select — score by count
  if ('_count' in logic) {
    const arr = Array.isArray(value) ? value : [];
    if (arr.length === 0) return 10;
    if (arr.length <= 2) return 7;
    if (arr.length <= 4) return 4;
    return 2;
  }

  // Range-based (number/percentage)
  if ('_range' in logic) {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) return 5;

    // F4: months of savings
    if (question.id === 'F4') {
      if (num >= 6) return 10;
      if (num >= 3) return 6;
      return 2;
    }

    // F5: income concentration percentage
    if (question.id === 'F5') {
      if (num <= 25) return 10;
      if (num <= 50) return 7;
      if (num <= 75) return 4;
      return 2;
    }

    // F6: equity percentage (context-dependent, use neutral)
    if (question.id === 'F6') return 5;

    // R3 derived — shouldn't hit here but fallback
    return 5;
  }

  // Standard select: look up value in scoring logic
  const strVal = String(value);
  if (strVal in logic) {
    return logic[strVal];
  }

  return 5; // neutral fallback
}

// ── Cash Ratio Score ───────────────────────────────────────────────
// F1/F2 ratio scoring: how much of market rate the deal pays.

function scoreCashRatio(f1: number, f2: number): number {
  if (f2 <= 0) return 5; // can't compute
  const ratio = f1 / f2;
  if (ratio >= 1.0) return 10;
  if (ratio >= 0.85) return 9;
  if (ratio >= 0.70) return 7;
  if (ratio >= 0.55) return 5;
  if (ratio >= 0.40) return 3;
  return 1;
}

// ── Assessment Derivation Helpers ──────────────────────────────────
// Derive evaluator answer values from assessment data.

export function deriveF3(ctx: EvalAssessmentContext): string {
  const income = ctx.income_range;
  const structure = ctx.income_structure;
  if (!income || !structure) return 'tight';

  const highIncome = ['300k_500k', '500k_1m', '1m_plus'].includes(income);
  const diversified = structure
    ? Object.values(structure).filter((v) => v > 10).length >= 3
    : false;

  if (highIncome || diversified) return 'comfortable';
  return 'tight';
}

export function deriveR3(ctx: EvalAssessmentContext): string {
  const structure = ctx.income_structure;
  if (!structure) return 'moderate';

  const categories = Object.values(structure).filter((v) => v > 10);
  if (categories.length >= 5) return 'diversified';
  if (categories.length >= 2) return 'moderate';
  return 'primary';
}

export function deriveR7(ctx: EvalAssessmentContext): string {
  const eq = ctx.equity_positions;
  if (!eq) return 'none';
  if (eq === 'none' || eq === 'offered') return 'none';
  if (eq === 'one') return '1_3';
  if (eq === 'few') return '1_3';
  if (eq === 'portfolio') return '4_7';
  return 'none';
}

export function deriveC1(ctx: EvalAssessmentContext): string {
  return String(ctx.detected_stage ?? 1);
}

// ── Score a Single Dimension ───────────────────────────────────────

export function scoreDimension(
  dimension: DimensionKey,
  answers: DimensionAnswers,
  questions: EvalQuestion[],
): DimensionScore {
  const dimQuestions = questions.filter((q) => q.dimension === dimension);
  if (dimQuestions.length === 0) {
    return { score: 5, signal: 'yellow', flags: [], questionScores: {} };
  }

  const questionScores: Record<string, { score: number; weight: number }> = {};
  const flags: string[] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  // Check for F1/F2 cash ratio
  const f1Answer = answers['F1'];
  const f2Answer = answers['F2'];
  let cashRatioScore: number | null = null;
  if (dimension === 'financial' && f1Answer && f2Answer) {
    const f1 = parseFloat(String(f1Answer.value));
    const f2 = parseFloat(String(f2Answer.value));
    if (!isNaN(f1) && !isNaN(f2) && f2 > 0) {
      cashRatioScore = scoreCashRatio(f1, f2);
    }
  }

  for (const q of dimQuestions) {
    const answer = answers[q.id];
    if (!answer) continue;

    let qScore: number;

    // Use cash ratio for F1 and F2
    if ((q.id === 'F1' || q.id === 'F2') && cashRatioScore !== null) {
      qScore = cashRatioScore;
    } else {
      qScore = scoreAnswer(q, answer.value);
    }

    questionScores[q.id] = { score: qScore, weight: q.scoringWeight };
    totalWeight += q.scoringWeight;
    weightedSum += qScore * q.scoringWeight;

    // Check red flag triggers
    if (q.redFlagTrigger && String(answer.value) === q.redFlagTrigger.condition) {
      flags.push(q.redFlagTrigger.message);
    }
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 5;
  const rounded = Math.round(score * 10) / 10;

  return {
    score: rounded,
    signal: scoreToSignal(rounded),
    flags,
    questionScores,
  };
}

// ── Compute Full Evaluation Scores ─────────────────────────────────

export function computeEvaluationScores(
  dealType: DealType,
  allAnswers: Record<DimensionKey, DimensionAnswers>,
  questions: EvalQuestion[],
): EvaluationScores {
  const dimensionKeys: DimensionKey[] = ['financial', 'career', 'partner', 'structure', 'risk', 'legal'];
  const weights = WEIGHT_MATRIX[dealType];

  const dimensionScores = {} as Record<DimensionKey, DimensionScore>;
  let overallWeightedSum = 0;
  let overallTotalWeight = 0;

  for (const dim of dimensionKeys) {
    const dimScore = scoreDimension(dim, allAnswers[dim] || {}, questions);
    dimensionScores[dim] = dimScore;
    const w = weights[dim];
    overallWeightedSum += dimScore.score * w;
    overallTotalWeight += w;
  }

  const overallScore = overallTotalWeight > 0 ? overallWeightedSum / overallTotalWeight : 5;
  const rounded = Math.round(overallScore * 10) / 10;

  return {
    ...dimensionScores,
    overall: {
      score: rounded,
      signal: scoreToSignal(rounded),
    },
  };
}

// ── Red Flag Detection ─────────────────────────────────────────────
// 8 red flag overrides that trigger regardless of score.

export function detectRedFlags(
  allAnswers: Record<DimensionKey, DimensionAnswers>,
  dealType: DealType,
): RedFlag[] {
  const flags: RedFlag[] = [];
  const get = (dim: DimensionKey, id: string) => allAnswers[dim]?.[id]?.value;

  // 1. No written agreement on deal > $10K
  const f1 = parseFloat(String(get('financial', 'F1') ?? 0));
  const d2 = get('structure', 'D2');
  if (f1 > 10000 && d2 === 'no_agreement') {
    flags.push({
      id: 'rf_no_agreement',
      message: 'Never proceed without a written agreement on a deal over $10K.',
      questionId: 'D2',
    });
  }

  // 2. Work-for-hire with no commensurate premium
  const d1 = get('structure', 'D1');
  const d4 = get('structure', 'D4');
  if ((d1 === 'work_for_hire' || d4 === 'work_for_hire') && f1 > 0) {
    const f2 = parseFloat(String(get('financial', 'F2') ?? 0));
    if (f2 > 0 && f1 / f2 < 0.7) {
      flags.push({
        id: 'rf_wfh_underpaid',
        message: "You're transferring all rights without adequate compensation.",
        questionId: 'D4',
      });
    }
  }

  // 3. Net profit participation with no audit rights
  const d6 = get('structure', 'D6');
  const d13 = get('structure', 'D13');
  if ((d13 === 'net_profit' || dealType === 'revenue_share') && d6 === 'no') {
    flags.push({
      id: 'rf_net_no_audit',
      message: 'Net profit without audit rights historically pays $0.',
      questionId: 'D6',
    });
  }

  // 4. No lawyer review on deal > $50K
  const l1 = get('legal', 'L1');
  if (f1 > 50000 && (l1 === 'no' || l1 === 'plan_to')) {
    flags.push({
      id: 'rf_no_lawyer',
      message: 'This deal size warrants legal review.',
      questionId: 'L1',
    });
  }

  // 5. Equity with no information rights
  const d11 = get('structure', 'D11');
  if (dealType === 'equity' && d11 === 'no') {
    flags.push({
      id: 'rf_equity_no_info',
      message: "You're investing without visibility into company performance.",
      questionId: 'D11',
    });
  }

  // 6. Perpetual exclusive license with no reversion
  const d17 = get('structure', 'D17');
  const d18 = get('structure', 'D18');
  const d19 = get('structure', 'D19');
  if (d17 === 'exclusive' && (d18 === 'perpetual' || d18 === 'in_perpetuity') && d19 === 'no') {
    flags.push({
      id: 'rf_perpetual_exclusive',
      message: 'Permanent exclusive rights transfer should command premium pricing.',
      questionId: 'D19',
    });
  }

  // 7. Partner with history of unfair treatment
  const p3 = get('partner', 'P3');
  if (p3 === 'concerns') {
    flags.push({
      id: 'rf_partner_history',
      message: 'Past behavior predicts future behavior.',
      questionId: 'P3',
    });
  }

  // 8. Cash sacrifice creates financial hardship
  const f3 = get('financial', 'F3');
  if (f3 === 'hardship') {
    flags.push({
      id: 'rf_financial_hardship',
      message: 'This deal puts your financial stability at risk.',
      questionId: 'F3',
    });
  }

  return flags;
}

// ── Misalignment Warnings ──────────────────────────────────────────
// Generate contextual warnings from assessment misalignment flags.

export function generateMisalignmentWarnings(
  assessmentFlags: MisalignmentFlag[] | null,
  dealType: DealType,
  allAnswers: Record<DimensionKey, DimensionAnswers>,
): MisalignmentWarning[] {
  if (!assessmentFlags || assessmentFlags.length === 0) return [];
  const warnings: MisalignmentWarning[] = [];
  const get = (dim: DimensionKey, id: string) => allAnswers[dim]?.[id]?.value;

  for (const flag of assessmentFlags) {
    switch (flag) {
      case 'judgment_not_priced':
        if (dealType === 'service') {
          warnings.push({
            flag,
            warning: "Your assessment flagged that you're delivering strategic-level value for execution-level compensation. Before accepting another service deal at this level, consider whether this relationship could be restructured to include advisory, equity, or participation components.",
            structureRef: { id: 4, slug: 'advisory-consultant-model' },
          });
        } else if (dealType === 'advisory') {
          warnings.push({
            flag,
            warning: "Your assessment flagged that your judgment is underpriced. This advisory deal is exactly the kind of structure your roadmap recommends. Make sure the terms reflect the value.",
          });
        }
        break;

      case 'ip_not_monetized':
        if (dealType === 'service') {
          warnings.push({
            flag,
            warning: 'Your assessment showed you have unmonetized IP and a pattern of work-for-hire agreements. This deal transfers all rights. Have you considered licensing specific usage instead of assigning ownership?',
            structureRef: { id: 27, slug: 'non-exclusive-licensing' },
          });
        } else if (dealType === 'licensing') {
          warnings.push({
            flag,
            warning: 'Your assessment flagged unmonetized IP. This licensing deal directly addresses that gap. Make sure the terms are well-structured — particularly reversion, exclusivity scope, and territory limitations.',
          });
        }
        break;

      case 'relationships_not_converted': {
        const p1 = get('partner', 'P1');
        if (p1 === '3y_plus') {
          warnings.push({
            flag,
            warning: "You've worked with trusted partners for years without equity participation. If this is one of those relationships, this deal might be the moment to propose ownership or participation.",
            structureRef: { id: 3, slug: 'project-equity-model' },
          });
        }
        break;
      }

      case 'income_exceeds_structure':
        if (dealType === 'equity') {
          warnings.push({
            flag,
            warning: "Your assessment flagged that your entity structure doesn't match your income level. Before signing equity agreements, ensure your business entity can hold equity efficiently.",
          });
        }
        break;

      case 'talent_without_structure':
        if (['equity', 'partnership', 'revenue_share'].includes(dealType)) {
          warnings.push({
            flag,
            warning: 'Your assessment flagged that you need professional advisory infrastructure. For a deal this complex, consult an attorney before proceeding.',
          });
        }
        break;

      case 'demand_exceeds_capacity':
        if (dealType === 'service') {
          const f1 = parseFloat(String(get('financial', 'F1') ?? 0));
          const f2 = parseFloat(String(get('financial', 'F2') ?? 0));
          if (f2 > 0 && f1 / f2 < 0.7) {
            warnings.push({
              flag,
              warning: "You're in a position of high demand — your assessment showed you're regularly turning down work. You don't need to accept below-market terms. Your leverage is stronger than you think.",
            });
          }
        }
        break;
    }
  }

  return warnings;
}

// ── Roadmap Alignment ──────────────────────────────────────────────
// Compute how this deal fits the member's roadmap.

// Stage ranges for each structure ID (which stages they're appropriate for)
const STRUCTURE_STAGE_MAP: Record<number, number[]> = {
  1: [1, 2],    // Premium Service
  2: [1, 2],    // Retainer + Bonus
  3: [2, 3],    // Project Equity
  4: [2, 3],    // Advisory/Consultant
  5: [2, 3],    // Co-Creation JV
  6: [2, 3],    // Product Partnership
  7: [3, 4],    // Platform Cooperative
  8: [2, 3],    // Creative Collective
  17: [2, 3],   // Equity for Services
  18: [3, 4],   // Founder Equity
  19: [2, 3],   // Vesting Equity
  20: [2, 3],   // Performance Equity
  21: [2, 3],   // Convertible Notes
  22: [2, 3],   // Gross Participation
  23: [2, 3],   // Net Profit Participation
  24: [1, 2],   // Revenue Share
  25: [2, 3],   // Royalties
  26: [2, 3],   // Hybrid Fee + Backend
  27: [1, 2, 3], // Non-Exclusive Licensing
  28: [2, 3],   // Exclusive Licensing
  29: [2, 3],   // Rights Reversion
  30: [2, 3],   // Subsidiary Rights
  31: [2, 3],   // Territory/Media Splitting
  34: [3, 4],   // Profit Participation + Mgmt Fee
};

export function computeRoadmapAlignment(
  dealType: DealType,
  assessmentContext: EvalAssessmentContext | null,
): RoadmapAlignment | null {
  if (!assessmentContext?.hasAssessment || !assessmentContext.detected_stage) return null;

  const stage = assessmentContext.detected_stage;
  const mapping = STRUCTURE_MAP[dealType];
  const primaryStructures = mapping.primary;

  // Check if primary structures are appropriate for member's stage
  const stageAppropriate = primaryStructures.some((id) => {
    const stages = STRUCTURE_STAGE_MAP[id];
    return stages?.includes(stage);
  });

  const dealStages = primaryStructures
    .map((id) => STRUCTURE_STAGE_MAP[id])
    .flat()
    .filter(Boolean);
  const minDealStage = Math.min(...dealStages);
  const maxDealStage = Math.max(...dealStages);

  let stageAlignment: 'aligned' | 'below' | 'above';
  let stageMessage: string;

  if (stageAppropriate) {
    stageAlignment = 'aligned';
    stageMessage = `This deal aligns with your current stage (Stage ${stage}). This is the type of deal your roadmap encourages.`;
  } else if (minDealStage > stage) {
    stageAlignment = 'above';
    stageMessage = `This deal involves structures typically associated with Stage ${minDealStage}+. Your assessment places you at Stage ${stage}. The deal itself might be right, but make sure your infrastructure can support it.`;
  } else {
    stageAlignment = 'below';
    stageMessage = `This is a Stage ${maxDealStage} deal. Your assessment places you at Stage ${stage}. Taking this deal isn't wrong, but it doesn't advance your trajectory.`;
  }

  // Check misalignment flag connection
  let flagConnection: RoadmapAlignment['flagConnection'] = undefined;
  if (assessmentContext.misalignment_flags) {
    for (const flag of assessmentContext.misalignment_flags) {
      if (flag === 'judgment_not_priced' && dealType === 'advisory') {
        flagConnection = {
          flag,
          addresses: true,
          message: "Your roadmap flagged 'judgment not priced.' This advisory deal directly addresses that misalignment.",
        };
        break;
      }
      if (flag === 'ip_not_monetized' && dealType === 'licensing') {
        flagConnection = {
          flag,
          addresses: true,
          message: "Your roadmap flagged 'IP not monetized.' This licensing deal directly addresses that gap.",
        };
        break;
      }
      if (flag === 'ip_not_monetized' && dealType === 'service') {
        flagConnection = {
          flag,
          addresses: false,
          message: "Your roadmap flagged 'IP not monetized.' This work-for-hire deal continues the pattern of creating value without retaining ownership.",
        };
        break;
      }
    }
  }

  // Check roadmap action connection
  let actionConnection: RoadmapAlignment['actionConnection'] = undefined;
  if (assessmentContext.roadmap_actions) {
    for (const action of assessmentContext.roadmap_actions) {
      if (action.status === 'completed' || action.status === 'skipped') continue;
      // Match action types to deal types
      if (action.type === 'positioning' && (dealType === 'advisory' || dealType === 'equity')) {
        actionConnection = {
          actionOrder: action.order,
          title: action.title,
          message: `Your Roadmap Action ${action.order} is "${action.title}." This deal could be the opportunity to execute that action.`,
        };
        break;
      }
      if (action.type === 'foundation' && ['equity', 'partnership'].includes(dealType)) {
        actionConnection = {
          actionOrder: action.order,
          title: action.title,
          message: `Your Roadmap Action ${action.order} is "${action.title}." Complete that before signing this agreement.`,
        };
        break;
      }
    }
  }

  return { stageAlignment, stageMessage, flagConnection, actionConnection };
}
