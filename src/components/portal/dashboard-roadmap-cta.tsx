import Link from "next/link";
import type { PlanSource, StageNumber } from "@/types/assessment";

interface DashboardRoadmapCTAProps {
  /** null = user has no plan yet */
  status?: "generating" | "draft" | "review" | "published" | null;
  stage?: StageNumber | null;
  stageName?: string | null;
  source?: PlanSource | null;
  actionsCompleted?: number;
  actionsTotal?: number;
}

const SOURCE_LABEL: Record<PlanSource, string> = {
  assessment: "Built from your Creative Identity",
  portfolio: "Built from your Portfolio audit",
  combined: "Built from your Creative Identity + Portfolio",
};

/**
 * Dashboard Roadmap CTA — surfaces once the user has a strategic plan.
 *
 * States:
 *   - null/undefined status → render nothing (covered by Portfolio CTA
 *     instead; prompting a roadmap with zero inputs is useless)
 *   - "generating" → "Your roadmap is generating..." with link
 *   - "published" → compact summary card: stage + source + action progress
 *   - draft/review → "Your roadmap is pending review"
 */
export default function DashboardRoadmapCTA({
  status,
  stage,
  stageName,
  source,
  actionsCompleted = 0,
  actionsTotal = 3,
}: DashboardRoadmapCTAProps) {
  if (!status) return null;

  if (status === "generating") {
    return (
      <div className="dash-tool-section rv rv-d1">
        <div className="dash-tool-title">Strategic Roadmap</div>
        <div className="inv-summary-card">
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 14,
              color: "var(--mid)",
              margin: "0 0 16px",
            }}
          >
            Your roadmap is being generated. It&apos;ll be ready in under a
            minute.
          </p>
          <div className="dash-tool-actions">
            <Link href="/roadmap" className="btn btn--filled">
              View Roadmap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "draft" || status === "review") {
    return (
      <div className="dash-tool-section rv rv-d1">
        <div className="dash-tool-title">Strategic Roadmap</div>
        <div className="inv-summary-card">
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 14,
              color: "var(--mid)",
              margin: "0 0 16px",
            }}
          >
            Your roadmap is pending review.
          </p>
          <div className="dash-tool-actions">
            <Link href="/roadmap" className="btn btn--filled">
              View Roadmap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Published — show the summary card
  return (
    <div className="dash-tool-section rv rv-d1">
      <div className="dash-tool-title">Strategic Roadmap</div>
      <div className="inv-summary-card">
        <div className="inv-summary-metrics">
          {stage && (
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value">Stage {stage}</span>
              <span className="inv-summary-metric-label">
                {stageName || "Current position"}
              </span>
            </div>
          )}
          <div className="inv-summary-metric">
            <span className="inv-summary-metric-value">
              {actionsCompleted}/{actionsTotal}
            </span>
            <span className="inv-summary-metric-label">Actions completed</span>
          </div>
          {source && (
            <div className="inv-summary-metric">
              <span
                className="inv-summary-metric-value"
                style={{ fontSize: 14, fontFamily: "var(--sans)", fontWeight: 500 }}
              >
                {source === "combined"
                  ? "CI + Portfolio"
                  : source === "portfolio"
                    ? "Portfolio"
                    : "Creative Identity"}
              </span>
              <span className="inv-summary-metric-label">Source</span>
            </div>
          )}
        </div>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: 13,
            color: "var(--light)",
            margin: "12px 0 0",
          }}
        >
          {source ? SOURCE_LABEL[source] : ""}
        </p>
        <div className="dash-tool-actions">
          <Link href="/roadmap" className="btn btn--filled">
            View Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
