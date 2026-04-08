import Link from "next/link";
import { ReactNode } from "react";
import { resolveStructureSlug } from "@/lib/structure-slugs";

interface CbRelatedProps {
  children: ReactNode;
}

export function CbRelated({ children }: CbRelatedProps) {
  return (
    <div className="cb-grid is-related">
      <h2 className="cb-related-title">Related</h2>
      <div className="cb-related">{children}</div>
    </div>
  );
}

interface CbRelatedCardProps {
  num?: string;
  label?: string;
  title: string;
  desc: string;
  href?: string;
}

export function CbRelatedCard({ num, label, title, desc, href }: CbRelatedCardProps) {
  let displayLabel = label;
  if (!displayLabel && num) {
    displayLabel = `Structure #${num}`;
  }

  // Auto-resolve href from structure number when num is present
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

  const content = (
    <>
      {displayLabel && <div className="cb-rel-num">{displayLabel}</div>}
      <div className="cb-rel-title">{title}</div>
      <div className="cb-rel-desc">{desc}</div>
    </>
  );

  if (resolvedHref) {
    return (
      <Link href={resolvedHref} className="cb-rel-card">
        {content}
      </Link>
    );
  }

  return <div className="cb-rel-card">{content}</div>;
}
