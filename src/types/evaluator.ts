// ── Deal Evaluator Types ──────────────────────────────────────────

import type { CreativeMode, MisalignmentFlag } from './assessment';

// ── Core Enums ──────────────────────────────────────────────────

export type DealType = 'service' | 'equity' | 'licensing' | 'partnership' | 'revenue_share' | 'advisory';
export type DimensionKey = 'financial' | 'career' | 'partner' | 'structure' | 'risk' | 'legal';
export type SignalColor = 'green' | 'yellow' | 'red';
export type EvaluationStatus = 'in_progress' | 'completed' | 'abandoned';
export type DealOutcome = 'accepted' | 'declined' | 'renegotiated' | 'pending';
export type EvalAnswerType = 'single_select' | 'multi_select' | 'currency' | 'percentage' | 'number' | 'free_text' | 'scale';

// Re-export for convenience
export type { CreativeMode, MisalignmentFlag } from './assessment';

// ── Questions ───────────────────────────────────────────────────

export type EvalQuestionOption = {
  value: string;
  label: string;
  description?: string;
};

export type AssessmentBehavior =
  | { type: 'always_ask' }
  | { type: 'skip_if_assessment'; assessmentField: string }
  | { type: 'prefill_if_assessment'; assessmentField: string };

export type RedFlagTrigger = {
  condition: string;
  message: string;
};

export type EvalQuestion = {
  id: string;
  dimension: DimensionKey;
  questionText: string;
  questionTextVariants?: Partial<Record<CreativeMode, string>>;
  answerType: EvalAnswerType;
  options?: EvalQuestionOption[];
  optionVariants?: Partial<Record<CreativeMode, EvalQuestionOption[]>>;
  dealTypes: DealType[] | 'all';
  scoringWeight: number;
  scoringLogic: Record<string, number>;
  redFlagTrigger?: RedFlagTrigger;
  assessmentBehavior: AssessmentBehavior;
  placeholder?: string;
  isOptional?: boolean;
  displayOrder: number;
  /** For currency questions: used in red flag ratio calculations */
  relatedQuestionId?: string;
};

// ── Answers ─────────────────────────────────────────────────────

export type EvalAnswer = {
  value: unknown;
  source: 'evaluator' | 'assessment';
};

export type DimensionAnswers = Record<string, EvalAnswer>;

export type EvaluatorAnswers = {
  financial: DimensionAnswers;
  career: DimensionAnswers;
  partner: DimensionAnswers;
  structure: DimensionAnswers;
  risk: DimensionAnswers;
  legal: DimensionAnswers;
};

// ── Scoring ─────────────────────────────────────────────────────

export type DimensionScore = {
  score: number;
  signal: SignalColor;
  flags: string[];
  questionScores: Record<string, { score: number; weight: number }>;
};

export type EvaluationScores = Record<DimensionKey, DimensionScore> & {
  overall: { score: number; signal: SignalColor };
};

export type RedFlag = {
  id: string;
  message: string;
  questionId: string;
};

export type WeightMatrix = Record<DealType, Record<DimensionKey, number>>;

export type StructureMapping = {
  primary: number[];
  secondary: number[];
};

// ── Assessment Context (subset passed to evaluator) ─────────────

export type EvalAssessmentContext = {
  hasAssessment: boolean;
  assessmentId: string | null;
  detected_stage: number | null;
  stage_score: number | null;
  creative_mode: CreativeMode | null;
  discipline: string | null;
  income_range: string | null;
  income_structure: Record<string, number> | null;
  equity_positions: string | null;
  demand_level: string | null;
  business_structure: string | null;
  risk_tolerance: string | null;
  misalignment_flags: MisalignmentFlag[] | null;
  archetype_primary: string | null;
  roadmap_actions: { order: number; type: string; title: string; status: string }[] | null;
  recommended_structures: number[] | null;
};

// ── Verdict Output (AI-generated) ───────────────────────────────

export type DealVerdict = {
  signal: {
    color: SignalColor;
    headline: string;
    summary: string;
  };
  dimension_summaries: Record<DimensionKey, string>;
  recommended_actions: {
    order: number;
    action: string;
    detail: string;
    structure_ref?: { id: number; slug: string; title: string };
  }[];
  resources: {
    structures: { id: number; slug: string; title: string; why: string }[];
    case_studies: { slug: string; title: string; why: string }[];
  };
};

// ── Misalignment Warnings (assessment completers) ───────────────

export type MisalignmentWarning = {
  flag: MisalignmentFlag;
  warning: string;
  structureRef?: { id: number; slug: string };
};

// ── Roadmap Alignment (assessment completers) ───────────────────

export type RoadmapAlignment = {
  stageAlignment: 'aligned' | 'below' | 'above';
  stageMessage: string;
  flagConnection?: { flag: MisalignmentFlag; addresses: boolean; message: string };
  actionConnection?: { actionOrder: number; title: string; message: string };
};

// ── DB Record Types ─────────────────────────────────────────────

export type DealEvaluation = {
  id: string;
  user_id: string;
  status: EvaluationStatus;
  creative_mode: CreativeMode | null;
  creative_mode_source: 'assessment' | 'evaluator';
  deal_type: DealType | null;
  deal_name: string | null;
  mapped_structures: number[];
  assessment_id: string | null;
  assessment_stage: number | null;
  assessment_flags: string[];
  archetype_primary: string | null;
  answers_financial: DimensionAnswers;
  answers_career: DimensionAnswers;
  answers_partner: DimensionAnswers;
  answers_structure: DimensionAnswers;
  answers_risk: DimensionAnswers;
  answers_legal: DimensionAnswers;
  scores: EvaluationScores | null;
  overall_score: number | null;
  overall_signal: SignalColor | null;
  red_flags: string[];
  current_dimension: number;
  current_question: number;
  deal_outcome: DealOutcome | null;
  outcome_notes: string | null;
  outcome_recorded_at: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

// Lightweight summary for listing completed evaluations
export type CompletedEvalSummary = {
  id: string;
  deal_name: string | null;
  deal_type: DealType | null;
  overall_score: number | null;
  overall_signal: SignalColor | null;
  completed_at: string | null;
  scores: EvaluationScores | null;
};

export type DealVerdictRecord = {
  id: string;
  user_id: string;
  evaluation_id: string;
  verdict_content: DealVerdict;
  status: 'generating' | 'draft' | 'published';
  created_at: string;
};
