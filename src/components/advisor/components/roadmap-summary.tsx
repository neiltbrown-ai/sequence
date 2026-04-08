"use client";

interface RoadmapAction {
  order: number;
  type: string;
  title: string;
  what: string;
  timeline?: string;
}

interface Misalignment {
  flag: string;
  whatItsCosting: string;
}

interface RoadmapSummaryProps {
  stage: number;
  stageName: string;
  stageDescription: string;
  transitionReadiness: string;
  misalignments: Misalignment[];
  actions: RoadmapAction[];
  vision?: {
    twelveMonthTarget: string;
    threeYearHorizon: string;
  };
  onSelect: (value: string) => void;
}

const STAGE_NAMES: Record<number, string> = {
  1: "Execution Excellence",
  2: "Judgment Positioning",
  3: "Ownership Accumulation",
  4: "Capital Formation",
};

export default function ChatRoadmapSummary({
  stage,
  stageName,
  stageDescription,
  transitionReadiness,
  misalignments,
  actions,
  vision,
  onSelect,
}: RoadmapSummaryProps) {
  return (
    <div className="adv-comp-roadmap">
      {/* Stage Badge */}
      <div className={`adv-comp-roadmap-stage stage-${stage}`}>
        <span className="adv-comp-roadmap-stage-num">Stage {stage}</span>
        <h3 className="adv-comp-roadmap-stage-name">
          {stageName || STAGE_NAMES[stage]}
        </h3>
        <p className="adv-comp-roadmap-stage-desc">{stageDescription}</p>
        <span className="adv-comp-roadmap-readiness">
          Transition readiness: {transitionReadiness}
        </span>
      </div>

      {/* Misalignments */}
      {misalignments.length > 0 && (
        <div className="adv-comp-roadmap-misalignments">
          {misalignments.map((m) => (
            <div key={m.flag} className="adv-comp-roadmap-misalignment">
              <span className="adv-comp-roadmap-flag-icon">!</span>
              <span className="adv-comp-roadmap-flag-text">
                {formatFlagLabel(m.flag)}: {m.whatItsCosting}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="adv-comp-roadmap-actions">
        <h4 className="adv-comp-roadmap-actions-title">Your Three Next Actions</h4>
        {actions.map((action) => (
          <div key={action.order} className="adv-comp-roadmap-action">
            <div className="adv-comp-roadmap-action-header">
              <span className="adv-comp-roadmap-action-num">{action.order}</span>
              <span className="adv-comp-roadmap-action-type">{action.type}</span>
            </div>
            <h5 className="adv-comp-roadmap-action-title">{action.title}</h5>
            <p className="adv-comp-roadmap-action-what">{action.what}</p>
          </div>
        ))}
      </div>

      {/* Vision */}
      {vision && (
        <div className="adv-comp-roadmap-vision">
          <h4 className="adv-comp-roadmap-vision-title">Vision</h4>
          <p className="adv-comp-roadmap-vision-12mo">
            <strong>12-month:</strong> {vision.twelveMonthTarget}
          </p>
          <p className="adv-comp-roadmap-vision-3yr">
            <strong>3-year:</strong> {vision.threeYearHorizon}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="adv-comp-roadmap-cta">
        <button
          type="button"
          className="adv-comp-card"
          onClick={() => onSelect("start_action_1")}
        >
          Start Action 1
        </button>
        <button
          type="button"
          className="adv-comp-card"
          onClick={() => onSelect("show_full_roadmap")}
        >
          View full roadmap
        </button>
      </div>
    </div>
  );
}

function formatFlagLabel(flag: string): string {
  const labels: Record<string, string> = {
    income_exceeds_structure: "Income exceeds structure",
    judgment_not_priced: "Judgment not priced",
    relationships_not_converted: "Relationships not converted",
    ip_not_monetized: "IP not monetized",
    demand_exceeds_capacity: "Demand exceeds capacity",
    talent_without_structure: "Talent without structure",
  };
  return labels[flag] || flag.replace(/_/g, " ");
}
