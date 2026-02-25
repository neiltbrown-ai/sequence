"use client";

interface StagePillsProps {
  stages: string[];
  activeStage: string;
  onStageChange: (value: string) => void;
}

export default function StagePills({ stages, activeStage, onStageChange }: StagePillsProps) {
  return (
    <div className="stage-filters">
      <span className="stage-filter-label">Stage</span>
      <button
        className={`stage-pill${activeStage === "all" ? " active" : ""}`}
        onClick={() => onStageChange("all")}
      >
        All
      </button>
      {stages.map((stage) => (
        <button
          key={stage}
          className={`stage-pill${activeStage === stage ? " active" : ""}`}
          onClick={() => onStageChange(stage)}
        >
          {stage}
        </button>
      ))}
    </div>
  );
}
