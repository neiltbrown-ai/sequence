import Link from "next/link";
import type { SignalColor } from "@/types/evaluator";

interface EvalSummary {
  count: number;
  medianScore: number | null;
  signals: { green: number; yellow: number; red: number };
  latestName: string | null;
  latestSignal: SignalColor | null;
}

interface DashboardEvalCTAProps {
  evalCount?: number;
  summary?: EvalSummary | null;
}

export default function DashboardEvalCTA({
  evalCount = 0,
  summary = null,
}: DashboardEvalCTAProps) {
  // Has evaluations — show metric card
  if (evalCount > 0 && summary) {
    return (
      <div className="dash-tool-section rv rv-d1">
        <div className="dash-tool-title">Deal Evaluator</div>
        <div className="inv-summary-card">
          <div className="inv-summary-metrics">
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value">{summary.count}</span>
              <span className="inv-summary-metric-label">Deals Evaluated</span>
            </div>
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value">
                {summary.medianScore !== null ? `${summary.medianScore.toFixed(1)} / 10` : "—"}
              </span>
              <span className="inv-summary-metric-label">Median Score</span>
            </div>
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value eval-signal-icons">
                {summary.signals.green > 0 && (
                  <span className="eval-signal-count eval-signal-count--green" title={`${summary.signals.green} deal${summary.signals.green > 1 ? "s" : ""} scored green (strong)`}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1"/><path d="M5 8.5l2 2 4-4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{summary.signals.green}</span>
                  </span>
                )}
                {summary.signals.yellow > 0 && (
                  <span className="eval-signal-count eval-signal-count--yellow" title={`${summary.signals.yellow} deal${summary.signals.yellow > 1 ? "s" : ""} scored yellow (caution)`}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/><path d="M8 6.5v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/></svg>
                    <span>{summary.signals.yellow}</span>
                  </span>
                )}
                {summary.signals.red > 0 && (
                  <span className="eval-signal-count eval-signal-count--red" title={`${summary.signals.red} deal${summary.signals.red > 1 ? "s" : ""} scored red (warning)`}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                    <span>{summary.signals.red}</span>
                  </span>
                )}
              </span>
              <span className="inv-summary-metric-label">Signal Breakdown</span>
            </div>
          </div>
          <div className="dash-tool-actions">
            <Link href="/evaluate" className="btn btn--filled">
              View Evaluations
              <span className="btn-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={10} height={10}>
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={10} height={10}>
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </span>
            </Link>
            <Link href="/evaluate" className="btn">New Evaluation</Link>
          </div>
        </div>
      </div>
    );
  }

  // No evaluations — CTA
  return (
    <div className="dash-tool-section rv rv-d1">
      <div className="dash-tool-title">Deal Evaluator</div>
      <Link href="/evaluate" className="dash-asmt-cta">
        <div className="dash-asmt-cta-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={0.75} width={120} height={120}>
            <rect x="8" y="4" width="32" height="40" rx="2" />
            <line x1="16" y1="16" x2="32" y2="16" />
            <line x1="16" y1="22" x2="32" y2="22" />
            <line x1="16" y1="28" x2="26" y2="28" />
            <path d="M30 32l4 4 8-8" opacity="0.4" />
          </svg>
        </div>
        <div className="dash-asmt-cta-content">
          <h2 className="dash-asmt-cta-title">Score your next deal</h2>
          <p className="dash-asmt-cta-desc">
            Run any offer through a structured evaluation across financial,
            career, partner, structure, risk, and legal dimensions.
          </p>
          <div className="dash-asmt-cta-footer">
            <span className="dash-asmt-cta-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              ~5 minutes
            </span>
            <span className="dash-asmt-cta-btn">
              Start Evaluation
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12} className="dash-asmt-cta-arrow">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
