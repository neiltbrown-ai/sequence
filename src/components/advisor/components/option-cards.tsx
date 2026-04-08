"use client";

import { useState } from "react";

interface OptionCardsProps {
  questionId: string;
  questionText: string;
  options: { value: string; label: string; description?: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function ChatOptionCards({
  questionId,
  questionText,
  options,
  onSelect,
  disabled = false,
}: OptionCardsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    if (disabled || selected) return;
    setSelected(value);
    onSelect(value);
  };

  if (!options || options.length === 0) return null;

  // After selection, hide entirely — the state machine renders the user bubble
  if (selected) return null;

  return (
    <div className="adv-comp-option-cards" data-question-id={questionId}>
      <div className="adv-comp-cards-grid">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="adv-comp-card"
            onClick={() => handleSelect(opt.value)}
            disabled={disabled}
          >
            <span className="adv-comp-card-label">{opt.label}</span>
            {opt.description && (
              <span className="adv-comp-card-desc">{opt.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
