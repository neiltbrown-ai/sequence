import LibCard from "./lib-card";
import SectionHeader from "./section-header";
import type { StructureMeta, CaseStudyMeta, ArticleMeta } from "@/lib/content";

const stripBr = (s: string) => s.replace(/<br\s*\/?>/gi, " ");

interface DashboardNewContentProps {
  items: (StructureMeta | CaseStudyMeta | ArticleMeta)[];
}

export default function DashboardNewContent({ items }: DashboardNewContentProps) {
  if (items.length === 0) return null;

  return (
    <div className="dash-section rv rv-d1">
      <SectionHeader
        title="New This Week"
        count={String(items.length)}
        linkHref="/library/structures"
        linkLabel="Browse all"
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
                isNew
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
                isNew
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
              isNew
              className={`rv rv-d${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
