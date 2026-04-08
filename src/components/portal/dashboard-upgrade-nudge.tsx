import Link from "next/link";

function EvalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 15h6" />
      <path d="M9 11h6" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );
}

function InvIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

export default function DashboardUpgradeNudge() {
  return (
    <div className="dash-section rv rv-d1">
      <div className="dash-upgrade-nudge">
        <div className="dash-upgrade-label">Full Access</div>
        <h3 className="dash-upgrade-title">Go deeper with AI tools</h3>
        <p className="dash-upgrade-desc">
          Score deals before you sign. Map your creative career stage. Catalog and value your assets. Full Access adds AI-powered tools to the library.
        </p>
        <div className="dash-upgrade-features">
          <div className="dash-upgrade-feature">
            <EvalIcon />
            <span>Deal Evaluator — Score any offer across 6 dimensions</span>
          </div>
          <div className="dash-upgrade-feature">
            <MapIcon />
            <span>Career Assessment — Map your position, get a strategic roadmap</span>
          </div>
          <div className="dash-upgrade-feature">
            <InvIcon />
            <span>Asset Inventory — Catalog and value your creative IP</span>
          </div>
        </div>
        <div className="dash-upgrade-actions">
          <Link href="/pricing" className="btn btn--filled">
            Learn More
          </Link>
          <Link href="/pricing" className="btn">
            Compare Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
