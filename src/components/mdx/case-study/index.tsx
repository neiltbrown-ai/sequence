import { CbSection } from "./cb-section";
import { CbHeading, CbSubheading } from "./cb-heading";
import { CbDropCap } from "./cb-drop-cap";
import { CbPullQuote } from "./cb-pull-quote";
import { CbTimeline, CbTimelineEra, CbTimelineEvent } from "./cb-timeline";
import { CbTable } from "./cb-table";
import { CbMetrics, CbMetric } from "./cb-metrics";
import { CbOrgChart } from "./cb-org-chart";
import { CbStructureBadge } from "./cb-structure-badge";
import { CbRelated, CbRelatedCard } from "./cb-related";
import { CbFlywheel } from "./cb-flywheel";
import { CbChart, CbChartRow } from "./cb-chart";
import { CbTabs, CbTabPanel, CbTabGrid, CbTabItem, CbTabNote } from "./cb-tabs";
import { CbAccordion, CbAccordionCard } from "./cb-accordion";
import { CbSources, CbSourceGroup, CbSourceItem } from "./cb-sources";

/* MDX element overrides for case study body content */
function CbParagraph(props: React.ComponentProps<"p">) {
  return (
    <div className="cb-grid">
      <p className="cb-p" {...props} />
    </div>
  );
}

function CbH2(props: React.ComponentProps<"h2">) {
  return (
    <div className="cb-grid is-section">
      <h2 className="cb-h2" {...props} />
    </div>
  );
}

function CbH3(props: React.ComponentProps<"h3">) {
  return (
    <div className="cb-grid is-sub">
      <h3 className="cb-h3" {...props} />
    </div>
  );
}

function CbStrong(props: React.ComponentProps<"strong">) {
  return <strong {...props} />;
}

/**
 * MDX component map for case study pages.
 * Import and pass to <MDXRemote components={caseStudyMdxComponents} />
 */
export const caseStudyMdxComponents = {
  /* Element overrides */
  p: CbParagraph,
  h2: CbH2,
  h3: CbH3,
  strong: CbStrong,

  /* Layout */
  CbSection,
  CbHeading,
  CbSubheading,
  CbDropCap,
  CbPullQuote,

  /* Data */
  CbTimeline,
  CbTimelineEra,
  CbTimelineEvent,
  CbTable,
  CbMetrics,
  CbMetric,
  CbOrgChart,
  CbStructureBadge,
  CbFlywheel,

  /* Related */
  CbRelated,
  CbRelatedCard,

  /* Interactive (client) */
  CbChart,
  CbChartRow,
  CbTabs,
  CbTabPanel,
  CbTabGrid,
  CbTabItem,
  CbTabNote,
  CbAccordion,
  CbAccordionCard,

  /* Sources */
  CbSources,
  CbSourceGroup,
  CbSourceItem,
};

/* Re-export all components for direct imports */
export {
  CbSection,
  CbHeading,
  CbSubheading,
  CbDropCap,
  CbPullQuote,
  CbTimeline,
  CbTimelineEra,
  CbTimelineEvent,
  CbTable,
  CbMetrics,
  CbMetric,
  CbOrgChart,
  CbStructureBadge,
  CbRelated,
  CbRelatedCard,
  CbFlywheel,
  CbChart,
  CbChartRow,
  CbTabs,
  CbTabPanel,
  CbTabGrid,
  CbTabItem,
  CbTabNote,
  CbAccordion,
  CbAccordionCard,
  CbSources,
  CbSourceGroup,
  CbSourceItem,
};
