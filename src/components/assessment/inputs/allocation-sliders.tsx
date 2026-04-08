"use client";

import { useCallback } from "react";
import type { QuestionOption } from "@/types/assessment";

interface AllocationSlidersProps {
  options: QuestionOption[];
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

export default function AllocationSliders({
  options,
  value,
  onChange,
}: AllocationSlidersProps) {
  // Initialize with equal distribution if empty
  const getValues = useCallback((): Record<string, number> => {
    if (Object.keys(value).length === 0) {
      const even = Math.floor(100 / options.length);
      const remainder = 100 - even * options.length;
      const init: Record<string, number> = {};
      options.forEach((opt, i) => {
        init[opt.value] = even + (i === 0 ? remainder : 0);
      });
      return init;
    }
    return value;
  }, [value, options]);

  const current = getValues();
  const total = Object.values(current).reduce((sum, v) => sum + v, 0);

  const handleSliderChange = useCallback(
    (key: string, newVal: number) => {
      const oldVal = current[key] || 0;
      const diff = newVal - oldVal;

      if (diff === 0) return;

      // Get other keys that have room to adjust
      const otherKeys = options
        .map((o) => o.value)
        .filter((k) => k !== key && (current[k] || 0) > 0);

      if (otherKeys.length === 0 && diff > 0) return;

      const next = { ...current, [key]: newVal };

      // Distribute the difference proportionally across other keys
      const otherTotal = otherKeys.reduce((sum, k) => sum + (current[k] || 0), 0);

      if (otherTotal > 0) {
        let remaining = -diff;
        otherKeys.forEach((k, i) => {
          if (i === otherKeys.length - 1) {
            // Last key gets whatever remains to keep total at 100
            next[k] = Math.max(0, (current[k] || 0) + remaining);
          } else {
            const proportion = (current[k] || 0) / otherTotal;
            const adjustment = Math.round(-diff * proportion);
            next[k] = Math.max(0, (current[k] || 0) + adjustment);
            remaining -= adjustment;
          }
        });
      }

      // Ensure total is exactly 100
      const newTotal = Object.values(next).reduce((s, v) => s + v, 0);
      if (newTotal !== 100) {
        const correction = 100 - newTotal;
        // Apply correction to the first other key that has room
        for (const k of otherKeys) {
          if (next[k] + correction >= 0) {
            next[k] += correction;
            break;
          }
        }
      }

      onChange(next);
    },
    [current, options, onChange]
  );

  const handleReset = useCallback(() => {
    const even = Math.floor(100 / options.length);
    const remainder = 100 - even * options.length;
    const init: Record<string, number> = {};
    options.forEach((opt, i) => {
      init[opt.value] = even + (i === 0 ? remainder : 0);
    });
    onChange(init);
  }, [options, onChange]);

  return (
    <div className="asmt-alloc">
      {/* Stacked bar visualization */}
      <div className="asmt-alloc-bar">
        {options.map((opt) => {
          const pct = current[opt.value] || 0;
          if (pct === 0) return null;
          return (
            <div
              key={opt.value}
              className="asmt-alloc-segment"
              style={{ width: `${pct}%` }}
              title={`${opt.label}: ${pct}%`}
            >
              {pct >= 8 && <span className="asmt-alloc-segment-label">{pct}%</span>}
            </div>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="asmt-alloc-sliders">
        {options.map((opt) => (
          <div key={opt.value} className="asmt-alloc-row">
            <label className="asmt-alloc-label">{opt.label}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={current[opt.value] || 0}
              onChange={(e) =>
                handleSliderChange(opt.value, Number(e.target.value))
              }
              className="asmt-alloc-range"
            />
            <span className="asmt-alloc-pct">{current[opt.value] || 0}%</span>
          </div>
        ))}
      </div>

      <div className="asmt-alloc-footer">
        <span className={`asmt-alloc-total${total !== 100 ? " error" : ""}`}>
          Total: {total}%
        </span>
        <button type="button" className="asmt-alloc-reset" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
