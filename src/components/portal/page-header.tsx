import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  count?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({
  title,
  description,
  count,
  backHref,
  backLabel = "Back",
}: PageHeaderProps) {
  return (
    <div className="page-header rv vis">
      {backHref && (
        <div className="page-back">
          <Link href={backHref}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {backLabel}
          </Link>
        </div>
      )}
      {count && <div className="page-count">{count}</div>}
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-desc">{description}</p>}
    </div>
  );
}
