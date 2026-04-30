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
  leverageRationale?: string;
  drivers?: ValueDriver[];
};

/**
 * Extract a single-word leverage class from either a clean "high" /
 * "medium" / "low" string OR a legacy full-sentence string like
 * "High — catalog is the primary asset...". Newer analyses store one
 * word in leverage_score and the explanation separately in
 * leverage_rationale; older analyses used to put it all in one field.
 */
function parseLeverage(raw: string): {
  word: "High" | "Medium" | "Low" | "Unknown";
  className: string;
} {
  const lower = raw.toLowerCase();
  // Match the first occurrence of high / medium / low as a whole word.
  const m = lower.match(/\b(high|medium|low)\b/);
  if (!m) return { word: "Unknown", className: "dash-leverage--medium" };
  const w = m[1];
  return {
    word: (w.charAt(0).toUpperCase() + w.slice(1)) as "High" | "Medium" | "Low",
    className: `dash-leverage--${w}`,
  };
}

/**
 * If the legacy leverage_score field contains "High — explanation here",
 * extract just the explanation portion to use as a rationale fallback
 * when leverage_rationale isn't set on the row.
 */
function extractLegacyRationale(raw: string): string | null {
  // Patterns: "High — text", "High - text", "High. Text"
  const m = raw.match(/^(?:high|medium|low)\s*[—\-:.]+\s*(.+)$/i);
  return m ? m[1].trim() : null;
}

export function DashValuationCard({
  valuationRange,
  leverageScore,
  leverageRationale,
  drivers,
}: ValuationProps) {
  const { word: leverageLabel, className: leverageClass } = parseLeverage(leverageScore);
  // Prefer the explicit rationale; fall back to legacy single-field parsing
  // so existing analyses still show rationale text under the score.
  const rationale = leverageRationale ?? extractLegacyRationale(leverageScore);

  return (
    <div className="dash-card dash-val-card">
      {/* Header row: section label + "Add Assets" pill on right.
          Pill stays outside the body link so it can navigate to its
          own action without the main card link intercepting clicks. */}
      <div className="dash-card-head">
        <span className="dash-card-lbl">Valuation Range</span>
        <Link href="/inventory" className="dash-card-pill">
          + Add Assets
        </Link>
      </div>

      <Link href="/inventory" className="dash-card-body-link">
        {/* Hero — valuation range left, leverage score right, divider between */}
        <div className="dash-val-hero">
          <div className="dash-val-hero-left">
            <div className="dash-val-range">{valuationRange}</div>
            <div className="dash-val-range-sub">Estimated value</div>
          </div>
          <div className="dash-val-hero-divider" aria-hidden />
          <div className="dash-val-hero-right">
            <span className={`dash-leverage-val ${leverageClass}`}>
              {leverageLabel}
            </span>
            <div className="dash-val-range-sub">Leverage score</div>
            {rationale && (
              <p className="dash-leverage-rationale">{rationale}</p>
            )}
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
              {/* Axis runs only under the bar column. The outer grid
                  matches the driver row (name | bar | score), with the
                  inner flex distributing the three labels across the
                  bar's full width. */}
              <div className="dash-drivers-axis" aria-hidden>
                <span className="dash-drivers-axis-track">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </span>
              </div>
            </div>
          </>
        )}
      </Link>
    </div>
  );
}

/* ── Risk Flags ─────────────────────────────────────────────────── */

type RiskFlagsProps = {
  risks: PortfolioRisk[];
};

export function DashRiskFlagsCard({ risks }: RiskFlagsProps) {
  return (
    <div className="dash-card dash-risk-card">
      <div className="dash-card-head">
        <span className="dash-card-lbl">Risk Flags</span>
      </div>
      <Link href="/inventory" className="dash-card-body-link">
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
    </div>
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
    <div className="dash-card dash-deals-card">
      <div className="dash-card-head">
        <span className="dash-card-lbl">Deals Evaluated</span>
        <Link href="/evaluate" className="dash-card-pill">
          + New Evaluation
        </Link>
      </div>
      <Link href="/evaluate" className="dash-card-body-link">
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
    </div>
  );
}
