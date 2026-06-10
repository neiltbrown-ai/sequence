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
- `content/reference/seq-assessment-build-spec-v3.md` — question bank, scoring, archetypes, roadmap schema (v3 from Phase 3 of the case-study taxonomy rollout: Q1 expanded to 16 industries + 6 new Section 4B pools, May 2026)
- `content/reference/deal-evaluator-spec-v2.md` — evaluation dimensions, scoring weights, verdict structure
- `content/reference/deal-evaluator-assessment-integration.md` — evaluator × assessment integration
- `content/reference/case-study-components.md` — MDX component toolkit
- `content/reference/case-study-editorial-conventions.md` — case study voice register, evidence honesty, three-verb system, anti-hedge rule, body-softening, structure-mapping patterns, stat-header chip rubric (§11), verification block structure (§12), "What Wouldn't Transfer" lesson convention (§13), Related-cases conventions (§14), authoring checklist. Sister doc to `case-study-components.md` (HOW to write inside the components vs. WHAT components to use). Built up across the May 2026 case study audit. Read before authoring or editing any case study prose.
- `content/reference/library-expansion-candidates.md` — patterns surfaced by the audit that don't fit the 35-structure library cleanly. Two candidates so far: Permanent Equity / Patient Capital Investment (Bezos/Tiny/Wilkinson pattern), and Creative Studio Company distinct from #8 Creative Collective (MSCHF/unified-studio pattern). When writing a new case and no existing structure fits cleanly, flag the pattern there rather than stretching an existing structure.
- `content/reference/design-system.md` — visual + editorial design reference
- `content/reference/diagram-system.md` — self-contained visual standard for the 5 case-study "Compounding Effect" diagram types (hub-and-spoke, broken-flywheel, triangle, linear sequence, independent grid): literal light+dark color tokens, exact per-type geometry, typography, selection rule. Static-only (no animation); portable enough to copy into another project (e.g. Remotion). Sister to `case-study-components.md`'s "Diagram type taxonomy."
- `content/reference/troubleshooting.md` — symptom → cause → fix for recurring bugs
- `content/reference/test-users.md` — quick-glance reference for the 10 seeded test/demo users (password, expected data shape per user, what each is best for testing/demoing)
- `design.md` (root) — digital product design system (tokens, components, patterns)
- `content/reference/advisor-memory-spec.md` — future: persistent advisor memory (Path B from the advisor evolution discussion). Not yet implemented.
- `content/reference/sequence-mcp-spec.md` — future: MCP server exposing Sequence data to Claude Desktop + future AI features. Not yet implemented.
- `CHANGELOG.md` (root) — session-level architectural log. Read this to reconstruct how the platform got to its current state without parsing every commit.

### Spec freshness — read before treating any spec as gospel

Several specs were written before architectural changes shipped. Where a spec disagrees with the current code or with this CLAUDE.md, **the code + this doc win**. Specifically:

- **`seq-assessment-build-spec-v3.md`** — Stage scoring weights and misalignment flag patterns are authoritative. The Q1 industry vocabulary + Section 4B industry pools were updated in v3 (Phase 3 of the case-study taxonomy rollout, May 2026) — they now match the live `src/lib/assessment/questions.ts` and the canonical `src/lib/case-studies/taxonomy.ts`. **Still outdated:** UI references "Assessment" everywhere — the user-facing brand is now "Creative Identity." Data flow assumed assessment was the only roadmap input — Portfolio + recent deal evaluations also feed `generate-plan.ts` now. **Archetypes:** the spec defines 6; the code now defines 8 (added Capital Allocator + Creative Principal for Stage 4). Treat `src/lib/assessment/archetypes.ts` as the source of truth.
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

- Stage detection weights (Q6–Q11) defined in `seq-assessment-build-spec-v3.md` Section 5. Do not change.
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

- `assessments` table has **no `updated_at` column** — selecting it silently fails the whole query. The snapshot loader on Settings initially broke because of this. Columns: `id`, `user_id`, `status`, `current_section`, `current_question`, `detected_stage`, `archetype_primary`, `creative_mode`, `discipline`, `sub_discipline` (`TEXT[]` since migration `00019` — multi-select up to 3, 2026-05-07; existing single strings backfilled to 1-element arrays), `misalignment_flags`, `completed_at`, `created_at`, `started_at` (+ all the question JSONB fields). `industry_questions` JSONB now allows `string | string[]` values per-key — six industry-pool Q1s are multi-select (Q-IND-PHOTO-1/2, Q-IND-COMEDY-1, Q-IND-MEDIA-1, Q-IND-HOSP-2, Q-IND-GAMING-2). Use `toAnswerArray()` from `src/lib/assessment/answer-utils.ts` to normalize at read sites.
- `strategic_plans` has `source` (`'assessment' | 'portfolio' | 'combined'`) + nullable `assessment_id` + nullable `portfolio_analysis_id` (migration `00015_roadmap_decoupling.sql`). At least one of the two FKs must be non-null (DB constraint).
- Dashboard queries use `maybeSingle()` for "user's most recent X" lookups. Never use `.single()` for user-scoped queries — if the user has 2+ rows (e.g., two completed assessments from regen), `.single()` throws instead of returning null.
- `InventoryAnalysisContent.summary.leverage_score` is contractually **one word** (`low | medium | high`); the explanation lives in a separate `summary.leverage_rationale` field. Pre-2026-04 analyses may have a full sentence in `leverage_score` — render layer extracts the first matching word + parses "High — text" patterns out as fallback rationale (see `parseLeverage` / `extractLegacyRationale` in `src/components/portal/dashboard-cards.tsx`).
- `InventoryAnalysisContent` also has optional `value_drivers` (5 named scores in fixed order: IP Strength · Market Demand · Differentiation · Execution Readiness · Financial Upside) and `risks` (top 5 portfolio risks with severity). Both optional for forward-compat; the dashboard Portfolio State cards conditionally render based on field presence.
- **`/api/assessment/regenerate` is deprecated for member-facing use** — it mutates the existing strategic_plans row in place rather than creating a new one, which leaves `assessment_actions` orphaned at "completed" status across the regen. Use `/api/roadmap/refresh` instead (calls `createStrategicPlan()` to create a fresh row + plan_id). The old endpoint still exists because the admin `/regenerate-all` references it; consider it pending removal.
- **`profiles.income_range` uses the canonical assessment vocabulary** (`under_50k`, `50k_75k`, …, `1m_plus`, `prefer_not`) — same values as `assessments.income_range` and the `Q6_SCORES` map in `src/lib/assessment/scoring.ts`. Single source: `src/lib/profile/income-ranges.ts`. **Don't redefine the option list locally in any new feature** — import `INCOME_RANGE_OPTIONS`. Pre-2026-05 history: Settings, Onboarding (now deleted), and the assessment all wrote different vocabularies; migration `00017_normalize_profile_income_range.sql` backfilled to canonical.
- **`profiles` social links** (migration `00016_profile_social_links.sql`): `website`, `instagram`, `tiktok`, `twitter`, `linkedin` (all nullable text). Settings save handler strips leading `@` on handle fields and stores empty strings as null — replicate that in any new writer.
- **`auth.users.user_metadata.website`** is also written by the `/signup` flow (added May 2026) — distinct from the `profiles.website` column. Both stores are valid today; if you need a single canonical source, sync via trigger or in the auth callback. Don't assume one is authoritative without checking. The signup form uses `type="text"` (not `type="url"`) on this field so scheme-less URLs like `yoursite.com` are accepted — replicate that for any other user-facing optional URL input.
- **Adding an option to a controlled-vocabulary field?** Grep every writer of the column first. Three different vocab sets writing to `profiles.income_range` was the original symptom — fixed in May 2026 but the pattern can recur on any enum-like field (`disciplines`, `interests`, `career_stage`, `business_structure`, etc.). When in doubt, put the option list in a shared module under `src/lib/profile/` or `src/lib/assessment/`.
- **Module-level SDK instantiation is a build-time landmine.** Never write `const x = new SDK(process.env.X)` at the top of a `lib/` module — Next.js evaluates these during the build's "Collecting page data" step, and any constructor that throws on missing env crashes the entire build (even for routes that never use the SDK). Lazy-instantiate at first use. Pattern: `let _x: SDK | null = null; function getX() { if (!_x) _x = new SDK(process.env.X); return _x; }`. See `src/lib/email/send.ts` for the canonical example.
- **Server components calling `createAdminClient()` need `export const dynamic = "force-dynamic"`.** Otherwise Next.js tries to statically generate them at build time and crashes when Supabase env vars aren't set in the build environment (e.g. Vercel Preview on Hobby). Auth-gated pages don't benefit from prerendering anyway. Examples: `/admin/assessments/page.tsx`, `/settings/page.tsx`. The `/roadmap/page.tsx` is implicitly dynamic via cookie/auth usage.
- **Worktrees need their own `.env.local` and `node_modules` symlinks for `next dev` to start via the launch.json preset.** The `dev` config in `.claude/launch.json` uses relative `./node_modules/.bin/next` and Next.js loads `.env.local` from cwd — neither resolves automatically inside `.claude/worktrees/<name>/`. Without `.env.local`, the auth POST hangs silently because `NEXT_PUBLIC_SUPABASE_*` are missing in the client bundle (no error logged on the server side either). Bootstrap inside a fresh worktree with: `ln -s ../../../node_modules node_modules && ln -s ../../../.env.local .env.local`. Both targets are gitignored so the symlinks don't get committed. Surfaced 2026-05-07 during Phase 2 of the case-study taxonomy rollout. Worth a `scripts/setup-worktree.sh` if we keep doing per-phase worktrees.
- **Vercel env vars on Hobby plan are scoped per-variable.** They don't auto-propagate across Production / Preview / Development. When rotating or adding an env var, verify it's set in **all three** environments. Preview deploys for feature branches will silently fail otherwise. Convention: Preview should use the Development variant of any sender/SDK key (e.g. Resend dev key) so test sends don't pollute production metrics. **Vars that must be Preview-ticked for portal flows to work** (audited 2026-05-07): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (middleware admin/gated routes), `NEXT_PUBLIC_APP_URL` (Stripe redirect URLs, OG/canonical), `NEXT_PUBLIC_BOOK_DOWNLOAD_URL` + `RESEND_API_KEY` (`/api/book/download` build-time evaluation), `SEQ_ANTHROPIC_API_KEY` + `SEQ_ANTHROPIC_BASE_URL` (all AI routes), `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` + `STRIPE_PRICE_*` (4) (checkout/portal/webhook), `ASSESSMENT_AUTO_RELEASE`. Quick-check: `vercel env ls | grep Preview`. CLI gotcha: `vercel env add NAME preview --value V --yes` errors with "git_branch_required" — pass `""` as the third positional to mean "all preview branches": `vercel env add NAME preview "" --value V --yes`.
- **Vercel "Needs Attention" badges** on credentials in the env vars dashboard are Vercel's prompt to mark high-sensitivity vars (API keys, secrets, service role keys) as **Sensitive**. Sensitive vars can only be read by builds/runtime — they no longer come down with `vercel env pull`, and the dashboard won't display them back. Strict security upgrade. Mark: `SEQ_ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` for each of Production / Preview / Development.
- **Case study `industries[]` + `disciplines[]` are canonical slug arrays.** Each MDX has `industries: IndustrySlug[]` (1-2 typical, max 3) + `disciplines: DisciplineSlug[]` (1-3 typical, max 4) from `src/lib/case-studies/taxonomy.ts`. The first item is the primary, used for default sorting/rollup. The freeform `discipline: string` (singular) is kept as a human-readable display string for the case-study detail page header (e.g. "Music Production / Strategic Direction") — distinct from the typed `disciplines[]` array. The legacy `industry: string` field was removed 2026-05-07. `validateCaseStudyTaxonomy()` runs on every case-study read and throws in dev / warns in production if frontmatter contains a slug that's not in the canonical lists — so authoring drift fails loud locally.
- **Anthropic SDK in Node scripts: do NOT pass `baseURL`.** The repo's `SEQ_ANTHROPIC_BASE_URL` env var includes a trailing `/v1`, but the official `@anthropic-ai/sdk` already appends `/v1/messages` itself — passing the env var produces a `/v1/v1/messages` 404. Production routes correctly use `new Anthropic({ apiKey })` with no baseURL; new scripts should match. The env var is for tooling that expects a fully-formed base URL; the SDK isn't in that camp. See `scripts/backfill-case-study-taxonomy.ts` for the canonical script-side init pattern.

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

**Shared vocab modules** (single source of truth — don't redefine option lists locally):
- `src/lib/profile/income-ranges.ts` — `INCOME_RANGE_OPTIONS` (matches `Q6_INCOME` + `Q6_SCORES`)
- `src/lib/case-studies/taxonomy.ts` — canonical case-study `INDUSTRIES` (16, 5 groups) + `DISCIPLINES` (10) with `IndustrySlug` / `DisciplineSlug` types. **Shared between case studies and the assessment Q1 vocabulary** as of Phase 3 (2026-05-07): `src/lib/assessment/questions.ts` imports `INDUSTRIES` to build Q1 options, and `assessments.discipline` stores `IndustrySlug` values. Q1 needs human-readable descriptions per industry; those live locally in `Q1_DESCRIPTIONS` inside `questions.ts` (the canonical module doesn't carry them).

**Core portal UI**:
- `src/app/(portal)/dashboard/page.tsx`
- `src/app/(portal)/roadmap/page.tsx` + `src/components/assessment/roadmap-display.tsx`
- `src/app/(portal)/settings/page.tsx` + `src/components/portal/settings-tabs.tsx` + `creative-identity-panel.tsx`
- `src/components/portal/portfolio-tabs.tsx` + `inventory-analysis-view.tsx`
- `src/components/portal/case-studies-filters-sidebar.tsx` — two-axis facet filter for `/library/case-studies` (desktop sidebar + mobile drawer + URL state). Reusable patterns: faceted-search sidebar, constraint-aware option counts, lossless URL hydration with disabled-but-checked options
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

## What this session built (May 2026)

Two batches shipped on 2026-05-06 from parallel worktrees.

**Portal refinements + vocab cleanup pass:**

- **Dashboard** — `Portfolio State` renamed to `Portfolio Overview`; valuation hero now 3 columns (Assets cataloged | Estimated value | Leverage score)
- **Roadmap** — "All three steps complete" refresh banner appears instantly when the third action flips (lifted status state from `ActionCard` → `RoadmapDisplay`); auto-scrolls into view
- **Settings → Profile** — new Links subgroup (website + instagram + tiktok + X-Twitter + linkedin); migration `00016_profile_social_links.sql`
- **Vocab cleanup** — `profiles.income_range` unified on canonical assessment vocabulary via new shared module `src/lib/profile/income-ranges.ts`; orphaned `/onboarding` route deleted (was unreachable but writing legacy vocab); 5 dead `prefill_if_assessment` declarations stripped from evaluator questions; migration `00017_normalize_profile_income_range.sql` backfills legacy values
- **Build hygiene** — surfaced two pre-existing Vercel build failures during the deploy: module-level Resend instantiation in `src/lib/email/send.ts` (now lazy via `getResend()`) and missing `force-dynamic` on `/admin/assessments/page.tsx` (auth-gated server component that calls `createAdminClient()`). Both fixed in commit `92325ec` ("Build hygiene: lazy-instantiate Resend + force-dynamic on admin queue"). Build is now env-independent.

**Public refinements + signup polish:**

- **Case study count** — bumped 70+ → 100+ across home / `/platform` / `/pricing` / `/about` / `/the-library` / `/resources` / structures gate / signup features / FAQ (the corpus headline is now in line with the post-audit catalog of 98 cases)
- **Pricing** — dropped Full Access annual ($190/yr); plan is monthly-only ($19/mo). Removed the `Billing` type, billing state, billing toggle UI, and conditional price/period rendering from `/signup`; pricing card and FAQ copy match
- **Contact form** — all five fields required (name, email, inquiry type, subject, message); "Support" inquiry → "Platform Support" (label only — option value unchanged)
- **Signup polish** — optional Website field above Email (saves to `auth.users.user_metadata.website`; uses `type="text"` to allow scheme-less URLs like `yoursite.com`); plan-step visual hierarchy upgraded with a 1px rule above Back/Continue actions, 3px top bar on the selected card (matching the pricing page's `.pr-plan-card--featured::before` pattern), and muted text on the unselected card

See `CHANGELOG.md` 2026-05-06 entries for the full lessons-learned sections.

**Case study taxonomy rollout — Phase 1 (2026-05-07):**

- New canonical taxonomy module `src/lib/case-studies/taxonomy.ts` (16 industries × 10 disciplines, 5 industry groups) with `IndustrySlug` / `DisciplineSlug` types
- All 104 case study MDX files migrated: `industries: IndustrySlug[]` + `disciplines: DisciplineSlug[]` added; legacy `industry: string` removed; freeform `discipline: string` (display string) preserved
- Backfill via `scripts/backfill-case-study-taxonomy.ts` (Claude API, two-pass: propose → apply, with calibration gate before mass run). Proposals JSON gitignored, regeneratable
- Build-time validator (`validateCaseStudyTaxonomy()`) in `src/lib/content.ts` — fails loud in dev when MDX contains an invalid slug
- Phase 1 consumer shims (filters / search / recommendations / library page) point at `industries[0]` for primary-industry semantics; the proper sidebar two-axis filter UI ships in Phase 2
- Worked-examples table in `case-study-taxonomy.md` extended with Brandon Stanton + Mimi Chao; Sahil Lavingia tagging updated per editor's call

Phases 2 (sidebar filter UI), 3 (assessment Q1 vocab alignment + 6 new pools), and 4 (cross-cutting docs) ship from their own worktrees later — see `content/reference/case-study-taxonomy-rollout-plan.md`.

See `CHANGELOG.md` 2026-05-07 entry for the full lessons-learned section.

**Case study taxonomy rollout — Phase 2 (2026-05-07):**

- New `src/components/portal/case-studies-filters-sidebar.tsx` — desktop sidebar (240px sticky) + mobile bottom-sheet drawer. Two-axis facet filter: Industries (16, sub-grouped by `INDUSTRY_GROUPS` domains) + Disciplines (10 flat). Multi-select within facet (OR), AND across facets.
- URL-persistent filter state via `useSearchParams` + `router.replace`: `?industries=music,film_tv&disciplines=production`. Hydratable from any URL — disabled-but-checked options stay checked so the URL round-trip is lossless even when the combination yields zero results.
- Per-option counts are constraint-aware: each count reflects the matching set if THIS facet's selection were just `{option}` while OTHER facets stay constrained — so toggling actually yields the displayed number. Zero-count options display as disabled.
- Featured-1 + featured-2 hero pattern preserved across filter states (matches the prior tab-bar's "first match becomes the hero" behavior). Empty state with "Clear all filters" CTA when zero matches.
- `case-studies-filters.tsx` (old single-axis tab-bar) deleted; the page-level `industries: Array<{slug,label}>` derivation deleted with it (the sidebar derives everything from the canonical taxonomy module).
- New CSS block at the end of `portal.css` (~280 lines, all `csf-*`-prefixed) with dark-mode overrides for the buttons that would invert when `--white` flips.

Phase 2 only touches the **portal** `/library/case-studies` page. The public `/case-studies` route is currently a 3-line stub and was not part of Phase 2 scope; building out a full public version is a future task.

See `CHANGELOG.md` 2026-05-07 (Phase 2) entry for the full lessons-learned section.

**Case study taxonomy rollout — Phase 3 (2026-05-07):**

- Assessment Q1 vocabulary aligned with the canonical case-study taxonomy. 8 legacy slugs renamed (`visual_arts` → `visual_art`, `film_video` → `film_tv`, `music_audio` → `music`, `performing_arts` → `theater`, `architecture_interiors` → `architecture`, `fashion_apparel` → `fashion`, `advertising_marketing` → `advertising`, `technology_creative_tech` → `technology`). 6 new industries added (`photography`, `comics`, `comedy`, `media`, `hospitality`, `gaming`).
- `src/lib/assessment/questions.ts` Q1 now imports `INDUSTRIES` from `src/lib/case-studies/taxonomy.ts` — single source of truth for the 16-industry vocabulary. Industry-specific Q1 descriptions (sub-discipline hints) live in a local `Record<IndustrySlug, string>` in `questions.ts`.
- `SUB_DISCIPLINES` typed strictly internally (`Record<IndustrySlug, AssessmentQuestion>`) for build-time exhaustiveness; exported as `Record<string, AssessmentQuestion>` for consumer indexing with DB string values.
- 12 new questions across the 6 new pools — 2 per pool (one ownership/rights norm, one deal/structure norm) per spec §4B. IDs: `Q-IND-PHOTO-1/2`, `Q-IND-COMICS-1/2`, `Q-IND-COMEDY-1/2`, `Q-IND-MEDIA-1/2`, `Q-IND-HOSP-1/2`, `Q-IND-GAMING-1/2`.
- Pool keys in `INDUSTRY_POOLS` renamed to mechanical `industry_${slug}` form (e.g. `industry_art` → `industry_visual_art`, `industry_film` → `industry_film_tv`, `industry_performing` → `industry_theater`). Existing question IDs (`Q-IND-ART-1`, etc.) intentionally left unchanged — they're persistent identifiers in `assessments.industry_questions` JSONB.
- `DISCIPLINE_GROUP_MAP` + `DISCIPLINE_TO_GROUP` in `src/types/assessment.ts` + `getReaction()` Q1 labels in `src/lib/advisor/assessment-state-machine.ts` updated to the 16-slug vocabulary.
- Migration `00018_normalize_assessment_industry.sql` backfills the 8 renamed slug values; the 6 new slugs require no backfill (no existing rows hold them).
- Spec doc renamed `seq-assessment-build-spec-v2.md` → `seq-assessment-build-spec-v3.md`. v3 changes the freshness note + Q1 table (§3) + Section 4B pools to reflect the 16-industry vocab — bringing it in sync with the live code. References updated across CLAUDE.md, the rollout plan, the advisor spec, and the deal-evaluator spec.
- `scripts/seed-test-users.ts` updated: Jordan Rivera's `discipline: "directing"` (a sub-slug at the top level — non-canonical even pre-Phase-3) → `discipline: "film_tv", sub_discipline: "directing"`. Other 4 seeded users were already on canonical slugs.

See `CHANGELOG.md` 2026-05-07 (Phase 3) entry for the full lessons-learned section.
