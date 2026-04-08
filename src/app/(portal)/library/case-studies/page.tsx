import { getAllCaseStudies } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import CaseStudiesFilters from "@/components/portal/case-studies-filters";

export default function PortalCaseStudiesPage() {
  const studies = getAllCaseStudies();

  // Extract unique industries for filter tabs
  const industries = Array.from(new Set(studies.map((s) => s.industry)));

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
