"use client";

import { useState } from "react";
import Link from "next/link";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Thesis", value: "thesis" },
  { label: "Deal Structures", value: "deal-structures" },
];

export interface ArticleCard {
  slug: string;
  category: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  image?: string;
}

function formatDateShort(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
}

export default function ArticlesFilter({
  articles,
}: {
  articles: ArticleCard[];
}) {
  const PAGE_SIZE = 12;
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredArticles =
    activeFilter === "all"
      ? articles
      : articles.filter((a) => a.category === activeFilter);

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  function handleFilterChange(value: string) {
    setActiveFilter(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      {/* FILTER */}
      <section className="filter">
        <div className="filter-bar rv vis">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-tab${activeFilter === f.value ? " active" : ""}`}
              data-filter={f.value}
              onClick={() => handleFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ARTICLE CARDS */}
      <section className="art-section">
        <div className="art-grid">
          {visibleArticles.map((article, i) => (
            <Link
              href={`/articles/${article.slug}`}
              className={`art-card rv vis${i % 2 === 1 ? " rv-d2" : ""}`}
              key={article.slug}
              data-category={article.category}
            >
              <div className="art-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.image || ""} alt="" />
              </div>
              <div className="art-card-body">
                <div className="art-card-meta">
                  <span className="art-card-tag">{article.tag}</span>
                  <span className="art-card-dot"></span>
                  <span className="art-card-date">
                    {formatDateShort(article.date)}
                  </span>
                </div>
                <h3 className="art-card-title">{article.title}</h3>
                <p className="art-card-excerpt">{article.excerpt}</p>
                <span className="art-card-read">Read Article &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="art-more rv">
          <button className="btn" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Load More Articles
            <span className="btn-arrow">
              <svg viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2L6 10M6 10L2 6M6 10L10 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2L6 10M6 10L2 6M6 10L10 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
      )}
    </>
  );
}
