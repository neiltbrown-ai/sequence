"use client";

import { useState } from "react";

interface SliderInputProps {
  questionId: string;
  questionText: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function ChatSliderInput({
  questionId,
  questionText,
  options,
  onSelect,
  disabled = false,
}: SliderInputProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    if (disabled || selected) return;
    setSelected(value);
    onSelect(value);
  };

  // After selection, hide entirely — the state machine renders the user bubble
  if (selected) return null;

  return (
    <div className="adv-comp-slider" data-question-id={questionId}>
      <div className="adv-comp-slider-stops">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="adv-comp-slider-stop"
            onClick={() => handleSelect(opt.value)}
            disabled={disabled}
          >
            <span className="adv-comp-slider-dot" />
            <span className="adv-comp-slider-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
