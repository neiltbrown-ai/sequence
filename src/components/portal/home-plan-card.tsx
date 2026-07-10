import Link from "next/link";
import type { ActionStatus } from "@/types/assessment";

/**
 * Home "Your next move" card — Phase 1d (strategy §11 "One move above the
 * fold, three on the tab").
 *
 * Renders on the full-access dashboard when the member has a published
 * strategic plan. Leads with the single current move (first action not yet
 * completed), one line of why, an inline dot+mono status, exactly one
 * primary action pill (Continue this move → /roadmap) and a mono text-link
 * to the Advisor. Right column: compact vertical 3-step move map
 * (done / current / next). Recomposes existing patterns: dash-card shell,
 * dash-card-lbl mono label, btn--filled pill.
 *
 * When this renders, the dashboard hides DashboardRoadmapCTA (it would
 * duplicate this card).
 */

export interface HomePlanAction {
  order: 1 | 2 | 3;
  title: string;
  why: string;
}

interface HomePlanCardProps {
  actions: HomePlanAction[];
  /** Live statuses keyed by action_order (from assessment_actions). */
  statuses: Partial<Record<1 | 2 | 3, ActionStatus>>;
}

/** First sentence of the `why` copy — the card carries one line, /roadmap carries the depth. */
function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

export default function HomePlanCard({ actions, statuses }: HomePlanCardProps) {
  const ordered = [...actions].sort((a, b) => a.order - b.order);
  const statusOf = (order: 1 | 2 | 3): ActionStatus => statuses[order] ?? "pending";
  // Completed and skipped moves are behind the member; the current move is
  // the first one still in play.
  const isDone = (s: ActionStatus) => s === "completed" || s === "skipped";
  const current = ordered.find((a) => !isDone(statusOf(a.order)));

  /* ── All three complete → refresh state ── */
  if (!current) {
    return (
      <div className="dash-section rv rv-d1">
        <div className="dash-card home-plan-card home-plan-card--done">
          <div className="home-plan-main">
            <div className="home-plan-kicker">
              <span className="dash-card-lbl">Your next move</span>
              <span className="home-plan-count">3 of 3 complete</span>
            </div>
            <h2 className="home-plan-title">All three moves are done.</h2>
            <p className="home-plan-why">
              Refresh your plan and it rebuilds around what you&apos;ve completed —
              your next three moves pick up from here.
            </p>
            <div className="home-plan-status">
              <span className="home-plan-dot home-plan-dot--done" aria-hidden />
              Complete
            </div>
            <div className="home-plan-actions">
              <Link href="/roadmap" className="btn btn--filled">
                Refresh your plan &rarr;
              </Link>
            </div>
          </div>
          <MoveMap ordered={ordered} statusOf={statusOf} currentOrder={null} />
        </div>
      </div>
    );
  }

  const status = statusOf(current.order);
  const inMotion = status === "in_progress";

  return (
    <div className="dash-section rv rv-d1">
      <div className="dash-card home-plan-card">
        <div className="home-plan-main">
          <div className="home-plan-kicker">
            <span className="dash-card-lbl">Your next move</span>
            <span className="home-plan-count">Move {current.order} of 3</span>
          </div>
          <h2 className="home-plan-title">{current.title}</h2>
          <p className="home-plan-why">{firstSentence(current.why)}</p>
          <div className="home-plan-status">
            <span
              className={`home-plan-dot ${inMotion ? "home-plan-dot--active" : "home-plan-dot--next"}`}
              aria-hidden
            />
            {inMotion ? "In motion" : "Up next"}
          </div>
          <div className="home-plan-actions">
            <Link href="/roadmap" className="btn btn--filled">
              Continue this move &rarr;
            </Link>
            <Link
              href={`/advisor?prompt=${encodeURIComponent(
                `Help me with Step ${current.order}: ${current.title}`
              )}`}
              className="home-plan-advisor-link"
            >
              Work on it with the Advisor
            </Link>
          </div>
        </div>
        <MoveMap ordered={ordered} statusOf={statusOf} currentOrder={current.order} />
      </div>
    </div>
  );
}

/* ── Compact vertical 3-step move map ──
   done   → filled node + strikethrough label
   current→ ring node + bold label
   next   → empty node + faint label */
function MoveMap({
  ordered,
  statusOf,
  currentOrder,
}: {
  ordered: HomePlanAction[];
  statusOf: (order: 1 | 2 | 3) => ActionStatus;
  currentOrder: 1 | 2 | 3 | null;
}) {
  return (
    <div className="home-plan-map" aria-label="Move map">
      {ordered.map((a) => {
        const s = statusOf(a.order);
        const done = s === "completed" || s === "skipped";
        const isCurrent = currentOrder === a.order;
        const state = done ? "done" : isCurrent ? "current" : "next";
        return (
          <div key={a.order} className={`home-plan-map-row home-plan-map-row--${state}`}>
            <span className="home-plan-map-node" aria-hidden />
            <span className="home-plan-map-label">{a.title}</span>
          </div>
        );
      })}
    </div>
  );
}
