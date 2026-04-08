import Link from "next/link";
import { resolveStructureSlug } from "@/lib/structure-slugs";

interface CbStructureBadgeProps {
  num: string;
  href?: string;
  inline?: boolean;
}

export function CbStructureBadge({
  num,
  href,
  inline,
}: CbStructureBadgeProps) {
  // Auto-resolve href from structure number if not explicitly provided,
  // or if the provided href looks like a structure link (override bad slugs)
  let resolvedHref = href;
  if (num) {
    const n = parseInt(num, 10);
    if (!isNaN(n)) {
      const slug = resolveStructureSlug(String(n));
      if (slug) {
        resolvedHref = `/library/structures/${slug}`;
      }
    }
  }

  const display = num ? `Structure #${num}` : "Structure";
  const content = (
    <>
      {display}
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 10L10 2M10 2H4M10 2V8" />
      </svg>
    </>
  );

  const badge = resolvedHref ? (
    <Link href={resolvedHref} className="cs-struct-badge">
      {content}
    </Link>
  ) : (
    <span className="cs-struct-badge">{content}</span>
  );

  if (inline) return badge;

  return (
    <div className="cb-grid cs-struct-badge-row">
      {badge}
    </div>
  );
}
