"use client";

import { useState, useCallback } from "react";

interface AllocationSlidersProps {
  questionId: string;
  questionText: string;
  categories: { value: string; label: string }[];
  onSelect: (value: Record<string, number>) => void;
  disabled?: boolean;
}

export default function ChatAllocationSliders({
  questionId,
  questionText,
  categories,
  onSelect,
  disabled = false,
}: AllocationSlidersProps) {
  const [submitted, setSubmitted] = useState(false);

  // Initialize with equal distribution
  const [values, setValues] = useState<Record<string, number>>(() => {
    const even = Math.floor(100 / categories.length);
    const remainder = 100 - even * categories.length;
    const init: Record<string, number> = {};
    categories.forEach((cat, i) => {
      init[cat.value] = even + (i === 0 ? remainder : 0);
    });
    return init;
  });

  const total = Object.values(values).reduce((sum, v) => sum + v, 0);

  const handleSliderChange = useCallback(
    (key: string, newVal: number) => {
      if (disabled || submitted) return;
      const oldVal = values[key] || 0;
      const diff = newVal - oldVal;
      if (diff === 0) return;

      const otherKeys = categories
        .map((c) => c.value)
        .filter((k) => k !== key && (values[k] || 0) > 0);

      if (otherKeys.length === 0 && diff > 0) return;

      const next = { ...values, [key]: newVal };
      const otherTotal = otherKeys.reduce((sum, k) => sum + (values[k] || 0), 0);

      if (otherTotal > 0) {
        let remaining = -diff;
        otherKeys.forEach((k, i) => {
          if (i === otherKeys.length - 1) {
            next[k] = Math.max(0, (values[k] || 0) + remaining);
          } else {
            const proportion = (values[k] || 0) / otherTotal;
            const adjustment = Math.round(-diff * proportion);
            next[k] = Math.max(0, (values[k] || 0) + adjustment);
            remaining -= adjustment;
          }
        });
      }

      // Ensure total is 100
      const newTotal = Object.values(next).reduce((s, v) => s + v, 0);
      if (newTotal !== 100) {
        const correction = 100 - newTotal;
        for (const k of otherKeys) {
          if (next[k] + correction >= 0) {
            next[k] += correction;
            break;
          }
        }
      }

      setValues(next);
    },
    [values, categories, disabled, submitted]
  );

  const handleDone = () => {
    setSubmitted(true);
    onSelect(values);
  };

  // After submission, hide entirely — the state machine renders the user bubble
  if (submitted) return null;

  return (
    <div className="adv-comp-allocation" data-question-id={questionId}>
      {/* Stacked bar */}
      <div className="adv-comp-alloc-bar">
        {categories.map((cat) => {
          const pct = values[cat.value] || 0;
          if (pct === 0) return null;
          return (
            <div
              key={cat.value}
              className="adv-comp-alloc-segment"
              style={{ width: `${pct}%` }}
            >
              {pct >= 10 && (
                <span className="adv-comp-alloc-segment-label">{pct}%</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="adv-comp-alloc-sliders">
        {categories.map((cat) => (
          <div key={cat.value} className="adv-comp-alloc-row">
            <label className="adv-comp-alloc-label">{cat.label}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={values[cat.value] || 0}
              onChange={(e) =>
                handleSliderChange(cat.value, Number(e.target.value))
              }
              className="adv-comp-alloc-range"
              disabled={disabled}
            />
            <span className="adv-comp-alloc-pct">{values[cat.value] || 0}%</span>
          </div>
        ))}
      </div>

      <div className="adv-comp-alloc-footer">
        <span className={`adv-comp-alloc-total${total !== 100 ? " error" : ""}`}>
          Total: {total}%
        </span>
        <button type="button" className="adv-comp-done-btn" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
}
