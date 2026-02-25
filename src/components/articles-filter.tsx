"use client";

import { useState } from "react";
import Link from "next/link";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Thesis", value: "thesis" },
  { label: "Deal Structures", value: "deal-structures" },
  { label: "Case Studies", value: "case-studies" },
  { label: "Practitioners", value: "practitioners" },
];

const ARTICLES = [
  {
    slug: "the-triple-convergence-where-creativity-cognition-and-capital-collide",
    category: "thesis",
    tag: "[THESIS]",
    date: "FEB 2026",
    title: "The Triple Convergence: Where Creativity, Cognition, and Capital Collide",
    excerpt:
      "Three forces are converging simultaneously — and the professionals who understand the intersection will capture asymmetric advantage in the next decade.",
    image:
      "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=600&fit=crop",
  },
  {
    slug: "revenue-share-vs-equity-choosing-the-right-ownership-structure",
    category: "deal-structures",
    tag: "[DEAL STRUCTURES]",
    date: "FEB 2026",
    title: "Revenue Share vs. Equity: Choosing the Right Ownership Structure",
    excerpt:
      "Two paths to ownership. One trades upside for certainty. The other bets on long-term value. How to decide which fits your situation.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
  },
  {
    slug: "from-freelancer-to-co-owner-a-photographers-path-through-the-four-stages",
    category: "case-studies",
    tag: "[CASE STUDY]",
    date: "JAN 2026",
    title: "From Freelancer to Co-Owner: A Photographer\u2019s Path Through the Four Stages",
    excerpt:
      "She started billing hourly. Within three years she held equity in two brands. The deals that made the transition possible — and the ones she turned down.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
  },
  {
    slug: "the-discernment-premium-why-taste-became-the-scarcest-asset",
    category: "thesis",
    tag: "[THESIS]",
    date: "JAN 2026",
    title: "The Discernment Premium: Why Taste Became the Scarcest Asset",
    excerpt:
      "AI didn\u2019t replace creativity. It revealed that most creative work was execution, not vision. The 40-70x gap between median and top creatives is accelerating.",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
  },
  {
    slug: "jeff-jackson-the-artist-desires-to-be-understood",
    category: "practitioners",
    tag: "[PRACTITIONER]",
    date: "JAN 2026",
    title: "Jeff Jackson: The Artist Desires to Be Understood",
    excerpt:
      "A painter who restructured his gallery relationships to retain ownership of his catalog. The conversation that changed his career trajectory.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
  },
  {
    slug: "the-performance-kicker-aligning-compensation-with-outcomes",
    category: "deal-structures",
    tag: "[DEAL STRUCTURES]",
    date: "DEC 2025",
    title: "The Performance Kicker: Aligning Compensation with Outcomes",
    excerpt:
      "Structure 07 from the library. A mechanism that ties creative compensation to measurable business results — shifting risk and reward simultaneously.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
  },
  {
    slug: "the-missing-middle-why-75k-500k-creatives-feel-the-squeeze",
    category: "thesis",
    tag: "[THESIS]",
    date: "DEC 2025",
    title: "The Missing Middle: Why $75K-$500K Creatives Feel the Squeeze",
    excerpt:
      "They\u2019re not failing. The market is restructuring around them. Understanding the compression — and the exits — that define this cohort.",
    image:
      "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&h=600&fit=crop",
  },
  {
    slug: "2nd-shift-design-co-building-community-through-craft",
    category: "case-studies",
    tag: "[CASE STUDY]",
    date: "NOV 2025",
    title: "2nd Shift Design Co: Building Community Through Craft",
    excerpt:
      "A design collective that turned shared space into shared ownership — and the deal structure that made it possible without outside capital.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
  },
];

export default function ArticlesFilter() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredArticles =
    activeFilter === "all"
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeFilter);

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
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ARTICLE CARDS */}
      <section className="art-section">
        <div className="art-grid">
          {filteredArticles.map((article, i) => (
            <Link
              href={`/articles/${article.slug}`}
              className={`art-card rv vis${i % 2 === 1 ? " rv-d2" : ""}`}
              key={article.slug}
              data-category={article.category}
            >
              <div className="art-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.image} alt="" />
              </div>
              <div className="art-card-body">
                <div className="art-card-meta">
                  <span className="art-card-tag">{article.tag}</span>
                  <span className="art-card-dot"></span>
                  <span className="art-card-date">{article.date}</span>
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
      <div className="art-more rv">
        <button className="btn">
          Load More Articles
          <span className="btn-arrow">
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M6 2L6 10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M6 2L6 10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </>
  );
}
