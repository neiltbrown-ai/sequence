# Sequence — Architectural Changelog

Session-level log of material architectural changes. One entry per substantive working session. Not a commit log — see `git log` for that. Use this to reconstruct the arc of how the platform got to where it is.

**End-of-session protocol:** before closing a session, ask:
1. Did we change architecture? → update `CLAUDE.md`
2. Did we hit a bug worth remembering? → add to `content/reference/troubleshooting.md`
3. Did we ship a new pattern or component? → update `design.md` if it's reusable
4. Did anything material happen at all? → one entry here

---

## 2026-05-05 — Case study audit Phases 3 and 5: era restructure (10 cases) + WWT lesson (98/98)

**Goal:** Continue the multi-phase case study audit. This session covered Phase 3 (era validity audit) and Phase 5 ("What Wouldn't Transfer" lesson — required across all 98 cases).

### Phase 3 — Era audit

Inventoried 340 era markers across 98 cases. Deep-audited 31 cases (all 4+ era cases + 5 three-era cases with 1-year-span eras + 1 two-era outlier); light-passed 67 standard 3-era cases via duration scan.

Surfaced 6 auto-merge proposals + 33 flag-for-reviews + 2 8+ era acks for Neil's annotation. Approved annotations applied across 5 batches:

- **Batch 1** (`1b643f1`) aries-moross (Era 3+4 merged), sean-baker (Era 5 merged into 4), timothy-goodman (Era 5+6 merged)
- **Batch 2** (`f873634`) mikkel-eriksen-stargate (Era 4+5 merged), bjarke-ingels (Era 9 relabeled "Critique, Accountability, and Structural Evolution"), jason-fried (Era 3 split into "Product Expansion" + "Strategic Focus" — 4→5 eras)
- **Batch 3** (`41971bd`) emily-cohen (Era 1+2 merged, Era 5+6 merged into "Succession & Industry Advocacy" — 6→4 eras)
- **Batch 4** (`b869118`) rich-tu (Era 4 removed, bullets redistributed), jeremy-o-harris (Era 2+3 merged, Era 5+6 merged — 7→5 eras)
- **Batch 5** (`32b5d30`) loveis-wise (5→3 eras, complex restructure per Neil's instruction)

Net: −9 era markers across 10 cases (340→331 total). One ambiguous annotation (F24 liz-lambert Era 8) defaulted to keep; logged as carry-forward in audit-handoff memory.

### Phase 5 — "What Wouldn't Transfer" lesson

Library is now **98/98 cases** with a canonical "What Wouldn't Transfer" lesson at the Tyler/Lucas voice register.

**Stream A — Backfill the missing.** Initial inventory showed 41 cases without the lesson (after correcting an inventory error: original grep `"What Wouldn"` missed cases using "What Would Not Transfer" without the contraction; corrected regex enumerates all label variants).

- **Calibration batch** (`3781cc0`) — 5 drafts approved by Neil before bulk: temi-coker (heavy-inference), a24 (institutional-mixed), bjarke-ingels (long-career platform), loveis-wise (identity-aligned authorship), liz-lambert (long-career founder).
- **Bulk pass via 3 parallel subagent batches** — 36 remaining cases. Per-batch commits: A (`b45d131`), B (`3d73fba`), C (`518f922`). 12 cases each.

**Stream B — Voice-register fix on existing.** Audit of the 57 pre-existing lessons surfaced 13 drift cases with the wouldn't-transfer paragraph but no closing transferable-pattern turn. Fixed in a single batch (`b55a519`):

- 12 cases: appended a closing-turn paragraph (~60–90 words) inside the existing `<CbAccordionCard>`, preserving wouldn't-transfer content unchanged.
- 1 case (ohneis-andries-ohneisser): structural migration. WWT lesson was rendered as raw markdown under a `<CbSubheading>` outside the accordion. Migrated into the accordion as `<CbAccordionCard num="06">` with closing turn appended; old subheading + raw markdown removed to avoid duplication.

### Editorial conventions doc — §13 populated

`content/reference/case-study-editorial-conventions.md` §13 ("The 'What Wouldn't Transfer' lesson") was a placeholder pointing at Phase 5; now populated with the full convention. Covers: card position and structure (two paragraphs, append as final card in lessons accordion); five source categories for wouldn't-transfer factors (scale, timing, network, identity, discipline accident); financial-data caveat as 4th factor for inferred cases; closing turn requirements (`**But X is universal**` + named transferable moves + scale-anchored close); length targets; anti-patterns (missing closing turn, generic factors, boilerplate close, invented moves, hedging); canonical references (Tyler + the 5 calibration exemplars).

### Operational learnings (for future bulk-style work)

- **Inventory grep needs all label variants.** Phase 5 inventory missed 5 cases because the initial grep `"What Wouldn"` excluded "What Would Not Transfer" without the apostrophe contraction. Use `grep -lE "What (Would|Wouldn'?t|Doesn'?t|Won'?t) (Not )?Transfer"` going forward. Apply this generally — when inventorying lessons / sections / patterns by phrase match, enumerate variant forms upfront.
- **Bash CWD is unreliable across calls.** The system claims it persists, but in practice it sometimes reverts to session-start CWD. Symptom: `git status` returns the wrong worktree's state, files appear missing, etc. Always prefix git/build commands with explicit `cd <worktree-path> &&`. Got bit twice during Phase 5 calibration — a rogue commit accidentally captured pre-existing main-checkout image-frontmatter changes under a misleading message; had to `git reset HEAD~1` and redo from the worktree.
- **Calibration gates pay off again.** Same pattern as Phase 2 calibration: 5 drafts to Neil before unleashing 3 parallel subagent batches on the remaining 36 cases. The voice register established by the calibration carried through cleanly to the bulk pass.
- **Voice-register audit on existing as a separate stream.** Phase 5 had two streams: backfill missing lessons (Stream A) AND audit existing lessons for register drift (Stream B). The drift audit surfaced 13 cases that needed the closing turn added — easy to miss without an explicit pass. Worth replicating for any future "every case must have X" sweep.

### Files touched

10 case studies for Phase 3 (`content/case-studies/*.mdx`). 54 case studies for Phase 5 (5 calibration + 36 bulk + 13 drift fix). `content/reference/case-study-editorial-conventions.md` (§13 populated, provenance updated). `audit-handoff` memory (status table + carry-forward + operational learnings).

10 commits this session. Build clean throughout (~395 static pages every commit).

### Phases remaining (next session)

4 (Related-cases audit), 6.1.a (Verification block standardization → populates §12), 6.1.b (Verified Data Points + **APPROVAL GATE on calibration batch**), 6.1.c (Section nav + frontmatter mass update), 6.2 (Confidence badge component), 6.3 (Stat header `estimated` prop → populates §11), 7a (`case-study-components.md` updates for new components), 7b (polish editorial-conventions doc + cross-link).

Phase 4 is now the lightest remaining lift (mostly `<CbRelatedCard>` swaps); Phase 6.1.b is the next heavy editorial lift.

---

## 2026-05-04/05 — Case study audit (Phases 0, 1, 1.5, 2, retro): 98 cases recalibrated

**Goal:** Run a comprehensive editorial audit of the case study library — calibrate language honesty about evidence type, fix structure-mapping drift, normalize case numbers, soften the public CTA on `/the-library`, and create a persistent in-repo home for the editorial conventions that emerged. Multi-day work; this entry covers the first session.

### Phases completed (of the original v5 briefing)

- **Phase 0** — `publishedAt` backfilled across all 98 cases (`updatedAt` value copied where missing). Required by Phase 4 recency cap. (`b48a0ef`)
- **Phase 1** — Structure-mapping audit. Subagent reviewed 593 `<CbStructureBadge>` instances; surfaced 19 auto-correction proposals + 11 flag-for-review. Neil approved all 30.
- **Phase 1.5** — Applied approved structure corrections across 21 cases. Body badge `num`+`href` swaps + frontmatter `structures: [...]` array updates. (`f0d2238`)
- **Case-number renumber** — Numbers had drifted (4 duplicates, 10 gaps, max 104). Renumbered sequentially 1-98 sorted by `(publishedAt, original-num, slug)`. 94 cases changed. (`8839ba0`)
- **Phase 2 (Pattern 8)** — Softened the cases-gate CTA on `/the-library` ("Real deals / Real terms / Real outcomes" → "Real careers / Real structures / Real receipts"; 70+ → 100+ count fixes). (`e547d1a`)
- **Phase 2 calibration** — 5 cases (`george-lucas`, `a24`, `temi-coker`, `tyler-the-creator`, `reese-witherspoon`) edited per the 5 active patterns. Self-imposed approval gate. Calibration revealed body-softening gap (Coker thesis body asserted licensing as fact while the closing disclosure walked it back) — addressed in extension commits before bulk pass. (`f6e6539`, `1ead8c9`, `192233a`)
- **Phase 2 bulk pass** — 6 parallel subagent batches edited the remaining 93 cases. 476 edits applied across all batches, 0 cases skipped. (`31e1f87`, `7c358e8`, `411cdd1`, `bdcabf0`, `a1a8267`, `026df75`)
- **Phase 1.5 retro** — Consolidated 19 borderlines surfaced during Phase 2 into a single retro pass: §A 6-case `#14` systemic fix, §B 2 calibration carry-forwards (tyler `#12`, reese `#6`), §C 11 individual mismappings. Applied 17 of 19. (`f4fe9e1`, `ba4525b`, `8581662`)

### New persistent reference docs

- **`content/reference/case-study-editorial-conventions.md`** (412 lines) — Sister doc to `case-study-components.md`. Covers voice register, evidence honesty, three-verb system, Pattern 6 disclosure register, body-softening, anti-hedge rule, and the 4 systemic structure-mapping patterns. Calibrated against the 5 gold-standard exemplars. (`4cc5d24`)
- **`content/reference/library-expansion-candidates.md`** — Tracks structural patterns that don't fit the 35-structure library cleanly. (`18ae81c`)

### Editorial conventions encoded

The audit produced a body of editorial calibration that's now codified in `case-study-editorial-conventions.md`:

- **Two-register rule** — declarative when evidence supports, attributed/sourced when it doesn't, never the throat-clearing middle.
- **Banned hedge phrases** — "appears to apply", "seems to have used", "what looks like", "could be characterized as", "may have likely", "reportedly" (without source), "according to industry sources" (without source). When softening unverified claims, name the actual evidence OR name the gap directly. (Anti-hedge rule self-corrected mid-audit when "reportedly" was caught creeping into a Coker softening edit — encoded as §10.)
- **Three-verb system** for structure attribution: "Used / Applied / Structured the deal as" (documented), "The deal pattern matches / The arrangement is structured as" (inferred-with-public-mechanics), "Functions as / Resembles / Consistent with" (analytical-framing). Lucas knew he was retaining rights but did NOT know he was "applying Structure #30" — verbs must reflect that we're reading our framework onto deals, regardless of disclosure level.
- **Pattern 6 disclosure sentence** at the end of every thesis paragraph, voice-tuned per case (Lucas direct, A24 institutional, Coker careful, Tyler defiant, Witherspoon analytical).
- **Body-softening register** — extends Pattern 6 past the thesis end-sentence into drop-caps, paragraphs, pull-quotes, section intros, accordion cards, lesson cards, tab notes. If body asserts deal-mechanism / IP-retention / specific-contract-terms / career-long behaviors as fact when those claims aren't in the verification block, soften.
- **Two-track judgment** — separate Track A (verification-block-confirmed) from Track B (case-body-asserted). Where B outruns A, soften B to general structural principle for that tier of work, not creator-specific assertion. Lucas is the gold-standard exception (most behaviors ARE in primary sources); most other cases need Track-B softening.

### Systemic findings worth preserving

- **4 structure-mapping patterns** from Phase 1, all encoded into `case-study-editorial-conventions.md` §9:
  1. `#11 Franchise/Licensing` was being conflated with `#28 Exclusive Licensing` on single-buyer deals (5 Phase 1 cases + 2 more in Phase 1.5 retro)
  2. `#14 Catalog/IP Securitization` was used metaphorically rather than for actual SPV/bond transactions
  3. `#15 DAO/Web3` was used for non-blockchain venture rounds and ordinary creative collaborations
  4. `#03 Project Equity` was conflated with film-deal structures (#22 Gross Participation, #28 Exclusive Licensing) on Coogler and Baker
- **`#14` systemic over-application** (Phase 2 bulk): 6 cases (sanderson, vernon, miranda, refik-anadol, sylvan-esso, taylor-swift) used `#14` where there was no actual SPV/bond mechanism. The Mikkel-Eriksen-Stargate 2018 Shamrock deal is the cleanest tier-1 `#14` in the inventory; the 6 others got reattributed in the Phase 1.5 retro (per-case: 4 to `#25`, 1 to `#5`, 1 dropped).
- **`#8` Creative Collective vs `#17` Equity-for-Services href mismatches** — three cases (collins, issa-rae, mschf) had `num="8"` paired with `href="/library/structures/equity-for-services"`. Two were resolved by fixing the href; collins was dropped entirely.

### Library expansion candidates surfaced

Two patterns the audit identified as not-fitting the existing library:
- **Permanent Equity / Patient Capital Investment** — minority secondary investment with profit-distribution returns, no exit, no board control. Seed case: Jason Fried's Bezos minority stake on Basecamp. Future cases: Andrew Wilkinson / Tiny, Sahil Lavingia / Gumroad, Tyler Tringas / Calm Fund, Brent Beshore / Permanent Equity.
- **Creative Studio Company** distinct from `#8` Creative Collective — unified entity with salaried employees and rapid creative cadence, vs. `#8`'s strict "loose association of independents" definition. Seed case: MSCHF (42 employees, VC-funded).

### Operational learnings (for future bulk-style work)

- **Subagent batched bulk passes** work at scale for editorial calibration. Pattern: write a brief in `audit-output/`, point at canonical reference docs, give subagent a case list, have them apply edits directly + write a per-batch summary. 6 parallel subagent batches completed Phase 2 in ~25 wall-clock minutes.
- **Self-imposed calibration gates** before unleashing bulk subagent work caught the body-softening gap on Coker before it replicated across 93 cases. Worth adding before any future ~100-case sweep.
- **Apply edits directly + per-batch git-diff review** beats proposal-then-apply for bulk work. At ~500-edit scale, per-edit Neil review is impractical; per-batch review via diffs is.
- **Phase 1.5 retro pattern** — when a structure-mapping issue surfaces during downstream work (a Pattern 5 verb borderline that's actually a structure-mapping concern), defer rather than mis-edit. Accumulate in a retro list and run a focused pass periodically.

### Files touched

98 case studies (`content/case-studies/*.mdx`), `src/app/(public)/the-library/page.tsx`, 2 new reference docs (`content/reference/case-study-editorial-conventions.md`, `content/reference/library-expansion-candidates.md`), `.gitignore` (new `audit-output/` entry), `content/structures/34-profit-participation-mgmt-fee.mdx` (deleted stub).

~22 commits. ~750 edits applied across all phases. Build clean throughout (395 static pages every commit).

### Phases remaining (next session)

3 (Era audit), 4 (Related-cases audit), 5 (What Wouldn't Transfer lesson — also populates editorial-conventions §13), 6.1.a/b/c (Verification block standardization + Verified Data Points generation **APPROVAL GATE on calibration batch** + section nav update), 6.2 (Confidence badge component), 6.3 (Stat header `estimated` prop — also populates §11), 7a (`case-study-components.md` updates for new components), 7b (polish editorial-conventions doc + cross-link).

Session handoff written to user memory at `~/.claude/projects/-Users-neilbrown-Documents-00-Neil-01-In-Sequence-sequence/memory/audit-handoff.md`. New session can resume by opening the worktree at `.claude/worktrees/hardcore-napier-c36d51/` (or by creating a fresh worktree if cleaned up).

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
