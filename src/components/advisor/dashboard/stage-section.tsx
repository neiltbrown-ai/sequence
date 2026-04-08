"use client";

interface StageSectionProps {
  stage: number;
  stageName: string;
  stageDescription: string;
  transitionReadiness: string;
}

export default function StageSection({
  stage,
  stageName,
  stageDescription,
  transitionReadiness,
}: StageSectionProps) {
  return (
    <div className={`adv-dash-stage stage-${stage}`}>
      <div className="adv-dash-stage-badge">
        <span className="adv-dash-stage-num">Stage {stage}</span>
        <h2 className="adv-dash-stage-name">{stageName}</h2>
      </div>
      <p className="adv-dash-stage-desc">{stageDescription}</p>
      <div className="adv-dash-stage-meta">
        <span className="adv-dash-readiness">
          Transition readiness: <strong>{transitionReadiness}</strong>
        </span>
        <a href="/assessment" className="adv-dash-retake">
          Retake assessment
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>
    </div>
  );
}
