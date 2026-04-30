/**
 * Dashboard portfolio-state cards.
 *
 * Three cards that surface portfolio-level state on the dashboard
 * without requiring the member to drill into Inventory or Evaluator:
 *
 *   - DashValuationCard       — valuation range + leverage score + 5
 *                               drivers of value (horizontal bars)
 *   - DashRiskFlagsCard       — top 5 portfolio risks with severity icons
 *   - DashDealsEvaluatedCard  — last 5 deals as a list with signal + score
 *
 * All three are read-only summaries. They link out to their full
 * surfaces (/inventory, /evaluate) for the detail.
 */

import Link from "next/link";
import type {
  ValueDriver,
  PortfolioRisk,
  RiskSeverity,
} from "@/types/inventory";
import type { SignalColor } from "@/types/evaluator";

/* ── Valuation + Drivers of Value ───────────────────────────────── */

type ValuationProps = {
  valuationRange: string;
  leverageScore: string;
  drivers?: ValueDriver[];
};

export function DashValuationCard({
  valuationRange,
  leverageScore,
  drivers,
}: ValuationProps) {
  const leverageLabel = leverageScore.charAt(0).toUpperCase() + leverageScore.slice(1).toLowerCase();
  const leverageClass =
    leverageScore.toLowerCase() === "high"
      ? "dash-leverage--high"
      : leverageScore.toLowerCase() === "low"
        ? "dash-leverage--low"
        : "dash-leverage--medium";

  return (
    <Link href="/inventory" className="dash-card dash-val-card">
      {/* Hero — valuation range left, leverage score right, divider between */}
      <div className="dash-val-hero">
        <div className="dash-val-hero-left">
          <span className="dash-card-lbl">Valuation Range</span>
          <div className="dash-val-range">{valuationRange}</div>
          <div className="dash-val-range-sub">Estimated value</div>
        </div>
        <div className="dash-val-hero-divider" aria-hidden />
        <div className="dash-val-hero-right">
          <span className={`dash-leverage-val ${leverageClass}`}>
            {leverageLabel}
          </span>
          <div className="dash-val-range-sub">Leverage score</div>
        </div>
      </div>

      {drivers && drivers.length > 0 && (
        <>
          <div className="dash-card-rule" aria-hidden />

          <div className="dash-drivers">
            <span className="dash-card-lbl">Drivers of Value</span>
            <ul className="dash-drivers-list">
              {drivers.map((d) => {
                const pct = Math.max(0, Math.min(100, d.pct));
                const scoreLabel =
                  d.score.charAt(0).toUpperCase() + d.score.slice(1);
                return (
                  <li key={d.name} className="dash-driver-row">
                    <span className="dash-driver-name">{d.name}</span>
                    <div className="dash-driver-bar" aria-label={`${d.name}: ${scoreLabel}`}>
                      <div
                        className="dash-driver-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="dash-driver-score">{scoreLabel}</span>
                  </li>
                );
              })}
            </ul>
            <div className="dash-drivers-axis" aria-hidden>
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}

/* ── Risk Flags ─────────────────────────────────────────────────── */

type RiskFlagsProps = {
  risks: PortfolioRisk[];
};

export function DashRiskFlagsCard({ risks }: RiskFlagsProps) {
  return (
    <Link href="/inventory" className="dash-card dash-risk-card">
      <span className="dash-card-lbl">Risk Flags</span>
      <ul className="dash-risk-list">
        {risks.slice(0, 5).map((r, i) => (
          <li key={`${r.name}-${i}`} className="dash-risk-row">
            <span
              className={`dash-risk-icon dash-risk-icon--${r.severity}`}
              aria-hidden
            >
              <RiskIcon severity={r.severity} />
            </span>
            <span className="dash-risk-name">{r.name}</span>
            <span className={`dash-risk-severity dash-risk-severity--${r.severity}`}>
              {r.severity.charAt(0).toUpperCase() + r.severity.slice(1)}
            </span>
          </li>
        ))}
      </ul>
    </Link>
  );
}

function RiskIcon({ severity }: { severity: RiskSeverity }) {
  // Solid filled circle for high, hollow ring for medium/low — both with
  // a `!` glyph in the center. Color set via parent class.
  if (severity === "high") {
    return (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <path d="M12 6v7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.9" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1" />
      <path d="M12 6v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.85" fill="currentColor" />
    </svg>
  );
}

/* ── Deals Evaluated (last 5) ───────────────────────────────────── */

export type RecentDealRow = {
  id: string;
  deal_name: string | null;
  deal_type: string | null;
  overall_signal: SignalColor | null;
  overall_score: number | null;
  completed_at: string | null;
};

type DealsProps = {
  deals: RecentDealRow[];
};

export function DashDealsEvaluatedCard({ deals }: DealsProps) {
  if (!deals || deals.length === 0) return null;
  return (
    <Link href="/evaluate" className="dash-card dash-deals-card">
      <span className="dash-card-lbl">Deals Evaluated</span>
      <ul className="dash-deals-list">
        {deals.slice(0, 5).map((d) => (
          <li key={d.id} className="dash-deal-row">
            <span
              className={`dash-deal-signal dash-deal-signal--${d.overall_signal ?? "unknown"}`}
              aria-label={`Signal: ${d.overall_signal ?? "unknown"}`}
            />
            <span className="dash-deal-name">
              {d.deal_name || "Untitled deal"}
            </span>
            <span className="dash-deal-meta">
              {d.deal_type && (
                <span className="dash-deal-type">{d.deal_type}</span>
              )}
              {d.overall_score != null && (
                <span className="dash-deal-score">
                  {Number(d.overall_score).toFixed(1)}/10
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="dash-deals-foot">
        <span>View all deals</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={12} height={12}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}
