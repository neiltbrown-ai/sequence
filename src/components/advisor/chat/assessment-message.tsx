"use client";

import type { AssessmentChatMessage } from "@/lib/advisor/assessment-state-machine";
import ChatOptionCards from "@/components/advisor/components/option-cards";
import ChatMultiSelect from "@/components/advisor/components/multi-select-cards";
import ChatRankingWidget from "@/components/advisor/components/ranking-widget";
import ChatAllocationSliders from "@/components/advisor/components/allocation-sliders";
import ChatSliderInput from "@/components/advisor/components/slider-input";
import ChatFreeTextInline from "@/components/advisor/components/free-text-inline";
import ChatActionCards from "@/components/advisor/components/action-cards-display";
import ChatRoadmapSummary from "@/components/advisor/components/roadmap-summary";

interface AssessmentMessageProps {
  message: AssessmentChatMessage;
  onAnswer: (questionId: string, value: unknown, label: string) => void;
  onRoadmapAction?: (value: string) => void;
  isLast?: boolean;
}

export default function AssessmentMessage({
  message,
  onAnswer,
  onRoadmapAction,
  isLast,
}: AssessmentMessageProps) {
  const { role } = message;

  // Thinking dots
  if (message.isThinking) {
    return (
      <div className="adv-chat-message assistant">
        <div className="adv-chat-avatar">
          <span className="adv-chat-avatar-icon">IS</span>
        </div>
        <div className="adv-chat-message-content">
          <div className="adv-chat-typing">
            <span className="adv-chat-typing-dot" />
            <span className="adv-chat-typing-dot" />
            <span className="adv-chat-typing-dot" />
          </div>
        </div>
      </div>
    );
  }

  // User collapsed response
  if (role === "user" && message.collapsedLabel) {
    return (
      <div className="adv-chat-message user">
        <div className="adv-chat-message-content">
          <div className="adv-comp-collapsed">
            <span className="adv-comp-collapsed-label">
              {message.collapsedLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message (text + optional component)
  return (
    <div className="adv-chat-message assistant">
      <div className="adv-chat-avatar">
        <span className="adv-chat-avatar-icon">IS</span>
      </div>
      <div className="adv-chat-message-content">
        {message.text && (
          <div className="adv-chat-message-text">
            {message.text
              .split("\n")
              .filter((l) => l.trim() !== "")
              .map((line, i, arr) => {
                const isLastLine = i === arr.length - 1;
                if (isLastLine && message.boldLastLine && message.component) {
                  return (
                    <p key={i} className="adv-chat-question-text">
                      <strong>{line}</strong>
                    </p>
                  );
                }
                return <p key={i}>{line}</p>;
              })}
          </div>
        )}
        {message.component && (
          <div className="adv-chat-tool">
            {renderComponent(message.component, onAnswer, onRoadmapAction, isLast)}
          </div>
        )}
      </div>
    </div>
  );
}

function renderComponent(
  component: NonNullable<AssessmentChatMessage["component"]>,
  onAnswer: (questionId: string, value: unknown, label: string) => void,
  onRoadmapAction?: (value: string) => void,
  isLast?: boolean
) {
  const { type, questionId, props } = component;

  // Helper to format label from a value for collapsed display
  const formatLabel = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object" && value) {
      // Allocation sliders: show percentages
      const obj = value as Record<string, number>;
      return Object.entries(obj)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k}: ${v}%`)
        .join(", ");
    }
    return String(value);
  };

  // Find the label for a selected option value
  const findOptionLabel = (
    val: string,
    options?: { value: string; label: string }[]
  ): string => {
    if (!options) return val;
    const opt = options.find((o) => o.value === val);
    return opt?.label || val;
  };

  switch (type) {
    case "option_cards":
      return (
        <ChatOptionCards
          questionId={questionId}
          questionText={props.questionText as string}
          options={
            props.options as { value: string; label: string; description?: string }[]
          }
          disabled={!isLast}
          onSelect={(value) =>
            onAnswer(
              questionId,
              value,
              findOptionLabel(
                value,
                props.options as { value: string; label: string }[]
              )
            )
          }
        />
      );

    case "multi_select":
      return (
        <ChatMultiSelect
          questionId={questionId}
          questionText={props.questionText as string}
          options={
            props.options as { value: string; label: string; description?: string }[]
          }
          maxSelections={props.maxSelections as number | undefined}
          disabled={!isLast}
          onSelect={(value) =>
            onAnswer(
              questionId,
              value,
              (value as string[])
                .map((v) =>
                  findOptionLabel(
                    v,
                    props.options as { value: string; label: string }[]
                  )
                )
                .join(", ")
            )
          }
        />
      );

    case "ranking":
      return (
        <ChatRankingWidget
          questionId={questionId}
          questionText={props.questionText as string}
          options={
            props.options as { value: string; label: string; description?: string }[]
          }
          disabled={!isLast}
          onSelect={(value) =>
            onAnswer(
              questionId,
              value,
              (value as string[])
                .map((v, i) =>
                  `${i + 1}. ${findOptionLabel(
                    v,
                    props.options as { value: string; label: string }[]
                  )}`
                )
                .join(", ")
            )
          }
        />
      );

    case "allocation_sliders":
      return (
        <ChatAllocationSliders
          questionId={questionId}
          questionText={props.questionText as string}
          categories={props.categories as { value: string; label: string }[]}
          disabled={!isLast}
          onSelect={(value) => onAnswer(questionId, value, formatLabel(value))}
        />
      );

    case "slider":
      return (
        <ChatSliderInput
          questionId={questionId}
          questionText={props.questionText as string}
          options={props.options as { value: string; label: string }[]}
          disabled={!isLast}
          onSelect={(value) =>
            onAnswer(
              questionId,
              value,
              findOptionLabel(
                value as string,
                props.options as { value: string; label: string }[]
              )
            )
          }
        />
      );

    case "free_text":
      return (
        <ChatFreeTextInline
          questionId={questionId}
          questionText={props.questionText as string}
          placeholder={props.placeholder as string | undefined}
          disabled={!isLast}
          onSelect={(value) =>
            onAnswer(questionId, value, (value as string) || "(skipped)")
          }
        />
      );

    case "roadmap_summary":
      return (
        <ChatRoadmapSummary
          stage={props.stage as number}
          stageName={props.stageName as string}
          stageDescription={props.stageDescription as string}
          transitionReadiness={props.transitionReadiness as string}
          misalignments={
            props.misalignments as { flag: string; whatItsCosting: string }[]
          }
          actions={
            props.actions as {
              order: number;
              type: string;
              title: string;
              what: string;
              timeline?: string;
            }[]
          }
          onSelect={(value) => onRoadmapAction?.(value)}
        />
      );

    case "action_cards":
      return (
        <ChatActionCards
          actions={
            props.actions as {
              order: number;
              type: string;
              title: string;
              what: string;
              timeline?: string;
            }[]
          }
          disabled={!isLast}
          onSelect={(value) => onRoadmapAction?.(value)}
        />
      );

    default:
      return (
        <div className="adv-chat-tool-unknown">Unknown component: {type}</div>
      );
  }
}
