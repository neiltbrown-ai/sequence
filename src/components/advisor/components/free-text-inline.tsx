"use client";

import { useState } from "react";

interface FreeTextInlineProps {
  questionId: string;
  questionText: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function ChatFreeTextInline({
  questionId,
  questionText,
  placeholder,
  onSelect,
  disabled = false,
}: FreeTextInlineProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!value.trim() || disabled || submitted) return;
    setSubmitted(true);
    onSelect(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // After submission, hide entirely — the state machine renders the user bubble
  if (submitted) return null;

  return (
    <div className="adv-comp-free-text" data-question-id={questionId}>
      <textarea
        className="adv-comp-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type your response..."}
        rows={3}
        disabled={disabled}
      />
      <button
        type="button"
        className="adv-comp-done-btn"
        onClick={handleSubmit}
        disabled={!value.trim()}
      >
        Send
      </button>
    </div>
  );
}
