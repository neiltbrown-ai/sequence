"use client";

import type { WizardSection } from "@/types/assessment";
import { SECTION_META } from "@/lib/assessment/questions";

interface AssessmentProgressProps {
  currentSection: WizardSection;
  onJumpToSection: (section: WizardSection) => void;
}

export default function AssessmentProgress({
  currentSection,
  onJumpToSection,
}: AssessmentProgressProps) {
  return (
    <div className="asmt-progress">
      <div className="asmt-progress-inner">
        {SECTION_META.map((meta) => {
          const isActive = meta.number === currentSection;
          const isCompleted = meta.number < currentSection;
          const isFuture = meta.number > currentSection;

          return (
            <button
              key={meta.number}
              className={`asmt-progress-step${isActive ? " active" : ""}${isCompleted ? " completed" : ""}${isFuture ? " future" : ""}`}
              onClick={() => {
                if (isCompleted) onJumpToSection(meta.number as WizardSection);
              }}
              disabled={isFuture}
              type="button"
            >
              <span className="asmt-progress-num">{meta.number}</span>
              <span className="asmt-progress-label">{meta.title}</span>
            </button>
          );
        })}
      </div>
      <div className="asmt-progress-bar">
        <div
          className="asmt-progress-fill"
          style={{ width: `${((currentSection - 1) / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}
