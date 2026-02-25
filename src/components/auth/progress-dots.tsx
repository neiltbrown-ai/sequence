interface ProgressDotsProps {
  steps: number;
  currentStep: number;
  labels?: string[];
}

export default function ProgressDots({ steps, currentStep, labels }: ProgressDotsProps) {
  return (
    <div>
      {labels && labels[currentStep] && (
        <div className="auth-step-label">{labels[currentStep]}</div>
      )}
      <div className="auth-progress">
        {Array.from({ length: steps }, (_, i) => (
          <div
            key={i}
            className={`auth-dot${i < currentStep ? " completed" : ""}${i === currentStep ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
