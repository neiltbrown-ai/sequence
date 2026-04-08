# Structure MDX Component Reference

CRITICAL: All props in MDX must be strings. Never use JSX expressions like `num={13}` — always use `num="13"`. MDX does not reliably evaluate curly-brace expressions. Arrays/objects must be passed as JSON strings via dedicated `*Json` props.

## Content Guidelines

- **Case studies must be FICTIONAL.** Use invented names and scenarios that illustrate realistic outcomes. Never reference real public figures. Format label as: `"Case 01 · Industry · Career Stage"`
- **Decision Matrix** (not "Leverage Assessment") — use `<SbSubheading>Decision Matrix</SbSubheading>` as the heading, then `<SbMatrix title="Context-Specific Title">` for the component (don't repeat "Decision Matrix" in the title prop)
- **Bold patterns in negotiation rows:** Start each SbNegRow value with a **bold phrase** to anchor the reader's eye
- **Alternatives** use arrow notation: condition text is automatically followed by → in the component — do NOT include → in your text
- **Flags** use ✓ for "Use When" and ✗ for "Avoid When" — this is handled by the component, just set `type="use"` or `type="avoid"`
- **Manipulation cards** use `warn="true"` which auto-prepends ⚠ to the number
- **Intro paragraphs** before Protections and Manipulations card sections — always include a brief paragraph setting context before the `<SbCards>` block
- **Value example character** — use a fictional name, describe their role and experience level, set up the "same work, two outcomes" comparison

## Frontmatter

Every structure MDX file includes standard frontmatter plus detail fields. The `subtype` determines grouping: structures 1–16 are `business-model`, structures 17–35 are `compensation`.

```yaml
---
title: "Gross Participation"
slug: gross-participation
type: structure
subtype: compensation
number: 22
risk: "MODERATE"
stage: "REVENUE"
excerpt: "Short description for listings."
tags: [compensation, revenue, moderate]
access: member
sortOrder: 22
published: true
updatedAt: "2026-02-26"
category: "Revenue / Profit Participation"
tagline: "Percentage of revenue before most costs deducted — the strongest protection against creative accounting."
stats:
  - { label: "Risk Profile", value: "Moderate" }
  - { label: "Asset Class", value: "Revenue" }
  - { label: "Time to Value", value: "6–18 months" }
  - { label: "Best For", value: "Artists with leverage" }
sections:
  - { id: "overview", label: "Overview" }
  - { id: "tiers", label: "Career Tiers" }
  - { id: "when-to-use", label: "When to Use" }
  - { id: "protect", label: "Protections" }
  - { id: "manipulations", label: "Manipulations" }
  - { id: "negotiate", label: "Negotiate" }
  - { id: "value", label: "Value Example" }
  - { id: "cases", label: "Case Studies" }
  - { id: "related", label: "Related" }
---
```

Notes:
- `tagline` — a complete sentence describing what the structure achieves. Appears prominently below the title.
- `stats` — always exactly 4 items: Risk Profile, Asset Class, Time to Value, Best For.
- `sections` — IDs must match the `<SbSection id="...">` values in the body.
- `sortOrder` should match `number`.

## Structure Reference Table

Use these exact slugs for `href` values in `SbRelatedCard` and `SbAlt` components. Format: `/library/structures/{slug}`

### Business Models (1–16, subtype: business-model)

| # | Slug | Title |
|---|------|-------|
| 01 | premium-service-model | Premium Service Model |
| 02 | retainer-bonus-model | Retainer + Bonus Model |
| 03 | project-equity-model | Project Equity Model |
| 04 | advisory-consultant-model | Advisory / Consultant Model |
| 05 | co-creation-joint-venture | Co-Creation Joint Venture |
| 06 | product-partnership-model | Product Partnership Model |
| 07 | platform-cooperative-model | Platform Cooperative Model |
| 08 | creative-collective-studio | Creative Collective / Studio |
| 09 | holding-company-model | Holding Company Model |
| 10 | diversified-revenue-streams | Diversified Revenue Streams |
| 11 | franchise-licensing-model | Franchise / Licensing Model |
| 12 | creator-as-platform-model | Creator-as-Platform Model |
| 13 | constraint-based-production | Constraint-Based Production |
| 14 | catalog-ip-securitization | Catalog / IP Securitization |
| 15 | dao-web3-governance | DAO / Web3 Governance |
| 16 | ai-augmented-studio-model | AI-Augmented Studio Model |

### Compensation Structures (17–35, subtype: compensation)

| # | Slug | Title |
|---|------|-------|
| 17 | equity-for-services | Equity-for-Services |
| 18 | founder-co-founder-equity | Founder / Co-Founder Equity |
| 19 | vesting-equity | Vesting Equity |
| 20 | performance-equity | Performance Equity |
| 21 | convertible-notes | Convertible Notes |
| 22 | gross-participation | Gross Participation |
| 23 | net-profit-participation | Net Profit Participation |
| 24 | revenue-share-partnership | Revenue Share Partnership |
| 25 | royalty-structures | Royalty Structures |
| 26 | hybrid-fee-backend | Hybrid Fee + Backend |
| 27 | non-exclusive-licensing | Non-Exclusive Licensing |
| 28 | exclusive-licensing | Exclusive Licensing |
| 29 | rights-reversion-clauses | Rights Reversion Clauses |
| 30 | subsidiary-rights-retention | Subsidiary Rights Retention |
| 31 | territory-media-rights-splitting | Territory / Media Rights Splitting |
| 32 | royalty-equity-hybrid | Royalty + Equity Hybrid |
| 33 | milestone-payment-structures | Milestone Payment Structures |
| 34 | profit-participation-mgmt-fee | Profit Participation + Mgmt Fee |
| 35 | option-agreements | Option Agreements |

## Layout Components

### SbSection
Wraps a content section with an anchor ID for scroll-tracking.
```mdx
<SbSection id="overview">
  ...content...
</SbSection>
```

### SbHeading / SbSubheading
Section and subsection headings in the grid.
```mdx
<SbHeading>When to Use This Structure</SbHeading>
<SbSubheading>Key Considerations</SbSubheading>
```

Note: Plain `## Heading` and `### Subheading` markdown also works — they are automatically wrapped in `sb-grid` containers by the MDX component overrides. Use `SbHeading`/`SbSubheading` when you need explicit control.

## Flags (Use When / Avoid When)

Two-column flags layout. Icons are automatic: ✓ for use, ✗ for avoid.
```mdx
<SbFlags>
  <SbFlagCol header="Use When">
    <SbFlag type="use">You have significant leverage in negotiations</SbFlag>
    <SbFlag type="use">The project has clear revenue streams</SbFlag>
  </SbFlagCol>
  <SbFlagCol header="Avoid When">
    <SbFlag type="avoid">You are early in your career with limited leverage</SbFlag>
    <SbFlag type="avoid">The project has uncertain commercial potential</SbFlag>
  </SbFlagCol>
</SbFlags>
```
- `SbFlag` type prop: `"use"` (default, ✓ checkmark) or `"avoid"` (✗ cross mark)
- Aim for 4–5 items per column

## Alternatives

Linked list of alternative structures with conditions. Arrow (→) is automatically appended to condition text.
```mdx
<SbAlts>
  <SbAlt condition="If less leverage" name="Net Profit Participation" href="/library/structures/net-profit-participation" />
  <SbAlt condition="If recurring income" name="Royalty Structures" href="/library/structures/royalty-structures" />
  <SbAlt condition="If equity preferred" name="Equity-for-Services" href="/library/structures/equity-for-services" />
</SbAlts>
```
- `href` is optional — omit for items without a linked page
- Do NOT include → in the condition text — the component adds it automatically
- Use exact slugs from the Structure Reference Table above

## Tabbed Tiers (Career Progression)

Tabbed panels with metrics grids and optional progress bars. Used for career tier breakdowns.
```mdx
<SbTabs tabsJson='["Early Career", "Mid-Career", "Established"]'>
  <SbTabPanel>
    <SbTabGrid>
      <SbTabItem label="Rate Multiplier" value="1.5–2x" />
      <SbTabItem label="Project Range" value="$15–50K" />
      <SbTabItem label="Effective Rate" value="$150–300/hr" />
    </SbTabGrid>
    <SbTabBar>
      <SbTabBarRow label="Leverage" pct="25" />
      <SbTabBarRow label="Upside" pct="40" />
    </SbTabBar>
    <SbTabNote>**Focus:** Build proof points and establish precedent at this level.</SbTabNote>
  </SbTabPanel>
  <SbTabPanel>
    <SbTabGrid>
      <SbTabItem label="Rate Multiplier" value="3–5x" />
      <SbTabItem label="Project Range" value="$50–150K" />
      <SbTabItem label="Effective Rate" value="$300–750/hr" />
    </SbTabGrid>
    <SbTabBar>
      <SbTabBarRow label="Leverage" pct="55" />
      <SbTabBarRow label="Upside" pct="65" />
    </SbTabBar>
    <SbTabNote>**Focus:** Narrow specialization. Implement value-based pricing on 25–50% of projects.</SbTabNote>
  </SbTabPanel>
  <SbTabPanel>
    <SbTabGrid>
      <SbTabItem label="Rate Multiplier" value="5–10x" />
      <SbTabItem label="Project Range" value="$150K–2M+" />
      <SbTabItem label="Effective Rate" value="$750–2,500/hr" />
    </SbTabGrid>
    <SbTabBar>
      <SbTabBarRow label="Leverage" pct="85" />
      <SbTabBarRow label="Upside" pct="90" />
    </SbTabBar>
    <SbTabNote>**Focus:** You choose projects — projects don't choose you.</SbTabNote>
  </SbTabPanel>
</SbTabs>
```
- `tabsJson` must be a JSON array string (single quotes around the JSON, double quotes inside)
- Each `SbTabPanel` maps to one tab — always provide content for all three tiers
- `SbTabGrid` items: use 3 metrics relevant to the structure (labels vary per structure)
- `SbTabBar` / `SbTabBarRow` are optional progress bar sections within a panel
- `SbTabNote` is optional inline note, supports **bold** — use `**Focus:**` pattern

## Table

Data table with headers and rows, passed as JSON strings.
```mdx
<SbTable
  headersJson='["Factor", "Gross", "Net", "Modified Gross"]'
  rowsJson='[["Transparency", "High", "Low", "Medium"], ["Risk to Creator", "Low", "High", "Medium"], ["Leverage Required", "High", "Low", "Medium"]]'
/>
```

## Collapsible Cards (Protections / Manipulations)

Accordion-style cards that expand on click. Use for protections, red flags, or manipulation tactics.

**Protections** (normal cards):
```mdx
<SbCards>
  <SbCard label="Audit Rights">
    <SbCardText>Include the right to audit the counterparty's financial records at least once annually.</SbCardText>
    <SbCardText>**Why it matters:** Without audit rights, gross participation can be eroded through misreported revenues.</SbCardText>
  </SbCard>
</SbCards>
```

**Manipulations** (warning cards with ⚠ prefix on numbers):
```mdx
<SbCards>
  <SbCard label="The 'Huge Backend' Lowball" warn="true">
    <SbCardText>**How it works:** Client offers massive backend percentage to justify below-market upfront fee.</SbCardText>
    <SbCardText>**Reality:** The backend rarely materializes at the projected level.</SbCardText>
    <SbCardSub>Sample Response</SbCardSub>
    <SbScript>I appreciate the backend offer, but I need the upfront component to reflect market rates...</SbScript>
  </SbCard>
</SbCards>
```
- `num` is optional — auto-generates "01", "02" etc. from order
- `warn="true"` adds ⚠ warning triangle before the number (for manipulations/red flags)
- `SbCardText` wraps paragraphs inside cards — supports **bold**
- `SbCardSub` renders a small uppercase label (e.g., "Sample Response")
- `SbScript` can be nested inside cards for sample negotiation language
- Aim for 3–5 protections and 3–5 manipulations per structure

## Script (Copy-to-Clipboard)

Negotiation script block with a copy button. Can be used standalone or nested inside cards.
```mdx
<SbScript>Based on comparable deals in this space and the value I bring to the project, I'd like to discuss a gross participation arrangement in the range of X–Y percent of first-dollar gross revenue.</SbScript>
```

## Negotiation Tabs

Tabbed scenario panels for different leverage positions. Each panel has labeled rows. **Always bold the opening phrase** of each row value.
```mdx
<SbNeg tabsJson='["High Leverage", "Moderate", "Low Leverage"]'>
  <SbNegPanel>
    <SbNegRow label="Position">**Stand firm on rates** — no discounting. Negotiate favorable payment terms.</SbNegRow>
    <SbNegRow label="Add">**Include performance bonuses** or backend options. Position for equity conversation.</SbNegRow>
    <SbNegRow label="Signal">**Client has urgent deadline,** referral from trusted source, competing demand.</SbNegRow>
  </SbNegPanel>
  <SbNegPanel>
    <SbNegRow label="Position">**Focus on differentiation,** not price matching. Offer scope flexibility.</SbNegRow>
    <SbNegRow label="Add">**Propose retainer** or multi-project agreements.</SbNegRow>
    <SbNegRow label="Signal">**Multiple qualified alternatives exist,** but client has engaged with your process.</SbNegRow>
  </SbNegPanel>
  <SbNegPanel>
    <SbNegRow label="Position">**Walk away** if margin becomes unsustainable. Reduce scope, not rate.</SbNegRow>
    <SbNegRow label="Add">**Offer a smaller engagement** as proof-of-concept.</SbNegRow>
    <SbNegRow label="Signal">**You need the client more than they need you.** Don't discount — restructure.</SbNegRow>
  </SbNegPanel>
</SbNeg>
```
- Always use exactly three tabs: "High Leverage", "Moderate", "Low Leverage"
- Always use exactly three rows per panel: Position, Add, Signal
- Each row value starts with **bold phrase** then detail

## Decision Matrix

Score-based decision matrix. Place below the negotiation tabs in the same section.
```mdx
<SbSubheading>Decision Matrix</SbSubheading>

<SbMatrix title="When to Push for Maximum Premium">
  <SbMatrixRow score="8–10" desc="Urgent timeline, referral, rare expertise" action="Full premium rates, add backend/equity options" />
  <SbMatrixRow score="5–7" desc="Interested but comparing options" action="Differentiate on value, offer scope flexibility" />
  <SbMatrixRow score="1–4" desc="Price-sensitive, multiple alternatives" action="Reduce scope (not rate) or walk away" />
</SbMatrix>
```
- The `SbSubheading` says "Decision Matrix" — don't repeat it in the `title` prop
- `title` prop = just the context (e.g., "When to Push for Gross", "When to Accept Net Terms")
- Always three rows: 8–10 (high), 5–7 (moderate), 1–4 (low)

## Chart

Animated horizontal bar chart. Bars animate on scroll into view.
```mdx
<SbChart title="Standard vs. Premium Positioning — Same 120 Hours">
  <SbChartRow label="Premium (Value-Based)" value="$75,000" pct="100" />
  <SbChartRow label="Standard (Hourly)" value="$18,000" pct="24" />
</SbChart>
```
- `pct` is a string 0–100. The highest bar should be "100", others proportional.

## Value Image

Parallax hero image with cover cropping.
```mdx
<SbImage src="/images/structures/gross-participation-value.jpg" alt="Revenue flow diagram" />
```

## Example Use Cases (Fictional)

Collapsible fictional case study cards. **IMPORTANT: All cases must be fictional with invented names.**

Label format: `"Case 01 · Industry · Career Stage"` (with centered dots ·)
```mdx
<SbHeading>Example Use Cases</SbHeading>

How three creatives at different career stages applied this structure — and what happened.

<SbCase label="Case 01 · Design · Mid-Career" name="Mara Chen — Brand Identity Designer" tag="Design" outcome="4.2x rate improvement">
  <SbCaseText>Mara had been freelancing for 6 years at $150/hour when she decided to specialize exclusively in brand systems for Series A startups.</SbCaseText>
  <SbCaseText>**The shift:** She stopped quoting hourly rates entirely. Her first value-based project: **$65,000** for a "fundraising-ready brand system."</SbCaseText>
  <SbCaseText>**Key insight:** The specialization gave her proof points to price against the client's outcome rather than her time.</SbCaseText>
</SbCase>

<SbCase label="Case 02 · Film · Emerging" name="David Okafor — Motion Designer" tag="Film" outcome="$8K to $45K per project">
  <SbCaseText>David narrowed his focus to title sequences for independent film, developing a distinctive visual language.</SbCaseText>
  <SbCaseText>**Key insight:** By owning a narrow niche, he eliminated competition on price.</SbCaseText>
</SbCase>
```
- `tag` and `outcome` appear in the collapsed header row
- `SbCaseText` wraps each paragraph inside the expanded body — supports **bold**
- Always include 2–3 cases with different career stages and industries
- Use pattern: setup paragraph, **The shift:** paragraph, **Key insight:** paragraph

## Related Structures

Grid of linked related structure cards. Always include 3–4 related structures.
```mdx
<SbRelated>
  <SbRelatedCard num="2" title="Retainer + Bonus Model" desc="Stable income with performance upside." href="/library/structures/retainer-bonus-model" />
  <SbRelatedCard num="4" title="Advisory / Consultant Model" desc="Charging for judgment, not execution." href="/library/structures/advisory-consultant-model" />
</SbRelated>
```
- `num` renders as "Structure #02" etc.
- `href` — use exact slugs from the Structure Reference Table above
- `desc` — one sentence explaining the relationship/when to use this alternative

## Full Structure Template

Here is a complete template showing how all components fit together. Every section is required unless noted.

```mdx
---
title: "Structure Name"
slug: structure-name
type: structure
subtype: compensation
number: 1
risk: "MODERATE"
stage: "REVENUE"
excerpt: "Brief description for listing pages."
tags: [compensation, revenue]
access: member
sortOrder: 1
published: true
updatedAt: "2026-02-26"
category: "Revenue / Profit Participation"
tagline: "One-line description of what this structure achieves — written as a complete sentence."
stats:
  - { label: "Risk Profile", value: "Moderate" }
  - { label: "Asset Class", value: "Revenue" }
  - { label: "Time to Value", value: "6–18 months" }
  - { label: "Best For", value: "Target audience" }
sections:
  - { id: "overview", label: "Overview" }
  - { id: "tiers", label: "Career Tiers" }
  - { id: "when-to-use", label: "When to Use" }
  - { id: "protect", label: "Protections" }
  - { id: "manipulations", label: "Manipulations" }
  - { id: "negotiate", label: "Negotiate" }
  - { id: "value", label: "Value Example" }
  - { id: "cases", label: "Case Studies" }
  - { id: "related", label: "Related" }
---

<SbSection id="overview">

<SbHeading>Overview</SbHeading>

Opening paragraph explaining the structure. **Bold** for emphasis on key numbers or concepts.

Second paragraph with more context about when and why this structure matters in the creative economy.

Third paragraph describing the strategic advantage and how it connects to other structures in the system.

</SbSection>

<SbSection id="tiers">

<SbHeading>Career Tiers</SbHeading>

<SbTabs tabsJson='["Early Career", "Mid-Career", "Established"]'>
  <SbTabPanel>
    <SbTabGrid>
      <SbTabItem label="Metric A" value="Value" />
      <SbTabItem label="Metric B" value="Value" />
      <SbTabItem label="Metric C" value="Value" />
    </SbTabGrid>
    <SbTabBar>
      <SbTabBarRow label="Leverage" pct="25" />
      <SbTabBarRow label="Upside" pct="40" />
    </SbTabBar>
    <SbTabNote>**Focus:** Guidance for this career stage.</SbTabNote>
  </SbTabPanel>
  <SbTabPanel>
    <SbTabGrid>
      <SbTabItem label="Metric A" value="Value" />
      <SbTabItem label="Metric B" value="Value" />
      <SbTabItem label="Metric C" value="Value" />
    </SbTabGrid>
    <SbTabBar>
      <SbTabBarRow label="Leverage" pct="55" />
      <SbTabBarRow label="Upside" pct="65" />
    </SbTabBar>
    <SbTabNote>**Focus:** Guidance for this career stage.</SbTabNote>
  </SbTabPanel>
  <SbTabPanel>
    <SbTabGrid>
      <SbTabItem label="Metric A" value="Value" />
      <SbTabItem label="Metric B" value="Value" />
      <SbTabItem label="Metric C" value="Value" />
    </SbTabGrid>
    <SbTabBar>
      <SbTabBarRow label="Leverage" pct="85" />
      <SbTabBarRow label="Upside" pct="90" />
    </SbTabBar>
    <SbTabNote>**Focus:** Guidance for this career stage.</SbTabNote>
  </SbTabPanel>
</SbTabs>

</SbSection>

<SbSection id="when-to-use">

<SbHeading>When to Use This Structure</SbHeading>

<SbFlags>
  <SbFlagCol header="Use When">
    <SbFlag type="use">Condition one</SbFlag>
    <SbFlag type="use">Condition two</SbFlag>
    <SbFlag type="use">Condition three</SbFlag>
    <SbFlag type="use">Condition four</SbFlag>
    <SbFlag type="use">Condition five</SbFlag>
  </SbFlagCol>
  <SbFlagCol header="Avoid When">
    <SbFlag type="avoid">Condition one</SbFlag>
    <SbFlag type="avoid">Condition two</SbFlag>
    <SbFlag type="avoid">Condition three</SbFlag>
    <SbFlag type="avoid">Condition four</SbFlag>
    <SbFlag type="avoid">Condition five</SbFlag>
  </SbFlagCol>
</SbFlags>

<SbSubheading>Alternatives</SbSubheading>

<SbAlts>
  <SbAlt condition="If condition A" name="Alternative Structure" href="/library/structures/slug" />
  <SbAlt condition="If condition B" name="Another Structure" href="/library/structures/slug" />
  <SbAlt condition="If condition C" name="Third Alternative" href="/library/structures/slug" />
</SbAlts>

</SbSection>

<SbSection id="protect">

<SbHeading>Key Protections</SbHeading>

Brief intro paragraph setting context for the protections that follow. Mention how many and why they matter.

<SbCards>
  <SbCard label="Protection Name">
    <SbCardText>Description of this protection and why it matters.</SbCardText>
    <SbCardText>**Why it matters:** Consequence of not having this protection.</SbCardText>
  </SbCard>
  <SbCard label="Second Protection">
    <SbCardText>Description.</SbCardText>
    <SbCardText>**Why it matters:** Explanation.</SbCardText>
  </SbCard>
</SbCards>

</SbSection>

<SbSection id="manipulations">

<SbHeading>Common Manipulations</SbHeading>

Brief intro paragraph. Name the number of tactics and set context for why knowing them matters.

<SbCards>
  <SbCard label="Manipulation Name" warn="true">
    <SbCardText>**How it works:** Description of the manipulation tactic.</SbCardText>
    <SbCardText>**Reality:** Why this tactic is harmful and what actually happens.</SbCardText>
    <SbCardSub>Sample Response</SbCardSub>
    <SbScript>Sample negotiation language to counter this manipulation.</SbScript>
  </SbCard>
  <SbCard label="Second Manipulation" warn="true">
    <SbCardText>**How it works:** Description.</SbCardText>
    <SbCardText>**Reality:** Explanation.</SbCardText>
    <SbCardSub>Sample Response</SbCardSub>
    <SbScript>Counter language.</SbScript>
  </SbCard>
</SbCards>

</SbSection>

<SbSection id="negotiate">

<SbHeading>Negotiation</SbHeading>

Your leverage determines your strategy. Three approaches based on how much the counterparty needs you specifically.

<SbNeg tabsJson='["High Leverage", "Moderate", "Low Leverage"]'>
  <SbNegPanel>
    <SbNegRow label="Position">**Bold opening phrase** followed by detail.</SbNegRow>
    <SbNegRow label="Add">**Bold opening phrase** followed by detail.</SbNegRow>
    <SbNegRow label="Signal">**Bold opening phrase** followed by detail.</SbNegRow>
  </SbNegPanel>
  <SbNegPanel>
    <SbNegRow label="Position">**Bold opening phrase** followed by detail.</SbNegRow>
    <SbNegRow label="Add">**Bold opening phrase** followed by detail.</SbNegRow>
    <SbNegRow label="Signal">**Bold opening phrase** followed by detail.</SbNegRow>
  </SbNegPanel>
  <SbNegPanel>
    <SbNegRow label="Position">**Bold opening phrase** followed by detail.</SbNegRow>
    <SbNegRow label="Add">**Bold opening phrase** followed by detail.</SbNegRow>
    <SbNegRow label="Signal">**Bold opening phrase** followed by detail.</SbNegRow>
  </SbNegPanel>
</SbNeg>

<SbSubheading>Decision Matrix</SbSubheading>

<SbMatrix title="Context-Specific Title for This Structure">
  <SbMatrixRow score="8-10" desc="High leverage scenario" action="Recommended action" />
  <SbMatrixRow score="5-7" desc="Moderate leverage scenario" action="Recommended action" />
  <SbMatrixRow score="1-4" desc="Low leverage scenario" action="Recommended action" />
</SbMatrix>

</SbSection>

<SbSection id="value">

<SbHeading>Example Value Calculation: [Character Name]'s [Deal Type]</SbHeading>

[Character name] is a [role] with [X] years of experience. [Scenario setup that shows why this structure matters]. Same deliverables, same timeline — but two completely different outcomes.

<SbChart title="Descriptive Chart Title — Context">
  <SbChartRow label="With Structure" value="$75,000" pct="100" />
  <SbChartRow label="Without Structure" value="$18,000" pct="24" />
</SbChart>

**Without the structure:** Description of the standard/worse outcome with specific numbers.

**With the structure:** Description of the improved outcome with specific numbers and rationale.

**What changed:** What the character did differently to achieve the better outcome.

</SbSection>

<SbSection id="cases">

<SbHeading>Example Use Cases</SbHeading>

How three creatives at different career stages applied this structure — and what happened.

<SbCase label="Case 01 · Industry · Career Stage" name="Fictional Name — Role Title" tag="Industry" outcome="Quantified outcome">
  <SbCaseText>Setup paragraph describing the character's situation before applying the structure.</SbCaseText>
  <SbCaseText>**The shift:** What they did differently and the specific deal terms they negotiated.</SbCaseText>
  <SbCaseText>**Key insight:** The transferable lesson from this case.</SbCaseText>
</SbCase>

<SbCase label="Case 02 · Industry · Career Stage" name="Fictional Name — Role Title" tag="Industry" outcome="Quantified outcome">
  <SbCaseText>Setup paragraph.</SbCaseText>
  <SbCaseText>**The shift:** What changed.</SbCaseText>
  <SbCaseText>**Key insight:** Lesson learned.</SbCaseText>
</SbCase>

<SbCase label="Case 03 · Industry · Career Stage" name="Fictional Name — Role Title" tag="Industry" outcome="Quantified outcome">
  <SbCaseText>Setup paragraph.</SbCaseText>
  <SbCaseText>**The shift:** What changed.</SbCaseText>
  <SbCaseText>**Key insight:** Lesson learned.</SbCaseText>
</SbCase>

</SbSection>

<SbSection id="related">

<SbHeading>Related Structures</SbHeading>

<SbRelated>
  <SbRelatedCard num="2" title="Related Structure" desc="Brief context for when to use this alternative." href="/library/structures/slug" />
  <SbRelatedCard num="4" title="Another Structure" desc="Brief context." href="/library/structures/slug" />
  <SbRelatedCard num="17" title="Third Structure" desc="Brief context." href="/library/structures/slug" />
  <SbRelatedCard num="22" title="Fourth Structure" desc="Brief context." href="/library/structures/slug" />
</SbRelated>

</SbSection>
```
