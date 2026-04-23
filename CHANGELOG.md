# Sequence — Architectural Changelog

Session-level log of material architectural changes. One entry per substantive working session. Not a commit log — see `git log` for that. Use this to reconstruct the arc of how the platform got to where it is.

**End-of-session protocol:** before closing a session, ask:
1. Did we change architecture? → update `CLAUDE.md`
2. Did we hit a bug worth remembering? → add to `content/reference/troubleshooting.md`
3. Did we ship a new pattern or component? → update `design.md` if it's reusable
4. Did anything material happen at all? → one entry here

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
