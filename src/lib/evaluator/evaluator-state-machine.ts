/**
 * Evaluator State Machine
 *
 * Drives the deal evaluation flow client-side. Walks through creative mode
 * (if no assessment), deal type, deal name, then 6 dimensions of questions.
 * Scoring is computed client-side; only the verdict narrative calls the API.
 */

import type {
  DealType,
  DimensionKey,
  EvalQuestion,
  EvalAssessmentContext,
  EvaluatorAnswers,
  EvaluationScores,
  DealVerdict,
  RedFlag,
  MisalignmentWarning,
  RoadmapAlignment,
  CreativeMode,
} from '@/types/evaluator';
import {
  getEvalQuestions,
  DIMENSIONS_ORDER,
  DIMENSION_META,
  DEAL_TYPE_OPTIONS,
  CREATIVE_MODE_QUESTION,
} from './questions';

// ── Message Types ──────────────────────────────────────────────

export type EvalComponentType =
  | 'option_cards'
  | 'deal_type_cards'
  | 'multi_select'
  | 'free_text'
  | 'currency_input'
  | 'percentage_input'
  | 'number_input'
  | 'scale_input'
  | 'verdict_summary'
  | 'radar_chart'
  | 'dimension_cards'
  | 'misalignment_warnings'
  | 'roadmap_alignment'
  | 'recommended_actions'
  | 'library_resources';

export interface EvalComponent {
  type: EvalComponentType;
  questionId: string;
  props: Record<string, unknown>;
}

export interface EvalChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text?: string;
  boldLastLine?: boolean;
  component?: EvalComponent;
  isThinking?: boolean;
  collapsedLabel?: string;
}

// ── State Types ──────────────────────────────────────────────

export type EvalPhase =
  | 'intro'
  | 'creative_mode'
  | 'deal_type'
  | 'deal_name'
  | 'questioning'
  | 'thinking'
  | 'dimension_transition'
  | 'computing'
  | 'generating_verdict'
  | 'verdict_revealed'
  | 'verdict_error';

export interface EvalMachineState {
  phase: EvalPhase;
  // Context
  assessmentContext: EvalAssessmentContext | null;
  creativeMode: CreativeMode | null;
  creativeModeSource: 'assessment' | 'evaluator';
  dealType: DealType | null;
  dealName: string | null;
  // Questions
  currentDimension: number; // index into DIMENSIONS_ORDER
  currentQuestion: number;
  dimensionQuestions: Record<DimensionKey, EvalQuestion[]>;
  // Answers
  answers: EvaluatorAnswers;
  // Scoring
  scores: EvaluationScores | null;
  redFlags: RedFlag[];
  misalignmentWarnings: MisalignmentWarning[];
  roadmapAlignment: RoadmapAlignment | null;
  // Verdict
  verdict: DealVerdict | null;
  verdictError: string | null;
  // Persistence
  evaluationId: string | null;
  // Messages
  messages: EvalChatMessage[];
}

// ── Actions ──────────────────────────────────────────────

export type EvalMachineAction =
  | { type: 'START' }
  | { type: 'SET_CREATIVE_MODE'; value: CreativeMode; label: string }
  | { type: 'SET_DEAL_TYPE'; value: DealType; label: string }
  | { type: 'SET_DEAL_NAME'; value: string }
  | { type: 'ANSWER'; questionId: string; value: unknown; label: string }
  | { type: 'THINKING_DONE' }
  | { type: 'SET_EVALUATION_ID'; id: string }
  | {
      type: 'SCORING_COMPLETE';
      scores: EvaluationScores;
      redFlags: RedFlag[];
      misalignmentWarnings: MisalignmentWarning[];
      roadmapAlignment: RoadmapAlignment | null;
    }
  | { type: 'VERDICT_RECEIVED'; verdict: DealVerdict }
  | { type: 'VERDICT_ERROR'; error: string }
  | { type: 'VERDICT_RETRY' };

// ── Constants ──────────────────────────────────────────────

const EVAL_INTRO =
  "Let\u2019s evaluate this deal. I\u2019ll walk through six dimensions \u2014 financial readiness, career positioning, partner quality, deal structure, risk, and legal readiness. Takes about 8 minutes.\n\nAt the end, you\u2019ll get a clear signal: green, yellow, or red \u2014 plus specific actions to take.";

const DIMENSION_INTROS: Record<DimensionKey, string> = {
  financial: "Let\u2019s start with the financial picture.",
  career: "Now let\u2019s look at how this deal fits your trajectory.",
  partner: "Let\u2019s evaluate who\u2019s on the other side of this deal.",
  structure: "Now the terms themselves \u2014 are they well-constructed?",
  risk: "Let\u2019s assess what could go wrong.",
  legal: "Finally, legal and tax readiness.",
};

const DIMENSION_TRANSITIONS: Record<DimensionKey, string> = {
  financial: '', // first, no transition
  career: "Good. Financial picture captured.",
  partner: "Career positioning assessed.",
  structure: "Partner quality evaluated.",
  risk: "Structure reviewed.",
  legal: "Risk profile mapped.",
};

// ── Reactions ──────────────────────────────────────────────

function getReaction(questionId: string, value: unknown): string {
  // Financial
  if (questionId === 'F3') {
    if (value === 'hardship') return 'That\u2019s an important signal.';
    return 'Noted.';
  }
  if (questionId === 'F8') {
    if (value === 'dont_know') return 'You should find out before proceeding.';
    return 'Got it.';
  }
  // Career
  if (questionId === 'C2') {
    if (value === 'away') return 'That\u2019s worth weighing carefully.';
    if (value === 'toward') return 'Good sign.';
    return 'Noted.';
  }
  // Partner
  if (questionId === 'P3') {
    if (value === 'concerns') return 'That\u2019s a serious signal.';
    return 'Good.';
  }
  if (questionId === 'P5') {
    if (value === 'opaque') return 'Transparency issues compound over time.';
    return 'Noted.';
  }
  // Structure
  if (questionId === 'D2') {
    if (value === 'no_agreement') return 'That needs to change before anything else.';
    return 'Good.';
  }
  if (questionId === 'D11') {
    if (value === 'no') return 'That\u2019s a critical gap.';
    return 'Noted.';
  }
  // Risk
  if (questionId === 'R5') {
    if (value === 'open_ended') return 'Open-ended risk needs attention.';
    return 'Noted.';
  }
  // Legal
  if (questionId === 'L1') {
    if (value === 'no') return 'Consider getting legal review.';
    return 'Good.';
  }
  if (questionId === 'L3') {
    if (value === 'verbal') return 'Get it in writing.';
    return 'Noted.';
  }

  return 'Noted.';
}

// ── Question Helpers ──────────────────────────────────────────

function getQuestionText(
  question: EvalQuestion,
  creativeMode?: CreativeMode | null,
): string {
  if (question.questionTextVariants && creativeMode && question.questionTextVariants[creativeMode]) {
    return question.questionTextVariants[creativeMode]!;
  }
  return question.questionText;
}

function mapAnswerTypeToComponent(answerType: string): EvalComponentType {
  switch (answerType) {
    case 'single_select': return 'option_cards';
    case 'multi_select': return 'multi_select';
    case 'currency': return 'currency_input';
    case 'percentage': return 'percentage_input';
    case 'number': return 'number_input';
    case 'scale': return 'scale_input';
    case 'free_text': return 'free_text';
    default: return 'option_cards';
  }
}

// ── Message Builder ──────────────────────────────────────────

let _msgCounter = 0;
function msgId(): string {
  _msgCounter += 1;
  return `eval-${_msgCounter}-${Date.now()}`;
}

function buildQuestionMessage(
  question: EvalQuestion,
  creativeMode: CreativeMode | null,
  introText?: string,
): EvalChatMessage {
  const questionText = getQuestionText(question, creativeMode);
  const componentType = mapAnswerTypeToComponent(question.answerType);

  const text = introText
    ? `${introText}\n\n${questionText}`
    : questionText;

  const props: Record<string, unknown> = {
    questionId: question.id,
    questionText,
  };

  if (question.options) {
    props.options = question.options;
  }

  if (question.placeholder) {
    props.placeholder = question.placeholder;
  }

  if (question.isOptional) {
    props.isOptional = true;
  }

  return {
    id: msgId(),
    role: 'assistant',
    text,
    boldLastLine: true,
    component: { type: componentType, questionId: question.id, props },
  };
}

function buildThinkingMessage(): EvalChatMessage {
  return { id: msgId(), role: 'assistant', isThinking: true };
}

function buildUserMessage(label: string): EvalChatMessage {
  return { id: msgId(), role: 'user', collapsedLabel: label };
}

function buildTextMessage(text: string): EvalChatMessage {
  return { id: msgId(), role: 'assistant', text };
}

// ── Empty Answers ──────────────────────────────────────────

function emptyAnswers(): EvaluatorAnswers {
  return {
    financial: {},
    career: {},
    partner: {},
    structure: {},
    risk: {},
    legal: {},
  };
}

// ── Build dimension questions ──────────────────────────────

function buildAllDimensionQuestions(
  dealType: DealType,
  stage: number | null,
  assessmentContext: EvalAssessmentContext | null,
): Record<DimensionKey, EvalQuestion[]> {
  const result = {} as Record<DimensionKey, EvalQuestion[]>;
  for (const dim of DIMENSIONS_ORDER) {
    result[dim] = getEvalQuestions(dim, dealType, stage, assessmentContext);
  }
  return result;
}

// ── Initial State ──────────────────────────────────────────

export function createInitialEvalState(
  assessmentContext: EvalAssessmentContext | null,
): EvalMachineState {
  _msgCounter = 0;

  const hasAssessment = assessmentContext?.hasAssessment ?? false;
  const creativeMode = hasAssessment ? assessmentContext?.creative_mode ?? null : null;

  return {
    phase: 'intro',
    assessmentContext,
    creativeMode,
    creativeModeSource: hasAssessment && creativeMode ? 'assessment' : 'evaluator',
    dealType: null,
    dealName: null,
    currentDimension: 0,
    currentQuestion: 0,
    dimensionQuestions: {
      financial: [], career: [], partner: [],
      structure: [], risk: [], legal: [],
    },
    answers: emptyAnswers(),
    scores: null,
    redFlags: [],
    misalignmentWarnings: [],
    roadmapAlignment: null,
    verdict: null,
    verdictError: null,
    evaluationId: null,
    messages: [buildTextMessage(EVAL_INTRO)],
  };
}

// ── Reducer ──────────────────────────────────────────────

export function evaluatorReducer(
  state: EvalMachineState,
  action: EvalMachineAction,
): EvalMachineState {
  switch (action.type) {
    case 'START': {
      const hasAssessment = state.assessmentContext?.hasAssessment ?? false;
      const hasCreativeMode = !!state.creativeMode;

      // If no assessment + no creative mode → ask creative mode
      if (!hasAssessment && !hasCreativeMode) {
        const cmMsg: EvalChatMessage = {
          id: msgId(),
          role: 'assistant',
          text: `First, a quick question.\n\n${CREATIVE_MODE_QUESTION.questionText}`,
          boldLastLine: true,
          component: {
            type: 'option_cards',
            questionId: 'CM1',
            props: {
              questionId: 'CM1',
              options: CREATIVE_MODE_QUESTION.options,
            },
          },
        };
        return { ...state, phase: 'creative_mode', messages: [...state.messages, cmMsg] };
      }

      // Skip to deal type
      return showDealTypeSelection(state);
    }

    case 'SET_CREATIVE_MODE': {
      const userMsg = buildUserMessage(action.label);
      const thinkingMsg = buildThinkingMessage();
      return {
        ...state,
        phase: 'thinking',
        creativeMode: action.value,
        creativeModeSource: 'evaluator',
        messages: [...state.messages, userMsg, thinkingMsg],
      };
    }

    case 'SET_DEAL_TYPE': {
      const userMsg = buildUserMessage(action.label);
      const thinkingMsg = buildThinkingMessage();

      // Build questions for this deal type
      const stage = state.assessmentContext?.detected_stage ?? null;
      const dimensionQuestions = buildAllDimensionQuestions(
        action.value, stage, state.assessmentContext,
      );

      return {
        ...state,
        phase: 'thinking',
        dealType: action.value,
        dimensionQuestions,
        messages: [...state.messages, userMsg, thinkingMsg],
      };
    }

    case 'SET_DEAL_NAME': {
      const userMsg = buildUserMessage(action.value || '(unnamed deal)');
      const thinkingMsg = buildThinkingMessage();
      return {
        ...state,
        phase: 'thinking',
        dealName: action.value,
        messages: [...state.messages, userMsg, thinkingMsg],
      };
    }

    case 'ANSWER': {
      const { questionId, value, label } = action;
      const dimKey = DIMENSIONS_ORDER[state.currentDimension];
      const newAnswers = { ...state.answers };
      newAnswers[dimKey] = {
        ...newAnswers[dimKey],
        [questionId]: { value, source: 'evaluator' as const },
      };

      const userMsg = buildUserMessage(label);
      const thinkingMsg = buildThinkingMessage();

      return {
        ...state,
        phase: 'thinking',
        answers: newAnswers,
        messages: [...state.messages, userMsg, thinkingMsg],
      };
    }

    case 'THINKING_DONE': {
      const messagesWithoutThinking = state.messages.filter((m) => !m.isThinking);

      // After creative mode → show deal type
      if (state.phase === 'thinking' && !state.dealType && state.creativeMode && !state.dealName) {
        // Check if we just set creative mode (no deal type yet)
        // Could also be after deal type selection — check if we have a deal type
        // We check if deal type is null to differentiate
        return showDealTypeSelection({
          ...state,
          messages: messagesWithoutThinking,
        });
      }

      // After deal type → show deal name
      if (state.dealType && state.dealName === null) {
        const nameMsg: EvalChatMessage = {
          id: msgId(),
          role: 'assistant',
          text: "Got it.\n\nGive this deal a name \u2014 whatever helps you identify it.",
          boldLastLine: true,
          component: {
            type: 'free_text',
            questionId: 'deal_name',
            props: {
              questionId: 'deal_name',
              placeholder: 'e.g. "Acme design retainer" or "Gallery show Q3"',
            },
          },
        };
        return {
          ...state,
          phase: 'deal_name',
          messages: [...messagesWithoutThinking, nameMsg],
        };
      }

      // After deal name → start dimension 1
      if (state.dealType && state.dealName !== null && state.currentDimension === 0 && state.currentQuestion === 0) {
        const dimKey = DIMENSIONS_ORDER[0];
        const questions = state.dimensionQuestions[dimKey];
        if (questions.length === 0) {
          // Skip empty dimension
          return advanceDimension(state, messagesWithoutThinking);
        }
        const intro = `${DIMENSION_INTROS[dimKey]}`;
        const firstQ = questions[0];
        const qMsg = buildQuestionMessage(firstQ, state.creativeMode, intro);
        return {
          ...state,
          phase: 'questioning',
          messages: [...messagesWithoutThinking, qMsg],
        };
      }

      // After answering a question → next question or next dimension
      const dimKey = DIMENSIONS_ORDER[state.currentDimension];
      const questions = state.dimensionQuestions[dimKey];
      const currentQ = questions[state.currentQuestion];
      const reaction = currentQ ? getReaction(currentQ.id, state.answers[dimKey]?.[currentQ.id]?.value) : 'Noted.';
      const nextQIdx = state.currentQuestion + 1;

      // More questions in this dimension
      if (nextQIdx < questions.length) {
        const nextQ = questions[nextQIdx];
        const qMsg = buildQuestionMessage(nextQ, state.creativeMode, reaction);
        return {
          ...state,
          phase: 'questioning',
          currentQuestion: nextQIdx,
          messages: [...messagesWithoutThinking, qMsg],
        };
      }

      // End of dimension → advance
      return advanceDimension(state, messagesWithoutThinking, reaction);
    }

    case 'SET_EVALUATION_ID':
      return { ...state, evaluationId: action.id };

    case 'SCORING_COMPLETE': {
      const genMsg = buildTextMessage('Scores computed. Generating your verdict...');
      return {
        ...state,
        phase: 'generating_verdict',
        scores: action.scores,
        redFlags: action.redFlags,
        misalignmentWarnings: action.misalignmentWarnings,
        roadmapAlignment: action.roadmapAlignment,
        messages: [...state.messages, genMsg],
      };
    }

    case 'VERDICT_RECEIVED': {
      const { verdict } = action;
      const scores = state.scores!;

      // Build verdict messages
      const summaryMsg: EvalChatMessage = {
        id: msgId(),
        role: 'assistant',
        text: 'Here\u2019s your evaluation.',
        component: {
          type: 'verdict_summary',
          questionId: 'verdict_summary',
          props: {
            signal: scores.overall.signal,
            score: scores.overall.score,
            headline: verdict.signal.headline,
            summary: verdict.signal.summary,
          },
        },
      };

      const radarMsg: EvalChatMessage = {
        id: msgId(),
        role: 'assistant',
        component: {
          type: 'radar_chart',
          questionId: 'radar',
          props: {
            dimensions: DIMENSIONS_ORDER.map((dim) => ({
              key: dim,
              label: DIMENSION_META[dim].label,
              score: scores[dim].score,
              signal: scores[dim].signal,
            })),
          },
        },
      };

      const newMessages: EvalChatMessage[] = [summaryMsg, radarMsg];

      // Misalignment warnings (assessment completers only)
      if (state.misalignmentWarnings.length > 0) {
        newMessages.push({
          id: msgId(),
          role: 'assistant',
          text: 'Based on your assessment:',
          component: {
            type: 'misalignment_warnings',
            questionId: 'misalignment',
            props: { warnings: state.misalignmentWarnings },
          },
        });
      }

      // Dimension breakdown
      newMessages.push({
        id: msgId(),
        role: 'assistant',
        component: {
          type: 'dimension_cards',
          questionId: 'dimensions',
          props: {
            dimensions: DIMENSIONS_ORDER.map((dim) => ({
              key: dim,
              label: DIMENSION_META[dim].label,
              description: DIMENSION_META[dim].description,
              score: scores[dim].score,
              signal: scores[dim].signal,
              flags: scores[dim].flags,
              summary: verdict.dimension_summaries[dim],
            })),
            redFlags: state.redFlags,
          },
        },
      });

      // Roadmap alignment (assessment completers only)
      if (state.roadmapAlignment) {
        newMessages.push({
          id: msgId(),
          role: 'assistant',
          text: 'How this deal fits your roadmap:',
          component: {
            type: 'roadmap_alignment',
            questionId: 'roadmap_alignment',
            props: { alignment: state.roadmapAlignment },
          },
        });
      }

      // Recommended actions
      if (verdict.recommended_actions.length > 0) {
        newMessages.push({
          id: msgId(),
          role: 'assistant',
          text: 'Before you proceed:',
          boldLastLine: true,
          component: {
            type: 'recommended_actions',
            questionId: 'actions',
            props: { actions: verdict.recommended_actions },
          },
        });
      }

      // Library resources
      if (verdict.resources.structures.length > 0 || verdict.resources.case_studies.length > 0) {
        newMessages.push({
          id: msgId(),
          role: 'assistant',
          text: 'Relevant library resources:',
          component: {
            type: 'library_resources',
            questionId: 'resources',
            props: { resources: verdict.resources },
          },
        });
      }

      return {
        ...state,
        phase: 'verdict_revealed',
        verdict,
        messages: [...state.messages, ...newMessages],
      };
    }

    case 'VERDICT_ERROR': {
      const errorMsg = buildTextMessage(
        'Something went wrong generating your verdict. Let me try again.',
      );
      return {
        ...state,
        phase: 'verdict_error',
        verdictError: action.error,
        messages: [...state.messages, errorMsg],
      };
    }

    case 'VERDICT_RETRY': {
      const retryMsg = buildTextMessage('Regenerating your verdict...');
      return {
        ...state,
        phase: 'generating_verdict',
        verdictError: null,
        messages: [...state.messages, retryMsg],
      };
    }

    default:
      return state;
  }
}

// ── Helper: Show deal type selection ──────────────────────────

function showDealTypeSelection(state: EvalMachineState): EvalMachineState {
  const dealTypeMsg: EvalChatMessage = {
    id: msgId(),
    role: 'assistant',
    text: "What type of deal are you evaluating?",
    boldLastLine: true,
    component: {
      type: 'deal_type_cards',
      questionId: 'deal_type',
      props: {
        questionId: 'deal_type',
        options: DEAL_TYPE_OPTIONS,
        creativeMode: state.creativeMode,
      },
    },
  };
  return {
    ...state,
    phase: 'deal_type',
    messages: [...state.messages, dealTypeMsg],
  };
}

// ── Helper: Advance to next dimension or computing ────────────

function advanceDimension(
  state: EvalMachineState,
  messagesWithoutThinking: EvalChatMessage[],
  reaction?: string,
): EvalMachineState {
  const nextDimIdx = state.currentDimension + 1;

  // All dimensions done → computing
  if (nextDimIdx >= DIMENSIONS_ORDER.length) {
    const prefix = reaction ? `${reaction}\n\n` : '';
    const computeMsg = buildTextMessage(
      `${prefix}All dimensions captured. Computing your evaluation...`,
    );
    return {
      ...state,
      phase: 'computing',
      messages: [...messagesWithoutThinking, computeMsg],
    };
  }

  // Next dimension
  const nextDimKey = DIMENSIONS_ORDER[nextDimIdx];
  const nextQuestions = state.dimensionQuestions[nextDimKey];

  // Skip empty dimensions
  if (nextQuestions.length === 0) {
    return advanceDimension(
      { ...state, currentDimension: nextDimIdx, currentQuestion: 0 },
      messagesWithoutThinking,
      reaction,
    );
  }

  const transition = DIMENSION_TRANSITIONS[nextDimKey];
  const intro = DIMENSION_INTROS[nextDimKey];
  const prefix = reaction
    ? `${reaction}\n\n${transition ? transition + '\n\n' : ''}${intro}`
    : `${transition ? transition + '\n\n' : ''}${intro}`;

  const firstQ = nextQuestions[0];
  const qMsg = buildQuestionMessage(firstQ, state.creativeMode, prefix);

  return {
    ...state,
    phase: 'questioning',
    currentDimension: nextDimIdx,
    currentQuestion: 0,
    messages: [...messagesWithoutThinking, qMsg],
  };
}

// ── Progress Helpers ──────────────────────────────────────────

export function getEvalProgress(state: EvalMachineState): {
  currentDimensionLabel: string;
  dimensionIndex: number;
  totalDimensions: number;
  questionIndex: number;
  totalQuestions: number;
  percent: number;
} {
  const dimKey = DIMENSIONS_ORDER[state.currentDimension] ?? 'financial';
  const questions = state.dimensionQuestions[dimKey] ?? [];
  const totalQ = questions.length;

  // Count total questions across all dimensions
  let totalAll = 0;
  let answeredAll = 0;
  for (let i = 0; i < DIMENSIONS_ORDER.length; i++) {
    const dk = DIMENSIONS_ORDER[i];
    const dq = state.dimensionQuestions[dk] ?? [];
    totalAll += dq.length;
    if (i < state.currentDimension) {
      answeredAll += dq.length;
    } else if (i === state.currentDimension) {
      answeredAll += state.currentQuestion;
    }
  }

  const percent = totalAll > 0 ? Math.round((answeredAll / totalAll) * 100) : 0;

  return {
    currentDimensionLabel: DIMENSION_META[dimKey]?.label ?? '',
    dimensionIndex: state.currentDimension,
    totalDimensions: DIMENSIONS_ORDER.length,
    questionIndex: state.currentQuestion,
    totalQuestions: totalQ,
    percent,
  };
}

// ── Exports ──────────────────────────────────────────────

export { DIMENSIONS_ORDER, DIMENSION_META } from './questions';
