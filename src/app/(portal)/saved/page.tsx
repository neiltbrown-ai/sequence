"use client";

import { useState } from "react";
import Link from "next/link";
import FilterBar from "@/components/portal/filter-bar";
import PageHeader from "@/components/portal/page-header";

/* ── Static saved items (will be replaced with Supabase query) ── */
const SAVED_ITEMS = [
  {
    type: "Structure",
    category: "structures",
    num: "[12]",
    title: "Revenue Share Agreements",
    desc: "Convert fixed fees into ongoing participation in the revenue your work generates. The bridge between fee-for-service and ownership.",
    tags: ["Stage 2–3", "Medium Risk"],
    href: "/library/structures/revenue-share-agreements",
  },
  {
    type: "Case Study",
    category: "case-studies",
    title: "Virgil Abloh",
    desc: "From DJ to cultural infrastructure — building a portfolio of equity positions, brand ownership, and advisory roles.",
    tags: ["Design", "Stage 3–4"],
    href: "/library/case-studies/virgil-abloh",
  },
  {
    type: "Guide",
    category: "guides",
    title: "Negotiation Playbook",
    desc: "Scripts, frameworks, and red-flag identification for real-world deal conversations.",
    tags: ["Negotiation"],
    href: "/guides",
  },
  {
    type: "Article",
    category: "articles",
    title: "Why the Middle Is Getting Squeezed",
    desc: "The $75K–$500K creative professional is caught in a structural compression that has nothing to do with talent.",
    tags: ["Thesis", "8 min"],
    href: "/library/articles/why-the-middle-is-getting-squeezed",
  },
  {
    type: "Structure",
    category: "structures",
    num: "[26]",
    title: "Hybrid Fee + Backend",
    desc: "Reduced upfront fee in exchange for backend equity or profit participation. High risk, high ceiling.",
    tags: ["Stage 2–3", "High Risk"],
    href: "/library/structures/hybrid-fee-plus-backend",
  },
  {
    type: "Case Study",
    category: "case-studies",
    title: "Taylor Swift",
    desc: "The re-recording strategy as the most public case study in ownership economics and master rights recapture.",
    tags: ["Entertainment", "Stage 4"],
    href: "/library/case-studies/taylor-swift",
  },
  {
    type: "Article",
    category: "articles",
    title: "Equity vs. Fee: When to Trade Income for Ownership",
    desc: "The decision to accept equity isn't about risk tolerance — it's about understanding where you are in the value chain.",
    tags: ["Structures"],
    href: "/library/articles/equity-vs-fee",
  },
  {
    type: "Structure",
    category: "structures",
    num: "[18]",
    title: "Strategic Advisory Retainer",
    desc: "Shift from executing deliverables to shaping direction. Charge for judgment, not hours.",
    tags: ["Stage 3", "Low Risk"],
    href: "/library/structures/strategic-advisory-retainer",
  },
];

const TABS = [
  { label: `All (${SAVED_ITEMS.length})`, value: "all" },
  { label: `Structures (${SAVED_ITEMS.filter((s) => s.category === "structures").length})`, value: "structures" },
  { label: `Case Studies (${SAVED_ITEMS.filter((s) => s.category === "case-studies").length})`, value: "case-studies" },
  { label: `Articles (${SAVED_ITEMS.filter((s) => s.category === "articles").length})`, value: "articles" },
  { label: `Guides (${SAVED_ITEMS.filter((s) => s.category === "guides").length})`, value: "guides" },
];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? SAVED_ITEMS
      : SAVED_ITEMS.filter((s) => s.category === activeTab);

  return (
    <>
      <PageHeader
        title="Saved"
        description="Your bookmarked structures, case studies, articles, and guides for easy reference."
        count={`${SAVED_ITEMS.length} SAVED ITEMS`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />

      <FilterBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="card-row rv vis rv-d2">
        {filtered.map((item, i) => (
          <Link
            key={`${item.type}-${item.title}`}
            href={item.href}
            className={`lib-card rv vis rv-d${Math.min(i + 1, 6)}`}
          >
            <span className="sav-bookmark">
              <svg viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <div className="lib-card-type">
              {item.num && <span className="card-num">{item.num}</span>}{" "}
              {item.type}
            </div>
            <div className="lib-card-title">{item.title}</div>
            <div className="lib-card-desc">{item.desc}</div>
            <div className="lib-card-meta">
              {item.tags.map((tag) => (
                <span key={tag} className="lib-card-tag">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="page-footer" />
    </>
  );
}
