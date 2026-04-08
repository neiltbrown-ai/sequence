import LibCard from "./lib-card";
import SectionHeader from "./section-header";
import type { StructureMeta, CaseStudyMeta, ArticleMeta } from "@/lib/content";

const stripBr = (s: string) => s.replace(/<br\s*\/?>/gi, " ");

interface DashboardSavedPreviewProps {
  items: (StructureMeta | CaseStudyMeta | ArticleMeta)[];
  totalCount: number;
}

export default function DashboardSavedPreview({ items, totalCount }: DashboardSavedPreviewProps) {
  if (items.length === 0) {
    return (
      <div className="dash-section rv rv-d1">
        <SectionHeader title="Saved" linkHref="/saved" linkLabel="View all" />
        <div className="dash-saved-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>Save structures and case studies as you explore. Your bookmarks appear here.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-section rv rv-d1">
      <SectionHeader
        title="Saved"
        count={String(totalCount)}
        linkHref="/saved"
        linkLabel="View all"
      />
      <div className="card-row">
        {items.map((item, i) => {
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
          if (item.type === "case-study") {
            const cs = item as CaseStudyMeta;
            return (
              <LibCard
                key={cs.slug}
                href={`/library/case-studies/${cs.slug}`}
                type="Case Study"
                title={stripBr(cs.title)}
                description={cs.excerpt}
                tags={[cs.discipline]}
                className={`rv rv-d${i + 1}`}
              />
            );
          }
          const a = item as ArticleMeta;
          return (
            <LibCard
              key={a.slug}
              href={`/library/articles/${a.slug}`}
              type="Article"
              title={stripBr(a.title)}
              description={a.excerpt}
              tags={[a.category]}
              className={`rv rv-d${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
