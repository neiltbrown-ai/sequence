# Diagram System — Visual Standard

Self-contained visual specification for the five In Sequence diagram types used in the "Compounding Effect" section of every case study. This document is **static-only** (no animation guidance) and **portable**: every value needed to reproduce a diagram is written here literally, with no dependency on the Sequence repo's CSS or components. It can be copied verbatim into another project (e.g. a Remotion animation project) as the source of truth for diagram geometry, color, and type.

> Scope boundary: this doc covers WHAT a diagram looks like (tokens, geometry, typography, type selection). It does not cover animation (entrance order, timing, easing) — that lives with the consuming project. It also does not cover the MDX `CbFlywheel` component API; for in-repo authoring see `case-study-components.md` → "Diagram type taxonomy."

---

## 1. How to use this document

There are two consumption modes:

**In-repo (MDX case studies).** Diagrams are raw `<svg>` inside `<CbFlywheel title="...">`. Colors must use the `--diag-*` CSS custom properties (see §2) so the portal's dark-mode flip works. Use `fill="var(--diag-child-bg)"`, never a hardcoded hex.

**Out-of-repo (Remotion or any standalone project).** There are no `--diag-*` vars. Use the **literal hex values** from the §2 tables directly, and pick the light or dark column based on the target background. Pass them as props/constants so a single theme switch flips the whole diagram.

The geometry (§4) is identical in both modes — only the color-reference mechanism differs.

---

## 2. Color tokens

Twelve tokens. In the repo they are CSS custom properties; the literal values below are the single source of truth. Light is the default; dark is the `[data-theme="dark"]` override.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--diag-parent-bg` | `#ffffff` | `#1a1a1a` | Fill of the **emphasis** card (the one node you want to read as primary/structural) |
| `--diag-parent-border` | `#1a1a1a` | `rgba(255,255,255,0.35)` | Border of the emphasis card |
| `--diag-parent-text` | `#1a1a1a` | `#e8e6e3` | Text inside the emphasis card |
| `--diag-child-bg` | `#f5f5f0` | `#242424` | Fill of standard cards (most nodes) |
| `--diag-child-border` | `#d9d6d1` | `rgba(255,255,255,0.12)` | Border of standard cards; also thin divider rules inside cards |
| `--diag-child-text` | `#1a1a1a` | `#e8e6e3` | Card name text (the bold descriptive label) |
| `--diag-muted-text` | `#888888` | `#888888` | Mono sub-labels, eyebrow labels, italic footnotes |
| `--diag-line` | `#d9d6d1` | `rgba(255,255,255,0.25)` | Connector lines, arrows, arrowhead fills |
| `--diag-center-bg` | `#1a1a1a` | `#0e0e0e` | Fill of the hub circle (hub-and-spoke only) |
| `--diag-center-border` | `rgba(255,255,255,0.25)` | `rgba(255,255,255,0.35)` | Hub circle border |
| `--diag-center-text` | `#ffffff` | `#ffffff` | Hub circle text |
| `--diag-label-bg` | `#ffffff` | `#1a1a1a` | Fill behind flow-text labels that sit on top of connector lines (triangle type) |

**Failure red** (broken-flywheel only, §4.2): `#c44` in both themes. Applied to card name text, mono sub-label, and the dashed arrow + arrowhead on the broken arc. Not a `--diag-*` token — hardcode `#c44`.

---

## 3. Typography

Two font families, fixed roles:

| Role | Family | Size | Weight | Letter-spacing | Color token |
|---|---|---|---|---|---|
| Card name (descriptive label) | `Geist, sans-serif` | 11 (hub/triangle) · 13–14 (sequence/grid) | 600 | normal | `--diag-child-text` / `--diag-parent-text` |
| Card sub-label (the detail) | `'PT Mono', monospace` | 8 | 400 | 0.05em | `--diag-muted-text` |
| Eyebrow / structure label | `'PT Mono', monospace` | 9 | 400 | 0.08em | `--diag-muted-text` |
| Hub circle — line 1 | `'PT Mono', monospace` | 9 | 400 | 0.08em | `--diag-center-text` |
| Hub circle — line 2/3 | `'PT Mono', monospace` | 7.5 | 400 | 0.05em | `--diag-muted-text` |
| Flow-text label (on connectors) | `Geist, sans-serif` | 10–11 | 400 (often italic) | normal | `--diag-muted-text` |
| Closing note (sequence/grid) | `Geist, sans-serif` | 11 | 400, italic | normal | `--diag-muted-text` |

**Iron rule:** the descriptive name leads (sans-serif, bold); the structure number or metric is the mono sub-label below it. Never lead a card with a bare structure number.

All `<text>` uses `textAnchor="middle"` unless noted. Card text is positioned by absolute `x`/`y`, not by flex/centering — coordinates in §4 give the exact baselines.

---

## 4. The five diagram types

Standard frame: each diagram renders inside a titled container. The `title` is a short, case-specific caption shown above the SVG (e.g. `KIRKLAND — TASTE COMPOUNDS`, `Eno — Opal Holds the Stack`), never a generic `Value Flywheel`.

### 4.1 Hub-and-spoke compounding wheel

The dominant pattern (~95 library cases). A central hub with 6 cards in a hexagonal ring. Two sub-variants share this geometry: **cyclic** (solid perimeter arrows showing a self-reinforcing loop) and **acyclic** (dashed spoke lines only, when the spokes compound by attaching to the hub rather than feeding each other).

- **viewBox:** `0 0 580 400`
- **Hub circle:** `cx=290 cy=200 r=52` (use `r=58` if the hub needs a 3rd text line). Fill `--diag-center-bg`, stroke `--diag-center-border`.
  - Line 1: `x=290 y=193` (mono 9, `--diag-center-text`)
  - Line 2: `x=290 y=210` (mono 7.5, `--diag-muted-text`)
  - For `r=58`: lines at `y=190 / 204 / 220`.
- **Six cards**, each `130×48 rx=4`, fill `--diag-child-bg` stroke `--diag-child-border`. Card name at card-top `+20`, mono sub-label at `+35`:

| Position | Card x,y | Name x,y | Sub x,y |
|---|---|---|---|
| Top | `225,18` | `290,38` | `290,53` |
| Top-right | `435,100` | `500,120` | `500,135` |
| Bottom-right | `435,252` | `500,272` | `500,287` |
| Bottom | `225,334` | `290,354` | `290,369` |
| Bottom-left | `15,252` | `80,272` | `80,287` |
| Top-left | `15,100` | `80,120` | `80,135` |

- **Dashed spokes** (hub → each card), `stroke=--diag-line strokeWidth=0.75 strokeDasharray="3,3"`:

| To | Path |
|---|---|
| Top | `290,148 → 290,66` |
| Top-right | `338,180 → 435,124` |
| Bottom-right | `338,220 → 435,276` |
| Bottom | `290,252 → 290,334` |
| Bottom-left | `242,220 → 145,276` |
| Top-left | `242,180 → 145,124` |

- **Cyclic variant only:** add solid perimeter arrows card→card (clockwise), `stroke=--diag-line strokeWidth=1`, with an arrowhead marker. Perimeter paths run between adjacent card edges (e.g. top→top-right `355,42 → 435,112`). Keep the dashed spokes as well — solid = the cycle, dashed = the laddering-to-hub.
- **Canonical references:** `jeremy-kirkland.mdx` (cyclic), `brian-eno.mdx` / `es-devlin.mdx` / `michael-bierut.mdx` (acyclic).

### 4.2 Broken-flywheel variant

Identical geometry to 4.1 (cyclic). The difference is purely color: the cards and arrows on the **broken arc** are rendered in failure-red `#c44` (card name, mono sub-label, the dashed arrow into/out of those nodes, and that arrow's arrowhead). The intact arc stays in standard tokens. The hub usually names what's missing (e.g. `FULL OWNERSHIP`).

- Use only for genuinely cautionary cases — the structures the creator *would* have needed are absent or broken.
- **Canonical reference:** `chance-the-rapper.mdx`.

### 4.3 Triangle / triadic flow

Three structure boxes in an inverted triangle (one top-center, two bottom corners) with **solid directional arrows** showing flow between them, and short flow-text labels sitting on a solid `--diag-label-bg` rectangle at each arrow's midpoint.

- **viewBox:** `0 0 580 400`
- **Boxes**, each `160×56 rx=4`, stroke `--diag-parent-border` (the A24 original strokes only — transparent fill; you may instead fill `--diag-child-bg` for consistency with other types):
  - Top: `x=210 y=8`
  - Bottom-left: `x=10 y=300`
  - Bottom-right: `x=410 y=300`
- **Box text:** eyebrow (mono 9) at box-top `+24`, name (sans 13, weight 500) at `+40`.
- **Arrows** (`stroke=--diag-line strokeWidth=1`, arrowhead marker):
  - `M240 64 L130 300` (top → bottom-left)
  - `M170 328 L410 328` (bottom-left → bottom-right)
  - `M450 300 L340 64` (bottom-right → top)
- **Flow-text labels** — `--diag-label-bg` rect (so the line doesn't strike through the text) + 2 lines of sans 11 `--diag-muted-text`:
  - `rect 130,166 94×30`
  - `rect 240,344 100×30`
  - `rect 339,166 120×30`
- **Arrowhead marker:** `markerWidth=8 markerHeight=6 refX=8 refY=3 orient=auto`, path `M0 0L8 3L0 6` filled `--diag-line`.
- Use for a small fixed set (typically 3) of structures that compound **directionally** rather than cyclically.
- **Canonical reference:** `a24.mdx`.

### 4.4 Linear sequence

Cards left→right with **bold horizontal arrows** between them. For a deliberate **chronological chain** where each step is a precondition for the next — not a loop. Two sizes by card count.

**Four-card** (the common case):
- **viewBox:** `0 0 720 360`
- **Cards**, each `160×180 rx=6`, at `y=60`, x = `20`, `200`, `380`, `560` (20px gaps). Emphasis card uses `--diag-parent-*`; others `--diag-child-*`.
  - Eyebrow (mono 9, e.g. `2004 · STRUCTURE #3`) at `y=86`
  - Divider rule (`stroke=--diag-*-border strokeWidth=0.5`) at `y=98`, inset 20px from card edges
  - Name line 1 at `y=128`, line 2 at `y=146` (sans 13–14, weight 600)
  - Mono detail line 1 at `y=180`, line 2 at `y=196` (mono 8, 0.05em)
- **Arrows** between cards at `y=150` (`stroke=--diag-line strokeWidth=1`, arrowhead): `185→195`, `365→375`, `545→555`
- Optional italic flow labels above each arrow.
- **Closing note** — two centered italic lines (sans 11) at `y=285` and `y=303`.

**Three-card** (e.g. when there are exactly 3 acts):
- **viewBox:** `0 0 580 360`
- Cards `170×80 rx=6` at `y=120`, x = `10`, `205`, `400`. Arrows at `y=160`: `180→205`, `375→400`. Per-card outcome text below (`y=240/258`); closing italic at `y=285/303`.

- **Arrowhead marker:** `viewBox 0 0 10 10 refX=9 refY=5 markerWidth=6 markerHeight=6 orient=auto-start-reverse`, path `M 0 0 L 10 5 L 0 10 z` filled `--diag-line`.
- **Canonical references:** `ira-glass.mdx` (3-card), `red-antler.mdx` / `stefan-sagmeister.mdx` / `yves-behar.mdx` (4-card).

### 4.5 Independent grid

An N×M grid of independent cards with **no arrows between them**. For cases whose argument is **separation / no cross-dependencies** — the visual absence of connectors is the point. A centered italic note states the argument.

- **viewBox:** `0 0 580 420` (2×2)
- **Cards**, each `250×140 rx=6`, at: `(20,20)`, `(310,20)`, `(20,260)`, `(310,260)`. Emphasis card `--diag-parent-*`; others `--diag-child-*`.
  - Asset-class header (mono 9, 0.08em) at card-top `+30`
  - Divider rule at `+42`, inset 20px
  - Entity name (sans 14, weight 600) at `+72`
  - Era + fate (two mono-8 lines) at `+100` and `+118`
- **Center note:** two centered italic lines (sans 11, `--diag-muted-text`) at `y=206` and `y=224` — names the separation argument (e.g. "Four asset classes. Four entities. No arrows between them — that is the structural argument.").
- **No connectors of any kind.** That is the type's defining feature.
- **Canonical reference:** `erik-spiekermann.mdx`.

---

## 5. Selection rule

Pick the type from the case's actual structural argument, not by default.

| The case argues… | Use |
|---|---|
| Self-reinforcing cycle | Hub-and-spoke, cyclic (4.1) |
| Broken / missing cycle (cautionary) | Broken-flywheel (4.2) |
| Spokes that compound by sharing a hub, not feeding each other | Hub-and-spoke, acyclic (4.1) |
| Three structures with directional flow | Triangle (4.3) |
| A sequence of structures deployed over time | Linear sequence (4.4) |
| Separation / no cross-dependencies | Independent grid (4.5) |

When uncertain, default to hub-and-spoke (4.1) — it is the library's anchor and fits most "compounding" cases.

---

## 6. Hygiene rules

1. **Color reference** — in-repo: `var(--diag-*)` only, never hardcoded hex (the portal flips to dark via `[data-theme="dark"]`; hardcoded hex breaks it). Out-of-repo: literal hex from §2, light or dark column. The only standing hardcode is `#c44` (failure red).
2. **Only `--diag-*` tokens exist.** `var(--diag-text)`, `var(--mid)`, etc. are undefined and render transparent. The twelve in §2 are the complete set.
3. **Card hierarchy** — descriptive name first (sans, 600), mono sub-label below. Never a bare structure number as the lead.
4. **viewBox is fixed per type** — `580×400` (hub, broken, triangle), `720×360` / `580×360` (sequence 4-card / 3-card), `580×420` (grid). Don't free-size.
5. **Title is case-specific** — descriptive caption, not `Value Flywheel`.
6. **Two fonts only** — `Geist, sans-serif` and `'PT Mono', monospace`. No third family.

---

## 7. Cross-references

- `case-study-components.md` → "Diagram type taxonomy" — the in-repo authoring view (MDX `CbFlywheel` API, prose selection guidance).
- `design.md` → "Diagrams" — the `--diag-*` token system in the context of the broader digital design system, plus the roadmap entity/flywheel React components.
- Library exemplars (read the SVG source to see geometry in situ): `jeremy-kirkland.mdx`, `chance-the-rapper.mdx`, `a24.mdx`, `ira-glass.mdx`, `erik-spiekermann.mdx`.

---

## Provenance

Created May 2026, consolidating the diagram standard that emerged during the May 2026 case-study additions (Eno / Glass / Spiekermann, then Sagmeister / Devlin / Red Antler, then Béhar / Bierut). The five-type taxonomy and the literal token/geometry values were extracted from the shipped library diagrams so this document and the rendered diagrams stay in agreement. Static-only by design; animation conventions live with the consuming project.
