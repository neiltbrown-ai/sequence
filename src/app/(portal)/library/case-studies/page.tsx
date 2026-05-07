import { getAllCaseStudies } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import CaseStudiesFilters from "@/components/portal/case-studies-filters";
import { INDUSTRIES, type IndustrySlug } from "@/lib/case-studies/taxonomy";

export default function PortalCaseStudiesPage() {
  const studies = getAllCaseStudies();

  // Tab values are primary-industry slugs from the canonical taxonomy.
  // Phase 1 shim: keeps the existing tab-bar working until the Phase 2 sidebar lands.
  const present = new Set<IndustrySlug>(
    studies.map((s) => s.industries[0]).filter((v): v is IndustrySlug => Boolean(v))
  );
  const industries = INDUSTRIES.filter((i) => present.has(i.slug)).map((i) => ({
    slug: i.slug,
    label: i.label,
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
      <CaseStudiesFilters studies={studies} industries={industries} />
      <div className="page-footer" />
    </>
  );
}
