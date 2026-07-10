import { getAllCaseStudies } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import LibraryTabs from "@/components/portal/library-tabs";
import CaseStudiesFiltersSidebar, {
  type CaseStudyCard,
} from "@/components/portal/case-studies-filters-sidebar";

export default function PortalCaseStudiesPage() {
  const all = getAllCaseStudies();

  // Project to only the fields the client sidebar/cards use — keeps stats,
  // sections, and hero images out of the serialized payload.
  const studies: CaseStudyCard[] = all.map((cs) => ({
    slug: cs.slug,
    title: cs.title,
    excerpt: cs.excerpt,
    coverImage: cs.coverImage,
    discipline: cs.discipline,
    tags: cs.tags,
    industries: cs.industries,
    disciplines: cs.disciplines,
  }));

  return (
    <>
      <PageHeader
        title="Case Studies"
        description="Real creative professionals who restructured their deals, captured ownership, and built lasting value. Study their moves."
        count={`${studies.length}+ CASE STUDIES`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />
      <LibraryTabs active="case-studies" />
      <CaseStudiesFiltersSidebar studies={studies} />
      <div className="page-footer" />
    </>
  );
}
