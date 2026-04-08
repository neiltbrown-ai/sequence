"use client";

import type { QuestionOption } from "@/types/assessment";

interface SliderInputProps {
  options: QuestionOption[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export default function SliderInput({
  options,
  value,
  onChange,
}: SliderInputProps) {
  const currentIdx = value ? options.findIndex((o) => o.value === value) : -1;

  return (
    <div className="asmt-slider">
      <div className="asmt-slider-track">
        <input
          type="range"
          min={0}
          max={options.length - 1}
          value={currentIdx >= 0 ? currentIdx : 0}
          onChange={(e) => onChange(options[Number(e.target.value)].value)}
          className="asmt-slider-range"
        />
        <div className="asmt-slider-stops">
          {options.map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              className={`asmt-slider-stop${currentIdx === idx ? " active" : ""}`}
              onClick={() => onChange(opt.value)}
            >
              <span className="asmt-slider-dot" />
              <span className="asmt-slider-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
