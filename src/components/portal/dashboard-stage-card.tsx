import Link from "next/link";
import type { StageNumber, ActionStatus } from "@/types/assessment";

const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Execution Excellence",
  2: "Judgment Positioning",
  3: "Ownership Accumulation",
  4: "Capital Formation",
};

type ActionSummary = {
  order: number;
  title: string;
  status: ActionStatus;
};

export default function DashboardStageCard({
  stage,
  actions,
  planStatus,
}: {
  stage: StageNumber;
  actions: ActionSummary[];
  planStatus: string;
}) {
  const completedCount = actions.filter((a) => a.status === "completed").length;

  return (
    <div className="dash-stage-card rv rv-d1">
      <div className="dash-stage-card-header">
        <div className={`dash-stage-badge dash-stage-${stage}`}>
          <span className="dash-stage-num">Stage {stage}</span>
          <span className="dash-stage-name">{STAGE_NAMES[stage]}</span>
        </div>
        {planStatus === "published" && (
          <Link href="/roadmap" className="dash-stage-link">
            View Roadmap →
          </Link>
        )}
        {planStatus === "review" && (
          <span className="dash-stage-review">Under review</span>
        )}
        {planStatus === "generating" && (
          <span className="dash-stage-review">Generating...</span>
        )}
      </div>

      {actions.length > 0 && planStatus === "published" && (
        <div className="dash-stage-actions">
          <div className="dash-stage-actions-header">
            <span>Your next steps</span>
            <span className="dash-stage-progress">
              {completedCount}/{actions.length}
            </span>
          </div>
          {actions.map((a) => (
            <div
              key={a.order}
              className={`dash-stage-action dash-stage-action--${a.status}`}
            >
              <span className="dash-stage-action-check">
                {a.status === "completed" ? "✓" : a.status === "in_progress" ? "●" : "○"}
              </span>
              <span className="dash-stage-action-title">{a.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
