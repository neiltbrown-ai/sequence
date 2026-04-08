"use client";

import { useState } from "react";
import Link from "next/link";
import FilterBar from "@/components/portal/filter-bar";
import PageHeader from "@/components/portal/page-header";
import SaveButton from "@/components/portal/save-button";

export type SavedItem = {
  contentType: "structure" | "case_study" | "article";
  slug: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  number?: number;
  savedAt: string;
};

type Recommendation = {
  slug: string;
  title: string;
  why: string;
  href: string;
  contentType: "structure" | "case_study" | "article";
};

interface SavedItemsProps {
  items: SavedItem[];
  recommendations: Recommendation[];
}

const TYPE_LABELS: Record<string, string> = {
  structure: "Structure",
  case_study: "Case Study",
  article: "Article",
};

const TAB_MAP: Record<string, string> = {
  structures: "structure",
  "case-studies": "case_study",
  articles: "article",
};

export default function SavedItems({ items, recommendations }: SavedItemsProps) {
  const [savedItems, setSavedItems] = useState(items);
  const [activeTab, setActiveTab] = useState("all");
  const [removing, setRemoving] = useState<string | null>(null);

  const filtered =
    activeTab === "all"
      ? savedItems
      : savedItems.filter((s) => s.contentType === TAB_MAP[activeTab]);

  const counts = {
    all: savedItems.length,
    structures: savedItems.filter((s) => s.contentType === "structure").length,
    "case-studies": savedItems.filter((s) => s.contentType === "case_study").length,
    articles: savedItems.filter((s) => s.contentType === "article").length,
  };

  const tabs = [
    { label: `All (${counts.all})`, value: "all" },
    { label: `Structures (${counts.structures})`, value: "structures" },
    { label: `Case Studies (${counts["case-studies"]})`, value: "case-studies" },
    { label: `Articles (${counts.articles})`, value: "articles" },
  ];

  async function removeBookmark(item: SavedItem) {
    const key = `${item.contentType}:${item.slug}`;
    setRemoving(key);
    const prev = [...savedItems];
    setSavedItems((s) => s.filter((i) => !(i.contentType === item.contentType && i.slug === item.slug)));
    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: item.contentType, slug: item.slug }),
      });
      if (!res.ok) setSavedItems(prev);
    } catch {
      setSavedItems(prev);
    } finally {
      setRemoving(null);
    }
  }

  /* ── Empty state ── */
  if (savedItems.length === 0) {
    return (
      <>
        <PageHeader
          title="Saved"
          description="Your bookmarked structures, case studies, and articles for easy reference."
          backHref="/dashboard"
          backLabel="Dashboard"
        />

        <div className="sav-empty">
          <svg
            className="sav-empty-icon"
            viewBox="0 0 24 24"
            width={48}
            height={48}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <div className="sav-empty-title">Nothing saved yet</div>
          <p className="sav-empty-desc">
            Save structures, case studies, and articles as you explore the library.
            Your bookmarks will appear here for quick reference.
          </p>

          {recommendations.length > 0 && (
            <div className="sav-recs">
              <div className="sav-rec-heading">Recommended for You</div>
              <div className="sav-rec-list">
                {recommendations.map((rec) => (
                  <div key={`${rec.contentType}:${rec.slug}`} className="sav-rec-card">
                    <Link href={rec.href} className="sav-rec-link">
                      <span className="sav-rec-type">
                        {TYPE_LABELS[rec.contentType] || rec.contentType}
                      </span>
                      <span className="sav-rec-title">{rec.title}</span>
                      <span className="sav-rec-why">{rec.why}</span>
                    </Link>
                    <SaveButton contentType={rec.contentType} slug={rec.slug} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sav-browse-ctas">
            <Link href="/library/structures" className="btn-bookmark">
              Browse Structures
            </Link>
            <Link href="/library/case-studies" className="btn-bookmark">
              Explore Case Studies
            </Link>
            <Link href="/library/articles" className="btn-bookmark">
              Read Articles
            </Link>
          </div>
        </div>

        <div className="page-footer" />
      </>
    );
  }

  /* ── Populated state ── */
  return (
    <>
      <PageHeader
        title="Saved"
        description="Your bookmarked structures, case studies, and articles for easy reference."
        count={`${savedItems.length} SAVED ITEMS`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />

      <FilterBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="card-row rv vis rv-d2">
        {filtered.map((item, i) => (
          <div
            key={`${item.contentType}-${item.slug}`}
            className={`lib-card rv vis rv-d${Math.min(i + 1, 6)}`}
            style={{ position: "relative" }}
          >
            <button
              className="sav-bookmark"
              onClick={() => removeBookmark(item)}
              disabled={removing === `${item.contentType}:${item.slug}`}
              aria-label="Remove bookmark"
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <Link href={item.href} className="sav-card-link">
              <div className="lib-card-type">
                {item.number != null && (
                  <span className="card-num">
                    [{String(item.number).padStart(2, "0")}]
                  </span>
                )}{" "}
                {TYPE_LABELS[item.contentType] || item.contentType}
              </div>
              <div className="lib-card-title">{item.title}</div>
              <div className="lib-card-desc">{item.description}</div>
              <div className="lib-card-meta">
                {item.tags.map((tag) => (
                  <span key={tag} className="lib-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="page-footer" />
    </>
  );
}
