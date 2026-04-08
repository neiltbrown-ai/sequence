/**
 * Assessment State Machine
 *
 * Drives the assessment flow client-side (no Claude API calls during data collection).
 * Walks through Sections 1-5 deterministically, renders structured UI components in chat,
 * and only calls the server for persistence + final roadmap generation.
 */

import type {
  AssessmentQuestion,
  AssessmentAnswers,
  CreativeMode,
  StageNumber,
  TransitionReadiness,
  MisalignmentFlag,
  WizardSection,
  AnswerType,
  Archetype,
} from "@/types/assessment";
import {
  SECTION_1_QUESTIONS,
  SECTION_2_QUESTIONS,
  SECTION_3_QUESTIONS,
  SECTION_5_QUESTIONS,
  SUB_DISCIPLINES,
} from "@/lib/assessment/questions";

// ── Message Types ──────────────────────────────────────────────

export type AssessmentComponentType =
  | "option_cards"
  | "multi_select"
  | "ranking"
  | "allocation_sliders"
  | "slider"
  | "free_text"
  | "roadmap_summary"
  | "action_cards";

export interface AssessmentComponent {
  type: AssessmentComponentType;
  questionId: string;
  props: Record<string, unknown>;
}

export interface AssessmentChatMessage {
  id: string;
  role: "assistant" | "user";
  text?: string;
  boldLastLine?: boolean;
  component?: AssessmentComponent;
  isThinking?: boolean;
  collapsedLabel?: string;
}

// ── State Types ──────────────────────────────────────────────

export type AssessmentPhase =
  | "intro"
  | "questioning"
  | "thinking"
  | "section_transition"
  | "computing"
  | "generating_roadmap"
  | "roadmap_revealed"
  | "complete";

export interface AssessmentMachineState {
  phase: AssessmentPhase;
  section: WizardSection;
  questionIndex: number;
  questions: AssessmentQuestion[]; // Current section's questions
  answers: AssessmentAnswers;
  assessmentId: string | null;
  // Scoring
  detectedStage: StageNumber | null;
  stageScore: number | null;
  transitionReadiness: TransitionReadiness | null;
  misalignmentFlags: MisalignmentFlag[];
  adaptiveQuestions: AssessmentQuestion[];
  // Archetype
  archetypeResult: { primary: Archetype; secondary?: Archetype } | null;
  // Roadmap
  roadmapPlanId: string | null;
  roadmapError: string | null;
  // Messages
  messages: AssessmentChatMessage[];
}

// ── Actions ──────────────────────────────────────────────

export type AssessmentMachineAction =
  | { type: "START" }
  | { type: "ANSWER"; questionId: string; value: unknown; label: string }
  | { type: "THINKING_DONE" }
  | { type: "SET_ASSESSMENT_ID"; id: string }
  | {
      type: "SET_STAGE_RESULTS";
      detectedStage: StageNumber;
      stageScore: number;
      transitionReadiness: TransitionReadiness;
      misalignmentFlags: MisalignmentFlag[];
      adaptiveQuestions: AssessmentQuestion[];
    }
  | {
      type: "SET_ARCHETYPE";
      result: { primary: Archetype; secondary?: Archetype };
    }
  | { type: "ROADMAP_RECEIVED"; planId: string }
  | { type: "ROADMAP_ERROR"; error: string }
  | { type: "ROADMAP_RETRY" };

// ── Constants ──────────────────────────────────────────────

const ASSESSMENT_INTRO =
  "This assessment covers five areas \u2014 your creative identity, how you feel about your work right now, the reality of your current business structure, a deeper dive based on what I learn, and where you want to go.\n\nTakes about 10 minutes. Let\u2019s start.";

const SECTION_TRANSITIONS: Record<number, string> = {
  2: "Good. Now let\u2019s talk about how your work feels right now.",
  3: "Noted. Now let\u2019s look at the reality of your current setup.",
  4: "I\u2019ve computed your position. A few more questions to go deeper.",
  5: "Almost done. Let\u2019s talk about where you want to go.",
};

const SECTION_NAMES: Record<number, string> = {
  1: "Identity",
  2: "Energy",
  3: "Reality",
  4: "Deep Dive",
  5: "Vision",
};

const STAGE_NAMES: Record<number, string> = {
  1: "Execution Excellence",
  2: "Judgment Positioning",
  3: "Ownership Accumulation",
  4: "Capital Formation",
};

const MISALIGNMENT_COSTS: Record<string, string> = {
  income_exceeds_structure:
    "You\u2019re earning significant revenue without the entity structure to protect it or optimize taxes.",
  judgment_not_priced:
    "Clients value your direction, but your income structure doesn\u2019t reflect it. You\u2019re underpricing your judgment.",
  relationships_not_converted:
    "You have steady demand and relationships but no equity positions. Long-term value is being left on the table.",
  ip_not_monetized:
    "You\u2019re creating intellectual property but not generating royalty or licensing income from it.",
  demand_exceeds_capacity:
    "You\u2019re turning down work but have no structure to scale beyond your own hours.",
  talent_without_structure:
    "Your creative judgment is ahead of your business infrastructure. Talent alone doesn\u2019t compound.",
};

// ── Reactions ──────────────────────────────────────────────

function getReaction(questionId: string, value: unknown): string {
  // Section 1
  if (questionId === "Q1") {
    const labels: Record<string, string> = {
      visual_arts: "Visual arts.",
      design: "Design.",
      film_video: "Film and video.",
      music_audio: "Music.",
      writing: "Writing.",
      performing_arts: "Performing arts.",
      architecture_interiors: "Architecture.",
      fashion_apparel: "Fashion.",
      advertising_marketing: "Advertising.",
      technology_creative_tech: "Creative tech.",
    };
    return labels[value as string] || "Got it.";
  }
  if (questionId.startsWith("Q1-sub")) return "Good range.";
  if (questionId === "Q2") {
    const modes: Record<string, string> = {
      maker: "Maker. That shapes everything.",
      service: "Service model. Important to know.",
      hybrid: "Hybrid. Common and complicated.",
      performer: "Performer. Different dynamics entirely.",
      builder: "Builder. That\u2019s a structural play.",
      transition: "In transition. Good time to map this.",
    };
    return modes[value as string] || "Noted.";
  }
  // Section 2
  if (questionId === "Q3") return "That tells me a lot about where your energy goes.";
  if (questionId === "Q4") return "Noted. Those patterns matter.";
  if (questionId === "Q5") return "Good to know where you\u2019re headed.";
  // Section 3
  if (questionId === "Q6") {
    if (["300k_500k", "500k_1m", "1m_plus"].includes(value as string))
      return "Meaningful revenue. Let\u2019s see how it\u2019s structured.";
    if (["under_50k", "50k_75k"].includes(value as string))
      return "Early stage income. The structure matters even more here.";
    return "Noted.";
  }
  if (questionId === "Q7") return "That breakdown is revealing.";
  if (questionId === "Q8") return "That\u2019s one of the strongest signals in this assessment.";
  if (questionId === "Q9") {
    if (value === "none") return "No equity positions. Worth noting.";
    if (value === "portfolio") return "Active portfolio. That changes the picture.";
    return "Noted.";
  }
  if (questionId === "Q10") return "Noted.";
  if (questionId === "Q11") {
    if (value === "none" || value === "sole_prop")
      return "No formal entity. That matters.";
    if (value === "multi_entity") return "Multi-entity. Sophisticated setup.";
    return "Got it.";
  }
  // Section 4 + 5
  if (questionId === "Q-AMB-4") return "Noted. I\u2019ll factor that in.";
  return "Noted.";
}

// ── Question Helpers ──────────────────────────────────────────

export function getQuestionsForSection(
  section: WizardSection,
  answers: AssessmentAnswers,
  adaptiveQuestions: AssessmentQuestion[]
): AssessmentQuestion[] {
  switch (section) {
    case 1: {
      const base = [...SECTION_1_QUESTIONS];
      if (answers.discipline && SUB_DISCIPLINES[answers.discipline]) {
        base.splice(1, 0, SUB_DISCIPLINES[answers.discipline]);
      }
      return base;
    }
    case 2:
      return SECTION_2_QUESTIONS;
    case 3:
      return SECTION_3_QUESTIONS;
    case 4:
      return adaptiveQuestions;
    case 5:
      return SECTION_5_QUESTIONS;
  }
}

function getQuestionText(
  question: AssessmentQuestion,
  creativeMode?: CreativeMode
): string {
  if (
    question.questionTextVariants &&
    creativeMode &&
    question.questionTextVariants[creativeMode]
  ) {
    return question.questionTextVariants[creativeMode]!;
  }
  return question.questionText;
}

function getQuestionOptions(
  question: AssessmentQuestion,
  creativeMode?: CreativeMode
) {
  if (
    question.optionVariants &&
    creativeMode &&
    question.optionVariants[creativeMode]
  ) {
    return question.optionVariants[creativeMode]!;
  }
  return question.options || [];
}

function mapAnswerTypeToComponent(answerType: AnswerType): AssessmentComponentType {
  switch (answerType) {
    case "single_select":
      return "option_cards";
    case "multi_select":
      return "multi_select";
    case "rank":
      return "ranking";
    case "allocation":
      return "allocation_sliders";
    case "slider":
      return "slider";
    case "free_text":
      return "free_text";
  }
}

function getAnswerKeyForQuestion(
  question: AssessmentQuestion,
  section: WizardSection
): string {
  if (section === 4) {
    if (question.pool?.startsWith("stage_")) return "stage_questions";
    if (question.pool?.startsWith("industry_")) return "industry_questions";
    if (question.pool === "discernment") return "discernment_questions";
  }
  const keyMap: Record<string, string> = {
    Q1: "discipline",
    Q2: "creative_mode",
    Q3: "energy_ranking",
    Q4: "drains",
    Q5: "dream_response",
    Q6: "income_range",
    Q7: "income_structure",
    Q8: "what_they_pay_for",
    Q9: "equity_positions",
    Q10: "demand_level",
    Q11: "business_structure",
    "Q-AMB-1": "three_year_goal",
    "Q-AMB-2": "risk_tolerance",
    "Q-AMB-3": "constraints",
    "Q-AMB-4": "specific_question",
  };
  if (question.isSubQuestion) return "sub_discipline";
  return keyMap[question.id] || question.id;
}

// ── Message Builder ──────────────────────────────────────────

let _msgCounter = 0;
function msgId(): string {
  _msgCounter += 1;
  return `asm-${_msgCounter}-${Date.now()}`;
}

function buildQuestionMessage(
  question: AssessmentQuestion,
  creativeMode?: CreativeMode,
  introText?: string
): AssessmentChatMessage {
  const questionText = getQuestionText(question, creativeMode);
  const options = getQuestionOptions(question, creativeMode);
  const componentType = mapAnswerTypeToComponent(question.answerType);

  const text = introText
    ? `${introText}\n\n${questionText}`
    : questionText;

  const props: Record<string, unknown> = {
    questionId: question.id,
    questionText,
  };

  if (componentType === "allocation_sliders") {
    props.categories = options;
  } else if (componentType === "free_text") {
    props.placeholder = question.placeholder || "Type your answer...";
  } else {
    props.options = options;
  }

  if (question.maxSelections) {
    props.maxSelections = question.maxSelections;
  }

  return {
    id: msgId(),
    role: "assistant",
    text,
    boldLastLine: true,
    component: { type: componentType, questionId: question.id, props },
  };
}

function buildThinkingMessage(): AssessmentChatMessage {
  return { id: msgId(), role: "assistant", isThinking: true };
}

function buildUserMessage(label: string): AssessmentChatMessage {
  return { id: msgId(), role: "user", collapsedLabel: label };
}

function buildTextMessage(text: string): AssessmentChatMessage {
  return { id: msgId(), role: "assistant", text };
}

// ── Initial State ──────────────────────────────────────────

export function createInitialState(): AssessmentMachineState {
  _msgCounter = 0;
  const questions = getQuestionsForSection(1, {}, []);
  return {
    phase: "intro",
    section: 1,
    questionIndex: 0,
    questions,
    answers: {},
    assessmentId: null,
    detectedStage: null,
    stageScore: null,
    transitionReadiness: null,
    misalignmentFlags: [],
    adaptiveQuestions: [],
    archetypeResult: null,
    roadmapPlanId: null,
    roadmapError: null,
    messages: [
      buildTextMessage(ASSESSMENT_INTRO),
    ],
  };
}

// ── Reducer ──────────────────────────────────────────────

export function assessmentReducer(
  state: AssessmentMachineState,
  action: AssessmentMachineAction
): AssessmentMachineState {
  switch (action.type) {
    case "START": {
      // Show first question
      const firstQ = state.questions[0];
      const qMsg = buildQuestionMessage(firstQ);
      return {
        ...state,
        phase: "questioning",
        messages: [...state.messages, qMsg],
      };
    }

    case "ANSWER": {
      const { questionId, value, label } = action;
      const question = state.questions[state.questionIndex];

      // Store answer
      const newAnswers = storeAnswer(
        state.answers,
        question,
        state.section,
        questionId,
        value
      );

      // Rebuild Section 1 questions if discipline just changed (may add/remove sub-discipline)
      let newQuestions = state.questions;
      if (questionId === "Q1") {
        newQuestions = getQuestionsForSection(1, newAnswers, state.adaptiveQuestions);
      }

      // Add user collapsed response + thinking dots
      const userMsg = buildUserMessage(label);
      const thinkingMsg = buildThinkingMessage();

      return {
        ...state,
        phase: "thinking",
        answers: newAnswers,
        questions: newQuestions,
        messages: [...state.messages, userMsg, thinkingMsg],
      };
    }

    case "THINKING_DONE": {
      // Remove the thinking message
      const messagesWithoutThinking = state.messages.filter(
        (m) => !m.isThinking
      );

      const currentQ = state.questions[state.questionIndex];
      const nextIdx = state.questionIndex + 1;
      const isLastInSection = nextIdx >= state.questions.length;
      const reaction = getReaction(
        currentQ.id,
        getStoredAnswer(state.answers, currentQ, state.section)
      );
      const creativeMode = state.answers.creative_mode;

      // Case A: More questions in this section
      if (!isLastInSection) {
        const nextQ = state.questions[nextIdx];
        const qMsg = buildQuestionMessage(nextQ, creativeMode, reaction);
        return {
          ...state,
          phase: "questioning",
          questionIndex: nextIdx,
          messages: [...messagesWithoutThinking, qMsg],
        };
      }

      // Case B: End of Section 3 → compute stage
      if (state.section === 3) {
        const computeMsg = buildTextMessage(
          `${reaction}\n\nComputing your position...`
        );
        return {
          ...state,
          phase: "computing",
          messages: [...messagesWithoutThinking, computeMsg],
        };
      }

      // Case C: End of Section 5 → generate roadmap
      if (state.section === 5) {
        const genMsg = buildTextMessage(
          `${reaction}\n\nAssessment complete. Generating your strategic roadmap...`
        );
        return {
          ...state,
          phase: "generating_roadmap",
          messages: [...messagesWithoutThinking, genMsg],
        };
      }

      // Case D: End of section → transition to next
      const nextSection = (state.section + 1) as WizardSection;
      const transitionText = SECTION_TRANSITIONS[nextSection];
      const transMsg = buildTextMessage(`${reaction}\n\n${transitionText}`);

      const nextQuestions = getQuestionsForSection(
        nextSection,
        state.answers,
        state.adaptiveQuestions
      );
      const firstQ = nextQuestions[0];
      const firstQMsg = buildQuestionMessage(firstQ, creativeMode);

      return {
        ...state,
        phase: "questioning",
        section: nextSection,
        questionIndex: 0,
        questions: nextQuestions,
        messages: [...messagesWithoutThinking, transMsg, firstQMsg],
      };
    }

    case "SET_ASSESSMENT_ID":
      return { ...state, assessmentId: action.id };

    case "SET_STAGE_RESULTS": {
      const {
        detectedStage,
        stageScore,
        transitionReadiness,
        misalignmentFlags,
        adaptiveQuestions,
      } = action;

      // Transition to Section 4
      const nextSection = 4 as WizardSection;
      const transitionText = SECTION_TRANSITIONS[nextSection];
      const transMsg = buildTextMessage(transitionText);
      const creativeMode = state.answers.creative_mode;
      const firstQ = adaptiveQuestions[0];
      const firstQMsg = buildQuestionMessage(firstQ, creativeMode);

      return {
        ...state,
        phase: "questioning",
        section: nextSection,
        questionIndex: 0,
        questions: adaptiveQuestions,
        detectedStage,
        stageScore,
        transitionReadiness,
        misalignmentFlags,
        adaptiveQuestions,
        messages: [...state.messages, transMsg, firstQMsg],
      };
    }

    case "SET_ARCHETYPE":
      return { ...state, archetypeResult: action.result };

    case "ROADMAP_RECEIVED": {
      // Show roadmap summary using archetype data
      const archetype = state.archetypeResult?.primary;
      if (!archetype || !state.detectedStage) return state;

      const roadmapMsg: AssessmentChatMessage = {
        id: msgId(),
        role: "assistant",
        text: "Here\u2019s your strategic position.",
        component: {
          type: "roadmap_summary",
          questionId: "roadmap",
          props: {
            stage: state.detectedStage,
            stageName:
              STAGE_NAMES[state.detectedStage] || `Stage ${state.detectedStage}`,
            stageDescription: archetype.description,
            transitionReadiness: state.transitionReadiness || "low",
            misalignments: state.misalignmentFlags.map((flag) => ({
              flag,
              whatItsCosting:
                MISALIGNMENT_COSTS[flag] || flag.replace(/_/g, " "),
            })),
            actions: archetype.actions.map((a) => ({
              order: a.order,
              type: a.type,
              title: a.title,
              what: a.what,
              timeline: a.timeline,
            })),
          },
        },
      };

      const actionCardsMsg: AssessmentChatMessage = {
        id: msgId(),
        role: "assistant",
        text: "Where would you like to start?",
        boldLastLine: true,
        component: {
          type: "action_cards",
          questionId: "next_action",
          props: {
            actions: archetype.actions.map((a) => ({
              order: a.order,
              type: a.type,
              title: a.title,
              what: a.what,
              timeline: a.timeline,
            })),
          },
        },
      };

      return {
        ...state,
        phase: "roadmap_revealed",
        roadmapPlanId: action.planId,
        messages: [...state.messages, roadmapMsg, actionCardsMsg],
      };
    }

    case "ROADMAP_ERROR": {
      const errorMsg = buildTextMessage(
        "Something went wrong generating your roadmap. Let me try again."
      );
      return {
        ...state,
        roadmapError: action.error,
        messages: [...state.messages, errorMsg],
      };
    }

    case "ROADMAP_RETRY": {
      const retryMsg = buildTextMessage("Regenerating your roadmap...");
      return {
        ...state,
        phase: "generating_roadmap",
        roadmapError: null,
        messages: [...state.messages, retryMsg],
      };
    }

    default:
      return state;
  }
}

// ── Answer Storage Helpers ──────────────────────────────────

function storeAnswer(
  answers: AssessmentAnswers,
  question: AssessmentQuestion,
  section: WizardSection,
  questionId: string,
  value: unknown
): AssessmentAnswers {
  // Section 4 stores in nested objects
  if (section === 4) {
    const pool = question.pool?.startsWith("stage_")
      ? "stage_questions"
      : question.pool?.startsWith("industry_")
        ? "industry_questions"
        : "discernment_questions";

    const existing =
      (answers[pool as keyof AssessmentAnswers] as Record<string, string>) || {};
    return {
      ...answers,
      [pool]: { ...existing, [questionId]: value as string },
    };
  }

  const key = getAnswerKeyForQuestion(question, section);
  return { ...answers, [key]: value };
}

function getStoredAnswer(
  answers: AssessmentAnswers,
  question: AssessmentQuestion,
  section: WizardSection
): unknown {
  if (section === 4) {
    const pool = question.pool?.startsWith("stage_")
      ? "stage_questions"
      : question.pool?.startsWith("industry_")
        ? "industry_questions"
        : "discernment_questions";
    const poolAnswers = answers[pool as keyof AssessmentAnswers] as
      | Record<string, string>
      | undefined;
    return poolAnswers?.[question.id];
  }
  const key = getAnswerKeyForQuestion(question, section);
  return answers[key as keyof AssessmentAnswers];
}

// ── Exports for external use ──────────────────────────────────

export { SECTION_NAMES, STAGE_NAMES, MISALIGNMENT_COSTS };
