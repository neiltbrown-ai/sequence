import type { MDXComponents } from "mdx/types";
import { PullQuote } from "./pull-quote";
import { Metrics, Metric } from "./metrics";
import { Chart, ChartRow } from "./chart";
import { BreakoutImage, FullWidthImage } from "./breakout-image";
import { Subhead, SmallSubhead } from "./headings";
import { DropCap } from "./drop-cap";

/**
 * MDX component map — passed to <MDXRemote /> so that custom tags
 * in .mdx files resolve to React components with the correct CSS classes.
 *
 * Default markdown elements (p, h2, h3, strong) are overridden to wrap
 * in the article grid system (.ab-grid).
 */
export const mdxComponents: MDXComponents = {
  // Custom components for rich article content
  PullQuote,
  Metrics,
  Metric,
  Chart,
  ChartRow,
  BreakoutImage,
  FullWidthImage,
  Subhead,
  SmallSubhead,
  DropCap,

  // Override default markdown elements to apply article CSS classes
  p: (props) => (
    <div className="ab-grid">
      <p className="ab-p rv vis" {...props} />
    </div>
  ),
  h2: (props) => (
    <div className="ab-grid is-subhead">
      <h2 className="ab-h2 rv vis" {...props} />
    </div>
  ),
  h3: (props) => (
    <div className="ab-grid is-subhead-sm">
      <h3 className="ab-h3 rv vis" {...props} />
    </div>
  ),
  strong: (props) => <strong {...props} />,
};
