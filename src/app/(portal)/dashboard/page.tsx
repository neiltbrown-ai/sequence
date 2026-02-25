import Link from "next/link";
import {
  getAllStructures,
  getAllCaseStudies,
  getAllArticles,
  type StructureMeta,
  type CaseStudyMeta,
  type ArticleMeta,
} from "@/lib/content";
import SectionHeader from "@/components/portal/section-header";
import LibCard from "@/components/portal/lib-card";

function formatDateShort(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}

export default function DashboardPage() {
  const structures = getAllStructures();
  const caseStudies = getAllCaseStudies();
  const articles = getAllArticles();

  // Pick 3 recommended structures for the top section
  const recommended: (StructureMeta | CaseStudyMeta)[] = [
    ...structures.filter((s) => [12, 18].includes(s.number)),
    ...caseStudies.slice(0, 1),
  ].slice(0, 3);

  // Compact structure rows — show first 8
  const structureRows = structures.slice(0, 8);

  // Case study cards — show first 4
  const caseCards = caseStudies.slice(0, 4);

  // Article rows — show first 5
  const articleRows = articles.slice(0, 5);

  return (
    <>
      {/* WELCOME */}
      <div className="welcome rv vis">
        <div className="welcome-left">
          <div className="welcome-name">Welcome back</div>
          <div className="welcome-context">Your personalized library</div>
        </div>
        <div className="welcome-right">
          <Link href="/library/structures" className="welcome-continue">
            Browse Structures
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={10} height={10}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* RECOMMENDED */}
      <div className="dash-section rv rv-d1">
        <SectionHeader title="Recommended for You" />
        <div className="collection-desc">
          Based on your profile — these are the structures and cases most relevant to where you are right now.
        </div>
        <div className="card-row">
          {recommended.map((item, i) => {
            if (item.type === "structure") {
              const s = item as StructureMeta;
              return (
                <LibCard
                  key={s.slug}
                  href={`/library/structures/${s.slug}`}
                  type="Structure"
                  number={String(s.number)}
                  title={s.title}
                  description={s.excerpt}
                  tags={[s.stage, s.risk]}
                  className={`rv rv-d${i + 1}`}
                />
              );
            }
            const cs = item as CaseStudyMeta;
            return (
              <LibCard
                key={cs.slug}
                href={`/library/case-studies/${cs.slug}`}
                type="Case Study"
                title={cs.title}
                description={cs.excerpt}
                tags={[cs.discipline]}
                isNew
                className={`rv rv-d${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* DEAL STRUCTURES */}
      <div className="dash-section rv rv-d2">
        <SectionHeader
          title="Deal Structures"
          count={`${structures.length} structures`}
          linkHref="/library/structures"
        />
        <div className="struct-list">
          {structureRows.map((s, i) => (
            <Link
              key={s.slug}
              href={`/library/structures/${s.slug}`}
              className={`struct-row rv rv-d${Math.min(i + 1, 6)}`}
            >
              <span className="struct-num">{String(s.number).padStart(2, "0")}</span>
              <div className="struct-info">
                <div className="struct-name">{s.title}</div>
                <div className="struct-sub">{s.excerpt}</div>
              </div>
              <div className="struct-tags">
                <span className="struct-tag">{s.stage}</span>
                <span className="struct-tag">{s.risk}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CASE STUDIES */}
      <div className="dash-section rv rv-d2">
        <SectionHeader
          title="Case Studies"
          count={`${caseStudies.length} studies`}
          linkHref="/library/case-studies"
        />
        <div className="case-grid">
          {caseCards.map((cs, i) => (
            <Link
              key={cs.slug}
              href={`/library/case-studies/${cs.slug}`}
              className={`case-card rv rv-d${Math.min(i + 1, 6)}`}
            >
              <div className="case-card-meta">
                <span>Case Study</span>
                <span className="case-card-dot" />
                <span>{cs.discipline}</span>
              </div>
              <div className="case-card-name">{cs.title}</div>
              <div className="case-card-desc">{cs.excerpt}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ARTICLES */}
      <div className="dash-section rv rv-d2">
        <SectionHeader
          title="Articles"
          count={`${articles.length} articles`}
          linkHref="/library/articles"
        />
        <div className="article-list">
          {articleRows.map((a, i) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className={`article-row rv rv-d${Math.min(i + 1, 6)}`}
            >
              <div>
                <div className="article-row-meta">
                  <span>{a.tag}</span>
                  <span className="article-row-dot" />
                  <span>{a.category}</span>
                </div>
                <div className="article-row-title">{a.title}</div>
                <div className="article-row-excerpt">{a.excerpt}</div>
              </div>
              <div className="article-row-date">{formatDateShort(a.date)}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* GUIDES */}
      <div className="dash-section rv rv-d2">
        <SectionHeader title="Guides" linkHref="/guides" linkLabel="View all" />
        <div className="guide-grid">
          {[
            { title: "Understanding Deal Structures", desc: "A primer on how creative professionals structure compensation beyond hourly rates.", type: "Beginner" },
            { title: "Negotiation Frameworks", desc: "Practical frameworks for negotiating equity, revenue share, and advisory terms.", type: "Strategy" },
            { title: "Building Your Advisory Practice", desc: "How to transition from execution to strategic advisory work.", type: "Advanced" },
          ].map((g, i) => (
            <Link
              key={g.title}
              href="/guides"
              className={`guide-card rv rv-d${i + 1}`}
            >
              <div className="guide-card-type">{g.type}</div>
              <div className="guide-card-title">{g.title}</div>
              <div className="guide-card-desc">{g.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* COLLECTIONS */}
      <div className="dash-section rv rv-d2">
        <SectionHeader title="Curated Collections" />
        <div className="coll-grid">
          {[
            { label: "Collection", title: "The Equity Playbook", desc: "Everything you need to negotiate and structure equity deals in creative work.", items: "8 Structures · 3 Cases" },
            { label: "Collection", title: "Revenue Share Mastery", desc: "From basic revenue share to complex participation structures.", items: "6 Structures · 4 Cases" },
            { label: "Collection", title: "The Advisory Path", desc: "Transition from maker to advisor. Build recurring revenue from expertise.", items: "5 Structures · 2 Cases" },
            { label: "Collection", title: "Creative IP & Licensing", desc: "Own what you create. License it strategically. Build lasting value.", items: "7 Structures · 3 Cases" },
          ].map((c, i) => (
            <div key={c.title} className={`coll-card rv rv-d${i + 1}`}>
              <div className="coll-card-label">{c.label}</div>
              <div className="coll-card-title">{c.title}</div>
              <div className="coll-card-desc">{c.desc}</div>
              <div className="coll-card-items">
                <span>{c.items.split("·")[0].trim()}</span>
                <span className="coll-dot" />
                <span>{c.items.split("·")[1].trim()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-footer" />
    </>
  );
}
