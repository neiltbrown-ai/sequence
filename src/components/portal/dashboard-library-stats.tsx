import SectionHeader from "./section-header";

interface DashboardLibraryStatsProps {
  structureCount: number;
  caseStudyCount: number;
  articleCount: number;
}

export default function DashboardLibraryStats({
  structureCount,
  caseStudyCount,
  articleCount,
}: DashboardLibraryStatsProps) {
  return (
    <div className="dash-section rv rv-d1">
      <SectionHeader title="The Library" />
      <div className="dash-lib-stats">
        <div className="dash-lib-stat">
          <span className="dash-lib-stat-value">{structureCount}</span>
          <span className="dash-lib-stat-label">Structures</span>
        </div>
        <div className="dash-lib-stat">
          <span className="dash-lib-stat-value">{caseStudyCount}+</span>
          <span className="dash-lib-stat-label">Case Studies</span>
        </div>
        <div className="dash-lib-stat">
          <span className="dash-lib-stat-value">{articleCount}</span>
          <span className="dash-lib-stat-label">Articles</span>
        </div>
        <div className="dash-lib-stat">
          <span className="dash-lib-stat-value">Weekly</span>
          <span className="dash-lib-stat-label">New Content</span>
        </div>
      </div>
    </div>
  );
}
