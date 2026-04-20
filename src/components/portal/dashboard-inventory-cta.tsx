import Link from "next/link";

interface DashboardInventoryCTAProps {
  assetCount?: number;
  summary?: {
    estimated_total_value_range: string;
    leverage_score: string;
  } | null;
}

export default function DashboardInventoryCTA({
  assetCount = 0,
  summary = null,
}: DashboardInventoryCTAProps) {
  // Has analysis — show metric card
  if (assetCount > 0 && summary) {
    return (
      <div className="dash-tool-section rv rv-d1">
        <div className="dash-tool-title">Asset Inventory</div>
        <div className="inv-summary-card">
          <div className="inv-summary-metrics">
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value">{assetCount}</span>
              <span className="inv-summary-metric-label">Assets Cataloged</span>
            </div>
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value">{summary.estimated_total_value_range}</span>
              <span className="inv-summary-metric-label">Estimated Value</span>
            </div>
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value">{summary.leverage_score.charAt(0).toUpperCase() + summary.leverage_score.slice(1)}</span>
              <span className="inv-summary-metric-label">Leverage Score</span>
            </div>
          </div>
          <div className="dash-tool-actions">
            <Link href="/inventory" className="btn btn--filled">
              View Inventory
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
            <Link href="/inventory" className="btn">Add More Assets</Link>
          </div>
        </div>
      </div>
    );
  }

  // Has assets but no analysis
  if (assetCount > 0) {
    return (
      <div className="dash-tool-section rv rv-d1">
        <div className="dash-tool-title">Asset Inventory</div>
        <div className="inv-summary-card">
          <div className="inv-summary-metrics">
            <div className="inv-summary-metric">
              <span className="inv-summary-metric-value">{assetCount}</span>
              <span className="inv-summary-metric-label">Assets Cataloged</span>
            </div>
          </div>
          <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--mid)", margin: "16px 0 0" }}>
            Run an AI analysis to get valuations, leverage scenarios, and a strategic roadmap.
          </p>
          <div className="dash-tool-actions">
            <Link href="/inventory" className="btn btn--filled">
              Analyze Portfolio
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
            <Link href="/inventory" className="btn">Add More Assets</Link>
          </div>
        </div>
      </div>
    );
  }

  // No assets — CTA
  return (
    <div className="dash-tool-section rv rv-d1">
      <div className="dash-tool-title">Asset Inventory</div>
      <Link href="/inventory" className="dash-asmt-cta">
        <div className="dash-asmt-cta-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={0.75} width={120} height={120}>
            <path d="M24 6l18 10v16L24 42 6 32V16z" />
            <path d="M6 16l18 10 18-10" />
            <line x1="24" y1="26" x2="24" y2="42" />
            <path d="M15 11l18 10" opacity="0.3" />
          </svg>
        </div>
        <div className="dash-asmt-cta-content">
          <h2 className="dash-asmt-cta-title">Audit your unmonetized assets</h2>
          <p className="dash-asmt-cta-desc">
            Catalog what you&apos;ve created, judgment you&apos;ve given away, and
            relationships you haven&apos;t priced. Get AI-powered valuations and a
            leverage roadmap.
          </p>
          <div className="dash-asmt-cta-footer">
            <span className="dash-asmt-cta-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              ~3 mins
            </span>
            <span className="dash-asmt-cta-btn">
              Start Inventory
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
