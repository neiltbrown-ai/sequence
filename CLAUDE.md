# Sequence — Project Context

Membership platform teaching creative professionals how to structure deals and build long-term value capture. Next.js 16, React 19, App Router, Supabase, Stripe, Anthropic Claude API, MDX via `next-mdx-remote` v6.

Public metadata: **"Sequence — Own Your Future"** / "Transform your portfolio of projects into a portfolio of assets."

## Current platform architecture

The member experience is organized as a single keystone-driven loop:

```
Portfolio Analysis   →   Strategic Roadmap   →   Deal Evaluator
   (keystone input)       (primary output)        (ongoing input;
                                                    refreshes roadmap)
        ↑                       ↑                        │
        └───────────────────────┴────────────────────────┘
                            │
                    Creative Identity
              (optional personalization profile,
               tunes every AI recommendation)
```

### Key surfaces

- `/dashboard` — CTA order mirrors the journey: Portfolio → Roadmap → Evaluate → Creative Identity
- `/inventory` — Portfolio Analysis (two tabs: **Assets** | **Analysis**). Completion auto-triggers roadmap regen.
- `/roadmap` — Strategic plan display. Diagrams at top (tabbed: Entity Structure | Value Flywheel), then Position, Recent Deal Signal, Vision, Misalignments, 3 Next Steps, Recommended Reading, 1:1 Advisory CTA.
- `/evaluate` — Deal evaluator. Verdict view includes a "Refresh Roadmap" CTA when the deal carries meaningful signal.
- `/advisor` — Conversational layer over everything.
- `/settings` — Tabbed: **Profile** | **Creative Identity**. CI tab shows a visual portrait when complete (archetype sigil + stage band + facet grid + friction points).
- `/the-library` — Public-facing library page with hero, structures, case studies, book download, testimonials, newsletter.

### Creative Identity (formerly "Assessment")

The 5-section wizard at `/assessment` is rebranded as **Creative Identity** throughout the UI. The `assessments` database table keeps its name — this is purely a presentation rename.

Creative Identity data powers a shared `member-context` block injected into every AI system prompt across the portal (`buildMemberContext()` in `src/lib/advisor/context-builder.ts`). When a member completes CI, every recommendation gets sharper.

### Strategic Roadmap generation

All roadmap generation goes through the shared lib `src/lib/roadmap/generate-plan.ts` exposing:

- `createStrategicPlan({ userId, assessmentId?, portfolioAnalysisId? })` → `{ planId, source, runGeneration }`

The caller **must** schedule `runGeneration` via Next.js `after()` (with `export const maxDuration = 60`) so the serverless function stays alive for the Claude call. Fire-and-forget without `after()` gets killed on Vercel before completion.

Triggers that call into the generator:
- `POST /api/assessment/complete` (Creative Identity wizard submission)
- `POST /api/inventory/analyze` (Portfolio analysis → auto-regen)
- `POST /api/roadmap/refresh` (Deal Evaluator "Refresh Roadmap" CTA + future manual regens)
- `POST /api/assessment/regenerate` (admin / legacy regen)

The generator pulls Creative Identity, latest Portfolio analysis, last 90 days of deal evaluations (including their verdict `recommended_actions`), and synthesizes patterns in the prompt.

`strategic_plans.source` is `"assessment" | "portfolio" | "combined"` — the Roadmap page subtitle reflects this ("Built from your Creative Identity + Portfolio audit + 3 recent deals").

### Action tracking across regenerations

`assessment_actions` are scoped to `plan_id`. Each regenerated plan has its own set of 3 actions (foundation / positioning / momentum). The `/api/assessment/actions` PATCH endpoint dedups on `(user_id, plan_id, action_order)`. Roadmap page queries by `plan_id` — completed actions from old plans don't carry forward (each plan's actions are genuinely different).

### Approved providers whitelist

Roadmap AI output references service providers (LegalZoom, Stripe Atlas, etc). Claude routinely hallucinates URLs or suggests generic categories. The render layer filters through `src/lib/roadmap/approved-providers.ts` — only matches to a small curated list pass through, always with the canonical URL we verified. Add entries to the whitelist as partnerships land.

---

## Content architecture

```
content/
├── structures/       35 deal structure MDX files
├── case-studies/     Case study MDX files (public teaser + portal full)
├── articles/         Article MDX files
├── reference/        Source material, style guides, component docs
└── data/             JSON data files
```

### Public routes

- `/case-studies/[slug]`, `/articles/[slug]`, `/structures/[slug]`

### Portal routes (members)

- `/library/case-studies/[slug]`, `/library/articles/[slug]`, `/library/structures/[slug]`

---

## Source-of-truth specs

Read these before building advisor / assessment / evaluator / roadmap features. They define data models, scoring logic, question flows, and archetype definitions. Do not deviate without explicit approval.

- `content/reference/seq-ai-advisor-experience-v1.md` — conversational UX layer
- `content/reference/seq-assessment-build-spec-v2.md` — question bank, scoring, archetypes, roadmap schema
- `content/reference/deal-evaluator-spec-v2.md` — evaluation dimensions, scoring weights, verdict structure
- `content/reference/deal-evaluator-assessment-integration.md` — evaluator × assessment integration
- `content/reference/case-study-components.md` — MDX component toolkit
- `content/reference/design-system.md` — visual + editorial design reference
- `content/reference/troubleshooting.md` — symptom → cause → fix for recurring bugs
- `design.md` (root) — digital product design system (tokens, components, patterns)
- `content/reference/advisor-memory-spec.md` — future: persistent advisor memory (Path B from the advisor evolution discussion). Not yet implemented.
- `content/reference/sequence-mcp-spec.md` — future: MCP server exposing Sequence data to Claude Desktop + future AI features. Not yet implemented.
- `CHANGELOG.md` (root) — session-level architectural log. Read this to reconstruct how the platform got to its current state without parsing every commit.

### Spec freshness — read before treating any spec as gospel

Several specs were written before architectural changes shipped. Where a spec disagrees with the current code or with this CLAUDE.md, **the code + this doc win**. Specifically:

- **`seq-assessment-build-spec-v2.md`** — The question bank, stage scoring weights, and misalignment flag patterns are STILL authoritative. **Outdated:** UI references "Assessment" everywhere — the user-facing brand is now "Creative Identity." Data flow assumed assessment was the only roadmap input — Portfolio + recent deal evaluations also feed `generate-plan.ts` now. **Archetypes:** the spec defines 6; the code now defines 8 (added Capital Allocator + Creative Principal for Stage 4). Treat `src/lib/assessment/archetypes.ts` as the source of truth.
- **`seq-ai-advisor-experience-v1.md`** — Architectural intent (layered prompts, structured chat components) is still right. Specifics about the pre- vs. post-assessment chat may be outdated. Doesn't mention `buildMemberContext()` injection pattern or the shared roadmap generator.
- **`deal-evaluator-spec-v2.md`** — Scoring weights, dimensions, and verdict JSON structure are current. **Update past spec:** `max_tokens = 4096`, robust JSON parse with code-fence fallback, "Refresh Roadmap" CTA on the verdict, deal-history aggregation in the roadmap generator prompt.
- **`deal-evaluator-assessment-integration.md`** — Integration logic (evaluator skipping / pre-filling questions from assessment) is current. **Doesn't reflect:** deal verdict `recommended_actions` now feed BACK INTO roadmap regeneration via `/api/roadmap/refresh` and the shared `generate-plan.ts`.
- **`design-system.md`** — Scoped to print/collateral brand only. For digital UI, use **`design.md`** (root).

The component reference docs (`case-study-components.md`, `structure-components.md`, `article-components.md`, `email-templates.md`) and the new docs (`troubleshooting.md`, `advisor-memory-spec.md`, `sequence-mcp-spec.md`, `design.md`) are current.

---

## Content writing rules

### When converting content to MDX

1. Read `content/reference/case-study-components.md` for the component toolkit
2. Reference `content/case-studies/a24.mdx` as the gold standard for structure and formatting

### CRITICAL MDX rules

- **ALL props must be strings.** Never `prop={value}`, always `prop="value"`.
  - WRONG: `num={13}`, `pct={100}`
  - RIGHT: `num="13"`, `pct="100"`
- **Arrays/objects must use JSON string props**: `headersJson='["Col1","Col2"]'`
- **Boolean props** (like `avg`, `inline`) work without values: `<CbChartRow avg />`
- Standard markdown (**bold**, *italic*) works inside component children
- Use `<p className="cb-card-text">` for paragraphs inside accordion cards

### Case study frontmatter

- `title` must never contain `<br />` — sweep periodically for concatenation bugs (`DJto` → `DJ to`)
- `coverImage` / `heroImage` / `secondaryImage` for images
- `stats`, `sections` arrays for structured UI

### Portal ↔ public URL handling in MDX

Case study / structure / article MDX files are rendered in two contexts:
- **Public**: `/case-studies/[slug]`, `/structures/[slug]`, `/articles/[slug]`
- **Portal**: `/library/case-studies/[slug]`, `/library/structures/[slug]`, `/library/articles/[slug]`

MDX authors typically write public URLs in their content (`/case-studies/rick-rubin`). Inline components must rewrite these to portal paths when rendered in the portal — otherwise logged-in members get kicked out to the public view.

**`CbRelatedCard` already does this** via `usePathname()`. Pattern for any new MDX component that renders links to case studies / articles / structures:

```tsx
const pathname = usePathname() || "";
const inPortal = pathname.startsWith("/library/");
// Rewrite `/case-studies/*` → `/library/case-studies/*` when inPortal
```

If a case study MDX file authors a raw `<a href="/case-studies/foo">` link, that link won't be rewritten. Prefer `<CbRelatedCard>` (or other components that do the rewrite) for any cross-references.

### SVG in MDX — use diagram CSS vars

Case studies occasionally embed handcrafted SVG diagrams (like the Cowart flywheel). These SVGs must use the `--diag-*` CSS vars (`--diag-parent-bg`, `--diag-child-bg`, `--diag-line`, etc.) for fills and strokes — **never hardcoded hex**. Hardcoded colors break dark mode when the case study is viewed in the portal. See `design.md` section 5 for the full variable list.

---

## AI architecture

### Member context injection (layered prompts)

Every AI endpoint prepends the shared member-context block from `buildMemberContextPrompt()` (in `src/lib/advisor/system-prompts.ts`). Wired into:

- `/api/advisor/chat` (ai-sdk streaming)
- `/api/inventory/analyze` (Anthropic SDK)
- `/api/evaluator/complete` (Anthropic SDK)
- `/api/assessment/complete` via the shared generator (Anthropic SDK)

### Serverless patterns (critical — do not regress)

Long Claude calls (roadmap generation, portfolio analysis, deal verdicts) take 30–90s. Vercel kills the function when the response returns — so **never** fire-and-forget a Claude call without `after()`.

Pattern to use:

```ts
import { NextResponse, after } from "next/server";
export const maxDuration = 60;        // or 120 for cascading calls

export async function POST(request: Request) {
  // ... validate + create row in "generating" state
  after(() => runLongTask());         // keeps function alive until done
  return NextResponse.json({ id });   // client polls for completion
}
```

`max_tokens` on verdict / roadmap calls: **4096** minimum. 2000 truncates the structured output and causes JSON parse failures.

### Claude response parsing

Always parse with a code-fence fallback:

```ts
let parsed: T;
try {
  parsed = JSON.parse(rawText);
} catch {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid JSON from Claude");
  parsed = JSON.parse(jsonMatch[0]);
}
```

### Scoring engine constraints

- Stage detection weights (Q6–Q11) defined in `seq-assessment-build-spec-v2.md` Section 5. Do not change.
- Six misalignment flag patterns defined in the spec. Implement all six.
- Eight archetypes defined in `src/lib/assessment/archetypes.ts` — six for Stages 1–3 and two for Stage 4 (Capital Allocator, Creative Principal). Stage 4 matching is split by creative_mode: builder/service/transition → Capital Allocator; maker/performer/hybrid → Creative Principal. Do not invent new archetypes beyond these eight.
- Creative mode (`maker` / `service` / `hybrid` / `performer` / `builder` / `transition`) adapts question language across every surface.

### What AI must NOT generate

Generic growth advice, content strategy, marketing tactics. Actions must be **structural**: entity formation, deal structures, IP protection, professional advisors, licensing agreements, equity arrangements.

---

## Shared UI patterns

### Generation progress (loading screens)

`src/components/shared/generation-progress.tsx` is the canonical loading UI for any long-running AI task. Used by:

- Portfolio Analysis (Analysis tab)
- Creative Identity wizard submission
- Deal Evaluator computing/generating phases
- Roadmap generation

Pass `label`, `title`, `description`, optional `progress` (0–100), `stageLabel`, `footerNote`. For indeterminate spinner-only, omit `progress`.

### Library card with cover image

`src/components/portal/lib-card.tsx` — case study / structure cards on dashboard + library. Cover image renders as a real `<img>` element (not CSS background) to avoid cascade conflicts with the nth-child conic-gradient rules.

Stacking order inside `.lib-card--cover`:
- z-0: `<img className="lib-card-cover-img">` (full card fill, `position: absolute; inset: 0`)
- z-1: `::before` gradient overlay
- z-2: title / description / tags (all content)

### Roadmap entity / value flywheel diagrams

`src/components/assessment/roadmap-entity-diagram.tsx` and `roadmap-flywheel.tsx`. Use CSS custom properties (`--diag-parent-bg`, `--diag-child-bg`, `--diag-line`, etc.) for theme-aware colors. Light defaults in `globals.css`, dark overrides in `portal.css`. **Do not hardcode hex in SVG attributes.**

### Creative Identity portrait

`src/components/portal/creative-identity-panel.tsx` has three states (empty / in-progress / complete). Complete state shows a per-archetype sigil SVG (6 unique marks, one per archetype) + stage band + facet grid + friction points. Snapshot loaded server-side in `src/app/(portal)/settings/page.tsx` — prefers completed assessment over any newer in-progress row.

The 8 archetype sigils live in `src/components/shared/archetype-sigil.tsx` and are consumed by both the portal portrait and the public Platform page's Creative Identity section. **Don't inline the sigil SVGs anywhere else — always import from the shared component.**

### Dashboard Portfolio State cards

`src/components/portal/dashboard-cards.tsx` exports three cards rendered when the member has portfolio data:

- `DashValuationCard` — full-width hero (valuation range + leverage score color-coded green/yellow/red + 5 driver bars)
- `DashRiskFlagsCard` — list of up to 5 portfolio risks with severity-coded icons
- `DashDealsEvaluatedCard` — last 5 individual deal evaluations as a list

All three follow the **head + body-link + action pill** pattern (see `design.md`). Renders only when underlying data exists; pre-2026-04 analyses without `value_drivers` / `risks` fall through gracefully (the valuation hero alone still shows).

**Layout:** Valuation card spans full main-body width on row 1; Risk Flags + Deals Evaluated render 2-up on row 2 (`.dash-portfolio-row`). Stacks below 900px.

**Conditional CTAs:** when this section renders, `DashboardInventoryCTA` and `DashboardEvalCTA` auto-hide because they'd duplicate the cards' content. The Roadmap and Creative Identity CTAs stay regardless (they don't duplicate Portfolio State).

**Deep-linking:** Valuation + Risk Flags cards link to `/inventory?tab=analysis` (the Analysis tab); the "+ Add Assets" pill stays on `/inventory` (Assets tab) since adding is the natural action there. The tab URL param is wired in `portfolio-tabs.tsx` via `useSearchParams`.

---

## Dark mode gotchas

The portal has a `[data-theme="dark"]` flip that swaps CSS vars:

```css
[data-theme="dark"] {
  --black: #e8e6e3;   /* inverts! */
  --white: #1a1a1a;   /* inverts! */
}
```

This means **`color: var(--white)` becomes black in dark mode**. Always-dark surfaces (cs-gate, dark card overlays, stage bands) must **hardcode `#ffffff`** for their text, not use the CSS var.

Surfaces that got bitten and now hardcode white:
- `.cs-gate`, `.cs-gate-title`, `.btn--white`
- `.cs-featured-name`, `.cs-featured-sub-name`
- `.lib-card--dark .lib-card-title/-desc/-type/-num`

### Dark theme progress bar

`gen-progress-bar-fill` uses `var(--black)` which flips to near-white. Dark theme needs explicit override (fill white, pct text dark) — see `portal.css`.

### Dark theme diagram overrides

Entity + Flywheel diagrams are theme-aware only when they use the `--diag-*` CSS vars. Case-study MDX files that author their own SVG with hardcoded hex won't respect dark mode — known gap.

### `::before` overlay specificity on cards

Any `::before` pseudo-element overlay on a themed card (e.g., `.lib-card--cover::before`) must **explicitly set both `opacity` and `background`** and guard against earlier rules that set them differently. This session hit three compounding bugs on `.lib-card--cover::before`:

1. `.lib-card--dark::before` sets `opacity: 0` at rest → cover variant overlay was invisible until we added `opacity: 1 !important`
2. `[data-theme="dark"] .lib-card--dark::before { background: #111 }` → covered cover images in dark mode until scoped to `:not(.lib-card--cover)`
3. Conic-gradient from `.lib-card--dark:nth-child(N)` kept showing through inline `style={backgroundImage}` → fixed by switching to a real `<img>` element instead of CSS background

**Takeaway:** when adding a new card variant with its own `::before` overlay, audit the chain of existing `::before` rules and dark-theme overrides. Better yet: use a real `<img>` element inside the card (as `.lib-card--cover` now does) to sidestep cascade battles entirely.

---

## Schema gotchas

- `assessments` table has **no `updated_at` column** — selecting it silently fails the whole query. The snapshot loader on Settings initially broke because of this. Columns: `id`, `user_id`, `status`, `current_section`, `current_question`, `detected_stage`, `archetype_primary`, `creative_mode`, `discipline`, `sub_discipline`, `misalignment_flags`, `completed_at`, `created_at`, `started_at` (+ all the question JSONB fields).
- `strategic_plans` has `source` (`'assessment' | 'portfolio' | 'combined'`) + nullable `assessment_id` + nullable `portfolio_analysis_id` (migration `00015_roadmap_decoupling.sql`). At least one of the two FKs must be non-null (DB constraint).
- Dashboard queries use `maybeSingle()` for "user's most recent X" lookups. Never use `.single()` for user-scoped queries — if the user has 2+ rows (e.g., two completed assessments from regen), `.single()` throws instead of returning null.
- `InventoryAnalysisContent.summary.leverage_score` is contractually **one word** (`low | medium | high`); the explanation lives in a separate `summary.leverage_rationale` field. Pre-2026-04 analyses may have a full sentence in `leverage_score` — render layer extracts the first matching word + parses "High — text" patterns out as fallback rationale (see `parseLeverage` / `extractLegacyRationale` in `src/components/portal/dashboard-cards.tsx`).
- `InventoryAnalysisContent` also has optional `value_drivers` (5 named scores in fixed order: IP Strength · Market Demand · Differentiation · Execution Readiness · Financial Upside) and `risks` (top 5 portfolio risks with severity). Both optional for forward-compat; the dashboard Portfolio State cards conditionally render based on field presence.
- **`/api/assessment/regenerate` is deprecated for member-facing use** — it mutates the existing strategic_plans row in place rather than creating a new one, which leaves `assessment_actions` orphaned at "completed" status across the regen. Use `/api/roadmap/refresh` instead (calls `createStrategicPlan()` to create a fresh row + plan_id). The old endpoint still exists because the admin `/regenerate-all` references it; consider it pending removal.

---

## Development

- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build` — must pass (currently 91+ pages, zero errors)
- **PATH must include**: `/Users/neilbrown/.nvm/versions/node/v24.14.0/bin`
- Auth is enabled; public routes work without login
- Vercel auto-deploys on push to `main`
- For long-running test flows: use test accounts like `neiltbrown+id1@gmail.com`, `+id2@gmail.com`, etc.

### Debug endpoint

`GET /api/debug/creative-identity` — returns the authenticated user's ID, email, and all their assessment rows. Use to diagnose "my CI is done but the tab shows empty" issues. Safe to leave in place.

### Migrations

Live in `supabase/migrations/`. Each migration needs to be applied manually to production Supabase (SQL Editor or `supabase db push`). Code that depends on a new column should be merged AFTER the migration is applied, or wrapped in graceful-degradation (`try/catch`, optional chaining).

---

## Publishing workflow

When the user says "publish this case study" or pastes content:

1. Read `content/reference/case-study-components.md`
2. Convert the content to MDX using the appropriate components
3. Save to the correct directory (`content/case-studies/`, `content/articles/`, etc.)
4. Run `npm run build` to verify it compiles
5. Report success with the URL path

---

## Git / deploy workflow

Current mode: direct-to-main. Every push triggers a Vercel deploy in ~60–90s. For safer flows in the future:

- `git checkout -b feature/xyz` → Vercel auto-creates preview URL (`sequence-git-feature-xyz.vercel.app`)
- Test on preview → `gh pr create` → merge to main

**Rollback in a hurry**: Vercel Dashboard → Deployments → three-dot menu on a previous deploy → "Promote to Production". Instant, no code changes.

**Never commit**:
- Screenshot PNGs into `public/videos/` (accidental drops from CapCut etc)
- CapCut temp folders
- `.env` / credentials

---

## Key file paths

**AI / roadmap**:
- `src/lib/roadmap/generate-plan.ts` — shared plan generator
- `src/lib/advisor/context-builder.ts` — `buildMemberContext()`
- `src/lib/advisor/system-prompts.ts` — `buildMemberContextPrompt()` + base prompt
- `src/lib/roadmap/approved-providers.ts` — provider whitelist
- `src/lib/assessment/archetypes.ts` — 8 archetype definitions (6 for Stages 1–3 + 2 for Stage 4)
- `src/lib/assessment/scoring.ts` — stage detection + misalignment flags

**Core portal UI**:
- `src/app/(portal)/dashboard/page.tsx`
- `src/app/(portal)/roadmap/page.tsx` + `src/components/assessment/roadmap-display.tsx`
- `src/app/(portal)/settings/page.tsx` + `src/components/portal/settings-tabs.tsx` + `creative-identity-panel.tsx`
- `src/components/portal/portfolio-tabs.tsx` + `inventory-analysis-view.tsx`
- `src/components/evaluator/evaluator-flow.tsx` + `refresh-roadmap-cta.tsx`
- `src/components/shared/generation-progress.tsx`
- `src/components/portal/sidebar.tsx` + `src/components/admin/sidebar.tsx`

**Styles**:
- `src/app/globals.css` — public site + shared
- `src/app/(portal)/portal.css` — portal + dark mode overrides

---

## What this session built (April 2026)

Five-batch consolidation (A → E):

- **A** Creative Identity rebrand + Settings tabs + shared member-context injected into every AI prompt
- **B** Strategic plans decoupled from assessment; unified generator; auto-trigger on Portfolio completion; serverless timeout fix with `after()` + `maxDuration`; migration `00015_roadmap_decoupling.sql`
- **C** Deal Evaluator "Refresh Roadmap" CTA; deal-history aggregation in generator prompt; Recent Deal Signal block on `/roadmap`
- **D** Roadmap UI redesign — diagrams promoted to headline, source-aware subtitle
- **E** Nav reorder (Portfolio → Roadmap → Evaluate → Advisor); new `DashboardRoadmapCTA`; dashboard CTA order mirrors the journey

Plus: unified `GenerationProgress` component, Creative Identity portrait view, provider whitelist, dark mode overhaul, admin sidebar matching portal pattern, and ~20 smaller refinements across home / case studies / portfolio / evaluator / roadmap.
