# Sequence — Digital Design System

A portable reference for the Sequence product design system. Covers tokens, components, patterns, motion, and composition rules used across the membership platform ([insequence.so](https://insequence.so)).

**Use this doc when:**
- Generating new UI in Claude Design (or similar) that should match Sequence's look
- Onboarding a designer / engineer to the codebase
- Auditing new screens for design-system compliance

For print/collateral brand guidelines (book covers, slides, social), see `content/reference/design-system.md`. This doc is specifically the **digital product system**.

---

## 1. Brand essence

**Sequence** teaches creative professionals how to structure deals for long-term value capture. The product sits at the intersection of editorial sophistication and practitioner credibility — trusted advisor, not flashy guru.

**Design philosophy:** Minimal, typographically driven, editorially restrained. Authority is communicated through whitespace, precision, and quiet confidence. Never decoration, never saturation, never visual noise.

**Physical analogue:** An uncoated matte hardcover with debossed title. Think *Kinfolk* × *Harvard Business Review*.

**Tone of voice:** Grounded, specific, economical. No filler. Systems thinking with storytelling. Never generic, never preachy, never "growth mindset" clichés. Every piece of UI copy should sound like it was written by someone who has done this work, not someone selling a course.

---

## 2. Color tokens

### Primary palette (light mode defaults)

| Token | Hex | Purpose |
|-------|-----|---------|
| `--bg` | `#f5f3f0` | Page background — warm off-white with beige undertone |
| `--black` | `#1a1a1a` | Headlines, primary text, buttons, high-contrast elements. **Never pure `#000`** |
| `--white` | `#ffffff` | Cards, content surfaces, reverse text on dark |

### Text hierarchy

| Token | Hex | Purpose |
|-------|-----|---------|
| (primary) | `#1a1a1a` via `var(--black)` | Headlines, titles, emphasis |
| `--mid` | `#555` | Running copy, descriptions |
| `--light` | `#999` | Labels, metadata, captions, supporting info |

### Structural

| Token | Value | Purpose |
|-------|-------|---------|
| `--border` | `#d9d6d1` | Dividers, card borders, table rules |
| Subtle background | `rgba(0,0,0,0.035)` | Hover states, input fills, tinted surfaces |
| Subtle overlay | `rgba(0,0,0,0.08)` | Stronger borders, chip outlines |

### Semantic / signal

Used for deal evaluator scoring + roadmap status indicators.

| Role | Hex | Usage |
|------|-----|-------|
| Green | `#3d8b55` | Strong / approved / complete |
| Yellow | `#c89333` | Caution / needs attention |
| Red | `#b0413e` | Problems / red flags / misalignments |
| Accent gold | `#b8860b` | Subtle highlight for featured items |

Signal dots in roadmap:
```css
.rdmp-deal-signal--green  { background: #3d8b55; }
.rdmp-deal-signal--yellow { background: #c89333; }
.rdmp-deal-signal--red    { background: #b0413e; }
```

### Dark mode

The portal has a `[data-theme="dark"]` variant that swaps tokens:

```css
[data-theme="dark"] {
  --bg: #111;
  --black: #e8e6e3;    /* INVERTS */
  --white: #1a1a1a;    /* INVERTS */
  --mid: #aaa;
  --light: #666;
  --border: #2a2a2a;
  --grid-line: rgba(255, 255, 255, 0.05);
}
```

**⚠ Critical:** because `var(--white)` flips to near-black in dark mode, **any text that sits on an always-dark surface must hardcode `#ffffff`** — don't use the CSS variable. This catches people constantly.

Always-dark surfaces that hardcode:
- `.cs-gate` (case study paywall gate)
- `.lib-card--dark` (dark gradient cards)
- `.lib-card--cover` (image-backed cards)
- `.btn--white` (button on dark surfaces)
- Stage band in Creative Identity portrait

---

## 3. Typography

### Font families

```css
--sans: 'Geist', -apple-system, system-ui, sans-serif;
--mono: 'PT Mono', ui-monospace, 'SF Mono', monospace;
```

**Sans (Geist)** — all body copy, titles, UI text. Weight range 300–600.

**Mono (PT Mono)** — labels, metadata, chips, section kickers, stage numbers, all-caps labels. Always lowercase letter-spacing.

### Type scale

Consistent across the platform:

| Usage | Size | Weight | Letter-spacing |
|-------|------|--------|----------------|
| Page hero (`<h1>`) | `clamp(44px, 7vw, 84px)` | 300 | `-.03em` |
| Section head (`<h2>`) | `clamp(32px, 4vw, 56px)` | 300 | `-.02em` |
| Card title (`<h3>`) | 22–28px | 500 | `-.02em` |
| Subhead | 18–22px | 500 | `-.01em` |
| Body | 14–15px | 400 | 0 |
| Small / meta | 13px | 400 | 0 |
| Mono label | 10–11px | 400 | `.12em–.14em` uppercase |
| Mono footer | 9–10px | 400 | `.08em–.1em` uppercase |

### Type rules

- **All display type uses light/regular weight** (300–500). Never bold (`700+`) for headlines. Weight is for emphasis within copy, not for titles.
- **Negative letter-spacing on display type** (`-.02em` to `-.03em`) — tightens up at size.
- **Positive letter-spacing on mono labels** (`.1em` to `.14em`) — opens up at small size.
- **Never center body copy.** Only hero titles, CTAs, and labeled metric rows center.
- **Never use text-decoration: underline.** Links use subtle color change on hover. Inline text links use border-bottom when needed.

---

## 4. Spacing + layout

### Grid

- **Public pages:** 8-column grid
- **Portal pages:** 12-column grid (sidebar offset)
- Gutters: `var(--gutter)` = 24px standard
- Margins: `var(--margin)` = 40px (desktop), scales to 24px on mobile

```css
.g8 { display: grid; grid-template-columns: repeat(8, 1fr); gap: var(--gutter); padding: 0 var(--margin); }
```

### Vertical rhythm

- **Section padding:** 80px top (major sections), 48px (sub-sections)
- **Card padding:** 24–32px
- **Card gaps:** 16–24px inside cards; 20–32px between cards
- **Page footer:** 120px+ bottom buffer

### Breakpoints (mobile-first inverted — design at desktop first)

```css
@media (max-width: 1080px) { /* tablet / small laptop */ }
@media (max-width: 860px)  { /* tablet portrait */ }
@media (max-width: 720px)  { /* small tablet */ }
@media (max-width: 640px)  { /* large phone */ }
@media (max-width: 560px)  { /* phone */ }
```

Most grids collapse to single-column or 1→2 at 860px or 720px.

---

## 5. Components

### Buttons

Three primary variants + one for dark surfaces:

```html
<!-- Default: outline on light -->
<button class="btn">CLICK</button>

<!-- Filled: solid black -->
<button class="btn btn--filled">PRIMARY ACTION</button>

<!-- Ghost: lighter outline -->
<button class="btn btn--ghost">SECONDARY</button>

<!-- White: for dark surfaces -->
<button class="btn btn--white">ON DARK</button>

<!-- Large -->
<button class="btn btn--filled btn--lg">HERO CTA</button>
```

**Button spec:**
- Font: `--mono`, 10px, `.1em` letter-spacing, uppercase
- Padding: `9px 14px` (base), `14px 20px` (--lg)
- Border: `1px solid var(--border)`
- Border-radius: `4px`
- Transition: `background .2s, color .2s, border-color .2s`
- Arrow icon (`<ButtonArrow />`) in trailing position

Hover on base/ghost: invert to filled state.

### Cards

**Base card** (`.lib-card`):
```css
padding: 24px;
border: 1px solid var(--border);
border-radius: 6px;
background: var(--bg);
display: flex;
flex-direction: column;
```

**Dark variant** (`.lib-card--dark`) — conic gradient background, white text, hover fade.

**Cover-image variant** (`.lib-card--cover`) — case study cards backed by the case study's cover image. Real `<img>` element inside, dark gradient overlay on top, content over both:

```
Stacking (inside .lib-card--cover):
  z-0: <img class="lib-card-cover-img">   (position: absolute; inset: 0)
  z-1: ::before gradient overlay
  z-2: title / description / tags
```

Overlay gradient at rest: `linear-gradient(to top, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.55) 100%)`. Lightens on hover.

### Badges + chips

**Structure badge** (`.cs-struct-badge`) — canonical pattern for referencing a deal structure inline:

```html
<a class="cs-struct-badge" href="/library/structures/...">
  Structure #29
  <svg>[diagonal arrow icon]</svg>
</a>
```

Spec:
- Font: `--mono` 10px, `.1em` letter-spacing, uppercase
- Padding: `5px 10px`
- Border: `1px solid var(--border)`
- Border-radius: `3px`
- Hover: invert to black background, white text

### Forms

**Input** (`.set-input`):
```css
width: 100%;
padding: 10px 14px;
font-family: var(--sans);
font-size: 14px;
color: var(--black);
background: var(--bg);
border: 1px solid var(--border);
border-radius: 6px;
transition: border-color .2s, background .2s;
```

Focus state: `border-color: var(--black); background: var(--white);`

### Sections

Every major content section follows the same rhythm:

```html
<div class="rdmp-section rv vis rv-d1">
  <div class="rdmp-section-heading">Your Position</div>
  <!-- content -->
</div>
```

The `.rdmp-section-heading` is a mono-style label — functioning like a chapter marker in an editorial layout.

### Tabs

Used in: Settings (Profile | Creative Identity), Portfolio (Assets | Analysis), Roadmap diagrams (Entity Structure | Value Flywheel).

```html
<div class="set-tabs" role="tablist">
  <button class="set-tab set-tab--active">Profile</button>
  <button class="set-tab">Creative Identity</button>
</div>
```

Tab styling: mono label, uppercase, `.14em` letter-spacing. Active tab has bottom border in `--black`, inactive is `--light`. 12–14px padding.

### Progress / loading

Use the shared `<GenerationProgress>` component for any long-running AI task (30–90s Claude calls). Pattern:

- Bordered card, centered, max-width 520px
- Rotating spinner (48px, 3px border)
- Mono label ("PORTFOLIO ANALYSIS" / "CREATIVE IDENTITY" / etc.)
- Large title (22px sans medium)
- Description sentence (14px muted)
- Optional progress bar (determinate) + stage label
- Mono footer note ("Usually ready in under a minute")

Timeout variant: alert-styled icon + apology title + return-to-dashboard CTA.

### Diagrams

Entity Structure and Value Flywheel. Use **theme-aware CSS custom properties**:

```css
.rdmp-diagram-svg-wrap,
.cs-flywheel {
  --diag-parent-bg: #fff;
  --diag-parent-border: #1a1a1a;
  --diag-parent-text: #1a1a1a;
  --diag-child-bg: #f5f5f0;
  --diag-child-border: #d9d6d1;
  --diag-child-text: #1a1a1a;
  --diag-muted-text: #888;
  --diag-line: #d9d6d1;
  --diag-center-bg: #1a1a1a;
  --diag-center-border: rgba(255,255,255,.25);
  --diag-center-text: #fff;
}
```

Dark-theme overrides invert the parent/child bg and push lines to `rgba(255,255,255,.25)`.

SVG elements reference these via `fill="var(--diag-parent-bg)"` etc. **Never hardcode hex in SVG attributes** — breaks dark mode.

---

## 6. Motion

### Reveal on scroll

Class `rv` + IntersectionObserver adds `vis` class when in view:

```css
.rv { opacity: 0; transform: translateY(24px); transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s; }
.rv.vis { opacity: 1; transform: translateY(0); }

.rv-d1 { transition-delay: .08s; }
.rv-d2 { transition-delay: .16s; }
.rv-d3 { transition-delay: .24s; }
/* etc. up to rv-d6 */
```

Stagger elements by applying `rv-d1`, `rv-d2` in order.

### Image reveal (hero)

```css
.anim-reveal-down { clip-path: inset(100% 0 0 0); transition: clip-path .6s cubic-bezier(.22,1,.36,1); }
.anim-reveal-down.vis { clip-path: inset(0 0 0 0); }
```

### Text-up

```css
.anim-text-up { opacity: 0; transform: translateY(20px); transition: opacity .6s, transform .6s; }
.anim-text-up.vis { opacity: 1; transform: translateY(0); }
```

### Hover transitions

- Cards: `.15s` background/border change
- Buttons: `.2s` all
- Spinner: `0.9s` linear infinite
- Overlay fades: `.25s–.3s` ease

### Progress bar

Eased approach-to-90% curve over expected duration:

```js
const eased = 1 - Math.pow(1 - Math.min(elapsed / expected, 1), 2.5);
return Math.min(eased * 90, 90);
```

Never reach 100% until the actual task completes (prevents fake-done look).

---

## 7. Iconography

**All icons are SVG line-art** — never filled shapes, never color. Stroke weight ranges from 0.75 (small diagnostic) to 1.5 (UI icons).

### Icon conventions

- `stroke="currentColor"` — inherits text color
- `fill="none"` by default
- `strokeLinecap="round"` and `strokeLinejoin="round"` for smooth edges
- Typical size: 14–20px for inline UI, 48px for hero graphics
- `viewBox` standardized: `0 0 24 24` for UI, `0 0 48 48` for hero

### Example

```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>
```

### Iconography families in use

- **Navigation / UI:** geometric line icons (dashboard, portfolio, roadmap, evaluate, advisor)
- **Stage / signal:** triangles, rings, dots
- **Archetype sigils:** one unique SVG per archetype (scattered fragments, concentric rings, hub+spokes, nested triangles, grid of cells, ascending bars)
- **Diagrams:** entity boxes, flywheel nodes with arrows, dashed radials

---

## 8. Composition patterns

### Page hero

```html
<section class="page-hero">
  <div class="ph-title"><h1 class="anim-text-up">Page Title</h1></div>
  <div class="ph-meta rv">
    <div class="ph-meta-grid">
      <span class="ph-meta-lbl">[LABEL]</span>
      <p class="ph-meta-desc">Description paragraph.</p>
    </div>
  </div>
</section>
```

### Section with heading

```html
<section class="[section-name]">
  <div class="[section-name]-head">
    <h2 class="anim-text-up">Section Title</h2>
  </div>
  <!-- content -->
</section>
```

### Callout block (big statement)

Used for thesis callouts, key numbers, pull quotes. Example: the "50X" thesis block on the home page.

### Newsletter / subscribe block

Full-width dark image with overlay, large white headline, form on the right.

### Tool card (Platform page)

Feature showcase: label on left column, title + description, then browser-frame-wrapped video on the right. Two-column grid at desktop, stacked mobile.

### Archetype preview card (`.archetype-card`)

Used on the public Platform page to surface 3 Creative Identity archetypes. Single-color card, 1px border, 24–32px padding, with the archetype SVG sigil (120×120 line-art) at top-left, followed by a mono `[ARCHETYPE]` label, sans 22px/500 title, and muted description.

```html
<section class="archetypes">
  <div class="archetypes-head">
    <span class="archetypes-lbl">[CREATIVE IDENTITY]</span>
    <h2>Creative Identity</h2>
    <p class="archetypes-desc">...</p>
  </div>
  <div class="archetypes-grid">
    <div class="archetype-card">
      <div class="archetype-card-sigil"><ArchetypeSigil archetypeId="..." /></div>
      <span class="archetype-card-lbl">[ARCHETYPE]</span>
      <h3 class="archetype-card-title">...</h3>
      <p class="archetype-card-desc">...</p>
    </div>
    <!-- ×3 -->
  </div>
</section>
```

Grid: 3 columns desktop, 2 columns at 860px (last card spans full width), 1 column at 640px. Hover darkens the border. Sigils use `currentColor` so the card text color drives them automatically.

### Archetype sigils — shared component

The 6 archetype SVG marks live in `src/components/shared/archetype-sigil.tsx` and are consumed by both the portal's Creative Identity portrait (`creative-identity-panel.tsx`) and the public Platform page. Always use the shared component — **don't inline SVG markup**. Each sigil is a 140×140 viewBox line-art mark that inherits its color from `currentColor`, so the consuming surface controls theming.

### Two-column content (library, misalignments, vision)

Grid with distinct cards in each column. Collapses to single column below 760px.

### Dashboard CTA card (`.dash-asmt-cta`)

Two-column card used for the major dashboard calls-to-action (Portfolio Audit, Creative Identity). Left column: geometric SVG icon block. Right column: label chip + title + description + time estimate + action pill.

```html
<Link href="/..." class="dash-asmt-cta rv rv-d1">
  <div class="dash-asmt-cta-icon">
    <svg>[geometric icon]</svg>
  </div>
  <div class="dash-asmt-cta-content">
    <div class="dash-asmt-cta-label">Creative Identity</div>
    <h2 class="dash-asmt-cta-title">Define your Creative Identity. Personalize your roadmap.</h2>
    <p class="dash-asmt-cta-desc">A short flow captures your…</p>
    <div class="dash-asmt-cta-footer">
      <span class="dash-asmt-cta-time">
        <svg>[clock icon]</svg>
        ~3 mins
      </span>
      <span class="dash-asmt-cta-btn">
        Build Creative Identity
        <svg>[arrow]</svg>
      </span>
    </div>
  </div>
</Link>
```

Time estimates: use concise form (`~3 mins`, `~minute`), not `~3 minutes`. Mono 10px.

### cs-gate bottom CTA (dark band)

Used in three places: public case-study paywall (`CaseStudyGate`), roadmap advisory CTA (`RoadmapAdvisoryCTA`), book download (`/about`). Dark conic-gradient band with two-column layout — left: label + title + desc + primary CTA button; right: 4-item feature grid.

```html
<div class="cs-gate">
  <div class="cs-gate-content">
    <div class="cs-gate-lbl">1:1 Advisory</div>
    <div class="cs-gate-title">Get help turning this plan into action.</div>
    <div class="cs-gate-desc">Your roadmap maps…</div>
    <div class="cs-gate-actions">
      <Link class="btn btn--white">Book a Session</Link>
    </div>
  </div>
  <div class="cs-gate-features">
    <div class="cs-gate-feat">
      <div class="cs-gate-feat-title">Deal Review</div>
      <div class="cs-gate-feat-desc">Pressure-test offers…</div>
    </div>
    <!-- 3 more feat cards -->
  </div>
</div>
```

Background is a conic-gradient with teal/grey colors — always dark regardless of theme. **All text here hardcodes `#ffffff`** (see Dark Mode section). The `btn--white` variant is designed exclusively for this + other always-dark surfaces.

Use this pattern when: major conversion moment (paywall, upsell, CTA to a paid tier or advisory service). Don't use for regular secondary CTAs — those use the standard card section pattern.

---

## 9. Dark mode rules (critical)

1. **Always-dark surfaces hardcode white text.** `#ffffff` not `var(--white)`. Because `--white` flips to near-black in dark mode.
2. **Card interiors that show color in dark mode** (misalignment cards, stage band) use `#242424` or `#1a1a1a` backgrounds and light-on-dark text — regardless of theme.
3. **Diagram SVGs use `--diag-*` CSS vars** (never hardcoded hex attributes).
4. **Progress bars** need explicit dark overrides — the default `var(--black)` fill flips to near-white and hardcoded white text becomes invisible.
5. **Cover-image cards** have a dark-theme-specific `:not(.lib-card--cover)` scope on the `#111` overlay override — otherwise it covers the cover image in dark mode.

---

## 10. Editorial voice (UI copy)

Every piece of UI text should pass these filters:

| Don't | Do |
|-------|----|
| "Unlock your potential!" | "Transform your portfolio of projects into a portfolio of assets." |
| "Take the assessment to get started" | "A 10-minute guided flow captures your discipline, creative mode, stage, and ambitions. It tunes every recommendation across the platform." |
| "Create your roadmap now" | "Your strategic roadmap is generating now — detected stage, structural misalignments, and 3 specific next steps." |
| "Amazing features!" | "Deal Evaluator — analyze and score any deal" |

**Rules:**
- Specific numbers over vague adjectives ("35 deal structures" not "lots of content")
- Systems language over self-help language ("structural misalignment" not "blocker" or "limiting belief")
- Practitioner's voice over marketer's voice
- Never exclamation points except in confirmation toasts
- Never "you'll love this" / "exciting news" / "get ready"

---

## 11. File map — where things live

### Styles
- `src/app/globals.css` — public site + shared tokens
- `src/app/(portal)/portal.css` — portal + dark mode overrides

### Shared components
- `src/components/shared/generation-progress.tsx` — loading UI
- `src/components/shared/archetype-sigil.tsx` — 6 archetype SVG sigils, used by both portal CI portrait and public Platform page
- `src/components/ui/button-arrow.tsx` — arrow icon
- `src/components/ui/browser-frame.tsx` — video frame wrapper

### Portal components
- `src/components/portal/sidebar.tsx`
- `src/components/portal/settings-tabs.tsx`
- `src/components/portal/creative-identity-panel.tsx` — with 6 archetype sigils
- `src/components/portal/lib-card.tsx` — library + dashboard cards
- `src/components/portal/portfolio-tabs.tsx`
- `src/components/assessment/roadmap-display.tsx` — full roadmap view
- `src/components/assessment/roadmap-entity-diagram.tsx`
- `src/components/assessment/roadmap-flywheel.tsx`
- `src/components/assessment/roadmap-advisory-cta.tsx`
- `src/components/assessment/action-card.tsx`
- `src/components/evaluator/evaluator-flow.tsx`
- `src/components/evaluator/refresh-roadmap-cta.tsx`

### Case study MDX components
- `src/components/mdx/case-study/` — full toolkit (CbHeading, CbTimeline, CbAccordion, CbStructureBadge, etc.)

---

## 12. Quick reference — adding a new screen

1. **Layout:** pick the section pattern (hero → content sections → footer)
2. **Colors:** use CSS variables, never hardcoded hex except for always-dark surfaces
3. **Type:** default to Geist for display + body, PT Mono for labels/chips/footer
4. **Spacing:** 80px section padding, 24–32px card padding, 16–24px internal gaps
5. **Motion:** wrap scroll-reveal elements in `rv` + stagger with `rv-d1`, `rv-d2`
6. **Buttons:** stick to the 4 variants — `.btn`, `.btn--filled`, `.btn--ghost`, `.btn--white`
7. **Dark mode:** test every new surface in both themes before committing. If text contains `var(--white)` and sits on a dark bg → it's going to invert. Hardcode.
8. **Icons:** line-art SVG with `stroke="currentColor"`, `fill="none"`, 1.5 stroke width
9. **Copy:** write like a practitioner, not a marketer. Specific numbers. Systems language.
