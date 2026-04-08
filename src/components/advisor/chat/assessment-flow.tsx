"use client";

import { useReducer, useRef, useEffect, useCallback } from "react";
import {
  assessmentReducer,
  createInitialState,
  type AssessmentMachineAction,
} from "@/lib/advisor/assessment-state-machine";
import { computeStageScore } from "@/lib/assessment/scoring";
import { matchArchetype } from "@/lib/assessment/archetype-matching";
import { selectAdaptiveQuestions } from "@/lib/assessment/question-selection";
import { useAssessmentAutosave } from "@/hooks/use-assessment-autosave";
import AssessmentMessage from "./assessment-message";
import ChatProgressBar from "./chat-progress-bar";
import type { CreativeMode, StageNumber } from "@/types/assessment";

interface AssessmentFlowProps {
  userId: string;
  onComplete?: () => void;
  className?: string;
}

export default function AssessmentFlow({
  userId,
  onComplete,
  className = "",
}: AssessmentFlowProps) {
  const [state, dispatch] = useReducer(assessmentReducer, undefined, createInitialState);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const computedRef = useRef(false);
  const roadmapCalledRef = useRef(false);

  // Autosave answers to Supabase
  const handleAssessmentCreated = useCallback(
    (id: string) => dispatch({ type: "SET_ASSESSMENT_ID", id }),
    []
  );

  useAssessmentAutosave(
    userId,
    state.assessmentId,
    state.answers,
    state.section,
    state.questionIndex,
    handleAssessmentCreated
  );

  // Auto-start: show first question after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        dispatch({ type: "START" });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Thinking timer: 800-1200ms fake delay between questions
  useEffect(() => {
    if (state.phase !== "thinking") return;
    const delay = 800 + Math.random() * 400;
    const timer = setTimeout(() => dispatch({ type: "THINKING_DONE" }), delay);
    return () => clearTimeout(timer);
  }, [state.phase, state.messages.length]);

  // After Section 3: compute stage score + load adaptive questions
  useEffect(() => {
    if (state.phase !== "computing" || computedRef.current) return;
    computedRef.current = true;

    // Run scoring client-side (pure functions)
    const stageResult = computeStageScore(state.answers);
    const adaptiveQs = selectAdaptiveQuestions(
      stageResult.detectedStage,
      (state.answers.creative_mode as CreativeMode) || "hybrid",
      state.answers.sub_discipline || state.answers.discipline || ""
    );

    // Small delay so the "computing" message is visible
    const timer = setTimeout(() => {
      dispatch({
        type: "SET_STAGE_RESULTS",
        detectedStage: stageResult.detectedStage,
        stageScore: stageResult.stageScore,
        transitionReadiness: stageResult.transitionReadiness,
        misalignmentFlags: stageResult.misalignmentFlags,
        adaptiveQuestions: adaptiveQs,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [state.phase, state.answers]);

  // After Section 5: generate roadmap
  useEffect(() => {
    if (state.phase !== "generating_roadmap" || roadmapCalledRef.current) return;
    if (!state.assessmentId) return;
    roadmapCalledRef.current = true;

    // Run final scoring + archetype matching client-side
    const stageResult = computeStageScore(state.answers);
    const archetypeResult = matchArchetype(
      stageResult.detectedStage,
      stageResult.stageScore,
      (state.answers.creative_mode as CreativeMode) || "hybrid",
      stageResult.misalignmentFlags
    );

    dispatch({ type: "SET_ARCHETYPE", result: archetypeResult });

    // Update stage results if different from Section 3 (Section 4 answers may affect discernment flag)
    if (
      stageResult.detectedStage !== state.detectedStage ||
      stageResult.misalignmentFlags.length !== state.misalignmentFlags.length
    ) {
      // Don't re-dispatch SET_STAGE_RESULTS here since it would change section —
      // just update local scoring state via the archetype dispatch above.
      // The roadmap will use the latest scoring.
    }

    // Call server for roadmap generation — send answers directly to avoid autosave race condition
    fetch("/api/assessment/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentId: state.assessmentId,
        answers: state.answers,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.planId) {
          dispatch({ type: "ROADMAP_RECEIVED", planId: data.planId });
        } else {
          dispatch({
            type: "ROADMAP_ERROR",
            error: data.error || "Failed to generate roadmap",
          });
        }
      })
      .catch((err) => {
        dispatch({ type: "ROADMAP_ERROR", error: String(err) });
      });
  }, [state.phase, state.assessmentId, state.answers, state.detectedStage, state.misalignmentFlags.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  // Handle answer from component interaction
  const handleAnswer = useCallback(
    (questionId: string, value: unknown, label: string) => {
      dispatch({ type: "ANSWER", questionId, value, label });
    },
    []
  );

  // Handle roadmap action selection
  const handleRoadmapAction = useCallback(
    (value: string) => {
      // For now, trigger completion. In the future, this could route to action coaching.
      onComplete?.();
    },
    [onComplete]
  );

  // Handle retry on roadmap error
  const handleRetry = useCallback(() => {
    roadmapCalledRef.current = false;
    dispatch({ type: "ROADMAP_RETRY" });
  }, []);

  const showProgress =
    state.phase !== "intro" &&
    state.phase !== "roadmap_revealed" &&
    state.phase !== "complete";

  return (
    <div className={`adv-chat-container ${className}`}>
      {/* Progress bar */}
      {showProgress && (
        <ChatProgressBar
          currentSection={state.section}
          totalSections={5}
        />
      )}

      {/* Messages */}
      <div className="adv-chat-messages" ref={scrollRef}>
        {state.messages.map((message, idx) => (
          <AssessmentMessage
            key={message.id}
            message={message}
            onAnswer={handleAnswer}
            onRoadmapAction={handleRoadmapAction}
            isLast={idx === state.messages.length - 1}
          />
        ))}

        {/* Roadmap error with retry */}
        {state.roadmapError && (
          <div className="adv-chat-message assistant">
            <div className="adv-chat-avatar">
              <span className="adv-chat-avatar-icon">IS</span>
            </div>
            <div className="adv-chat-message-content">
              <div className="adv-chat-error">
                <p>Something went wrong generating your roadmap.</p>
                <button
                  type="button"
                  className="adv-chat-retry-btn"
                  onClick={handleRetry}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area — disabled during assessment (all input via structured components) */}
      <div className="adv-chat-input-wrapper">
        <div className="adv-chat-input-container">
          <textarea
            className="adv-chat-input"
            placeholder="Assessment in progress..."
            disabled
            rows={1}
          />
        </div>
      </div>
    </div>
  );
}
