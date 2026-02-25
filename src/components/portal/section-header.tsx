import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  count?: string;
  linkHref?: string;
  linkLabel?: string;
}

export default function SectionHeader({
  title,
  count,
  linkHref,
  linkLabel = "Browse all",
}: SectionHeaderProps) {
  return (
    <div className="dash-section-head">
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
        <span className="dash-section-title">{title}</span>
        {count && <span className="dash-section-count">{count}</span>}
      </div>
      {linkHref && (
        <Link href={linkHref} className="dash-section-link">
          {linkLabel}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      )}
    </div>
  );
}
