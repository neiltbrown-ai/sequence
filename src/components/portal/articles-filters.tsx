"use client";

import { useState } from "react";
import Link from "next/link";
import FilterBar from "./filter-bar";
import type { ArticleMeta } from "@/lib/content";

interface ArticlesFiltersProps {
  articles: ArticleMeta[];
  categories: string[];
}

export default function ArticlesFilters({
  articles,
  categories,
}: ArticlesFiltersProps) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { label: `All (${articles.length})`, value: "all" },
    ...categories.map((c) => ({
      label: `${c} (${articles.filter((a) => a.category === c).length})`,
      value: c,
    })),
  ];

  const filtered =
    activeTab === "all"
      ? articles
      : articles.filter((a) => a.category === activeTab);

  // First 2 articles as featured cards
  const featured = filtered.slice(0, 2);
  const rest = filtered;

  return (
    <>
      <FilterBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Featured Articles */}
      {featured.length > 0 && (
        <div className="ap-featured rv vis rv-d1">
          {featured.map((a) => (
            <Link
              key={a.slug}
              href={`/library/articles/${a.slug}`}
              className="ap-feat-card"
            >
              {a.access === "member" && (
                <span className="ap-early">Early Access</span>
              )}
              <div className="ap-feat-meta">
                {a.category} <span className="article-row-dot" /> {a.readTime} min
                read
              </div>
              <div className="ap-feat-title">{a.title}</div>
              <div className="ap-feat-excerpt">{a.excerpt}</div>
              <div className="ap-feat-date">
                {new Date(a.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Article List */}
      <div className="article-list rv vis rv-d2">
        {rest.map((a) => (
          <Link
            key={a.slug}
            href={`/library/articles/${a.slug}`}
            className="article-row"
          >
            <div>
              <div className="article-row-meta">
                {a.access === "member" && (
                  <span className="ap-early">Early Access</span>
                )}
                {a.category} <span className="article-row-dot" /> {a.readTime} min
                read
              </div>
              <div className="article-row-title">{a.title}</div>
              <div className="article-row-excerpt">{a.excerpt}</div>
            </div>
            <div className="article-row-date">
              {new Date(a.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
