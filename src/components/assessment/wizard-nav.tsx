"use client";

interface WizardNavProps {
  onBack?: () => void;
  onNext: () => void;
  canProceed: boolean;
  isOptional?: boolean;
  isLastQuestion?: boolean;
}

export default function WizardNav({
  onBack,
  onNext,
  canProceed,
  isOptional,
  isLastQuestion,
}: WizardNavProps) {
  return (
    <div className="asmt-nav">
      {onBack ? (
        <button type="button" className="btn btn--ghost btn--lg" onClick={onBack}>
          Back
        </button>
      ) : (
        <div />
      )}

      <div className="asmt-nav-right">
        {isOptional && !canProceed && (
          <button type="button" className="btn btn--lg" onClick={onNext}>
            Skip
          </button>
        )}
        <button
          type="button"
          className="btn btn--filled btn--lg"
          onClick={onNext}
          disabled={!canProceed && !isOptional}
        >
          {isLastQuestion ? "Complete" : "Next"}
        </button>
      </div>
    </div>
  );
}
