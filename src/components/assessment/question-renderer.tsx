"use client";

import type { AssessmentQuestion, CreativeMode } from "@/types/assessment";
import SingleSelectCards from "./inputs/single-select-cards";
import MultiSelectCards from "./inputs/multi-select-cards";
import RankInput from "./inputs/rank-input";
import SliderInput from "./inputs/slider-input";
import AllocationSliders from "./inputs/allocation-sliders";
import FreeTextInput from "./inputs/free-text-input";

interface QuestionRendererProps {
  question: AssessmentQuestion;
  currentAnswer: unknown;
  onAnswer: (value: unknown) => void;
  creativeMode?: CreativeMode;
}

function getQuestionText(question: AssessmentQuestion, mode?: CreativeMode): string {
  if (mode && question.questionTextVariants?.[mode]) {
    return question.questionTextVariants[mode]!;
  }
  return question.questionText;
}

function getOptions(question: AssessmentQuestion, mode?: CreativeMode) {
  if (mode && question.optionVariants?.[mode]) {
    return question.optionVariants[mode]!;
  }
  return question.options || [];
}

export default function QuestionRenderer({
  question,
  currentAnswer,
  onAnswer,
  creativeMode,
}: QuestionRendererProps) {
  const text = getQuestionText(question, creativeMode);
  const options = getOptions(question, creativeMode);

  return (
    <div className="asmt-question">
      <h3 className="asmt-question-text">{text}</h3>

      {question.answerType === "single_select" && (
        <SingleSelectCards
          options={options}
          value={currentAnswer as string | undefined}
          onChange={(v) => onAnswer(v)}
        />
      )}

      {question.answerType === "multi_select" && (
        <MultiSelectCards
          options={options}
          value={(currentAnswer as string[] | undefined) || []}
          onChange={(v) => onAnswer(v)}
          maxSelections={question.maxSelections || 2}
        />
      )}

      {question.answerType === "rank" && (
        <RankInput
          options={options}
          value={(currentAnswer as string[] | undefined) || []}
          onChange={(v) => onAnswer(v)}
        />
      )}

      {question.answerType === "slider" && (
        <SliderInput
          options={options}
          value={currentAnswer as string | undefined}
          onChange={(v) => onAnswer(v)}
        />
      )}

      {question.answerType === "allocation" && (
        <AllocationSliders
          options={options}
          value={(currentAnswer as Record<string, number> | undefined) || {}}
          onChange={(v) => onAnswer(v)}
        />
      )}

      {question.answerType === "free_text" && (
        <FreeTextInput
          value={(currentAnswer as string | undefined) || ""}
          onChange={(v) => onAnswer(v)}
          placeholder={question.placeholder}
        />
      )}
    </div>
  );
}
