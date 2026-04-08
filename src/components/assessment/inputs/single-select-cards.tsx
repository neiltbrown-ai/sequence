"use client";

import type { QuestionOption } from "@/types/assessment";

interface SingleSelectCardsProps {
  options: QuestionOption[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export default function SingleSelectCards({
  options,
  value,
  onChange,
}: SingleSelectCardsProps) {
  return (
    <div className="asmt-card-grid">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`asmt-card${value === opt.value ? " selected" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="asmt-card-label">{opt.label}</span>
          {opt.description && (
            <span className="asmt-card-desc">{opt.description}</span>
          )}
        </button>
      ))}
    </div>
  );
}
