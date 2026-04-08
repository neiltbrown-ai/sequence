'use client';

import { useState } from 'react';

interface NumberInputProps {
  questionId: string;
  onSelect: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function NumberInput({
  onSelect,
  disabled,
  placeholder,
}: NumberInputProps) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return null;

  const numVal = parseFloat(value);
  const isValid = !isNaN(numVal) && numVal >= 0;

  function handleSubmit() {
    if (!isValid || disabled) return;
    setSubmitted(true);
    onSelect(numVal);
  }

  return (
    <div className="eval-input-row">
      <div className="eval-input-group">
        <input
          type="number"
          min={0}
          className="eval-input-field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={disabled}
          placeholder={placeholder ?? '0'}
        />
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
