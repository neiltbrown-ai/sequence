import type { StageNumber } from "@/types/assessment";

const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Execution Excellence",
  2: "Judgment Positioning",
  3: "Ownership Accumulation",
  4: "Capital Formation",
};

const STAGE_RANGES: Record<StageNumber, string> = {
  1: "$75K–$200K",
  2: "$200K–$500K",
  3: "$500K–$2M+",
  4: "$2M+",
};

export default function StageBadge({
  stage,
  size = "default",
}: {
  stage: StageNumber;
  size?: "default" | "large";
}) {
  return (
    <div className={`rdmp-stage-badge rdmp-stage-badge--${size} rdmp-stage-${stage}`}>
      <span className="rdmp-stage-badge-number">Stage {stage}</span>
      <span className="rdmp-stage-badge-name">{STAGE_NAMES[stage]}</span>
      <span className="rdmp-stage-badge-range">{STAGE_RANGES[stage]}</span>
    </div>
  );
}
