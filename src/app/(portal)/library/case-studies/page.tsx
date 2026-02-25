import { getAllCaseStudies } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import CaseStudiesFilters from "@/components/portal/case-studies-filters";

export default function PortalCaseStudiesPage() {
  const studies = getAllCaseStudies();

  // Extract unique disciplines for filter tabs
  const disciplines = Array.from(new Set(studies.map((s) => s.discipline)));

  return (
    <>
      <PageHeader
        title="Case Studies"
        description="Real creative professionals who restructured their deals, captured ownership, and built lasting value. Study their moves."
        count={`${studies.length}+ CASE STUDIES`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />
      <CaseStudiesFilters studies={studies} disciplines={disciplines} />
      <div className="page-footer" />
    </>
  );
}
