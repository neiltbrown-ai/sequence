"use client";

import { useState } from "react";

interface CurrencyInputProps {
  questionId: string;
  questionText: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function ChatCurrencyInput({
  questionId,
  questionText,
  placeholder,
  onSelect,
  disabled = false,
}: CurrencyInputProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const formatCurrency = (raw: string): string => {
    const num = raw.replace(/[^0-9]/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("en-US");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setValue(raw);
  };

  const handleSubmit = () => {
    if (!value || disabled || submitted) return;
    setSubmitted(true);
    onSelect(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (submitted) {
    return (
      <div className="adv-comp-collapsed">
        <span className="adv-comp-collapsed-label">
          ${formatCurrency(value)}
        </span>
      </div>
    );
  }

  return (
    <div className="adv-comp-currency" data-question-id={questionId}>
      <div className="adv-comp-currency-input-wrap">
        <span className="adv-comp-currency-symbol">$</span>
        <input
          type="text"
          inputMode="numeric"
          className="adv-comp-currency-input"
          value={formatCurrency(value)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "0"}
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        className="adv-comp-done-btn"
        onClick={handleSubmit}
        disabled={!value}
      >
        Submit
      </button>
    </div>
  );
}
