# Sequence — Architectural Changelog

Session-level log of material architectural changes. One entry per substantive working session. Not a commit log — see `git log` for that. Use this to reconstruct the arc of how the platform got to where it is.

**End-of-session protocol:** before closing a session, ask:
1. Did we change architecture? → update `CLAUDE.md`
2. Did we hit a bug worth remembering? → add to `content/reference/troubleshooting.md`
3. Did we ship a new pattern or component? → update `design.md` if it's reusable
4. Did anything material happen at all? → one entry here

---

## 2026-04-30 — Dashboard portfolio state + 10 new case studies

**Goal:** Transform the dashboard from a CTA navigation hub into a portfolio-state surface that meets active members where their data already lives. Plus a substantial library expansion (10 new case studies) and two bug fixes from member testing.

### Dashboard portfolio cards

Three new cards in `src/components/portal/dashboard-cards.tsx` surface portfolio-level state without requiring drill-down:

- **DashValuationCard** — full-width hero with valuation range left, leverage score right (green/yellow/red color-coded), divider between, then 5 horizontal driver bars (IP Strength · Market Demand · Differentiation · Execution Readiness · Financial Upside) with low/medium/high axis below the bar. Editorial big-number treatment per Neil's reference screenshots. Body link → `/inventory?tab=analysis`.
- **DashRiskFlagsCard** — list of up to 5 risks with severity-coded icons (filled red circle for high, hollow ring for medium/low). Body link → `/inventory?tab=analysis`.
- **DashDealsEvaluatedCard** — last 5 individual deals with signal dot, type chip, score, and "View all deals →" footer. Body link → `/evaluate`. Distinct from the existing aggregated `DashboardEvalCTA` (which stays as a navigation prompt).

**Schema additions** in `src/types/inventory.ts`:
- `summary.leverage_score` is now contractually one word (`low | medium | high`); the explanation moved to a separate `summary.leverage_rationale` field
- `value_drivers: ValueDriver[]` (5 named, in fixed order, with `pct` 0-100 + `score` low/medium/high + `rationale`)
- `risks: PortfolioRisk[]` (top 5, sorted by severity descending)
- All optional for back-compat; render layer extracts the first matching word from any legacy single-field `leverage_score` and parses "High — text" patterns out as fallback rationale

The portfolio-analysis Claude prompt (`/api/inventory/analyze/route.ts`) was updated to emit the new fields with constraints documented inline.

### Dashboard layout: Portfolio State at top

After two iterations on placement, the final layout for active users (those with data):
1. Portfolio State section (top) — **Valuation card spans the full main-body width** on row 1; Risk Flags + Deals Evaluated render 2-up on row 2
2. Roadmap CTA (kept — unique value not duplicated by Portfolio State)
3. Creative Identity CTA (only when not yet completed — auto-hides after)
4. Featured Case Studies

**Conditional CTAs eliminated duplication**:
- `DashboardInventoryCTA` renders only when `!inventoryAnalysis` (Valuation card subsumes its info once data exists)
- `DashboardEvalCTA` renders only when `recentDeals.length === 0` (Deals Evaluated card subsumes once data exists)
- New users still see all CTAs above the fold; active users see state instead

**Card structure unified**: all three cards moved from `<Link>` root to `<div>` root with a separated `.dash-card-head` row + `.dash-card-body-link`. Head holds the section label and optional action pill (`+ Add Assets` on Valuation, `+ New Evaluation` on Deals); pills navigate independently of the body link.

**`?tab=analysis` URL param** added in `src/components/portal/portfolio-tabs.tsx` — Valuation + Risk Flags cards deep-link directly to the Analysis tab instead of dumping users on the default Assets tab. URL uses the user-facing name "analysis"; internal state stays "valuation" for back-compat.

### 10 new case studies

10 case studies converted from `.md` source drafts to MDX, all with hero / cover / secondary images sourced via the image-sourcer tool:

**Batch 1** (#86–#89): Emma Chamberlain (founder equity + product partnership + premium service), Jason Fried (constraint-based + Bezos minority deal + holding company), Mark Rober (creator-as-platform + franchise/licensing + holding company), Sahil Lavingia (creator-as-platform + revenue share + holding company; the only regression case in the library).

**Batch 2** (#90–#95): Ava DuVernay (4-entity ARRAY: holding + creative collective + platform cooperative), Coralie Fargeat (final cut as asset + 3-party JV + Stage-2 holding company), Mikkel Eriksen / Stargate (catalog IP securitization + JV + creator-as-platform), Ryan Coogler (first-dollar gross + 25-year reversion + Proximity Media), Sean Baker (constraint-based + persistent team + pre-sale deal), Tina Roth Eisenberg (5-venture portfolio + light-touch franchise + the Tattly/BIC exit reckoning).

Each follows the gold-standard structure: CbDropCap thesis + CbPullQuote · CbTimeline (3-6 eras) · 3 structure sections with badge + heading + body + CbTabs/CbTable/CbAccordion · **CbFlywheel hub-and-spoke "circles of circles" SVG** (central black circle + 6 satellites + perimeter cycle arrows + dashed spokes) · Transferable Lessons accordion · CbSources · CbRelated.

Library count: was 85, now 95.

### Two bugs fixed (member testing)

- **Admin sidebar X rendering large**: when the portal sidebar's `.sb-close` JSX + CSS was removed earlier, the admin sidebar still had the same JSX. With no CSS to style it, the button rendered with default browser styling. Removed the orphaned JSX and unused `CloseIcon` import.
- **Refresh Roadmap not creating a new plan**: `handleRegenerate` POSTed to `/api/assessment/regenerate`, which mutated the existing `strategic_plans` row in place. Plan_id never changed, so `assessment_actions` rows tied to that plan still showed completed on reload — banner stayed up. Fix: point `handleRegenerate` at `/api/roadmap/refresh` instead, which calls `createStrategicPlan()` to create a NEW row with a fresh plan_id.

### Drivers axis label bug fixed

"High" was rendering as default body sans at full size because the prior CSS only styled `:nth-child(2)` ("Medium"). Restructured: 3 labels wrap in a single `.dash-drivers-axis-track` span placed in grid column 2 (under the bar), all 3 children share mono 9px / `.12em` tracking via inheritance.

### Seed updates

All 4 power users (Jordan / Priya / Marcus / Maya) in `scripts/seed-test-users.ts` got the new schema fields (one-word leverage_score, leverage_rationale, value_drivers, risks). Email domain flipped from `insequence.co` → `insequence.so` across all 10 test/demo accounts. SQL cleanup of `.co` orphans documented in the session.

**Outcome:** Members with data now land on their portfolio status first; CTAs drop below as "what's next" navigation. Library expanded by 10 cases covering filmmaker holding-co architecture (Coogler, DuVernay), the discipline path (Baker), contractual leverage (Fargeat), catalog economics (Stargate), exit reckoning (Tina), and four creator-economy plays (Emma, Jason, Mark, Sahil). Two member-reported bugs closed.

---

## 2026-04-24 — Stage 4 archetypes + Platform CI horizontal scroller

**Goal:** Close the Stage 4 gap in the archetype system and rebuild the public Platform page's Creative Identity section as a richer, asymmetric showcase that all 8 archetypes can live in.

**Shipped:**

**Two new Stage 4 archetypes** in `src/lib/assessment/archetypes.ts` — the first 6 topped out at stage_range `[2, 3.5]`, so any member detected at Stage 4 (Capital Formation, $2M+) was getting routed into a Stage 3 archetype that undersold their position.
- **Capital Allocator** (`builder / service / transition`) — operator graduating to portfolio role. 3 actions: formalize allocator role (family office / fund / investment LLC) · write investment thesis · make first structured portfolio bet. Sigil: filled HQ + 4 cardinal satellite squares with connecting rays.
- **Creative Principal** (`maker / performer / hybrid`) — Virgil Abloh-style: taste as IP across multiple ventures, written doctrine, second principal. 3 actions: creative services holding structure · codify the taste · hire second principal. Sigil: filled center taste-node + 5 rays fanning to varied satellites (mixed geometry = multi-discipline).
- Routing happens automatically through the existing weighted matcher (+3 stage range, +2 mode match) — no change needed in `archetype-matching.ts`. A maker at Stage 4 → Creative Principal; a builder/service → Capital Allocator.

**Public Platform page CI section — full redesign** in `src/app/(public)/platform/page.tsx` + `src/components/platform/archetype-scroller.tsx` (new) + `src/app/globals.css`.
- Iterated through three layouts to land on the right one: 3-up grid (initial) → 4-up + 2-centered asymmetric (request 1) → single-row horizontal scroller (request 2). The scroller is the keeper.
- New `ArchetypeScroller` client component: all 8 cards in a single horizontal row wider than the viewport. On fine-pointer + hover-capable devices, mouse x-position inside the section drives `scrollLeft` via rAF lerp (14% easing per frame). Touch / coarse pointer / reduced-motion fall back to native overflow-x scroll. Edge-fade gradients toggle via `has-overflow-left` / `has-overflow-right` to hint scrollability.
- Card content went from sigil + title + desc → sigil + kicker + title + desc + typical stage band with dot-rail + income band + 2 example friction points with stroked-triangle markers.
- Section head reflowed: title spans cols 1-7 on row 1, description + bullets sit on row 2 at cols 3-6 for asymmetric indent. Bullets use mono `[LABEL]` + 11px sans copy with stroked-triangle markers (inline SVG, flex layout, pixel-perfect vertical centering with the mono label — verified delta 0).

**New shared component:**
- `src/components/platform/archetype-scroller.tsx` — first instance of mouse-position-driven horizontal scroll in the codebase. Reusable for any showcase row that needs to feel rich without claiming vertical real estate.

**Outcome:** Creative Identity section on the public Platform page now does the conceptual heavy lifting it was supposed to — all 8 archetypes visible, all coverage from Stage 1 to Stage 4 represented, the system's logic legible to a visitor before they sign up. Members at Stage 4 finally land in an archetype that matches their position.

---

## 2026-04-24 — Refinements pass (platform, case studies, portal mobile, roadmap)

**Goal:** A series of small, well-scoped refinements across the public site and portal — no architectural change, just surface-level polish and a few UX corrections caught in walkthroughs.

**Shipped:**
- **Platform page** — new "Creative Identity" section below the tool cards, showcasing 3 archetype preview cards (Unstructured Creative / Platform Builder / Untapped Catalog) with SVG sigils. Sigils extracted from `creative-identity-panel.tsx` into a shared `src/components/shared/archetype-sigil.tsx` so public + portal both consume the same component
- **Case study titles** — 6 concatenated-word titles fixed (Tyler Mitchell, Tash Sultana, Joey L, Kristian Andersen, Pomplamoose, Paul Trillo). Continuation of the earlier `DJto`-style sweep — one more pattern (`AITransition`) caught this round
- **Portal mobile nav** — removed the redundant X close button; the carrot collapse button now closes the drawer on mobile and toggles collapsed state on desktop. Single toggle, behavior varies by viewport
- **Portal top-right buttons** — Save / Regenerate / Download PDF wrap their text in a `.btn-bookmark-label` span and hide it below 640px, leaving just the icon with tightened padding. `aria-label` added so screen readers still get the full label
- **Roadmap section order** — Recent Deal Signal moved from position 3 (right under Your Position) to position 5 (after Structural Misalignments, before Your 3 Next Steps). Misalignments get more weight; deals now sit closer to the forward-looking actions they influence. Your Vision keeps Transition Signals nested at its bottom — no internal change
- **Roadmap all-steps-complete banner** — when all 3 `assessment_actions` for the current `plan_id` are `completed`, a banner renders under the actions with a "Refresh Roadmap" CTA that calls the existing `handleRegenerate` flow. Derived from `roadmap.actions.every(...)` — no new API or DB column
- **Roadmap PDF polish** — editorial two-column header (title left, member/date right), thin black rule above each section label, subtle tinted cards for Position/Vision/Actions, numbered black circles on each Next Step, updated footer ("insequence.so · page N / total"). Same 3-page structure; styling-only pass
- **Structures mobile** — Alternatives condition can now wrap to its own line (`flex-shrink: 1`, `flex-basis: 100%` at ≤640px) so the structure name doesn't get squeezed into 3 lines. Tables drop their 480px min-width and let the first column wrap, mirroring the `.cb-table` case-study pattern
- **Portfolio Analysis horizons** — Medium Term and Long Term Vision now render as two side-by-side cards in a grid (stacked below 640px). Each card has a line-art SVG icon (clock for medium, mountain-peak for long-term) and body text bumped from 13px → 15px

**New shared component:**
- `src/components/shared/archetype-sigil.tsx` — single source of truth for the 6 archetype SVG marks. Consumed by `creative-identity-panel.tsx` (portal) and `platform/page.tsx` (public)

**Outcome:** Public Platform page finally shows the Creative Identity story with its own visual weight. Roadmap narrative reads tighter (misalignments → deal signal → actions) and the "you're done — refresh" loop is closed. Mobile nav is no longer confusing, and Structures + Portfolio read cleanly on phone. PDF download looks worth printing.

---

## 2026-04-19 — Documentation hardening + future scope

**Goal:** Make the docs robust enough that a fresh Claude session can ramp on architecture in <5 min and avoid re-introducing bugs we already paid for.

**Shipped:**
- Created `design.md` (root) — portable digital product design system (tokens, components, motion, dark mode rules, editorial voice, file map)
- Created `content/reference/troubleshooting.md` — symptom → root cause → fix for 16 recurring bugs from this arc, organized by area (AI/roadmap, settings/CI, dark mode, UI rendering, content, dev/deploy)
- Created `content/reference/advisor-memory-spec.md` — Path B scope for persistent advisor memory (structured insight extraction). ~2 week build, not yet implemented
- Created `content/reference/sequence-mcp-spec.md` — v0 scope for Sequence MCP server exposing platform data to Claude Desktop + future AI features. ~3-4 day build, not yet implemented
- Added "Spec freshness — read before treating any spec as gospel" section to `CLAUDE.md` enumerating which older specs are still authoritative vs. evolved
- Added 5-7 line freshness banners to `seq-assessment-build-spec-v2.md`, `seq-ai-advisor-experience-v1.md`, `deal-evaluator-spec-v2.md`, `deal-evaluator-assessment-integration.md`, `design-system.md`
- Created this `CHANGELOG.md`

**Outcome:** Three-layer doc defense — architecture in CLAUDE.md, bug history in troubleshooting.md, freshness flags on older specs. Future sessions get oriented quickly without rediscovering known traps.

---

## 2026-04-18 — UI iteration cycles + dashboard case-card debugging

**Goal:** Member-facing polish across all surfaces shipped in the consolidation.

**Shipped:**
- Roadmap redesign tweaks: tabs back for diagrams (legibility), transition signals as 3 metric cards (limit + new layout), recommended reading 2-col cap at 3 each, reading path with breathing room
- New `RoadmapAdvisoryCTA` (cs-gate style) at bottom of roadmap
- Evaluator: dimension breakdown accordion always shows description; verdict actions feed into roadmap regen via shared generator
- Dashboard `Personalize` card linked to Creative Identity, copy + time updated
- Removed `Discuss with Advisor` button from evaluator verdict
- Settings: Preferences moved below Profile/Bio; CI relationship clarified in copy
- Misalignment cards: 2-column when 2+ items; always-dark interior cards
- Transition signals: white-bg cards in light mode (was beige)
- Approved providers whitelist (`src/lib/roadmap/approved-providers.ts`) — only known-real services pass through; AI hallucinations filtered out
- Unified generation loading UI (`GenerationProgress` shared component) across Portfolio, Evaluator, CI wizard, Roadmap
- Creative Identity portrait redesign in Settings tab — per-archetype SVG sigil + stage band + facet grid + friction points
- Dashboard case study cards: cover-image background via real `<img>` element after multiple cascade battles. Final form: z-stack with overlay + content layered on image
- Dark mode comprehensive fixes: `var(--white)` flip understood and hardcoded `#ffffff` on always-dark surfaces (cs-gate, lib-card--dark, btn--white, cs-featured-name); diagram CSS vars added for theme-aware SVGs; progress bar dark-theme overrides; cover overlay scoped with `:not(.lib-card--cover)`
- Admin sidebar refactored to match portal sidebar pattern (collapse toggle, icon-only rail, label spans)
- Many bug fixes from member testing — verdict regression (max_tokens=4096 + resilient JSON parse), action persistence across regens, flywheel arrow geometry, related card portal/public URL rewriting
- Case study title sweep: 19 concatenated-word titles fixed (DJto → DJ to, etc.)

**Outcome:** Production-ready UI across the consolidated experience. All major dark mode landmines documented + fixed.

---

## 2026-04-18 — Five-batch platform consolidation (A → E)

**Goal:** Restructure the portal so that Portfolio Analysis is the keystone input, Roadmap is the primary output, Evaluate is the ongoing input loop, and Creative Identity is optional personalization. Eliminate the silos between Portfolio / Roadmap / Deal Evaluator.

**Batch A — Creative Identity reframing:**
- Renamed user-facing "Assessment" → "Creative Identity" (DB table `assessments` unchanged)
- Settings page is now tabbed: Profile | Creative Identity
- New `CreativeIdentityPanel` with three states (empty / in-progress / complete)
- Member context block (`buildMemberContext()` + `buildMemberContextPrompt()`) injected into evaluator's system prompt — same canonical block the advisor uses
- Updated user-facing copy across dashboard CTA, wizard, roadmap, advisor

**Batch B — Roadmap decoupling + unified generator:**
- Migration `00015_roadmap_decoupling.sql` — `strategic_plans.assessment_id` nullable, new `source` enum + `portfolio_analysis_id` FK
- Shared generator at `src/lib/roadmap/generate-plan.ts` — accepts `{ userId, assessmentId?, portfolioAnalysisId? }`, returns `{ planId, source, runGeneration }`. Caller schedules `runGeneration` via `after()` + `maxDuration`
- Auto-trigger roadmap regen on Portfolio Analysis completion
- Critical fix: serverless timeout. Long Claude calls (30-90s) require `after()` to keep function alive. Fire-and-forget without `after()` was being killed by Vercel mid-Claude-call, leaving plans stuck in 'generating' forever

**Batch C — Deal Evaluator refresh + deal-history aggregation:**
- New `RefreshRoadmapCTA` on evaluator verdict (gated to meaningful signal — yellow/red or any red flags, AND user has existing roadmap)
- New `/api/roadmap/refresh` endpoint
- Shared generator now pulls deal verdicts (`recommended_actions`) and folds patterns into roadmap prompt
- New "Recent Deal Signal" block on roadmap display

**Batch D — Roadmap UI redesign:**
- Diagrams (Entity Structure + Value Flywheel) promoted from "buried under tabs" to top-of-page headline
- Initially side-by-side (later reverted to tabs for legibility — diagrams need full width)
- Source-based subtitle: "Built from your Creative Identity + Portfolio audit + N recent deals"

**Batch E — Nav + dashboard reorientation:**
- Sidebar swap: Roadmap moved up (now position 3), Evaluate down (position 4). Order reflects journey: Dashboard / Portfolio / Roadmap / Evaluate / Advisor
- New `DashboardRoadmapCTA` shown once a strategic plan exists
- Dashboard CTA order mirrors data flow: Portfolio → Roadmap → Evaluate → Creative Identity
- Removed onboarding "path cards" (off-message now that Portfolio is canonical)

**Outcome:** Single keystone-driven loop. Portfolio in → Roadmap out → Deals refresh roadmap → Creative Identity tunes everything. Architecture is finally aligned with the product narrative.

---

## 2026-04-17 — Platform reorientation + UI updates (pre-consolidation)

**Goal:** Surface-level updates ahead of the bigger architectural work. Mostly home page, case studies, navigation, copy.

**Shipped:**
- Home page hero rewrite, intro section update, footer Library link
- Case study fixes: secondary images, related links, missing line-break titles, Cleo Abram + Jeremy Cowart specific updates
- Cowart case study: replaced entity-style flywheel with value-flywheel design (clusters of outputs grouped by value type)
- Public Library page (`/the-library`) created
- Platform page tool cards reordered + retitled, hero copy update
- Book download flow improvements (single-row form, dedicated email template, page redesign)
- Dashboard featured case studies use cover images
- Site metadata standardized ("Sequence — Own Your Future" / "Transform your portfolio of projects into a portfolio of assets.")
- Portfolio Analysis: timing expectations (60-90s), valuation tab CTA, completion handling
- AI Advisor crash fix on legacy conversations (undefined `parts`)
- Hero image race condition on cross-route-group navigation (RevealProvider MutationObserver enhancement)
- Admin newsletter multi-select + book download segment
- Deal evaluator empty pages diagnosed (missing deal_verdicts rows — SQL seed)

**Outcome:** Surface polished. Set the stage for the consolidation work that followed.

---

## Format

Each entry uses:

```
## YYYY-MM-DD — Short title

**Goal:** One sentence on what this session was trying to achieve.

**Shipped:**
- Bullet per material change
- Group by feature/area if it's a big session
- Link to specific files/migrations only when load-bearing

**Outcome:** One sentence on the resulting state.
```

Entries should be readable to a fresh Claude session that has never seen the codebase. Avoid jargon without context. When in doubt, name the file.
