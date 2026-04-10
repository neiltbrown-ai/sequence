import Link from "next/link";
import { ReactNode } from "react";

interface CaseStudyHeaderProps {
  number: number;
  discipline: string;
  readTime?: string;
  title: string;
  subtitle?: string;
  heroImage?: string;
  heroAlt?: string;
  heroPosition?: string;
  heroCredit?: string;
  stats?: Array<{ value: string; label: string }>;
  backHref?: string;
  backLabel?: string;
  saveButton?: ReactNode;
}

export default function CaseStudyHeader({
  number,
  discipline,
  readTime,
  title,
  subtitle,
  heroImage,
  heroAlt,
  heroPosition,
  heroCredit,
  stats,
  backHref = "/case-studies",
  backLabel = "All Case Studies",
  saveButton,
}: CaseStudyHeaderProps) {
  const caseNum = String(number).padStart(2, "0");

  return (
    <>
      <section className="cs-header">
        {/* Back link */}
        <div className="cs-back rv">
          <Link href={backHref}>
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M10 6H2M2 6L6 2M2 6L6 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{" "}
            {backLabel}
          </Link>
        </div>

        {/* Meta row — single row on desktop, stacked on mobile (via CSS) */}
        <div className="cs-header-meta rv rv-d1">
          <div className="cs-header-meta-grid">
            <div className="cs-header-meta-inner">
              <span className="cs-header-tag">[Case {caseNum}]</span>
              <span className="cs-header-dot" />
              <span className="cs-header-cat">{discipline}</span>
              {readTime && (
                <>
                  <span className="cs-header-dot" />
                  <span className="cs-header-cat">{readTime} Min Read</span>
                </>
              )}
            </div>
            {saveButton}
          </div>
        </div>

        {/* Title — supports <br> via dangerouslySetInnerHTML */}
        <div className="cs-header-title anim-text-up">
          <div className="cs-header-title-grid">
            <h1 dangerouslySetInnerHTML={{ __html: title }} />
          </div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="cs-header-sub rv rv-d2">
            <div className="cs-header-sub-grid">
              <p>{subtitle}</p>
            </div>
          </div>
        )}

        {/* Hero image */}
        {heroImage && (
          <div className="cs-hero anim-reveal-down">
            <div className="cs-hero-grid">
              <div className="cs-hero-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="cs-hero-img"
                  src={heroImage}
                  alt={heroAlt || title.replace(/<[^>]+>/g, "")}
                  style={heroPosition ? { objectPosition: heroPosition } : undefined}
                />
              </div>
              {heroCredit && (
                <div className="cs-hero-credit">{heroCredit}</div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Stats bar — separate section for reveal animation */}
      {stats && stats.length > 0 && (
        <section className="cs-stats rv rv-d4">
          <div className="cs-stats-inner">
            {stats.map((s) => (
              <div key={s.label} className="cs-stat">
                <span className="cs-stat-val">{s.value}</span>
                <span className="cs-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
