import Link from "next/link";

export default function DashboardAssessmentCTA() {
  return (
    <Link href="/assessment" className="dash-asmt-cta rv rv-d1">
      <div className="dash-asmt-cta-icon">
        <svg viewBox="0 0 120 48" fill="none" stroke="currentColor" strokeWidth={0.75} width={150} height={60}>
          {/* Doc 1 */}
          <rect x="2" y="6" width="28" height="36" rx="1.5" />
          <line x1="7" y1="14" x2="25" y2="14" />
          <line x1="7" y1="19" x2="25" y2="19" />
          <line x1="7" y1="24" x2="20" y2="24" />
          {/* Arrow 1→2 */}
          <line x1="33" y1="24" x2="42" y2="24" />
          <polyline points="39 21 42 24 39 27" />
          {/* Doc 2 */}
          <rect x="46" y="6" width="28" height="36" rx="1.5" />
          <line x1="51" y1="14" x2="69" y2="14" />
          <line x1="51" y1="19" x2="69" y2="19" />
          <line x1="51" y1="24" x2="64" y2="24" />
          {/* Arrow 2→3 */}
          <line x1="77" y1="24" x2="86" y2="24" />
          <polyline points="83 21 86 24 83 27" />
          {/* Doc 3 with check */}
          <rect x="90" y="6" width="28" height="36" rx="1.5" />
          <path d="M99 23l3.5 3.5L110 19" strokeWidth={1.2} />
        </svg>
      </div>
      <div className="dash-asmt-cta-content">
        <div className="dash-asmt-cta-label">Creative Identity</div>
        <h2 className="dash-asmt-cta-title">Define your Creative Identity. Personalize your roadmap.</h2>
        <p className="dash-asmt-cta-desc">
          A 10-minute guided flow capturing your discipline, creative mode,
          stage, and ambitions. Tunes every recommendation across the platform —
          roadmap, deal evaluations, and advisor guidance.
        </p>
        <div className="dash-asmt-cta-footer">
          <span className="dash-asmt-cta-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            ~10 minutes
          </span>
          <span className="dash-asmt-cta-btn">
            Build Creative Identity
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12} className="dash-asmt-cta-arrow">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
