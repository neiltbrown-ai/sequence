import Link from "next/link";
import { ReactNode } from "react";

interface SbRelatedProps {
  children: ReactNode;
}

export function SbRelated({ children }: SbRelatedProps) {
  return (
    <div className="sb-grid is-related">
      <div className="sb-related">{children}</div>
    </div>
  );
}

interface SbRelatedCardProps {
  num?: string;
  title: string;
  desc: string;
  href?: string;
}

export function SbRelatedCard({ num, title, desc, href }: SbRelatedCardProps) {
  const content = (
    <div className="sb-rel-text">
      {num && <div className="sb-rel-num">Structure #{num}</div>}
      <div className="sb-rel-title">{title}</div>
      <div className="sb-rel-desc">{desc}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="sb-rel-card">
        {content}
      </Link>
    );
  }

  return <div className="sb-rel-card">{content}</div>;
}
