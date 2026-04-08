"use client";

import type { QuestionOption } from "@/types/assessment";

interface MultiSelectCardsProps {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections: number;
}

export default function MultiSelectCards({
  options,
  value,
  onChange,
  maxSelections,
}: MultiSelectCardsProps) {
  const handleToggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else if (value.length < maxSelections) {
      onChange([...value, optValue]);
    }
  };

  return (
    <div className="asmt-card-grid">
      <p className="asmt-select-hint">Select up to {maxSelections}</p>
      {options.map((opt) => {
        const isSelected = value.includes(opt.value);
        const isDisabled = !isSelected && value.length >= maxSelections;

        return (
          <button
            key={opt.value}
            type="button"
            className={`asmt-card${isSelected ? " selected" : ""}${isDisabled ? " disabled" : ""}`}
            onClick={() => !isDisabled && handleToggle(opt.value)}
            disabled={isDisabled}
          >
            <span className="asmt-card-check">
              {isSelected ? "✓" : ""}
            </span>
            <span className="asmt-card-label">{opt.label}</span>
            {opt.description && (
              <span className="asmt-card-desc">{opt.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
