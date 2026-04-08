"use client";

import { useState } from "react";
import Link from "next/link";
import FilterBar from "./filter-bar";
import type { CaseStudyMeta } from "@/lib/content";

const stripBr = (s: string) => s.replace(/<br\s*\/?>/gi, " ");

interface CaseStudiesFiltersProps {
  studies: CaseStudyMeta[];
  industries: string[];
}

export default function CaseStudiesFilters({
  studies,
  industries,
}: CaseStudiesFiltersProps) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { label: `All (${studies.length})`, value: "all" },
    ...industries.map((d) => ({
      label: `${d} (${studies.filter((s) => s.industry === d).length})`,
      value: d,
    })),
  ];

  const filtered =
    activeTab === "all"
      ? studies
      : studies.filter((s) => s.industry === activeTab);

  // 3 featured: first is large hero, next 2 are medium cards
  const featuredMain = filtered[0];
  const featuredSub = filtered.slice(1, 3);
  const rest = filtered.slice(3);

  return (
    <>
      <FilterBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Featured: 1 large hero */}
      {featuredMain && (
        <Link
          href={`/library/case-studies/${featuredMain.slug}`}
          className="cs-featured rv vis rv-d2"
        >
          {featuredMain.coverImage && (
            <img
              className="cs-featured-img"
              src={featuredMain.coverImage}
              alt={stripBr(featuredMain.title)}
            />
          )}
          {!featuredMain.coverImage && (
            <div
              className="cs-featured-img"
              style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #555 100%)" }}
            />
          )}
          <div className="cs-featured-overlay" />
          <div className="cs-featured-content">
            <div className="cs-featured-label">
              {featuredMain.discipline}
            </div>
            <div className="cs-featured-name">{stripBr(featuredMain.title)}</div>
            <div className="cs-featured-desc">{featuredMain.excerpt}</div>
            <div className="cs-featured-tags">
              {featuredMain.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="cs-featured-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      )}

      {/* Featured: 2 medium cards below */}
      {featuredSub.length > 0 && (
        <div className="cs-featured-sub-grid">
          {featuredSub.map((s, i) => (
            <Link
              key={s.slug}
              href={`/library/case-studies/${s.slug}`}
              className={`cs-featured-sub rv vis rv-d${i + 3}`}
            >
              {s.coverImage && (
                <img
                  className="cs-featured-sub-img"
                  src={s.coverImage}
                  alt={stripBr(s.title)}
                />
              )}
              {!s.coverImage && (
                <div
                  className="cs-featured-sub-img"
                  style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #555 100%)" }}
                />
              )}
              <div className="cs-featured-sub-overlay" />
              <div className="cs-featured-sub-content">
                <div className="cs-featured-sub-label">{s.discipline}</div>
                <div className="cs-featured-sub-name">{stripBr(s.title)}</div>
                <div className="cs-featured-sub-desc">{s.excerpt}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Case Study Grid */}
      <div className="ptl-case-grid">
        {rest.map((s, i) => (
          <Link
            key={s.slug}
            href={`/library/case-studies/${s.slug}`}
            className={`ptl-case-card rv vis rv-d${Math.min(i + 1, 6)}`}
          >
            <div className="ptl-case-card-name">{stripBr(s.title)}</div>
            <div className="ptl-case-card-desc">{s.excerpt}</div>
            <div className="ptl-case-card-meta">
              {s.discipline}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
