"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

/**
 * Rewrite public content URLs to portal equivalents when the case study
 * is being viewed inside the portal (`/library/...`). Many MDX files
 * were authored with public URLs (`/case-studies/foo`, `/structures/bar`)
 * for related cards — those links kicked logged-in members out of the
 * portal to the public view. This rewrite keeps navigation in-portal
 * without touching 70+ MDX files.
 */
function contextualHref(href: string, inPortal: boolean): string {
  if (!inPortal) return href;
  if (href.startsWith("/case-studies/")) {
    return href.replace("/case-studies/", "/library/case-studies/");
  }
  if (href.startsWith("/articles/")) {
    return href.replace("/articles/", "/library/articles/");
  }
  if (href.startsWith("/structures/")) {
    return href.replace("/structures/", "/library/structures/");
  }
  return href;
}

export function CbRelatedCard({ num, label, title, desc, href }: CbRelatedCardProps) {
  const pathname = usePathname() || "";
  const inPortal = pathname.startsWith("/library/");

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

  // If we ended up with a non-num href (case study or article), rewrite
  // it to the portal path when we're inside the portal
  if (resolvedHref && !num) {
    resolvedHref = contextualHref(resolvedHref, inPortal);
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
