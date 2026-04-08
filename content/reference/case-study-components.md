# Case Study MDX Component Reference

CRITICAL: All props in MDX must be strings. Never use JSX expressions like `num={13}` — always use `num="13"`. MDX does not reliably evaluate curly-brace expressions. Arrays/objects must be passed as JSON strings via dedicated `*Json` props.

## Layout Components

### CbSection
Wraps a content section with an anchor ID for sidenav scroll-tracking.
```mdx
<CbSection id="thesis">
  ...content...
</CbSection>
```

### CbHeading / CbSubheading
Section and subsection headings inside the 8-column grid.
```mdx
<CbHeading>The Thesis: Taste as Infrastructure</CbHeading>
<CbSubheading>Deal Comparison</CbSubheading>
```

### CbDropCap
First paragraph with a large drop-cap letter.
```mdx
<CbDropCap>A24 did not become a cultural institution...</CbDropCap>
```

### CbPullQuote
Highlighted blockquote spanning the reading column.
```mdx
<CbPullQuote>A24 proved something the creative economy hadn't seen before...</CbPullQuote>
```

## Structure Badge
Inline or standalone link to a structure page. Always use `num` as a string.
```mdx
<!-- Standalone (above a heading) -->
<CbStructureBadge num="13" href="/library/structures/constraint-based-production" />

<!-- Inline (within text, e.g. timeline) -->
Applied <CbStructureBadge num="13" href="/library/structures/constraint-based-production" inline /> Budgets capped...
```
Props: `num` (string, required), `href` (string), `inline` (boolean)

## Data Components

### CbTimeline
Vertical timeline with era groupings.
```mdx
<CbTimeline>
  <CbTimelineEra label="Era 1: Distribution (2012–2015)">
    <CbTimelineEvent year="2012">Description text. **Bold** works.</CbTimelineEvent>
    <CbTimelineEvent year="2013">More text...</CbTimelineEvent>
  </CbTimelineEra>
  <CbTimelineEra label="Era 2: Production (2016–2020)">
    ...
  </CbTimelineEra>
</CbTimeline>
```

### CbMetrics
Row of large stat callouts.
```mdx
<CbMetrics>
  <CbMetric value="$2.5B+" label="Cumulative Worldwide Gross" />
  <CbMetric value="~$6M" label="Avg. Production Budget" />
  <CbMetric value="12x" label="Average ROI Per Film" />
</CbMetrics>
```

### CbChart + CbChartRow
Animated horizontal bar chart. Bars animate on scroll into view.
```mdx
<CbChart title="A24 Production ROI vs. Industry Average">
  <CbChartRow label="Moonlight" value="16.25x" pct="100" />
  <CbChartRow label="Hereditary" value="8x" pct="49" />
  <CbChartRow label="Avg. studio" value="1.3x" pct="8" avg />
</CbChart>
```
CbChartRow props: `label`, `value`, `pct` (string 0-100, highest = "100"), `avg` (boolean, renders faded with separator)

### CbTable
Data table. Headers and rows must use JSON string props.
```mdx
<CbTable
  headersJson='["Revenue Stream","Est. Share","Trajectory"]'
  rowsJson='[["Theatrical","40%","Stable"],["Backend","25%","Growing"]]'
/>
```

### CbOrgChart
Entity/org hierarchy diagram.
```mdx
<CbOrgChart
  title="A24 Entity Structure"
  parent="A24 Holdings (Parent)"
  itemsJson='[{"name":"A24 Films","desc":"Production"},{"name":"A24 Distribution","desc":"Theatrical"}]'
/>
```

### CbFlywheel
SVG diagram wrapper for flywheel/cycle graphics. Raw SVG goes inside.
```mdx
<CbFlywheel title="Value Flywheel">
  <svg viewBox="0 0 580 400" ...>...</svg>
</CbFlywheel>
```

## Interactive Components

### CbTabs
Tabbed panels. Tab labels must use JSON string prop.
```mdx
<CbTabs tabsJson='["A24 Terms","Traditional Studio","Outcome"]'>
  <CbTabPanel>
    <CbTabGrid>
      <CbTabItem label="Director Fee" value="$300–600K" />
      <CbTabItem label="Backend" value="8–15% adj. gross" />
    </CbTabGrid>
    <CbTabNote>**Creative control: full.** No studio notes.</CbTabNote>
  </CbTabPanel>
  <CbTabPanel>
    ...second tab content...
  </CbTabPanel>
</CbTabs>
```

### CbAccordion + CbAccordionCard
Expandable card stack. Only one open at a time.
```mdx
<CbAccordion>
  <CbAccordionCard num="01" label="Budget Caps and Creative Autonomy">
    <p className="cb-card-text">Paragraph text with **bold** support.</p>
    <p className="cb-card-text">Second paragraph.</p>
  </CbAccordionCard>
  <CbAccordionCard num="02" label="Profit Participation">
    <p className="cb-card-text">Content here...</p>
  </CbAccordionCard>
</CbAccordion>
```

### CbSources
Collapsible sources/verification accordion at bottom of case study (above Related).
```mdx
<CbSources>
  <CbSourceGroup title="Primary Sources">
    <CbSourceItem>Box Office Mojo — theatrical gross data</CbSourceItem>
    <CbSourceItem>SEC filings — equity rounds</CbSourceItem>
  </CbSourceGroup>
  <CbSourceGroup title="Gaps to Verify">
    <CbSourceItem>Exact catalog valuation — estimated, not appraised</CbSourceItem>
  </CbSourceGroup>
</CbSources>
```

## Related Section
Links to structures, articles, and other case studies.
```mdx
<CbRelated>
  <CbRelatedCard num="13" title="Constraint-Based Production" desc="How budget limits create advantages" href="/library/structures/constraint-based-production" />
  <CbRelatedCard label="Article" title="The Discernment Premium" desc="Why taste is undervalued" href="/articles/the-discernment-premium" />
  <CbRelatedCard label="Case 02" title="Virgil Abloh" desc="Structures of cultural influence" href="/case-studies/virgil-abloh" />
</CbRelated>
```
Props: `num` (string, for structures) OR `label` (string, for articles/case studies), `title`, `desc`, `href`

## Frontmatter Template
```yaml
---
title: "Title with optional <br> for line breaks"
slug: slug-name
type: case-study
number: 1
discipline: "Film / Production"
industry: "Film"
excerpt: "Short description for cards and SEO"
subtitle: "Longer subtitle for the hero section"
structures: [13, 9, 14]
tags: [film, production, profit-participation]
access: member
heroImage: "https://images.unsplash.com/..."
heroAlt: "Image description"
readTime: 22
stats:
  - value: "$2.5B+"
    label: "Cumulative Worldwide Gross"
  - value: "12x"
    label: "Average ROI"
sections:
  - id: thesis
    label: The Thesis
  - id: timeline
    label: Timeline
published: true
updatedAt: "2026-02-25"
---
```

### Field Notes
- **`discipline`** — Full descriptive label shown on cards (e.g., "Film / Entertainment", "Graphic Design / Product Design")
- **`industry`** — Short category used for filter tabs on the list page. Use one of: `Film`, `Design`, `Music`, `Writing`, `Photography`, `Agency`. Add new categories as needed but keep them to one word.

## Standard Case Study Structure
1. Thesis section (CbDropCap + CbPullQuote)
2. Timeline section (CbTimeline with eras)
3. Structure sections (1-3 structures, each with CbStructureBadge + CbHeading + analysis + data components)
4. Compounding Effect section (how structures interact)
5. Transferable Lessons (CbAccordion)
6. Sources (CbSources)
7. Related (CbRelated)
