# In Sequence Design System

A comprehensive visual and editorial design reference for producing branded artifacts — interior book pages, print collateral, slide decks, social graphics, and any other materials that should feel like they belong to the In Sequence world.

---

## 1. Brand Essence

**In Sequence** is a membership platform ($89/yr) teaching creative professionals how to structure deals for long-term value capture. The brand sits at the intersection of editorial sophistication and practitioner credibility — it's a trusted advisor, not a flashy guru.

**Design philosophy:** Minimal, typographically driven, editorially restrained. The visual system communicates authority through whitespace, precision, and quiet confidence — never through decoration, color saturation, or visual noise.

**If In Sequence were a physical object:** A beautifully typeset hardcover with an uncoated matte cover, no dust jacket, debossed title. Think Kinfolk meets Harvard Business Review.

---

## 2. Color Palette

### Primary Colors

| Role | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Background** | `#f5f3f0` | 245, 243, 240 | Page backgrounds, canvas — warm off-white with slight beige undertone |
| **Black** | `#1a1a1a` | 26, 26, 26 | Headlines, primary text, high-contrast elements — never pure `#000` |
| **White** | `#ffffff` | 255, 255, 255 | Cards, content surfaces, reverse text on dark |

### Text Colors

| Role | Hex | Usage |
|------|-----|-------|
| **Primary text** | `#1a1a1a` | Headlines, titles, emphasis |
| **Body text** | `#555555` | Running copy, descriptions |
| **Secondary text** | `#999999` | Labels, metadata, captions, supporting info |

### Structural Colors

| Role | Hex / Value | Usage |
|------|-------------|-------|
| **Border** | `#d9d6d1` | Dividers, card borders, table rules |
| **Subtle background** | `rgba(0,0,0,0.035)` | Input fields, hover states, tinted surfaces |
| **Grid overlay** | `rgba(0,0,0,0.055)` | Decorative column lines |
| **Shadow** | `rgba(0,0,0,0.08)` | Elevated elements (dropdowns, modals) |

### Accent / Dark Backgrounds

For premium CTAs, hero sections, and high-value moments:

- **Rich dark gradient**: Conic gradients blending `#1a1a1a` with muted teal-blue tones (`#335050`, `#354a60`, `#363b5e`)
- These appear sparingly — reserved for pricing, CTAs, and landing page hero moments
- On dark backgrounds, text is white at varying opacities: headlines at `rgba(255,255,255,0.92)`, body at `rgba(255,255,255,0.6)`

### Color Rules

- **No bright accent colors.** The palette is intentionally neutral/warm.
- **No pure black.** Always `#1a1a1a` (soft black).
- **No saturated colors** for UI elements. Color comes from content (photos, illustrations), not chrome.
- The only "color" accent is a burnt orange notification dot (`#9a3412`) and a coral error state (`#c44`), both used extremely sparingly.

---

## 3. Typography

### Font Families

| Font | Role | Fallbacks |
|------|------|-----------|
| **Geist** (sans-serif) | Primary — headings, body, all running text | -apple-system, system-ui, sans-serif |
| **PT Mono** (monospace) | UI labels, metadata, buttons, navigation, table headers | monospace |

**Note for print/offline use:** Geist is a Vercel open-source typeface (available via Google Fonts or direct download). PT Mono is a Google Font. For print where Geist isn't available, **Inter** or **Suisse Int'l** are the closest substitutes. For PT Mono, **IBM Plex Mono** works.

### Type Scale

#### Headlines & Display

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **Hero title** | 80–160px (fluid) | 400 | 0.82 | -0.06em |
| **Page title** | 56–110px (fluid) | 300 | 0.9 | -0.05em |
| **Section heading (h2)** | 28–44px (fluid) | 300 | 1.1–1.3 | -0.025em |
| **Article heading** | 32–52px (fluid) | 300 | 1.08 | -0.035em |
| **Subsection heading** | 24px | 500 | 1.2 | -0.02em |
| **Card title** | 16–20px | 500 | 1.3 | -0.01em |

#### Body & Content

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **Intro/lede text** | 17px | 400 | 1.55–1.75 | -0.01em |
| **Body text** | 15px | 400 | 1.65–1.75 | normal |
| **Small body** | 13–14px | 400 | 1.5 | normal |

#### Labels & Metadata (PT Mono)

| Element | Size | Weight | Line Height | Letter Spacing | Transform |
|---------|------|--------|-------------|----------------|-----------|
| **Navigation / buttons** | 10px | 400 | 1 | 0.1em | uppercase |
| **Table headers** | 9px | 400 | 1.4 | 0.1em | uppercase |
| **Tags / badges** | 9px | 400 | 1.5 | 0.12em | uppercase |
| **Metric labels** | 9px | 400 | 1.4 | 0.1em | uppercase |

#### Special

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **Pull quote** | 28–44px (fluid) | 300 | 1.3 | -0.025em |
| **Metric value** | 36–64px (fluid) | 200 | 0.9 | -0.04em |
| **Drop cap** | 72px | 200 | — | — |

### Typography Rules

- **Headlines are always light-weight** (200–300) with tight letter-spacing. This is the brand's most distinctive typographic trait.
- **Body text is always regular weight** (400) in the mid-gray (`#555`).
- **Emphasis within body** uses weight 500 in `#1a1a1a`, not italic.
- **Monospace labels are always uppercase** with wide letter-spacing (+0.1em) in the lightest gray (`#999`).
- **Never bold (700+) anything.** The heaviest weight in the system is 600, used only for pricing figures.
- **Negative letter-spacing scales with size.** Bigger text = tighter tracking.

---

## 4. Spacing & Layout

### Grid System

The website uses an **8-column grid** with:
- **Gutter**: 25px between columns
- **Margin**: 50px page edges (desktop)
- **Content typically spans columns 2–7** (centered within the 8-column grid)

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| **Section gap** | 48px | Between major content sections |
| **Subsection gap** | 24px | Between related content blocks |
| **Element gap** | 16px | Between individual elements within a block |
| **Gutter** | 25px | Column gaps |
| **Margin** | 50px | Page edges |

### Common Padding

| Context | Value |
|---------|-------|
| **Section vertical** | 80–120px |
| **Card / container** | 40px |
| **Small card** | 24px |
| **Button** | 9px 14px (standard), 10px 24px (large) |

### Spacing Philosophy

- **Generous whitespace is core to the brand.** When in doubt, add more space, not less.
- Content breathes. Sections are separated by substantial vertical space.
- The grid provides structure but isn't rigid — content can break the grid for emphasis (e.g., pull quotes spanning wider).

---

## 5. Component Patterns

### Buttons

- **Font**: PT Mono, 10px, uppercase, 0.1em letter-spacing
- **Padding**: 9px 14px
- **Border**: 1px solid
- **Border radius**: 4px
- **Variants**:
  - **Default**: Transparent background, `#1a1a1a` border and text. On hover, inverts to black background with white text.
  - **Filled**: Black background, white text. Slight opacity reduction on hover.
  - **White** (on dark): White text with `rgba(255,255,255,0.2)` border.

### Cards

- **Background**: White (`#fff`)
- **Border**: 1px solid `#d9d6d1`
- **Border radius**: 4–6px
- **Padding**: 24–40px
- **Shadow**: None at rest; `0 4px 16px rgba(0,0,0,0.08)` when elevated
- **Hover**: Border darkens slightly to `rgba(0,0,0,0.12)`, background shifts to white

### Tables

- **Header row**: PT Mono, 9px, uppercase, `#999` color
- **Cell text**: 14px Geist, `#555`
- **Cell padding**: 14px 16px
- **Borders**: 1px solid `rgba(0,0,0,0.04)` — extremely subtle
- **Hover row**: `rgba(0,0,0,0.015)` background
- **First column**: Bold / darker than others

### Metrics / Stats Display

- **Value**: 36–64px, weight 200 (ultralight), `#1a1a1a`
- **Label**: 9px mono, uppercase, `#999`
- **Layout**: Grid of cards, white background, 32px padding
- **This is a signature pattern** — big light numbers with tiny uppercase labels below

### Pull Quotes

- **Top border**: 2px solid `#1a1a1a`
- **Text**: 28–44px, weight 300, `#1a1a1a`
- **Attribution**: 9px mono, uppercase, `#999`, margin-top 20px
- **Width**: Spans wider than body text (breaks the content column)

### Accordion / Expandable Cards

- **Full border** around container
- **Divider** between items: 1px solid `#d9d6d1`
- **Head padding**: 20px 24px
- **Body padding**: 0 24px 28px
- **Animation**: Smooth expand with `cubic-bezier(0.22, 1, 0.36, 1)`
- **Toggle icon**: Plus sign that rotates 45 degrees to become an X

### Badges / Tags

- **Font**: PT Mono, 9px, uppercase
- **Padding**: 6px 10px
- **Border**: 1px solid `#d9d6d1`
- **Border radius**: 3px (rectangular) or 100px (pill)
- **Featured variant**: Black background, white text

---

## 6. Visual Elements & Imagery

### Photography Style

- Documentary / editorial in feel
- Muted, natural tones — no heavy color grading or oversaturation
- Portraiture uses warm, even lighting
- Environmental shots favor architecture, workspaces, landscapes

### Decorative Elements

- **Grid overlay**: Subtle vertical column lines (`rgba(0,0,0,0.055)`) used as a background texture on landing pages
- **Conic gradients**: Rich, dark gradients used behind premium CTAs — never garish
- **No icons or illustrations** in the current system beyond utility SVGs
- **No decorative borders, ornaments, or flourishes**

### Data Visualization

- **Bar charts**: Horizontal bars with labels left, values right. Bars animate from 0% width.
- **Org charts**: Hierarchical tree layout with 1px connecting lines
- **Flywheel diagrams**: SVG-based, centered, white card background

### Border Radius

| Context | Value |
|---------|-------|
| **Buttons, cards, images, inputs** | 4px |
| **Larger containers, modals** | 6px |
| **Pill badges** | 100px |
| **Avatars** | 50% (circular) |

**Note**: The brand uses a very subtle border radius — almost square. This is intentional and editorial. Never use large rounded corners (12px+).

---

## 7. Navigation & Chrome

- **Fixed navigation** with backdrop blur (`blur(16px)`) and semi-transparent background (`rgba(245,243,240,0.92)`)
- **Logo**: "IN SEQUENCE" in PT Mono, 10px, uppercase, 0.1em letter-spacing — text only, no icon
- **Nav links**: PT Mono, 10px, uppercase, `#999` default, `#1a1a1a` on hover/active
- **Avatar**: 30px circle, black background, white initial

---

## 8. Animation & Motion

- **Reveal animations**: Elements fade in and slide up 14px, 0.5s ease
- **Stagger**: Sequential items delay by 0.06s increments
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` — smooth, slightly bouncy deceleration
- **General philosophy**: Motion is subtle, functional, and never flashy. Elements enter; they don't dance.

---

## 9. Voice & Tone (Summary)

Detailed in `voice-guide.md`. Key principles for design:

- **Practitioner, not professor.** Authority earned through experience, not credentials.
- **Economical.** Every word (and every visual element) does work. No decoration for its own sake.
- **Systems thinking.** Content reveals patterns and structures, not just stories.
- **Humble authority.** Confident without arrogance. Shows work, admits uncertainty.
- **No emoji. No exclamation points. No forced enthusiasm.**

---

## 10. Applying the System to Print & Offline Artifacts

### Interior Book Pages

- **Body text**: 10–11pt Geist (or Inter), regular weight, 14–16pt leading, `#555555`
- **Chapter titles**: 36–48pt, weight 300, `#1a1a1a`, tight letter-spacing (-0.04em)
- **Section heads**: 18–24pt, weight 300, `#1a1a1a`
- **Running headers/folios**: 7–8pt PT Mono (or IBM Plex Mono), uppercase, `#999`, 0.1em tracking
- **Pull quotes**: 18–24pt, weight 300, 2pt top rule in `#1a1a1a`
- **Margins**: Generous — at minimum 1" inner, 0.75" outer, 1" top/bottom on a 6x9 trim
- **Paper tone**: Warm/cream stock, not bright white (matches the `#f5f3f0` digital background)

### Slide Decks

- **Background**: `#f5f3f0` (warm off-white) or `#1a1a1a` (dark) for emphasis slides
- **Title slides**: Large (48–72pt), weight 300, tight tracking
- **Body slides**: 16–20pt body, generous margins, left-aligned
- **Stats/metrics**: Use the big-number-small-label pattern (48pt value / 9pt mono label)
- **Avoid**: Bullet point slides. Use one idea per slide with supporting visual.

### Social Graphics

- **Canvas**: `#f5f3f0` background
- **Text**: `#1a1a1a`, weight 300–400, large and letterspaced
- **Overlay pattern**: The 8-column grid lines as a subtle background element
- **Format**: Headline (5–10 words) + subline (10–15 words). No more.

### Print Collateral (One-pagers, Brochures)

- **Grid**: Adapt the 8-column system to print — e.g., 4-column grid with 4mm gutters on A4/Letter
- **Color**: Stay within palette. Print on warm/uncoated stock when possible.
- **Data displays**: Use the metric card pattern (big number + mono label)
- **Tables**: Minimal rules, mono headers, generous cell padding

---

## 11. What This Brand Is NOT

- Not colorful. Not playful. Not "tech startup."
- Not corporate. Not stiff. Not presentation-deck generic.
- Not maximalist. Not illustrated. Not icon-heavy.
- Not trendy. Not gradient-heavy (except the specific dark CTA gradient).
- Not loud. The brand whispers with authority.

---

## Quick Reference Card

```
COLORS
  Background:  #f5f3f0    Black:       #1a1a1a
  Body text:   #555555    Light text:  #999999
  Border:      #d9d6d1    White:       #ffffff

FONTS
  Headlines:   Geist, weight 300, tight tracking
  Body:        Geist, weight 400, 15px/1.7
  Labels:      PT Mono, 9-10px, uppercase, +0.1em tracking

SPACING
  Section:     48px       Subsection:  24px
  Element:     16px       Margin:      50px

RADIUS
  Standard:    4px        Large:       6px       Pill: 100px

SHADOWS
  Elevated:    0 4px 16px rgba(0,0,0,.08)
```
