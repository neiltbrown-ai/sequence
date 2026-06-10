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
  <CbMetric value="$2.5B+" label="Cumulative Worldwide Gross" estimated />
  <CbMetric value="$4.05B" label="Disney Acquisition Price" />
  <CbMetric value="12x" label="Average ROI Per Film" estimated />
</CbMetrics>
```
**`estimated` prop** (boolean, optional): renders a small "Est." chip below the value. Use for industry-comparable figures, Forbes net worth estimates, lifetime totals, derived multiples, `+`/`~` prefixed values. SEC-verified or trade-press-disclosed transactions get no chip. See `case-study-editorial-conventions.md` §11 for the full rubric.

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
Wrapper for the case's "Compounding Effect" diagram. The component name is historical — the diagram inside doesn't have to be a flywheel. Raw SVG goes inside.

```mdx
<CbFlywheel title="Value Flywheel">
  <svg viewBox="0 0 580 400" ...>...</svg>
</CbFlywheel>
```

#### Diagram type taxonomy

> For the full visual standard — literal color tokens (light + dark), exact per-type geometry/coordinates, and typography — see the dedicated, self-contained spec `diagram-system.md`. The summary below is the authoring view (which type to pick, in MDX); `diagram-system.md` is the reproduction view (every value needed to build one, including outside the repo).

Pick the diagram from the case's actual structural argument, not by template. There are five recognized types — the first three are well-established in the library (~100 cases between them); the last two are newer and have a single canonical exemplar each.

**1. Hub-and-spoke compounding wheel** (the dominant pattern, ~95 cases)

Use when the case argues a genuine self-reinforcing loop — every spoke feeds the next, and the cycle is the whole point. Central black circle with a 2-line thesis (`TASTE` / `COMPOUNDS`), 6 outer cards in hex pattern, **solid arrows around the perimeter** (the cycle), **dashed lines from each spoke to the hub** (every spoke ladders back to the central concept).

Canonical reference: `content/case-studies/jeremy-kirkland.mdx` — `KIRKLAND — TASTE COMPOUNDS`.

**2. Broken-flywheel variant** (1 case)

Same hub-and-spoke layout, but half the spokes are rendered in a muted red with **dashed arrows** showing where the cycle breaks down. Hub usually names what's missing (`FULL OWNERSHIP` for Chance). Use when the case is genuinely cautionary — the structures the creator *would* have needed are absent or broken.

Canonical reference: `content/case-studies/chance-the-rapper.mdx` — `CHANCE — THE BROKEN FLYWHEEL`.

**3. Triangle / triadic flow** (1 case)

Three structure boxes in an inverted triangle (one top, two bottom) with **solid arrows showing the directional flow** between them and short flow-text labels (e.g. "Capital funds production", "Diversified revenue builds catalog"). Use when the case has a small number of structures (typically 3) that compound on each other directionally rather than cyclically.

Canonical reference: `content/case-studies/a24.mdx` — `A24 Value Flywheel`.

**4. Linear sequence** (1 case)

Three large cards left-to-right with **bold horizontal arrows** between them. Each card carries a year/era header, structure number, descriptive name, and a 2–3 line mono-small-caps outcome detail. Italic flow labels above each arrow ("acquires", "spawns") and an italic closing line below the row tying the sequence together. Use when the structures are deployed in a deliberate **chronological chain** — each one a precondition for the next — not a loop.

Canonical reference: `content/case-studies/ira-glass.mdx` — `The Glass Sequence — One Move in Three Acts`.

**5. Independent grid** (1 case)

N×M grid of independent entity cards with **no arrows between them**. Each card carries an asset-class header (mono-small-caps), entity name (sans bold), era, and fate. A center note (italic, muted) names the structural argument: "Four asset classes. Four entities. No arrows between them — that is the structural argument." Use when the case argues **separation** — multiple entities or asset classes with no cross-dependencies, where the visual absence of connections is the point.

Canonical reference: `content/case-studies/erik-spiekermann.mdx` — `Four Entities, Four Asset Classes, No Cross-Dependencies`.

#### Selection rule

Match the diagram to the case's argument:

| The case argues… | Use |
|---|---|
| Self-reinforcing cycle | Hub-and-spoke (1) |
| Broken / missing cycle | Broken-flywheel variant (2) |
| Three structures with directional flow | Triangle (3) |
| Sequence of structures over time | Linear sequence (4) |
| Separation / no cross-dependencies | Independent grid (5) |

When uncertain, default to hub-and-spoke (1) — it's the library's anchor and works for most "compounding" cases.

#### Mandatory hygiene

- **Use `var(--diag-*)` CSS vars, never hardcoded hex.** The portal flips to dark mode via `[data-theme="dark"]`; hardcoded colors break dark mode. The 100 pre-2026-05 hub-and-spoke cases use hardcoded hex (`#1a1a1a`, `#f5f5f0`, etc.) — that's a known carry-forward gap. New diagrams must use the vars.
- **Confirmed var names:** `--diag-parent-bg`, `--diag-parent-border`, `--diag-parent-text`, `--diag-child-bg`, `--diag-child-border`, `--diag-child-text`, `--diag-muted-text`, `--diag-line`, `--diag-center-bg`, `--diag-center-border`, `--diag-center-text`, `--diag-label-bg`. Anything else (e.g. `--diag-text`, `--mid`) is undefined and renders transparent.
- **Card text hierarchy:** lead with the **descriptive name** (sans-serif, fontWeight 600, fontSize 11–14), supporting detail in **mono-small-caps** below (`'PT Mono', monospace`, fontSize 8, `var(--diag-muted-text)`, letterSpacing 0.05em). Never lead with a bare structure number.
- **Standard viewBox:** `0 0 580 400` for hub-and-spoke (1, 2) and grid (5). Sequence (4) typically wider — `0 0 700 320`. Triangle (3) follows A24's existing geometry.
- **Title prop:** descriptive and case-specific (`KIRKLAND — TASTE COMPOUNDS`, `Eno — Opal Holds the Stack`), not generic (`Value Flywheel`). The title appears as a small label above the SVG.

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
Collapsible sources/verification accordion at bottom of case study (above Related). Wraps the case's canonical five-subsection verification block. The `CbSources` component MUST live inside `<CbSection id="sources">` so the section nav anchor resolves correctly.

**Canonical 5-subsection structure** (in this order):

```mdx
<CbSection id="sources">

<CbSources>
  <CbSourceGroup title="Verification Info">
    <CbSourceItem>2-3 short bullets on the case's overall confidence character.</CbSourceItem>
  </CbSourceGroup>
  <CbSourceGroup title="Primary Sources">
    <CbSourceItem>Box Office Mojo — theatrical gross data</CbSourceItem>
    <CbSourceItem>SEC filings — equity rounds</CbSourceItem>
  </CbSourceGroup>
  <CbSourceGroup title="Secondary Sources">
    <CbSourceItem>Variety, Deadline, THR — trade press coverage</CbSourceItem>
  </CbSourceGroup>
  <CbVerifiedDataPoints>
    <CbDataPoint confidence="very-high">Disney acquisition $4.05B — SEC filings</CbDataPoint>
    <CbDataPoint confidence="high">Net worth $7B — Forbes 2025</CbDataPoint>
    <CbDataPoint confidence="medium">Industry-comparable royalty rate — entertainment attorneys</CbDataPoint>
  </CbVerifiedDataPoints>
  <CbSourceGroup title="Gaps to Verify">
    <CbSourceItem>Exact catalog valuation — estimated, not appraised</CbSourceItem>
  </CbSourceGroup>
</CbSources>

</CbSection>
```

See `case-study-editorial-conventions.md` §12 for the full convention.

### CbVerifiedDataPoints + CbDataPoint
Confidence-rated data point list, used inside `CbSources` as the 4th subsection. Replaces the older `<CbSourceGroup title="Verified Data Points">` pattern with a structured component that renders confidence chips.

```mdx
<CbVerifiedDataPoints>
  <CbDataPoint confidence="very-high">Star Wars $775M worldwide (1977) — box office records</CbDataPoint>
  <CbDataPoint confidence="high">Salary reduction $500K → $150K — Deadline, NFS, CNW</CbDataPoint>
  <CbDataPoint confidence="medium">Net worth $7B — Forbes 2025</CbDataPoint>
</CbVerifiedDataPoints>
```

`CbDataPoint.confidence` accepts: `"very-high"` | `"high"` | `"medium"`.

- **very-high** — primary-sourced (SEC filings, official press releases, AMPAS, Box Office Mojo, named on-record interviews, Wikipedia for verifiable chart/award facts)
- **high** — multiple credible secondary sources OR named primary statement without separate corroboration. Trade press confirmation.
- **medium** — single secondary source, industry-comparable estimates, analyst projections. Often pushed to Gaps to Verify with parens-text instead.

Conservative bias: when uncertain between two levels, lean lower.

### CbConfidenceBadge
Auto-renders in the case header band based on the `confidence:` frontmatter field. Three states: `disclosed`, `mixed`, `inferred`. Renders as a clickable text chip (`[ DISCLOSED ]` / `[ MIXED ]` / `[ INFERRED ]`) that scrolls to the `#sources` anchor.

You don't usually use this component directly in MDX — set the frontmatter field instead:

```yaml
confidence: disclosed   # or "mixed" or "inferred"
```

If used directly in MDX:

```mdx
<CbConfidenceBadge level="mixed" />
```

The component is registered in the MDX components map for direct MDX use, but the typical usage path is frontmatter → `CaseStudyHeader` → automatic render.

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
confidence: mixed                  # "disclosed" | "mixed" | "inferred" — see §12 of conventions doc
heroImage: "https://images.unsplash.com/..."
heroAlt: "Image description"
readTime: 22
stats:
  - value: "$2.5B+"
    label: "Cumulative Worldwide Gross"
    estimated: true                # add when value is an industry-comparable estimate
  - value: "$4.05B"
    label: "Disney Acquisition"    # SEC-verified, no estimated flag
  - value: "12x"
    label: "Average ROI"
    estimated: true
sections:
  - id: thesis
    label: The Thesis
  - id: timeline
    label: Timeline
  - id: lessons
    label: Lessons
  - id: sources
    label: Sources & Verification  # canonical label
  - id: related
    label: Related
published: true
publishedAt: "2026-02-25"          # date the case was originally published (≠ updatedAt)
updatedAt: "2026-02-25"
---
```

### Field Notes
- **`discipline`** — Full descriptive label shown on cards (e.g., "Film / Entertainment", "Graphic Design / Product Design")
- **`industry`** — Short category used for filter tabs on the list page. Use one of: `Film`, `Design`, `Music`, `Writing`, `Photography`, `Agency`. Add new categories as needed but keep them to one word.
- **`confidence`** — Drives the case header confidence badge. `disclosed` for cases where most figures are SEC-verified or named-source-confirmed. `mixed` (the default for most cases) when some figures are disclosed and some are industry-comparable estimates. `inferred` when most figures are estimated. See `case-study-editorial-conventions.md` §12 for the full convention; assignment is calibrated against the case's Verified Data Points + Verification Info content.
- **`stats[].estimated`** — Optional boolean. When true, renders an "Est." chip below the value. Use for industry-comparable figures, Forbes net worth, derived multiples. See conventions §11 for the rubric.
- **`sections`** — Required to include `- id: sources / label: Sources & Verification` between Lessons and Related. The `<CbSection id="sources">` body wrapper around `<CbSources>` is also required so the section nav anchor resolves.
- **`publishedAt`** — Original publication date. Distinct from `updatedAt`. Used by the related-cases recency cap (currently paused; re-enabling depends on a future Phase 0 follow-up using git first-touch dates instead of `updatedAt`).

## Standard Case Study Structure
1. Thesis section (CbDropCap + CbPullQuote)
2. Timeline section (CbTimeline with eras)
3. Structure sections (1-3 structures, each with CbStructureBadge + CbHeading + analysis + data components)
4. Compounding Effect section (how structures interact)
5. Transferable Lessons (CbAccordion). Closing card MUST be a "What Wouldn't Transfer" lesson per `case-study-editorial-conventions.md` §13.
6. Sources & Verification (CbSection id="sources" → CbSources → 5 canonical subsections). See §12 of conventions.
7. Related (CbSection id="related" → CbRelated). At least one case-card desc should use a relational form (axis 2 / 3 / 5) per §14.

## Cross-references

For voice register, evidence-honesty conventions, structure-mapping rules, and the per-section quality bar, see the sister doc:

- **`content/reference/case-study-editorial-conventions.md`** — sister doc with 14 numbered sections covering voice (§1–10), stat header chip rubric (§11), verification block structure (§12), "What Wouldn't Transfer" lesson convention (§13), Related-cases conventions (§14), plus an authoring checklist at the end.

This components doc covers WHAT components exist and HOW to use them. The conventions doc covers HOW to write inside the components — the editorial register, the evidence rules, the per-pattern judgments. Both are required reading before authoring or editing a case study.
