'use client';

import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import type {
  EvalAssessmentContext,
  CreativeMode,
  DealType,
  DealEvaluation,
  DimensionKey,
  EvalQuestion,
  EvaluatorAnswers,
  EvaluationScores,
  RedFlag,
  MisalignmentWarning,
  RoadmapAlignment,
  DealVerdict,
  CompletedEvalSummary,
  DimensionAnswers,
} from '@/types/evaluator';
import { createClient } from '@/lib/supabase/client';
import {
  getEvalQuestions,
  DIMENSIONS_ORDER,
  DIMENSION_META,
  DEAL_TYPE_OPTIONS,
  CREATIVE_MODE_QUESTION,
  ALL_EVAL_QUESTIONS,
} from '@/lib/evaluator/questions';
import {
  computeEvaluationScores,
  detectRedFlags,
  generateMisalignmentWarnings,
  computeRoadmapAlignment,
} from '@/lib/evaluator/scoring';
import SectionIntro from '@/components/assessment/section-intro';
import WizardNav from '@/components/assessment/wizard-nav';
import SingleSelectCards from '@/components/assessment/inputs/single-select-cards';
import MultiSelectCards from '@/components/assessment/inputs/multi-select-cards';
import FreeTextInput from '@/components/assessment/inputs/free-text-input';
import { VerdictSummary } from './components/verdict-summary';
import { DimensionCards } from './components/dimension-card';
import RefreshRoadmapCTA from './refresh-roadmap-cta';
import { toTitleCase } from '@/lib/utils';

// ── Summary Helpers ─────────────────────────────────────

function computeMedianScore(evals: CompletedEvalSummary[]): number | null {
  const scores = evals
    .map((e) => e.overall_score)
    .filter((s): s is number => s !== null)
    .sort((a, b) => a - b);
  if (scores.length === 0) return null;
  const mid = Math.floor(scores.length / 2);
  return scores.length % 2 === 0
    ? (scores[mid - 1] + scores[mid]) / 2
    : scores[mid];
}

function computeSignalCounts(evals: CompletedEvalSummary[]) {
  const counts = { green: 0, yellow: 0, red: 0 };
  for (const e of evals) {
    if (e.overall_signal === 'green') counts.green++;
    else if (e.overall_signal === 'yellow') counts.yellow++;
    else if (e.overall_signal === 'red') counts.red++;
  }
  return counts;
}

function computeStrongestDimension(evals: CompletedEvalSummary[]): string | null {
  const dimScores: Record<string, number[]> = {};
  for (const e of evals) {
    if (!e.scores) continue;
    for (const dim of DIMENSIONS_ORDER) {
      const ds = e.scores[dim];
      if (ds && typeof ds.score === 'number') {
        if (!dimScores[dim]) dimScores[dim] = [];
        dimScores[dim].push(ds.score);
      }
    }
  }
  let best: string | null = null;
  let bestMedian = -1;
  for (const [dim, scores] of Object.entries(dimScores)) {
    if (scores.length === 0) continue;
    scores.sort((a, b) => a - b);
    const mid = Math.floor(scores.length / 2);
    const median = scores.length % 2 === 0
      ? (scores[mid - 1] + scores[mid]) / 2
      : scores[mid];
    if (median > bestMedian) {
      bestMedian = median;
      best = dim;
    }
  }
  return best ? DIMENSION_META[best as DimensionKey].label : null;
}

function getEvalInsight(evals: CompletedEvalSummary[]): string {
  const { green, yellow, red } = computeSignalCounts(evals);
  const total = green + yellow + red;
  if (total === 0) return 'Evaluate more deals to surface patterns in your deal flow.';
  if (green > yellow && green > red) return 'Most of your evaluated deals score favorably.';
  if (red > green && red > yellow) return 'Your recent deals show consistent risk signals.';
  return 'Your deal quality varies — compare scores across evaluations.';
}

// ── Types ──────────────────────────────────────────────

type WizardPhase =
  | 'list'
  | 'setup'
  | 'dimension_intro'
  | 'questioning'
  | 'computing'
  | 'generating'
  | 'verdict'
  | 'view_verdict'
  | 'error';

interface WizardState {
  phase: WizardPhase;
  creativeMode: CreativeMode | null;
  creativeModeSource: 'assessment' | 'evaluator';
  dealType: DealType | null;
  dealName: string;
  currentDimension: number; // index into DIMENSIONS_ORDER
  currentQuestionIndex: number; // -1 = dimension intro
  dimensionQuestions: Record<DimensionKey, EvalQuestion[]>;
  answers: EvaluatorAnswers;
  scores: EvaluationScores | null;
  redFlags: RedFlag[];
  misalignmentWarnings: MisalignmentWarning[];
  roadmapAlignment: RoadmapAlignment | null;
  verdict: DealVerdict | null;
  evaluationId: string | null;
  error: string | null;
}

type WizardAction =
  | { type: 'START_EVALUATION'; creativeMode: CreativeMode | null; creativeModeSource: 'assessment' | 'evaluator'; dealType: DealType; dealName: string; dimensionQuestions: Record<DimensionKey, EvalQuestion[]> }
  | { type: 'SET_ANSWER'; dimension: DimensionKey; questionId: string; value: unknown }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET_SCORES'; scores: EvaluationScores; redFlags: RedFlag[]; misalignmentWarnings: MisalignmentWarning[]; roadmapAlignment: RoadmapAlignment | null }
  | { type: 'SET_VERDICT'; verdict: DealVerdict; evaluationId: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'NEW_EVALUATION' }
  | { type: 'BACK_TO_LIST' }
  | { type: 'VIEW_EVALUATION'; evaluationId: string }
  | { type: 'CLONE_EVALUATION'; dealType: DealType; dealName: string; creativeMode: CreativeMode | null; creativeModeSource: 'assessment' | 'evaluator'; dimensionQuestions: Record<DimensionKey, EvalQuestion[]>; answers: EvaluatorAnswers };

// ── Helpers ──────────────────────────────────────────────

function emptyAnswers(): EvaluatorAnswers {
  return { financial: {}, career: {}, partner: {}, structure: {}, risk: {}, legal: {} };
}

function emptyDimensionQuestions(): Record<DimensionKey, EvalQuestion[]> {
  return { financial: [], career: [], partner: [], structure: [], risk: [], legal: [] };
}

function buildDimensionQuestions(
  dealType: DealType,
  stage: number | null,
  ctx: EvalAssessmentContext | null,
): Record<DimensionKey, EvalQuestion[]> {
  const result = {} as Record<DimensionKey, EvalQuestion[]>;
  for (const dim of DIMENSIONS_ORDER) {
    result[dim] = getEvalQuestions(dim, dealType, stage, ctx);
  }
  return result;
}

function getQuestionText(q: EvalQuestion, mode: CreativeMode | null): string {
  if (mode && q.questionTextVariants?.[mode]) return q.questionTextVariants[mode]!;
  return q.questionText;
}

// ── Reducer ──────────────────────────────────────────────

function createInitialState(_ctx: EvalAssessmentContext | null, hasCompletedEvals?: boolean): WizardState {
  return {
    phase: hasCompletedEvals ? 'list' : 'setup',
    creativeMode: null,
    creativeModeSource: 'evaluator',
    dealType: null,
    dealName: '',
    currentDimension: 0,
    currentQuestionIndex: -1,
    dimensionQuestions: emptyDimensionQuestions(),
    answers: emptyAnswers(),
    scores: null,
    redFlags: [],
    misalignmentWarnings: [],
    roadmapAlignment: null,
    verdict: null,
    evaluationId: null,
    error: null,
  };
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'START_EVALUATION':
      return {
        ...state,
        phase: 'dimension_intro',
        creativeMode: action.creativeMode,
        creativeModeSource: action.creativeModeSource,
        dealType: action.dealType,
        dealName: action.dealName,
        dimensionQuestions: action.dimensionQuestions,
        currentDimension: 0,
        currentQuestionIndex: -1,
      };

    case 'SET_ANSWER': {
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.dimension]: {
            ...state.answers[action.dimension],
            [action.questionId]: { value: action.value, source: 'evaluator' as const },
          },
        },
      };
    }

    case 'NEXT': {
      if (state.phase === 'dimension_intro') {
        return { ...state, phase: 'questioning', currentQuestionIndex: 0 };
      }
      if (state.phase === 'questioning') {
        const dim = DIMENSIONS_ORDER[state.currentDimension];
        const questions = state.dimensionQuestions[dim];
        const nextIdx = state.currentQuestionIndex + 1;

        if (nextIdx < questions.length) {
          return { ...state, currentQuestionIndex: nextIdx };
        }

        // Move to next dimension
        const nextDim = state.currentDimension + 1;
        if (nextDim < DIMENSIONS_ORDER.length) {
          return {
            ...state,
            currentDimension: nextDim,
            currentQuestionIndex: -1,
            phase: 'dimension_intro',
          };
        }

        // All dimensions done → computing
        return { ...state, phase: 'computing' };
      }
      return state;
    }

    case 'BACK': {
      if (state.phase === 'setup') {
        // Back from setup goes to list if we have completed evals
        return { ...state, phase: 'list' };
      }
      if (state.phase === 'dimension_intro') {
        if (state.currentDimension === 0) {
          return { ...state, phase: 'setup' };
        }
        const prevDim = state.currentDimension - 1;
        const prevQuestions = state.dimensionQuestions[DIMENSIONS_ORDER[prevDim]];
        return {
          ...state,
          currentDimension: prevDim,
          currentQuestionIndex: prevQuestions.length - 1,
          phase: 'questioning',
        };
      }
      if (state.phase === 'questioning') {
        if (state.currentQuestionIndex > 0) {
          return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
        }
        return { ...state, currentQuestionIndex: -1, phase: 'dimension_intro' };
      }
      return state;
    }

    case 'SET_SCORES':
      return {
        ...state,
        phase: 'generating',
        scores: action.scores,
        redFlags: action.redFlags,
        misalignmentWarnings: action.misalignmentWarnings,
        roadmapAlignment: action.roadmapAlignment,
      };

    case 'SET_VERDICT':
      return {
        ...state,
        phase: 'verdict',
        verdict: action.verdict,
        evaluationId: action.evaluationId,
      };

    case 'SET_ERROR':
      return { ...state, phase: 'error', error: action.error };

    case 'RETRY':
      return { ...state, phase: 'generating', error: null };

    case 'NEW_EVALUATION':
      return {
        ...createInitialState(null),
        phase: 'setup',
      };

    case 'BACK_TO_LIST':
      return {
        ...state,
        phase: 'list',
      };

    case 'VIEW_EVALUATION':
      return {
        ...state,
        phase: 'view_verdict',
        evaluationId: action.evaluationId,
      };

    case 'CLONE_EVALUATION':
      return {
        ...state,
        phase: 'dimension_intro',
        creativeMode: action.creativeMode,
        creativeModeSource: action.creativeModeSource,
        dealType: action.dealType,
        dealName: action.dealName,
        dimensionQuestions: action.dimensionQuestions,
        answers: action.answers,
        currentDimension: 0,
        currentQuestionIndex: -1,
        scores: null,
        redFlags: [],
        misalignmentWarnings: [],
        roadmapAlignment: null,
        verdict: null,
        evaluationId: null,
        error: null,
      };

    default:
      return state;
  }
}

// ── Progress Component ──────────────────────────────────

function EvalProgress({
  currentDimension,
  phase,
}: {
  currentDimension: number;
  phase: WizardPhase;
}) {
  const isSetup = phase === 'setup';
  const isDone = phase === 'computing' || phase === 'generating' || phase === 'verdict';
  const progress = isSetup ? 0 : isDone ? 100 : (currentDimension / DIMENSIONS_ORDER.length) * 100;

  return (
    <div className="asmt-progress">
      <div className="asmt-progress-inner">
        {DIMENSIONS_ORDER.map((dim, i) => {
          const isActive = !isSetup && i === currentDimension && !isDone;
          const isCompleted = !isSetup && (i < currentDimension || isDone);
          const isFuture = isSetup || (i > currentDimension && !isDone);

          return (
            <button
              key={dim}
              className={`asmt-progress-step${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}${isFuture ? ' future' : ''}`}
              disabled
              type="button"
            >
              <span className="asmt-progress-num">{i + 1}</span>
              <span className="asmt-progress-label">{DIMENSION_META[dim].label}</span>
            </button>
          );
        })}
      </div>
      <div className="asmt-progress-bar">
        <div className="asmt-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ── Currency Input ──────────────────────────────────────

function CurrencyInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="asmt-freetext">
      <div className="eval-currency-wrap">
        <span className="eval-currency-sign">$</span>
        <input
          type="text"
          inputMode="numeric"
          className="asmt-textarea eval-currency-input"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            if (raw === '') { onChange(''); return; }
            onChange(Number(raw).toLocaleString('en-US'));
          }}
          placeholder="0"
        />
      </div>
    </div>
  );
}

// ── Percentage Input ──────────────────────────────────

function PercentageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="asmt-freetext">
      <div className="eval-currency-wrap">
        <input
          type="number"
          min={0}
          max={100}
          className="asmt-textarea eval-currency-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
        <span className="eval-currency-sign">%</span>
      </div>
    </div>
  );
}

// ── Number Input ──────────────────────────────────────

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="asmt-freetext">
      <input
        type="number"
        min={0}
        className="asmt-textarea eval-currency-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '0'}
      />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────

// ── Deal type label helper ──────────────────────────────
const DEAL_TYPE_LABELS: Record<string, string> = {
  service: 'Service',
  equity: 'Equity',
  licensing: 'Licensing',
  partnership: 'Partnership',
  revenue_share: 'Revenue Share',
  advisory: 'Advisory',
};

interface EvaluatorFlowProps {
  userId: string;
  assessmentContext: EvalAssessmentContext | null;
  existingEvaluation?: DealEvaluation | null;
  completedEvaluations?: CompletedEvalSummary[];
  onComplete?: (evaluationId: string) => void;
}

export function EvaluatorFlow({
  userId,
  assessmentContext,
  existingEvaluation,
  completedEvaluations = [],
  onComplete,
}: EvaluatorFlowProps) {
  const hasCompletedEvals = completedEvaluations.length > 0;
  const [state, dispatch] = useReducer(
    wizardReducer,
    assessmentContext,
    (ctx) => createInitialState(ctx, hasCompletedEvals),
  );

  // Completed evaluations list (mutable — new evals added after completion)
  const [completedEvals, setCompletedEvals] = useState<CompletedEvalSummary[]>(completedEvaluations);

  // Past verdict viewing state
  const [viewingVerdict, setViewingVerdict] = useState<DealVerdict | null>(null);
  const [viewingScores, setViewingScores] = useState<EvaluationScores | null>(null);
  const [viewingRedFlags, setViewingRedFlags] = useState<RedFlag[]>([]);
  const [viewingDealName, setViewingDealName] = useState<string>('');
  const [loadingVerdict, setLoadingVerdict] = useState(false);

  // Setup screen local state
  const hasAssessmentMode = assessmentContext?.hasAssessment && assessmentContext?.creative_mode;
  const [setupCreativeMode, setSetupCreativeMode] = useState<CreativeMode | null>(
    hasAssessmentMode ? assessmentContext!.creative_mode : null,
  );
  const [setupDealType, setSetupDealType] = useState<DealType | null>(null);
  const [setupDealName, setSetupDealName] = useState('');

  // Wizard question state
  const [currentAnswer, setCurrentAnswer] = useState<unknown>(undefined);
  const verdictCalledRef = useRef(false);

  // List view action state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEval, setEditingEval] = useState<CompletedEvalSummary | null>(null);
  const [editForm, setEditForm] = useState({ deal_name: '', deal_type: '' as DealType | '' });
  const [editSaving, setEditSaving] = useState(false);

  // ── Start evaluation ──
  const handleStartEvaluation = useCallback(() => {
    if (!setupDealType || !setupDealName.trim()) return;
    const dq = buildDimensionQuestions(
      setupDealType,
      assessmentContext?.detected_stage ?? null,
      assessmentContext,
    );
    dispatch({
      type: 'START_EVALUATION',
      creativeMode: setupCreativeMode,
      creativeModeSource: hasAssessmentMode ? 'assessment' : 'evaluator',
      dealType: setupDealType,
      dealName: setupDealName.trim(),
      dimensionQuestions: dq,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setupCreativeMode, setupDealType, setupDealName, assessmentContext, hasAssessmentMode]);

  // ── Delete evaluation ──
  const handleDeleteEval = useCallback(async (evalId: string) => {
    const supabase = createClient();
    await supabase.from('deal_verdicts').delete().eq('evaluation_id', evalId);
    await supabase.from('deal_evaluations').delete().eq('id', evalId);
    setCompletedEvals((prev) => prev.filter((e) => e.id !== evalId));
    setDeletingId(null);
  }, []);

  // ── Save metadata edit ──
  const handleSaveEdit = useCallback(async () => {
    if (!editingEval || !editForm.deal_name.trim() || !editForm.deal_type) return;
    setEditSaving(true);
    const supabase = createClient();
    await supabase
      .from('deal_evaluations')
      .update({ deal_name: editForm.deal_name.trim(), deal_type: editForm.deal_type })
      .eq('id', editingEval.id);
    setCompletedEvals((prev) =>
      prev.map((e) =>
        e.id === editingEval.id
          ? { ...e, deal_name: editForm.deal_name.trim(), deal_type: editForm.deal_type as DealType }
          : e,
      ),
    );
    setEditingEval(null);
    setEditSaving(false);
  }, [editingEval, editForm]);

  // ── Re-evaluate (clone with pre-filled answers) ──
  const handleReEvaluate = useCallback(async (evalId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('deal_evaluations')
      .select('deal_type, deal_name, creative_mode, creative_mode_source, answers_financial, answers_career, answers_partner, answers_structure, answers_risk, answers_legal')
      .eq('id', evalId)
      .single();
    if (!data || !data.deal_type) return;
    const answers: EvaluatorAnswers = {
      financial: (data.answers_financial as DimensionAnswers) ?? {},
      career: (data.answers_career as DimensionAnswers) ?? {},
      partner: (data.answers_partner as DimensionAnswers) ?? {},
      structure: (data.answers_structure as DimensionAnswers) ?? {},
      risk: (data.answers_risk as DimensionAnswers) ?? {},
      legal: (data.answers_legal as DimensionAnswers) ?? {},
    };
    const dq = buildDimensionQuestions(
      data.deal_type as DealType,
      assessmentContext?.detected_stage ?? null,
      assessmentContext,
    );
    dispatch({
      type: 'CLONE_EVALUATION',
      dealType: data.deal_type as DealType,
      dealName: `${data.deal_name ?? 'Untitled'} (re-evaluation)`,
      creativeMode: (data.creative_mode as CreativeMode) ?? null,
      creativeModeSource: (data.creative_mode_source as 'assessment' | 'evaluator') ?? 'evaluator',
      dimensionQuestions: dq,
      answers,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [assessmentContext]);

  // Get current questions
  const dim = DIMENSIONS_ORDER[state.currentDimension];
  const questions = state.dimensionQuestions[dim] ?? [];
  const currentQuestion = state.currentQuestionIndex >= 0 && state.currentQuestionIndex < questions.length
    ? questions[state.currentQuestionIndex]
    : null;

  // Get existing answer for current question
  const getExistingAnswer = useCallback((): unknown => {
    if (!currentQuestion) return undefined;
    const d = DIMENSIONS_ORDER[state.currentDimension];
    const stored = state.answers[d][currentQuestion.id];
    return stored?.value;
  }, [currentQuestion, state.currentDimension, state.answers]);

  // Reset currentAnswer when question changes
  useEffect(() => {
    const existing = getExistingAnswer();
    setCurrentAnswer(existing ?? undefined);
  }, [state.currentQuestionIndex, state.currentDimension, getExistingAnswer]);

  // ── Computing → Scoring ──
  useEffect(() => {
    if (state.phase === 'computing') {
      const timer = setTimeout(() => {
        const scores = computeEvaluationScores(state.dealType!, state.answers, ALL_EVAL_QUESTIONS);
        const redFlags = detectRedFlags(state.answers, state.dealType!);
        const misalignmentWarnings = generateMisalignmentWarnings(
          assessmentContext?.misalignment_flags ?? null,
          state.dealType!,
          state.answers,
        );
        const roadmapAlignment = computeRoadmapAlignment(state.dealType!, assessmentContext);

        dispatch({
          type: 'SET_SCORES',
          scores,
          redFlags,
          misalignmentWarnings,
          roadmapAlignment,
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.dealType, state.answers, assessmentContext]);

  // ── Generating → Verdict API ──
  useEffect(() => {
    if (state.phase === 'generating' && !verdictCalledRef.current) {
      verdictCalledRef.current = true;
      callVerdictAPI();
    }
  }, [state.phase]);

  async function callVerdictAPI() {
    try {
      const resp = await fetch('/api/evaluator/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: state.evaluationId,
          userId,
          dealType: state.dealType,
          dealName: state.dealName,
          creativeMode: state.creativeMode,
          creativeModeSource: state.creativeModeSource,
          answers: state.answers,
          scores: state.scores,
          redFlags: state.redFlags,
          assessmentContext,
        }),
      });

      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      const data = await resp.json();
      dispatch({ type: 'SET_VERDICT', verdict: data.verdict, evaluationId: data.evaluationId });
      // Add newly completed eval to the list
      setCompletedEvals((prev) => [
        {
          id: data.evaluationId,
          deal_name: state.dealName,
          deal_type: state.dealType,
          overall_score: state.scores?.overall?.score ?? null,
          overall_signal: state.scores?.overall?.signal ?? null,
          completed_at: new Date().toISOString(),
          scores: state.scores ?? null,
        },
        ...prev,
      ]);
      onComplete?.(data.evaluationId);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: String(err) });
      verdictCalledRef.current = false;
    }
  }

  // ── Load past verdict ──
  const loadPastVerdict = useCallback(async (evalId: string) => {
    setLoadingVerdict(true);
    setViewingVerdict(null);
    setViewingScores(null);
    setViewingRedFlags([]);
    dispatch({ type: 'VIEW_EVALUATION', evaluationId: evalId });

    try {
      const supabase = createClient();
      const [verdictResult, evalResult] = await Promise.all([
        supabase
          .from('deal_verdicts')
          .select('verdict_content')
          .eq('evaluation_id', evalId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('deal_evaluations')
          .select('scores, red_flags, deal_name')
          .eq('id', evalId)
          .single(),
      ]);

      if (verdictResult.data?.verdict_content) {
        setViewingVerdict(verdictResult.data.verdict_content as unknown as DealVerdict);
      }
      if (evalResult.data) {
        setViewingScores((evalResult.data.scores as unknown as EvaluationScores) ?? null);
        setViewingRedFlags(
          ((evalResult.data.red_flags as string[]) ?? []).map((msg, i) => ({
            id: String(i),
            message: msg,
            questionId: '',
          })),
        );
        setViewingDealName(evalResult.data.deal_name ?? '');
      }
    } catch (err) {
      console.error('Failed to load verdict:', err);
    } finally {
      setLoadingVerdict(false);
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────

  const handleNext = useCallback(() => {
    dispatch({ type: 'NEXT' });
    setCurrentAnswer(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnswer = useCallback((value: unknown) => {
    if (!currentQuestion) return;
    const d = DIMENSIONS_ORDER[state.currentDimension];
    setCurrentAnswer(value);
    dispatch({ type: 'SET_ANSWER', dimension: d, questionId: currentQuestion.id, value });
  }, [currentQuestion, state.currentDimension]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'BACK' });
    setCurrentAnswer(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const canProceed = (() => {
    if (state.phase === 'dimension_intro') return true;
    if (state.phase === 'questioning') {
      if (!currentQuestion) return true;
      if (currentQuestion.isOptional) return true;
      return currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== '';
    }
    return false;
  })();

  const showProgress = ['dimension_intro', 'questioning', 'computing', 'generating', 'verdict'].includes(state.phase);
  const isLastQuestion =
    state.phase === 'questioning' &&
    state.currentDimension === DIMENSIONS_ORDER.length - 1 &&
    state.currentQuestionIndex === questions.length - 1;

  const canGoBack = ['dimension_intro', 'questioning'].includes(state.phase);
  const canStartEval = setupDealType !== null && setupDealName.trim().length > 0 && (!hasAssessmentMode ? setupCreativeMode !== null : true);

  // ── Dimension breakdown — bar chart visible, each row expandable ──
  function DimensionBreakdown({ scores, verdict, redFlags }: {
    scores: EvaluationScores;
    verdict: DealVerdict;
    redFlags: RedFlag[];
  }) {
    const [expandedDim, setExpandedDim] = useState<string | null>(null);
    const mappedRedFlags = redFlags.map((rf, i) => ({
      id: String(i),
      message: typeof rf === 'string' ? rf : rf.message,
      questionId: typeof rf === 'string' ? '' : rf.questionId,
    }));

    return (
      <div className="eval-breakdown">
        <h4 className="eval-section-title">Dimension Breakdown</h4>

        {mappedRedFlags.length > 0 && (
          <div className="eval-red-flags" style={{ marginBottom: 16 }}>
            <h4 className="eval-red-flags-title">Red Flags</h4>
            {mappedRedFlags.map((rf) => (
              <div key={rf.id} className="eval-red-flag">
                <span className="eval-red-flag-icon">🔴</span>
                <span>{rf.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="eval-bars">
          {DIMENSIONS_ORDER.map((d) => {
            const s = scores[d];
            const pct = ((s?.score ?? 5) / 10) * 100;
            const signal = s?.signal ?? 'yellow';
            const isOpen = expandedDim === d;
            const summary = verdict.dimension_summaries?.[d] ?? '';
            const flags = s?.flags ?? [];

            return (
              <div key={d} className={`eval-bar-row${isOpen ? ' is-expanded' : ''}`}>
                <button
                  type="button"
                  className="eval-bar-header"
                  onClick={() => setExpandedDim(isOpen ? null : d)}
                  data-cursor="expand"
                >
                  <span className="eval-bar-label">{DIMENSION_META[d].label}</span>
                  <div className="eval-bar-track">
                    <div className={`eval-bar-fill eval-bar-${signal}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="eval-bar-score">{(s?.score ?? 5).toFixed(1)}</span>
                </button>
                {isOpen && (summary || flags.length > 0) && (
                  <div className="eval-bar-detail">
                    {summary && <p className="eval-bar-summary">{summary}</p>}
                    {flags.length > 0 && (
                      <div className="eval-bar-flags">
                        {flags.map((flag, i) => (
                          <div key={i} className="eval-dim-flag">
                            <span className="eval-dim-flag-icon">⚠</span>
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Shared verdict renderer ──────────────────────────
  function renderVerdictContent(opts: {
    verdict: DealVerdict;
    scores: EvaluationScores;
    redFlags: RedFlag[];
    dealName?: string;
    showBackToList?: boolean;
  }) {
    return (
      <div className="eval-verdict-wrap">
        {opts.dealName && (
          <h3 className="eval-verdict-deal-name">{toTitleCase(opts.dealName)}</h3>
        )}

        <VerdictSummary
          signal={opts.verdict.signal.color as 'green' | 'yellow' | 'red'}
          score={opts.scores.overall.score}
          headline={opts.verdict.signal.headline}
          summary={opts.verdict.signal.summary}
        />

        {/* Collapsible dimension breakdown: bar chart + accordion cards */}
        <DimensionBreakdown
          scores={opts.scores}
          verdict={opts.verdict}
          redFlags={opts.redFlags}
        />

        {opts.verdict.recommended_actions && opts.verdict.recommended_actions.length > 0 && (
          <div className="eval-section">
            <h4 className="eval-section-title">Recommended Actions</h4>
            <div className="eval-actions-list">
              {opts.verdict.recommended_actions.map((a) => (
                <div key={a.order} className="eval-action-item">
                  <span className="eval-action-number">{a.order}</span>
                  <div>
                    <strong>{a.action}</strong>
                    <p>{a.detail}</p>
                    {a.structure_ref && (
                      <a href={`/library/structures/${a.structure_ref.slug.replace(/^\d+-/, "")}`} className="eval-action-link">
                        {a.structure_ref.title} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh roadmap — only renders if user has a roadmap AND the deal
            carries meaningful signal (yellow/red or any red flags) */}
        <RefreshRoadmapCTA
          verdict={opts.verdict}
          overallSignal={opts.scores.overall.signal}
          redFlags={opts.redFlags}
        />

        {opts.verdict.resources && (
          (opts.verdict.resources.structures?.length > 0 || opts.verdict.resources.case_studies?.length > 0) && (
            <div className="eval-section">
              <h4 className="eval-section-title">Library Resources</h4>
              <div className="eval-resources">
                {opts.verdict.resources.structures?.length > 0 && (
                  <div className="eval-resources-section">
                    <h5>Structures</h5>
                    {opts.verdict.resources.structures.map((s) => (
                      <a key={s.id ?? s.slug} href={`/library/structures/${s.slug.replace(/^\d+-/, "")}`} className="eval-resource-link">
                        <span>{s.title || s.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                        <span className="eval-resource-why">{s.why}</span>
                      </a>
                    ))}
                  </div>
                )}
                {opts.verdict.resources.case_studies?.length > 0 && (
                  <div className="eval-resources-section">
                    <h5>Case Studies</h5>
                    {opts.verdict.resources.case_studies.map((cs) => (
                      <a key={cs.slug} href={`/library/case-studies/${cs.slug}`} className="eval-resource-link">
                        <span>{cs.title}</span>
                        <span className="eval-resource-why">{cs.why}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        <div className="eval-verdict-nav">
          {opts.showBackToList ? (
            <button
              className="btn btn--ghost btn--lg"
              onClick={() => {
                dispatch({ type: 'BACK_TO_LIST' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              type="button"
            >
              ← Back to Evaluations
            </button>
          ) : (
            <a href="/dashboard" className="btn btn--ghost btn--lg">Dashboard</a>
          )}
        </div>
      </div>
    );
  }

  // ── Render: List ──────────────────────────────────

  if (state.phase === 'list') {
    return (
      <>
        <div className="page-header rv vis">
          <div className="page-back">
            <a href="/dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Dashboard
            </a>
          </div>
          <h1 className="page-title">Deal Evaluator</h1>
          <p className="page-desc">
            Review past evaluations or start a new one.
          </p>
        </div>

        <div className="inv-toolbar rv vis rv-d1">
          <span className="inv-count">
            {completedEvals.length} {completedEvals.length === 1 ? 'evaluation' : 'evaluations'}
          </span>
          <button
            type="button"
            className="btn btn--filled"
            onClick={() => dispatch({ type: 'NEW_EVALUATION' })}
          >
            + New Evaluation
          </button>
        </div>

        {completedEvals.length >= 2 && (() => {
          const median = computeMedianScore(completedEvals);
          const signals = computeSignalCounts(completedEvals);
          const strongest = computeStrongestDimension(completedEvals);
          const insight = getEvalInsight(completedEvals);
          return (
            <div className="inv-summary-card rv vis rv-d1">
              <div className="inv-summary-metrics">
                <div className="inv-summary-metric">
                  <span className="inv-summary-metric-value">{completedEvals.length}</span>
                  <span className="inv-summary-metric-label">Deals Evaluated</span>
                </div>
                <div className="inv-summary-metric">
                  <span className="inv-summary-metric-value">
                    {median !== null ? `${median.toFixed(1)} / 10` : '—'}
                  </span>
                  <span className="inv-summary-metric-label">Median Score</span>
                </div>
                <div className="inv-summary-metric">
                  <span className="inv-summary-metric-value eval-signal-icons">
                    {signals.green > 0 && (
                      <span className="eval-signal-count eval-signal-count--green" title={`${signals.green} deal${signals.green > 1 ? 's' : ''} scored green (strong)`}>
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1"/><path d="M5 8.5l2 2 4-4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>{signals.green}</span>
                      </span>
                    )}
                    {signals.yellow > 0 && (
                      <span className="eval-signal-count eval-signal-count--yellow" title={`${signals.yellow} deal${signals.yellow > 1 ? 's' : ''} scored yellow (caution)`}>
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/><path d="M8 6.5v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/></svg>
                        <span>{signals.yellow}</span>
                      </span>
                    )}
                    {signals.red > 0 && (
                      <span className="eval-signal-count eval-signal-count--red" title={`${signals.red} deal${signals.red > 1 ? 's' : ''} scored red (warning)`}>
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                        <span>{signals.red}</span>
                      </span>
                    )}
                  </span>
                  <span className="inv-summary-metric-label">Signal Breakdown</span>
                </div>
                <div className="inv-summary-metric">
                  <span className="inv-summary-metric-value">{strongest ?? '—'}</span>
                  <span className="inv-summary-metric-label">Strongest Dimension</span>
                </div>
              </div>
              <div className="inv-summary-insight">{insight}</div>
            </div>
          );
        })()}

        <div className="eval-list-section rv vis rv-d1">
          <div className="set-section-title">Deal Evaluations</div>
          <div className="inv-list">
            {completedEvals.map((ev) => (
              <div
                key={ev.id}
                className="inv-card"
                style={{ cursor: 'pointer' }}
                data-cursor="arrow"
                onClick={() => loadPastVerdict(ev.id)}
              >
                <div className="inv-card-main">
                  <div className="inv-card-left">
                    <span className="inv-card-name">{toTitleCase(ev.deal_name || 'Untitled Deal')}</span>
                    <div className="inv-card-badges">
                      {ev.deal_type && (
                        <span className="inv-badge inv-badge--type">{DEAL_TYPE_LABELS[ev.deal_type] ?? ev.deal_type}</span>
                      )}
                      <span className={`inv-badge eval-badge-signal eval-badge-${ev.overall_signal ?? 'yellow'}`}>
                        {ev.overall_score?.toFixed(1) ?? '—'} / 10
                      </span>
                      {ev.completed_at && (
                        <span className="inv-badge">
                          {new Date(ev.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="inv-card-actions">
                    <button
                      type="button"
                      className="inv-action-btn"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEval(ev);
                        setEditForm({ deal_name: ev.deal_name ?? '', deal_type: ev.deal_type ?? '' });
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    </button>
                    <button
                      type="button"
                      className="inv-action-btn"
                      title="Re-evaluate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReEvaluate(ev.id);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                    </button>
                    {deletingId === ev.id ? (
                      <span className="inv-delete-confirm">
                        <button
                          type="button"
                          className="inv-action-btn inv-action-btn--danger"
                          onClick={(e) => { e.stopPropagation(); handleDeleteEval(ev.id); }}
                        >Yes</button>
                        <button
                          type="button"
                          className="inv-action-btn"
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                        >No</button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="inv-action-btn"
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); setDeletingId(ev.id); }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit metadata modal */}
        {editingEval && (
          <div
            className={`set-confirm-overlay${editingEval ? ' active' : ''}`}
            onClick={(e) => { if (e.target === e.currentTarget) setEditingEval(null); }}
          >
            <div className="set-confirm-modal" style={{ maxWidth: 440, textAlign: 'left' }}>
              <div className="set-confirm-title">Edit Deal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div>
                  <label className="inv-scenario-stat-label" style={{ display: 'block', marginBottom: 6 }}>Deal Name</label>
                  <input
                    type="text"
                    className="asmt-textarea"
                    style={{ width: '100%', padding: '10px 12px', fontSize: 14 }}
                    value={editForm.deal_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, deal_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="inv-scenario-stat-label" style={{ display: 'block', marginBottom: 6 }}>Deal Type</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {DEAL_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`inv-badge inv-badge--type${editForm.deal_type === opt.value ? ' eval-badge-active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          padding: '6px 14px',
                          background: editForm.deal_type === opt.value ? 'var(--black)' : 'transparent',
                          color: editForm.deal_type === opt.value ? 'var(--white)' : 'var(--mid)',
                          borderColor: editForm.deal_type === opt.value ? 'var(--black)' : 'var(--border)',
                        }}
                        onClick={() => setEditForm((f) => ({ ...f, deal_type: opt.value }))}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="set-confirm-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setEditingEval(null)}>Cancel</button>
                <button
                  className="btn btn--filled"
                  onClick={handleSaveEdit}
                  disabled={editSaving || !editForm.deal_name.trim() || !editForm.deal_type}
                >
                  {editSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Render: View Past Verdict ──────────────────────

  if (state.phase === 'view_verdict') {
    if (loadingVerdict) {
      return (
        <>
          <div className="page-header rv vis">
            <h1 className="page-title">Deal Evaluator</h1>
            <p className="page-desc">Loading verdict...</p>
          </div>
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div className="rdmp-generating-spinner" style={{ margin: '0 auto' }} />
          </div>
        </>
      );
    }

    if (viewingVerdict && viewingScores) {
      return (
        <>
          <div className="page-header rv vis">
            <div className="page-back">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                dispatch({ type: 'BACK_TO_LIST' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Evaluations
              </a>
            </div>
          </div>
          <div className="eval-view-verdict rv vis rv-d1">
            {renderVerdictContent({
              verdict: viewingVerdict,
              scores: viewingScores,
              redFlags: viewingRedFlags,
              dealName: viewingDealName,
              showBackToList: true,
            })}
          </div>
        </>
      );
    }

    // Error state — couldn't load verdict
    return (
      <>
        <div className="page-header rv vis">
          <h1 className="page-title">Deal Evaluator</h1>
          <p className="page-desc">Could not load verdict for this evaluation.</p>
        </div>
        <div style={{ padding: '24px 0' }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              dispatch({ type: 'BACK_TO_LIST' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            ← Back to Evaluations
          </button>
        </div>
      </>
    );
  }

  // ── Render: Setup ──────────────────────────────────

  if (state.phase === 'setup') {
    return (
      <div className="asmt-wizard">
        <EvalProgress currentDimension={-1} phase="setup" />
        <div className="asmt-content">
          <div className="eval-setup">
            <h2 className="eval-setup-title">Deal Evaluator</h2>
            <p className="eval-setup-desc">
              Answer questions across six dimensions to get a verdict on whether you should take this deal.
            </p>

            {/* Creative mode — only if no assessment */}
            {!hasAssessmentMode && (
              <div className="eval-setup-field">
                <label className="eval-setup-label">{CREATIVE_MODE_QUESTION.questionText}</label>
                <SingleSelectCards
                  options={CREATIVE_MODE_QUESTION.options}
                  value={setupCreativeMode ?? undefined}
                  onChange={(v) => setSetupCreativeMode(v as CreativeMode)}
                />
              </div>
            )}

            <div className="eval-setup-field">
              <label className="eval-setup-label">What type of deal are you evaluating?</label>
              <SingleSelectCards
                options={DEAL_TYPE_OPTIONS}
                value={setupDealType ?? undefined}
                onChange={(v) => setSetupDealType(v as DealType)}
              />
            </div>

            <div className="eval-setup-field">
              <label className="eval-setup-label">What would you call this deal?</label>
              <p className="eval-hint">A short name to identify it — e.g. &ldquo;Nike rebrand project&rdquo; or &ldquo;Startup equity offer&rdquo;</p>
              <FreeTextInput
                value={setupDealName}
                onChange={setSetupDealName}
                placeholder="Enter a name for this deal..."
              />
            </div>

            <div className="eval-setup-actions">
              {completedEvals.length > 0 && (
                <button
                  className="btn btn--ghost btn--lg"
                  onClick={() => dispatch({ type: 'BACK_TO_LIST' })}
                  type="button"
                >
                  ← Back to Evaluations
                </button>
              )}
              <button
                className="eval-setup-start"
                disabled={!canStartEval}
                onClick={handleStartEvaluation}
                type="button"
              >
                Start Deal Evaluation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Computing / Generating ──────────────────

  if (state.phase === 'computing' || state.phase === 'generating') {
    return (
      <div className="asmt-wizard">
        <EvalProgress currentDimension={state.currentDimension} phase={state.phase} />
        <div className="asmt-content">
          <div className="asmt-complete">
            <div className="asmt-complete-header">
              <div className="asmt-complete-graphic">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48" className="asmt-complete-graphic-svg">
                  <circle cx="24" cy="24" r="20" />
                  <path d="M16 24 L22 30 L32 18" strokeWidth="1.5" opacity="0.3" />
                </svg>
                <div className="rdmp-generating-spinner asmt-complete-spinner" />
              </div>
              <div className="asmt-complete-header-text">
                <div className="asmt-complete-label">Deal Evaluator</div>
                <h2 className="asmt-complete-title">
                  {state.phase === 'computing' ? 'Scoring your evaluation' : 'Generating your verdict'}
                </h2>
                <p className="asmt-complete-desc">
                  {state.phase === 'computing'
                    ? 'Calculating scores across six dimensions...'
                    : 'Building your deal verdict with recommended actions...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Verdict ──────────────────────────────────

  if (state.phase === 'verdict' && state.verdict && state.scores) {
    return (
      <div className="asmt-wizard">
        <EvalProgress currentDimension={state.currentDimension} phase={state.phase} />
        <div className="asmt-content">
          {renderVerdictContent({
            verdict: state.verdict,
            scores: state.scores,
            redFlags: state.redFlags,
            showBackToList: completedEvals.length > 0,
          })}
        </div>
      </div>
    );
  }

  // ── Render: Error ──────────────────────────────────

  if (state.phase === 'error') {
    return (
      <div className="asmt-wizard">
        <div className="asmt-content">
          <div className="asmt-complete">
            <div className="asmt-complete-header">
              <div className="asmt-complete-graphic">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48">
                  <circle cx="24" cy="24" r="20" />
                  <path d="M24 14v12M24 30v2" />
                </svg>
              </div>
              <div className="asmt-complete-header-text">
                <div className="asmt-complete-label">Error</div>
                <h2 className="asmt-complete-title">Something went wrong</h2>
                <p className="asmt-complete-desc">{state.error}</p>
              </div>
            </div>
            <button
              className="asmt-complete-btn"
              onClick={() => {
                verdictCalledRef.current = false;
                dispatch({ type: 'RETRY' });
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Wizard ──────────────────────────────────

  const dimMeta = DIMENSION_META[dim];

  return (
    <div className="asmt-wizard">
      {showProgress && (
        <EvalProgress currentDimension={state.currentDimension} phase={state.phase} />
      )}

      <div className="asmt-content">
        {/* ── Dimension Intro ── */}
        {state.phase === 'dimension_intro' && (
          <SectionIntro
            number={state.currentDimension + 1}
            title={dimMeta.label}
            description={dimMeta.description}
            estimatedTime={`Dimension ${state.currentDimension + 1} of 6`}
            onContinue={handleNext}
          />
        )}

        {/* ── Questioning ── */}
        {state.phase === 'questioning' && currentQuestion && (
          <div className="asmt-question-wrap">
            <div className="asmt-question">
              <h3 className="asmt-question-text">
                {getQuestionText(currentQuestion, state.creativeMode)}
              </h3>

              {currentQuestion.answerType === 'single_select' && currentQuestion.options && (
                <SingleSelectCards
                  options={currentQuestion.options}
                  value={currentAnswer as string | undefined}
                  onChange={(v) => handleAnswer(v)}
                />
              )}

              {currentQuestion.answerType === 'multi_select' && currentQuestion.options && (
                <MultiSelectCards
                  options={currentQuestion.options}
                  value={(currentAnswer as string[] | undefined) || []}
                  onChange={(v) => handleAnswer(v)}
                  maxSelections={3}
                />
              )}

              {currentQuestion.answerType === 'free_text' && (
                <FreeTextInput
                  value={(currentAnswer as string | undefined) || ''}
                  onChange={(v) => handleAnswer(v)}
                  placeholder={currentQuestion.placeholder}
                />
              )}

              {currentQuestion.answerType === 'currency' && (
                <CurrencyInput
                  value={(currentAnswer as string | undefined) || ''}
                  onChange={(v) => handleAnswer(v)}
                />
              )}

              {currentQuestion.answerType === 'percentage' && (
                <PercentageInput
                  value={currentAnswer !== undefined ? String(currentAnswer) : ''}
                  onChange={(v) => handleAnswer(v)}
                />
              )}

              {currentQuestion.answerType === 'number' && (
                <NumberInput
                  value={currentAnswer !== undefined ? String(currentAnswer) : ''}
                  onChange={(v) => handleAnswer(v)}
                  placeholder={currentQuestion.placeholder}
                />
              )}
            </div>
            <WizardNav
              onBack={handleBack}
              onNext={handleNext}
              canProceed={canProceed}
              isOptional={currentQuestion.isOptional}
              isLastQuestion={isLastQuestion}
            />
          </div>
        )}
      </div>
    </div>
  );
}
