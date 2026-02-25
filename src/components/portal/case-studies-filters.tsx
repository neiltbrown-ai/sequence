"use client";

import { useState } from "react";
import Link from "next/link";
import FilterBar from "./filter-bar";
import StagePills from "./stage-pills";
import type { CaseStudyMeta } from "@/lib/content";

const STAGES = ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Emerging"];

interface CaseStudiesFiltersProps {
  studies: CaseStudyMeta[];
  disciplines: string[];
}

export default function CaseStudiesFilters({
  studies,
  disciplines,
}: CaseStudiesFiltersProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeStage, setActiveStage] = useState("all");

  const tabs = [
    { label: `All (${studies.length})`, value: "all" },
    ...disciplines.map((d) => ({
      label: `${d} (${studies.filter((s) => s.discipline === d).length})`,
      value: d,
    })),
  ];

  let filtered =
    activeTab === "all"
      ? studies
      : studies.filter((s) => s.discipline === activeTab);

  if (activeStage !== "all") {
    filtered = filtered.filter((s) =>
      s.tags?.some((t) => t.toLowerCase().includes(activeStage.toLowerCase()))
    );
  }

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      <FilterBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <StagePills
        stages={STAGES}
        activeStage={activeStage}
        onStageChange={setActiveStage}
      />

      {/* Featured Case Study */}
      {featured && (
        <Link
          href={`/library/case-studies/${featured.slug}`}
          className="cs-featured rv vis rv-d3"
        >
          <div className="cs-featured-badge">Featured</div>
          {featured.coverImage && (
            <img
              className="cs-featured-img"
              src={featured.coverImage}
              alt={featured.title}
            />
          )}
          {!featured.coverImage && (
            <div
              className="cs-featured-img"
              style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #555 100%)" }}
            />
          )}
          <div className="cs-featured-overlay" />
          <div className="cs-featured-content">
            <div className="cs-featured-label">
              {featured.discipline} <span className="ap-dot" /> Case Study
            </div>
            <div className="cs-featured-name">{featured.title}</div>
            <div className="cs-featured-desc">{featured.excerpt}</div>
            <div className="cs-featured-tags">
              <span className="cs-featured-tag">{featured.discipline}</span>
              {featured.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="cs-featured-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      )}

      {/* Case Study Grid */}
      <div className="case-grid">
        {rest.map((s, i) => (
          <Link
            key={s.slug}
            href={`/library/case-studies/${s.slug}`}
            className={`case-card rv vis rv-d${Math.min(i + 1, 6)}`}
          >
            <div className="case-card-meta">
              {s.discipline} <span className="case-card-dot" /> Case Study
            </div>
            <div className="case-card-name">{s.title}</div>
            <div className="case-card-desc">{s.excerpt}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
