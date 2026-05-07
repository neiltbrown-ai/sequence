import { getAllCaseStudies } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import CaseStudiesFiltersSidebar from "@/components/portal/case-studies-filters-sidebar";

export default function PortalCaseStudiesPage() {
  const studies = getAllCaseStudies();

  return (
    <>
      <PageHeader
        title="Case Studies"
        description="Real creative professionals who restructured their deals, captured ownership, and built lasting value. Study their moves."
        count={`${studies.length}+ CASE STUDIES`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />
      <CaseStudiesFiltersSidebar studies={studies} />
      <div className="page-footer" />
    </>
  );
}
