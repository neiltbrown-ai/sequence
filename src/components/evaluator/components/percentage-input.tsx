'use client';

import { useState } from 'react';

interface PercentageInputProps {
  questionId: string;
  onSelect: (value: number) => void;
  disabled?: boolean;
  prefillValue?: number;
  prefillLabel?: string;
}

export function PercentageInput({
  onSelect,
  disabled,
  prefillValue,
  prefillLabel,
}: PercentageInputProps) {
  const [value, setValue] = useState(prefillValue?.toString() ?? '');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return null;

  const numVal = parseInt(value, 10);
  const isValid = !isNaN(numVal) && numVal >= 0 && numVal <= 100;

  function handleSubmit() {
    if (!isValid || disabled) return;
    setSubmitted(true);
    onSelect(numVal);
  }

  return (
    <div className="eval-input-row">
      {prefillLabel && (
        <div className="eval-input-prefill">{prefillLabel}</div>
      )}
      <div className="eval-input-group">
        <input
          type="number"
          min={0}
          max={100}
          className="eval-input-field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={disabled}
          placeholder="0"
        />
        <span className="eval-input-suffix">%</span>
        <button
          type="button"
          className="eval-input-submit"
          onClick={handleSubmit}
          disabled={disabled || !isValid}
        >
          →
        </button>
      </div>
    </div>
  );
}
