"use client";

import { useState } from "react";

interface MultiSelectCardsProps {
  questionId: string;
  questionText: string;
  options: { value: string; label: string; description?: string }[];
  maxSelections?: number;
  onSelect: (value: string[]) => void;
  disabled?: boolean;
}

export default function ChatMultiSelect({
  questionId,
  questionText,
  options,
  maxSelections = 3,
  onSelect,
  disabled = false,
}: MultiSelectCardsProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleToggle = (value: string) => {
    if (disabled || submitted) return;
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else if (selected.length < maxSelections) {
      setSelected([...selected, value]);
    }
  };

  const handleDone = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
    onSelect(selected);
  };

  // After submission, hide entirely — the state machine renders the user bubble
  if (submitted) return null;

  return (
    <div className="adv-comp-multi-select" data-question-id={questionId}>
      <p className="adv-comp-hint">
        Select up to {maxSelections} ({selected.length} selected)
      </p>
      <div className="adv-comp-cards-grid">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const isDisabled = !isSelected && selected.length >= maxSelections;
          return (
            <button
              key={opt.value}
              type="button"
              className={`adv-comp-card${isSelected ? " selected" : ""}${isDisabled ? " disabled" : ""}`}
              onClick={() => handleToggle(opt.value)}
              disabled={disabled || isDisabled}
            >
              <span className="adv-comp-card-check">
                {isSelected ? "✓" : ""}
              </span>
              <span className="adv-comp-card-label">{opt.label}</span>
              {opt.description && (
                <span className="adv-comp-card-desc">{opt.description}</span>
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <button
          type="button"
          className="adv-comp-done-btn"
          onClick={handleDone}
        >
          Done
        </button>
      )}
    </div>
  );
}
