"use client";

interface SectionIntroProps {
  number: number;
  title: string;
  description: string;
  estimatedTime: string;
  onContinue: () => void;
}

export default function SectionIntro({
  number,
  title,
  description,
  estimatedTime,
  onContinue,
}: SectionIntroProps) {
  return (
    <div className="asmt-intro">
      <div className="asmt-intro-num">Section {number} of 5</div>
      <h2 className="asmt-intro-title">{title}</h2>
      <p className="asmt-intro-desc">{description}</p>
      <p className="asmt-intro-time">{estimatedTime}</p>
      <button type="button" className="asmt-intro-btn" onClick={onContinue}>
        {number === 1 ? "Start" : "Continue"}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12}>
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </button>
    </div>
  );
}
