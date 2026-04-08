# Article MDX Conversion Reference

Instructions for converting article markdown files into MDX format for the In Sequence platform.

---

## How It Works

Articles use the `ab-*` (article body) CSS class system. The page shell (header, hero image, author byline, related articles, CTA, newsletter) is rendered automatically by the page component from frontmatter. **You only write the article body content in MDX.**

Regular markdown paragraphs are automatically wrapped in `.ab-grid > .ab-p` by the MDX component system. You don't need to do anything special for plain paragraphs — just write them as normal markdown.

---

## Frontmatter

Every article MDX file starts with YAML frontmatter. All fields shown below:

```yaml
---
title: "The Full Article Title: Including Any Subtitle"
slug: the-article-slug
type: article
category: thesis
tag: "[THESIS]"
date: "2026-02-18"
excerpt: "One-sentence summary for cards and meta descriptions."
readTime: 12
author: Neil Brown
authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=112&h=112&fit=crop&crop=face"
authorBio: "Researcher and strategist studying the restructuring of the creative economy. Author of the In Sequence thesis and library of 35 deal structures. Based in Chattanooga, TN."
heroImage: "https://images.unsplash.com/photo-XXXXX?w=1400&h=560&fit=crop&crop=center"
tags: [tag-one, tag-two, tag-three]
access: public
relatedArticles:
  - other-article-slug
  - another-article-slug
relatedStructures: [12, 23]
published: true
updatedAt: "2026-02-18"
---
```

### Field Notes

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Full title in quotes. Include subtitle after colon if applicable. |
| `slug` | Yes | URL-safe lowercase, matches filename (without `.mdx`). |
| `type` | Yes | Always `article`. |
| `category` | Yes | One of: `thesis`, `practitioners`, `case-studies`, `deal-structures`. |
| `tag` | Yes | Display tag in brackets: `"[THESIS]"`, `"[PRACTITIONER]"`, `"[CASE STUDY]"`, `"[DEAL STRUCTURE]"`. |
| `date` | Yes | ISO date string in quotes: `"2026-02-18"`. |
| `excerpt` | Yes | One sentence, under 200 chars. Used on cards and in meta. |
| `readTime` | Yes | Integer (minutes). No quotes — it's a number. |
| `author` | Yes | Author name, no quotes needed. |
| `authorImage` | No | Square crop URL (`w=112&h=112&fit=crop&crop=face`). |
| `authorBio` | No | One sentence in quotes. |
| `heroImage` | No | Wide crop URL (`w=1400&h=560&fit=crop`). Used as article header image. |
| `tags` | Yes | Array of lowercase kebab-case tags for footer display. |
| `access` | Yes | `public` or `member`. |
| `relatedArticles` | No | Array of slugs (up to 3). Renders "Continue Reading" section. |
| `relatedStructures` | No | Array of structure numbers (integers). Renders "Library" CTA. |
| `published` | Yes | `true` or `false`. |
| `updatedAt` | Yes | ISO date in quotes. |

### Categories

| Category | Tag | Content Type |
|----------|-----|-------------|
| `thesis` | `[THESIS]` | Core platform thesis pieces — the big ideas. |
| `practitioners` | `[PRACTITIONER]` | Profiles of creatives who restructured their careers. |
| `case-studies` | `[CASE STUDY]` | Deep dives on specific companies/collectives. |
| `deal-structures` | `[DEAL STRUCTURE]` | Analysis of specific deal structure patterns. |

---

## Available MDX Components

### 1. DropCap

Opening paragraph with a large drop capital letter. Use this for the **first paragraph only**.

```mdx
<DropCap>
Opening paragraph text goes here. This should be 2-4 sentences that set up the article's thesis. The first letter will be rendered as a large drop cap.
</DropCap>
```

- Children: Plain text + inline markdown (`**bold**`, `*italic*`).
- Only use once, at the very start of the article body.

---

### 2. Subhead

Section headings (renders as `<h2>`). Use to divide the article into major sections.

```mdx
<Subhead>The Section Title Goes Here</Subhead>
```

- Children: Plain text only (no markdown).
- Use for major structural divisions (typically 3-6 per article).

---

### 3. SmallSubhead

Sub-section headings (renders as `<h3>`). Use within a section for numbered points or sub-topics.

```mdx
<SmallSubhead>1. First Point</SmallSubhead>
```

- Children: Plain text only.
- Use for numbered lists of concepts, sub-arguments, etc.

---

### 4. PullQuote

Highlighted quotation with optional attribution. Breaks the visual rhythm of body text.

```mdx
<PullQuote attribution="From the In Sequence Thesis, Part 3">
The quoted text goes here. Keep it to 1-3 sentences. This should be the most memorable or provocative statement from the surrounding section.
</PullQuote>
```

```mdx
<PullQuote>
A pull quote without attribution.
</PullQuote>
```

- `attribution` prop: Optional string. Rendered with an em-dash prefix.
- Children: Plain text + inline markdown.
- Use 2-4 per article for visual rhythm.

---

### 5. Metrics / Metric

Row of 2-4 key statistics. Rendered as a horizontal grid.

```mdx
<Metrics>
<Metric value="50x" label="Compensation gap between median and top creative professionals" />
<Metric value="73%" label="Of top-tier creative comp comes from ownership, not salary" />
<Metric value="8→2" label="Years for AI to compress the execution-to-judgment transition" />
</Metrics>
```

- `<Metrics>`: Wrapper. Children are `<Metric>` components.
- `<Metric>`: Self-closing. Props:
  - `value` — string, the big number/stat (e.g., `"50x"`, `"73%"`, `"$2.4M"`).
  - `label` — string, description of the metric.
- Use 2-4 Metric items per Metrics block.
- Use 1-2 Metrics blocks per article.

---

### 6. Chart / ChartRow

Horizontal bar chart with labels and values.

```mdx
<Chart title="Chart title describing what's compared">
<ChartRow label="Category A" width="100" display="40–70x" />
<ChartRow label="Category B" width="56" display="10–20x" />
<ChartRow label="Category C" width="28" display="3–5x" />
<ChartRow label="Category D" width="12" display="1x" />
</Chart>
```

- `<Chart>`: Wrapper. Props:
  - `title` — string, chart heading.
- `<ChartRow>`: Self-closing. Props:
  - `label` — string, row label (left side).
  - `width` — string, percentage of bar fill (0-100). The longest bar should be `"100"`.
  - `display` — string, the value shown on the right side.
- Order rows from largest to smallest (or smallest to largest depending on narrative).
- Use 1-2 charts per article.

---

### 7. BreakoutImage

Wide image that breaks out of the text column. Good for data visualizations, diagrams, or atmospheric photos.

```mdx
<BreakoutImage
  src="https://images.unsplash.com/photo-XXXXX?w=1000&h=500&fit=crop"
  alt="Descriptive alt text"
  caption="Source: Attribution or description"
/>
```

- `src` — string, image URL. Use Unsplash with `w=1000&h=500&fit=crop`.
- `alt` — string, accessibility description.
- `caption` — optional string, shown below image in small text.

---

### 8. FullWidthImage

Full-viewport-width image. More dramatic than BreakoutImage. Use for section transitions.

```mdx
<FullWidthImage
  src="https://images.unsplash.com/photo-XXXXX?w=1400&h=480&fit=crop&crop=center"
  alt="Descriptive alt text"
  caption="Caption text below image."
/>
```

- Same props as BreakoutImage.
- Use `w=1400&h=480` for full-width images.
- Use sparingly — 1-2 per article maximum.

---

## Plain Markdown

Regular markdown is automatically styled by the component system:

| Markdown | Renders As |
|----------|-----------|
| Plain paragraph | `.ab-grid > .ab-p` (body text in article column) |
| `**bold**` | `<strong>` (inline, no special wrapping) |
| `*italic*` | `<em>` |
| `## Heading` | `.ab-grid.is-subhead > .ab-h2` (same as `<Subhead>`) |
| `### Heading` | `.ab-grid.is-subhead-sm > .ab-h3` (same as `<SmallSubhead>`) |

**Prefer the explicit `<Subhead>` and `<SmallSubhead>` components** over markdown headings for consistency. Markdown paragraphs are fine as-is.

---

## Critical MDX Rules

1. **Escape `<` in text content.** If the article text contains a less-than symbol before a digit or letter (e.g., `<5%`, `<$100K`), replace with `&lt;`. Inside quoted prop values this is fine — only bare text content needs escaping.

2. **ALL props are strings — including `width` on ChartRow.** Write `width="85"`, not `width={85}`. Curly brace syntax does not work with next-mdx-remote.

3. **No `import` statements.** Components are provided by the MDX component map automatically.

4. **Inline markdown works inside components.** `**bold**` and `*italic*` work inside `<DropCap>`, `<PullQuote>`, and paragraph text. They do NOT work inside prop values.

5. **Self-closing tags need the slash.** `<Metric value="50x" label="Description" />` — note the `/>`.

6. **Blank lines around components.** Always leave a blank line before and after each component block for clean parsing.

7. **No HTML comments.** Use MDX components, not `<!-- comments -->`.

---

## Article Structure Guide

### Typical Thesis Article (~2,000-3,000 words)

```
<DropCap>Opening paragraph</DropCap>

1-2 body paragraphs setting up the problem.

<Subhead>First Major Section</Subhead>

3-4 paragraphs of argument.

<PullQuote attribution="Source">Key quote.</PullQuote>

2-3 more paragraphs.

<Metrics>
<Metric value="X" label="Description" />
<Metric value="Y" label="Description" />
<Metric value="Z" label="Description" />
</Metrics>

1-2 paragraphs interpreting the data.

<BreakoutImage src="..." alt="..." caption="..." />

<Subhead>Second Major Section</Subhead>

<SmallSubhead>1. First Point</SmallSubhead>
2 paragraphs.

<SmallSubhead>2. Second Point</SmallSubhead>
2 paragraphs.

<SmallSubhead>3. Third Point</SmallSubhead>
2 paragraphs.

<Chart title="Comparison">
<ChartRow label="A" width="100" display="Value" />
<ChartRow label="B" width="50" display="Value" />
</Chart>

<PullQuote>Second key quote.</PullQuote>

<Subhead>Third Major Section</Subhead>

3-4 paragraphs connecting back to thesis.

<FullWidthImage src="..." alt="..." caption="..." />

2-3 paragraphs.

<Subhead>Conclusion / Implications</Subhead>

2-3 closing paragraphs.
```

### Typical Practitioner Article (~1,500-2,500 words)

Focus on one creative professional's journey. Structure:

```
<DropCap>Introduce the person and their situation.</DropCap>

Context paragraphs.

<Subhead>The Before</Subhead>
Their career structure before the shift. What wasn't working.

<Metrics>
<Metric value="$X" label="Previous annual income" />
<Metric value="X%" label="Revenue from single client" />
</Metrics>

<Subhead>The Turning Point</Subhead>
What happened. The conversation, the realization, the deal.

<PullQuote attribution="Person's Name">Their words about the shift.</PullQuote>

<Subhead>The Structure</Subhead>
How they restructured. Reference specific deal structures.

<Chart title="Revenue comparison">
<ChartRow label="After" width="100" display="$XXX,XXX" />
<ChartRow label="Before" width="40" display="$XXX,XXX" />
</Chart>

<Subhead>The After</Subhead>
Where they are now. What changed beyond the money.

<BreakoutImage src="..." alt="..." caption="..." />

<Subhead>What Others Can Learn</Subhead>
Transferable insights. 2-3 specific takeaways.
```

### Typical Deal Structure Article (~1,500-2,000 words)

Analysis of a deal pattern. Structure:

```
<DropCap>Set up the problem this structure solves.</DropCap>

<Subhead>How It Works</Subhead>
Mechanics of the deal structure.

<Metrics>
<Metric value="X" label="Typical range" />
<Metric value="X" label="Success rate" />
</Metrics>

<Subhead>When to Use It</Subhead>
Context and conditions.

<PullQuote>Key insight about when this works.</PullQuote>

<Subhead>Real Numbers</Subhead>
Concrete example with financial modeling.

<Chart title="Value comparison">
<ChartRow label="With structure" width="100" display="$XXX" />
<ChartRow label="Without" width="35" display="$XXX" />
</Chart>

<Subhead>Common Mistakes</Subhead>
What goes wrong and how to avoid it.

<Subhead>The Bigger Picture</Subhead>
How this connects to the ownership progression.
```

### Typical Case Study Article (~2,000-3,000 words)

Deep dive on a company or collective:

```
<DropCap>Introduce the company/collective and the core tension.</DropCap>

<Subhead>The Origin</Subhead>
How it started. The founding context.

<BreakoutImage src="..." alt="..." caption="..." />

<Subhead>The Model</Subhead>
How the business/collective is structured.

<Metrics>
<Metric value="X" label="Key metric" />
<Metric value="X" label="Key metric" />
<Metric value="X" label="Key metric" />
</Metrics>

<Subhead>What Makes It Work</Subhead>
Analysis of why the structure succeeds.

<PullQuote>Insight from founders/participants.</PullQuote>

<Chart title="Growth trajectory">
<ChartRow label="Year 3" width="100" display="$X" />
<ChartRow label="Year 1" width="30" display="$X" />
</Chart>

<Subhead>The Tensions</Subhead>
What's hard. The tradeoffs.

<FullWidthImage src="..." alt="..." caption="..." />

<Subhead>Transferable Lessons</Subhead>
What other creatives can take from this.
```

---

## Complete Example

See `content/articles/the-discernment-premium.mdx` for a fully built thesis article demonstrating all components in context.

---

## Article Reference Table

| Slug | Title | Category | Tag | Access |
|------|-------|----------|-----|--------|
| the-discernment-premium | The Discernment Premium: Why Taste Became the Scarcest Asset... | thesis | [THESIS] | public |
| the-triple-convergence | The Triple Convergence: Where Creativity, Cognition, and Capital Collide | thesis | [THESIS] | public |
| the-creative-majority | The Creative Majority: Why Creative Professionals Between $75K and $500K... | thesis | [THESIS] | public |
| revenue-share-vs-equity | Revenue Share vs. Equity: Choosing the Right Ownership Structure | deal-structures | [DEAL STRUCTURE] | public |
| the-performance-kicker | The Performance Kicker: Deal Terms That Align Incentives | deal-structures | [DEAL STRUCTURE] | public |
| from-freelancer-to-co-owner | From Freelancer to Co-Owner: The Four Stages of Creative Compensation | case-studies | [CASE STUDY] | public |
| jeff-jackson | Jeff Jackson: The Artist Desires to Be Understood | practitioners | [PRACTITIONER] | public |
| 2nd-shift-design-co | 2nd Shift Design Co: Building Community Through Craft | case-studies | [CASE STUDY] | public |

---

## Checklist Before Submitting

- [ ] Frontmatter has all required fields
- [ ] `slug` matches the filename (without `.mdx`)
- [ ] `readTime` is an integer (no quotes)
- [ ] `relatedStructures` uses integers in array: `[12, 23]`
- [ ] Article starts with `<DropCap>` for the opening paragraph
- [ ] Sections divided by `<Subhead>` components
- [ ] At least one `<PullQuote>` for visual rhythm
- [ ] At least one `<Metrics>` block with 2-4 metrics
- [ ] Any `<` symbols in text content escaped as `&lt;`
- [ ] `ChartRow` width uses `{number}` syntax
- [ ] Blank lines before and after every component
- [ ] No `import` statements
- [ ] No HTML comments
