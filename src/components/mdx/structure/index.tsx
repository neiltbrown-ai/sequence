import { SbSection } from "./sb-section";
import { SbHeading, SbSubheading } from "./sb-heading";
import { SbFlags, SbFlagCol, SbFlag } from "./sb-flags";
import { SbAlts, SbAlt } from "./sb-alts";
import { SbTable } from "./sb-table";
import { SbMatrix, SbMatrixRow } from "./sb-matrix";
import { SbRelated, SbRelatedCard } from "./sb-related";
import { SbImage } from "./sb-image";
import { SbTabs, SbTabPanel, SbTabGrid, SbTabItem, SbTabNote, SbTabBar, SbTabBarRow } from "./sb-tabs";
import { SbCards, SbCard, SbCardText, SbCardSub } from "./sb-cards";
import { SbScript } from "./sb-script";
import { SbNeg, SbNegPanel, SbNegRow } from "./sb-neg";
import { SbChart, SbChartRow } from "./sb-chart";
import { SbCase, SbCaseText } from "./sb-case";

/* MDX element overrides for structure body content */
function SbParagraph(props: React.ComponentProps<"p">) {
  return (
    <div className="sb-grid">
      <p className="sb-p" {...props} />
    </div>
  );
}

function SbH2(props: React.ComponentProps<"h2">) {
  return (
    <div className="sb-grid is-section">
      <h2 className="sb-h2" {...props} />
    </div>
  );
}

function SbH3(props: React.ComponentProps<"h3">) {
  return (
    <div className="sb-grid is-sub">
      <h3 className="sb-h3" {...props} />
    </div>
  );
}

function SbStrong(props: React.ComponentProps<"strong">) {
  return <strong {...props} />;
}

function SbUl(props: React.ComponentProps<"ul">) {
  return (
    <div className="sb-grid">
      <ul className="sb-list" {...props} />
    </div>
  );
}

function SbOl(props: React.ComponentProps<"ol">) {
  return (
    <div className="sb-grid">
      <ol className="sb-list sb-list--ordered" {...props} />
    </div>
  );
}

/**
 * MDX component map for structure pages.
 * Import and pass to <MDXRemote components={structureMdxComponents} />
 */
export const structureMdxComponents = {
  /* Element overrides */
  p: SbParagraph,
  h2: SbH2,
  h3: SbH3,
  strong: SbStrong,
  ul: SbUl,
  ol: SbOl,

  /* Layout */
  SbSection,
  SbHeading,
  SbSubheading,

  /* Flags */
  SbFlags,
  SbFlagCol,
  SbFlag,

  /* Alternatives */
  SbAlts,
  SbAlt,

  /* Data */
  SbTable,
  SbMatrix,
  SbMatrixRow,
  SbImage,

  /* Related */
  SbRelated,
  SbRelatedCard,

  /* Interactive (client) */
  SbTabs,
  SbTabPanel,
  SbTabGrid,
  SbTabItem,
  SbTabNote,
  SbTabBar,
  SbTabBarRow,
  SbCards,
  SbCard,
  SbCardText,
  SbCardSub,
  SbScript,
  SbNeg,
  SbNegPanel,
  SbNegRow,
  SbChart,
  SbChartRow,
  SbCase,
  SbCaseText,
};

/* Re-export all components for direct imports */
export {
  SbSection,
  SbHeading,
  SbSubheading,
  SbFlags,
  SbFlagCol,
  SbFlag,
  SbAlts,
  SbAlt,
  SbTable,
  SbMatrix,
  SbMatrixRow,
  SbRelated,
  SbRelatedCard,
  SbImage,
  SbTabs,
  SbTabPanel,
  SbTabGrid,
  SbTabItem,
  SbTabNote,
  SbTabBar,
  SbTabBarRow,
  SbCards,
  SbCard,
  SbCardText,
  SbCardSub,
  SbScript,
  SbNeg,
  SbNegPanel,
  SbNegRow,
  SbChart,
  SbChartRow,
  SbCase,
  SbCaseText,
};
