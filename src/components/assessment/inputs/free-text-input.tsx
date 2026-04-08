"use client";

interface FreeTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function FreeTextInput({
  value,
  onChange,
  placeholder,
}: FreeTextInputProps) {
  return (
    <div className="asmt-freetext">
      <textarea
        className="asmt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />
    </div>
  );
}
