"use client";

import { useReducer, useCallback, useEffect, useRef, useState } from "react";
import type {
  Assessment,
  AssessmentQuestion,
  WizardState,
  WizardAction,
  WizardSection,
  CreativeMode,
  AssessmentAnswers,
} from "@/types/assessment";
import {
  SECTION_1_QUESTIONS,
  SECTION_2_QUESTIONS,
  SECTION_3_QUESTIONS,
  SECTION_5_QUESTIONS,
  SUB_DISCIPLINES,
  SECTION_META,
} from "@/lib/assessment/questions";
import { computeStageScore } from "@/lib/assessment/scoring";
import { selectAdaptiveQuestions } from "@/lib/assessment/question-selection";
import AssessmentProgress from "./assessment-progress";
import SectionIntro from "./section-intro";
import QuestionRenderer from "./question-renderer";
import WizardNav from "./wizard-nav";
import { useAssessmentAutosave } from "@/hooks/use-assessment-autosave";
import GenerationProgress from "@/components/shared/generation-progress";

// ── Initial state ──────────────────────────────────────────────

function createInitialState(existing: Assessment | null): WizardState {
  if (existing) {
    return {
      assessmentId: existing.id,
      currentSection: (existing.current_section || 1) as WizardSection,
      currentQuestionIndex: existing.current_question || 0,
      answers: {
        discipline: existing.discipline ?? undefined,
        sub_discipline: existing.sub_discipline ?? undefined,
        creative_mode: existing.creative_mode ?? undefined,
        energy_ranking: existing.energy_ranking ?? undefined,
        drains: existing.drains ?? undefined,
        dream_response: existing.dream_response ?? undefined,
        income_range: existing.income_range ?? undefined,
        income_structure: existing.income_structure ?? undefined,
        what_they_pay_for: existing.what_they_pay_for ?? undefined,
        equity_positions: existing.equity_positions ?? undefined,
        demand_level: existing.demand_level ?? undefined,
        business_structure: existing.business_structure ?? undefined,
        stage_questions: existing.stage_questions ?? undefined,
        industry_questions: existing.industry_questions ?? undefined,
        discernment_questions: existing.discernment_questions ?? undefined,
        three_year_goal: existing.three_year_goal ?? undefined,
        risk_tolerance: existing.risk_tolerance ?? undefined,
        constraints: existing.constraints ?? undefined,
        specific_question: existing.specific_question ?? undefined,
      },
      detectedStage: existing.detected_stage ?? null,
      stageScore: existing.stage_score ?? null,
      transitionReadiness: existing.transition_readiness ?? null,
      misalignmentFlags: existing.misalignment_flags ?? [],
      adaptiveQuestions: [],
      saving: false,
      lastSaved: null,
      error: null,
      completed: existing.status === "completed",
    };
  }
  return {
    assessmentId: null,
    currentSection: 1,
    currentQuestionIndex: -1, // -1 means show section intro
    answers: {},
    detectedStage: null,
    stageScore: null,
    transitionReadiness: null,
    misalignmentFlags: [],
    adaptiveQuestions: [],
    saving: false,
    lastSaved: null,
    error: null,
    completed: false,
  };
}

// ── Reducer ──────────────────────────────────────────────

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_ASSESSMENT_ID":
      return { ...state, assessmentId: action.id };

    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value },
      };

    case "SET_SECTION_4_ANSWER":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.pool]: {
            ...(state.answers[action.pool] as Record<string, string> || {}),
            [action.questionId]: action.value,
          },
        },
      };

    case "NEXT_QUESTION":
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };

    case "PREV_QUESTION":
      return {
        ...state,
        currentQuestionIndex: Math.max(-1, state.currentQuestionIndex - 1),
      };

    case "SET_SECTION":
      return {
        ...state,
        currentSection: action.section,
        currentQuestionIndex: -1, // show intro
      };

    case "SET_STAGE_RESULTS":
      return {
        ...state,
        detectedStage: action.detectedStage,
        stageScore: action.stageScore,
        transitionReadiness: action.transitionReadiness,
        misalignmentFlags: action.misalignmentFlags,
      };

    case "SET_ADAPTIVE_QUESTIONS":
      return { ...state, adaptiveQuestions: action.questions };

    case "SET_SAVING":
      return { ...state, saving: action.saving };

    case "SET_LAST_SAVED":
      return { ...state, lastSaved: action.timestamp };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_COMPLETED":
      return { ...state, completed: true };

    case "HYDRATE":
      return { ...state, ...action.state };

    default:
      return state;
  }
}

// ── Helpers ──────────────────────────────────────────────

function getQuestionsForSection(
  section: WizardSection,
  answers: AssessmentAnswers,
  adaptiveQuestions: AssessmentQuestion[]
): AssessmentQuestion[] {
  switch (section) {
    case 1: {
      const base = [...SECTION_1_QUESTIONS];
      // Insert sub-discipline question after Q1 if a discipline is selected
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

function getAnswerKeyForQuestion(
  question: AssessmentQuestion,
  section: WizardSection
): string {
  // Section 4 questions store answers in nested objects
  if (section === 4) {
    if (question.pool?.startsWith("stage_")) return "stage_questions";
    if (question.pool?.startsWith("industry_")) return "industry_questions";
    if (question.pool === "discernment") return "discernment_questions";
  }
  // Map question IDs to answer keys
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

function getCurrentAnswer(
  question: AssessmentQuestion,
  section: WizardSection,
  answers: AssessmentAnswers
): unknown {
  if (section === 4) {
    const pool = question.pool?.startsWith("stage_")
      ? "stage_questions"
      : question.pool?.startsWith("industry_")
        ? "industry_questions"
        : "discernment_questions";
    const poolAnswers = answers[pool as keyof AssessmentAnswers] as Record<string, string> | undefined;
    return poolAnswers?.[question.id];
  }
  const key = getAnswerKeyForQuestion(question, section);
  return answers[key as keyof AssessmentAnswers];
}

// ── Component ──────────────────────────────────────────────

interface AssessmentWizardProps {
  userId: string;
  existingAssessment: Assessment | null;
}

export default function AssessmentWizard({
  userId,
  existingAssessment,
}: AssessmentWizardProps) {
  const [state, dispatch] = useReducer(
    wizardReducer,
    existingAssessment,
    createInitialState
  );

  const { saving, lastSaved, saveError } = useAssessmentAutosave(
    userId,
    state.assessmentId,
    state.answers,
    state.currentSection,
    state.currentQuestionIndex,
    (id) => dispatch({ type: "SET_ASSESSMENT_ID", id }),
  );

  const contentRef = useRef<HTMLDivElement>(null);

  // Re-derive adaptive questions on mount if resuming past Section 3
  useEffect(() => {
    if (
      state.detectedStage &&
      state.adaptiveQuestions.length === 0 &&
      state.currentSection >= 4
    ) {
      const adaptive = selectAdaptiveQuestions(
        state.detectedStage,
        (state.answers.creative_mode as CreativeMode) || "hybrid",
        state.answers.discipline || ""
      );
      dispatch({ type: "SET_ADAPTIVE_QUESTIONS", questions: adaptive });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update saving state
  useEffect(() => {
    dispatch({ type: "SET_SAVING", saving });
    if (lastSaved) dispatch({ type: "SET_LAST_SAVED", timestamp: lastSaved });
  }, [saving, lastSaved]);

  const questions = getQuestionsForSection(
    state.currentSection,
    state.answers,
    state.adaptiveQuestions
  );

  const currentQuestion =
    state.currentQuestionIndex >= 0 && state.currentQuestionIndex < questions.length
      ? questions[state.currentQuestionIndex]
      : null;

  const currentAnswer = currentQuestion
    ? getCurrentAnswer(currentQuestion, state.currentSection, state.answers)
    : undefined;

  const isShowingIntro = state.currentQuestionIndex === -1;
  const sectionMeta = SECTION_META[state.currentSection - 1];

  // ── Handlers ──────────────────────────────────────────

  const handleAnswer = useCallback(
    (value: unknown) => {
      if (!currentQuestion) return;

      if (state.currentSection === 4) {
        const pool = currentQuestion.pool?.startsWith("stage_")
          ? "stage_questions"
          : currentQuestion.pool?.startsWith("industry_")
            ? "industry_questions"
            : "discernment_questions";
        dispatch({
          type: "SET_SECTION_4_ANSWER",
          pool: pool as "stage_questions" | "industry_questions" | "discernment_questions",
          questionId: currentQuestion.id,
          value: value as string,
        });
      } else {
        const key = getAnswerKeyForQuestion(currentQuestion, state.currentSection);
        dispatch({ type: "SET_ANSWER", key, value });

        // If discipline changes, reset sub-discipline
        if (key === "discipline" && value !== state.answers.discipline) {
          dispatch({ type: "SET_ANSWER", key: "sub_discipline", value: undefined });
        }
      }
    },
    [currentQuestion, state.currentSection, state.answers.discipline]
  );

  const handleNext = useCallback(() => {
    const nextIdx = state.currentQuestionIndex + 1;

    if (nextIdx < questions.length) {
      dispatch({ type: "NEXT_QUESTION" });
    } else {
      // Move to next section
      const nextSection = (state.currentSection + 1) as WizardSection;
      if (nextSection <= 5) {
        // When finishing Section 3, run scoring and load adaptive questions
        if (state.currentSection === 3) {
          const stageResult = computeStageScore(state.answers);
          dispatch({
            type: "SET_STAGE_RESULTS",
            detectedStage: stageResult.detectedStage,
            stageScore: stageResult.stageScore,
            transitionReadiness: stageResult.transitionReadiness,
            misalignmentFlags: stageResult.misalignmentFlags,
          });

          const adaptive = selectAdaptiveQuestions(
            stageResult.detectedStage,
            (state.answers.creative_mode as CreativeMode) || "hybrid",
            state.answers.discipline || ""
          );
          dispatch({ type: "SET_ADAPTIVE_QUESTIONS", questions: adaptive });

          // Section 4 now has questions, proceed to it
          dispatch({ type: "SET_SECTION", section: 4 });
        } else {
          dispatch({ type: "SET_SECTION", section: nextSection });
        }
      } else {
        // Assessment complete
        dispatch({ type: "SET_COMPLETED" });
      }
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentQuestionIndex, state.currentSection, state.answers, questions.length]);

  const handleBack = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      dispatch({ type: "PREV_QUESTION" });
    } else if (state.currentQuestionIndex === 0) {
      // Go back to intro
      dispatch({ type: "PREV_QUESTION" });
    } else if (state.currentSection > 1) {
      // Go to previous section's last question
      const prevSection = (state.currentSection - 1) as WizardSection;
      // Skip section 4 going backwards if empty
      const targetSection =
        prevSection === 4 && state.adaptiveQuestions.length === 0
          ? (3 as WizardSection)
          : prevSection;
      const prevQuestions = getQuestionsForSection(
        targetSection,
        state.answers,
        state.adaptiveQuestions
      );
      dispatch({ type: "SET_SECTION", section: targetSection });
      // Set to last question of previous section (after a tick so intro is set first)
      setTimeout(() => {
        for (let i = 0; i < prevQuestions.length; i++) {
          dispatch({ type: "NEXT_QUESTION" });
        }
      }, 0);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentQuestionIndex, state.currentSection, state.adaptiveQuestions, state.answers]);

  const handleStartSection = useCallback(() => {
    dispatch({ type: "NEXT_QUESTION" }); // moves from -1 to 0
  }, []);

  const handleJumpToSection = useCallback(
    (section: WizardSection) => {
      if (section < state.currentSection) {
        dispatch({ type: "SET_SECTION", section });
      }
    },
    [state.currentSection]
  );

  const canProceed = (() => {
    if (!currentQuestion) return true; // intro or complete
    if (currentQuestion.isOptional) return true;
    return currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== "";
  })();

  // ── Submit assessment and trigger roadmap generation ──────────

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!state.completed || hasSubmitted.current || !state.assessmentId) return;
    hasSubmitted.current = true;
    setSubmitting(true);

    fetch("/api/assessment/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId: state.assessmentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.planId) {
          // Stay on completion screen — user clicks through to roadmap
          setSubmitting(false);
        } else {
          setSubmitError("Something went wrong. Please try again.");
          setSubmitting(false);
        }
      })
      .catch(() => {
        setSubmitError("Something went wrong. Please try again.");
        setSubmitting(false);
      });
  }, [state.completed, state.assessmentId]);

  // ── Render: Complete state ──────────────────────────────

  if (state.completed) {
    return (
      <div className="asmt-wizard">
        <div className="asmt-complete">
          {submitting ? (
            <GenerationProgress
              label="Creative Identity"
              title="Saving your Creative Identity"
              description="Building your personalized strategic roadmap from your answers, archetype, and stage."
              footerNote="Usually ready in under a minute"
            />
          ) : submitError ? (
            <>
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
                  <p className="asmt-complete-desc">{submitError}</p>
                </div>
              </div>
              <button
                className="asmt-complete-btn"
                onClick={() => {
                  hasSubmitted.current = false;
                  setSubmitError(null);
                  setSubmitting(true);
                  dispatch({ type: "SET_COMPLETED" });
                }}
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="asmt-complete-header">
                <div className="asmt-complete-graphic">
                  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48">
                    <circle cx="24" cy="24" r="20" />
                    <path d="M16 24 L22 30 L32 18" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="asmt-complete-header-text">
                  <div className="asmt-complete-label">Creative Identity Complete</div>
                  <h2 className="asmt-complete-title">Your Creative Identity is saved</h2>
                  <p className="asmt-complete-desc">
                    Every recommendation across the platform — your roadmap,
                    deal evaluations, and advisor guidance — is now tuned
                    to your profile.
                  </p>
                </div>
              </div>

              <div className="asmt-complete-summary">
                {state.detectedStage && (
                  <div className="asmt-complete-summary-item">
                    <span className="asmt-complete-summary-label">Stage</span>
                    <span className="asmt-complete-summary-value">Stage {state.detectedStage}</span>
                  </div>
                )}
                {state.misalignmentFlags.length > 0 && (
                  <div className="asmt-complete-summary-item">
                    <span className="asmt-complete-summary-label">Misalignments</span>
                    <span className="asmt-complete-summary-value">{state.misalignmentFlags.length} detected</span>
                  </div>
                )}
                <div className="asmt-complete-summary-item">
                  <span className="asmt-complete-summary-label">Sections</span>
                  <span className="asmt-complete-summary-value">5 of 5</span>
                </div>
              </div>

              <div className="asmt-complete-next">
                <div className="asmt-complete-next-label">What happens next</div>
                <p className="asmt-complete-next-desc">
                  Your strategic roadmap is generating now — detected stage,
                  structural misalignments, and 3 specific next steps. Click
                  through to view it; the page will populate as soon as it&apos;s
                  ready (usually under a minute).
                </p>
                <a href="/roadmap" className="asmt-complete-btn">
                  View Roadmap
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <a href="/dashboard" className="asmt-complete-link">
                  Dashboard
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Wizard ──────────────────────────────

  return (
    <div className="asmt-wizard">
      <AssessmentProgress
        currentSection={state.currentSection}
        onJumpToSection={handleJumpToSection}
      />

      <div className="asmt-content" ref={contentRef}>
        {/* Save indicator */}
        <div className="asmt-save-status">
          {saveError ? (
            <span style={{ color: "var(--red, #c44)" }}>
              ⚠ Save error: {saveError}
            </span>
          ) : saving ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12" className="asmt-save-icon">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Saving
            </>
          ) : lastSaved ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Saved
            </>
          ) : null}
        </div>

        {isShowingIntro ? (
          <SectionIntro
            number={sectionMeta.number}
            title={sectionMeta.title}
            description={sectionMeta.intro}
            estimatedTime={sectionMeta.estimatedTime}
            onContinue={handleStartSection}
          />
        ) : currentQuestion ? (
          <div className="asmt-question-wrap">
            <QuestionRenderer
              question={currentQuestion}
              currentAnswer={currentAnswer}
              onAnswer={handleAnswer}
              creativeMode={(state.answers.creative_mode as CreativeMode) || undefined}
            />
            <WizardNav
              onBack={
                state.currentQuestionIndex > 0 || state.currentSection > 1
                  ? handleBack
                  : undefined
              }
              onNext={handleNext}
              canProceed={canProceed}
              isOptional={currentQuestion.isOptional}
              isLastQuestion={
                state.currentQuestionIndex === questions.length - 1 &&
                state.currentSection === 5
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
