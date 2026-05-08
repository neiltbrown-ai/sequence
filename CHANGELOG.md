# Sequence — Architectural Changelog

Session-level log of material architectural changes. One entry per substantive working session. Not a commit log — see `git log` for that. Use this to reconstruct the arc of how the platform got to where it is.

**End-of-session protocol:** before closing a session, ask:
1. Did we change architecture? → update `CLAUDE.md`
2. Did we hit a bug worth remembering? → add to `content/reference/troubleshooting.md`
3. Did we ship a new pattern or component? → update `design.md` if it's reusable
4. Did anything material happen at all? → one entry here

---

## 2026-05-07 (continued) — Hotfix: assessment Section 4 industry pool was empty for everyone

**Symptom:** Neil walked through the assessment as `media` and got the stage pool + discernment questions in Section 4 but no industry-specific questions — the new Q-IND-MEDIA-1/2 didn't appear. Same for any other industry.

**Root cause:** `getIndustryQuestions(discipline)` in `src/lib/assessment/question-selection.ts` resolved `discipline` against `DISCIPLINE_TO_GROUP` only — but that map's keys are SUB-discipline slugs (`podcast_media`, `painting`, etc.). The assessment wizard at `src/components/assessment/assessment-wizard.tsx:275` passes `state.answers.discipline` (a TOP-level industry slug like `media`). `DISCIPLINE_TO_GROUP["media"]` returned undefined → empty industry pool → silent fail.

**Pre-existing bug, not Phase 3.** Same chain failed pre-Phase-3 too (`DISCIPLINE_TO_GROUP["music_audio"]` would have been undefined too — only sub-disciplines like `music_producer` were keys). The seeded test users have `industry_questions: {}` in the seed precisely because the seed authors never bothered populating them — likely because they discovered the same empty-pool symptom and worked around it. Phase 3 made the bug user-visible by introducing six new pools (photography, comics, comedy, media, hospitality, gaming) that everyone could see *should* fire but didn't.

**Fix.** `getIndustryQuestions` now accepts either form: it checks `DISCIPLINE_GROUP_MAP` first (top-level → group is the same value), then falls back to `DISCIPLINE_TO_GROUP` (sub-level → parent group). Both call sites in the wizard + the advisor flow continue to work without changes.

### Verification

- `npx tsc --noEmit` — clean.
- One-shot verification script (since deleted) confirmed: all 16 top-level industry slugs now resolve to their expected `industry_*` pool with 2 questions each (`media` → `Q-IND-MEDIA-1, Q-IND-MEDIA-2`). The sub-discipline path (`podcast_media` → `industry_media`) still works for the advisor-flow caller that prefers `sub_discipline`.

### Lessons / patterns worth remembering

- **Silent empty-collection returns are the hardest bugs to discover.** This function was returning `[]` for years; nobody noticed because (a) seeded users had `industry_questions: {}` so it looked correct in screenshots, and (b) Section 4 still rendered other questions so users didn't see a gap. Phase 3 unblocked it by tripling the surface area (10 → 16 pools) and shipping content that the team explicitly went looking for. **When a routing function returns the empty type when the input is "wrong shape," consider whether to `throw` in dev (fail loud) instead of returning empty (fail silent).** I considered adding a dev-mode warn here but didn't ship one — flagging for next session if the pattern recurs.
- **Two related vocabulary maps with overlapping but distinct key sets is a footgun.** `DISCIPLINE_GROUP_MAP` keys = top-level industry slugs (`media`); `DISCIPLINE_TO_GROUP` keys = sub-discipline slugs (`podcast_media`). The naming hint that they were both "discipline → group" maps obscured the difference. The fix accepts both forms because the API can't easily force a caller to disambiguate; the new comment on the function documents the dual semantics. If we ever rename, consider `INDUSTRY_TO_POOL` + `SUB_DISCIPLINE_TO_INDUSTRY` to make the asymmetry obvious from the name.
- **The seed file masked the bug.** Marcus, Maya, et al. have `industry_questions: {}` hardcoded. If the seed had populated those (e.g. matching what a real run would produce), the empty-pool bug would have been visible at every demo for over a year. Worth a follow-up: re-seed all 5 completed test users with realistic `industry_questions` based on the now-working pool routing, so future demos surface the full Section 4 experience.

### Files updated

- `src/lib/assessment/question-selection.ts` — `getIndustryQuestions` accepts either top-level or sub-level slug; comment documents the dual semantics
- `content/reference/troubleshooting.md` — symptom → cause → fix entry for "Section 4 industry questions don't appear"

---

## 2026-05-07 (continued) — Case study taxonomy rollout, Phase 4 (cross-cutting cleanup + roll-up)

**Goal:** Final coherence pass after Phases 1–3. Update `case-study-taxonomy.md`'s provenance line to reflect the as-shipped Phase 3 alignment, and add this roll-up entry as a single landing-pad for someone reading the history later.

This is Phase 4 (and the closing entry) of the rollout planned in `content/reference/case-study-taxonomy-rollout-plan.md`. Smaller than originally scoped because the spec rewrite (`seq-assessment-build-spec-v2.md` → `v3.md`) was folded into Phase 3 while the code was being touched.

### What shipped

- **`case-study-taxonomy.md` Provenance section updated.** The "Aligned with: assessment Q1" line now specifies Phase 3 (2026-05-07), names the import-from pattern (`questions.ts` imports `INDUSTRIES` from `case-studies/taxonomy.ts`), enumerates the 8 renamed + 6 new slugs, and points at `seq-assessment-build-spec-v3.md` for the question pools + migration `00018_normalize_assessment_industry.sql`. Anyone reading the taxonomy doc cold now sees the as-shipped state without having to cross-reference CLAUDE.md.
- **CLAUDE.md coherence pass.** Re-read Schema gotchas + Key file paths sections. Phase 1/2/3 additions already read coherently — line 395 (Shared vocab modules) was updated in Phase 3 to note `case-studies/taxonomy.ts` is dual-purpose (case studies + assessment Q1), the Phase 3 block in "What this session built" is comprehensive, and the case-studies-industries-disciplines bullet (line 331) plus assessments-column inventory (line 316) cover the schema-level facts. No prose edits needed.
- **No code changes.** Pure docs polish.

### Roll-up — case study taxonomy rollout (May 2026)

Four phases, all shipped 2026-05-07 across separate worktrees per the rollout plan's per-phase protocol:

- **Phase 1 — Schema foundation + content backfill.** Canonical `INDUSTRIES` (16, 5 groups) + `DISCIPLINES` (10) module at `src/lib/case-studies/taxonomy.ts`. All 104 case study MDX files migrated to typed `industries[]` + `disciplines[]` frontmatter (Claude-API-driven backfill via `scripts/backfill-case-study-taxonomy.ts`, calibrated against worked-examples). Build-time validator added. Legacy `industry: string` removed.
- **Phase 2 — Sidebar two-axis filter UI.** Replaced the single-axis tab bar on `/library/case-studies` with a 240px sticky sidebar (Industries grouped by domain + Disciplines flat) + mobile bottom-sheet drawer. URL-persistent filter state (`?industries=music,film_tv&disciplines=production`), constraint-aware per-option counts, lossless URL hydration.
- **Phase 3 — Assessment Q1 alignment + 6 new industry pools.** Q1 expanded 10 → 16 industries, importing from the canonical taxonomy module. 8 legacy slugs renamed; 6 new industries (`photography`, `comics`, `comedy`, `media`, `hospitality`, `gaming`) added with their own Section 4B question pools. Spec `v2` → `v3`. Migration `00018` applied.
- **Phase 4 — Cross-cutting cleanup (this entry).** Provenance + roll-up.

**Outcome:** the case study taxonomy is now the single shared vocabulary for case-study tagging, filter UX, and the assessment's industry question. Adding a 17th industry in the future means: edit `taxonomy.ts`, write a Section 4B pool in `questions.ts`, add the sub-discipline question, update CLAUDE.md "Adding an option" guidance — no schema or filter UI changes required.

### Lessons / patterns worth remembering

- **Per-phase protocol scaled well to 4 phases / 1 day.** Each phase had a worktree, a clean commit graph, an independent Vercel preview, and shipped to main with docs + code in the same fast-forward push. The forced isolation (worktree per phase) made it easy to interrupt and resume; the forced docs-with-code pairing meant context never went stale. Recommend keeping the protocol for any multi-phase rollout.
- **"Should this be its own module?" is worth questioning each phase, not just at planning time.** The rollout plan called for a Phase 3 `src/lib/profile/disciplines.ts` module. By Phase 3 the canonical `case-studies/taxonomy.ts` already covered the same need — creating a new module would have introduced two-places-to-update for no benefit. Skipped it; documented the decision in Phase 3's CHANGELOG and the new shared-vocab-modules note in CLAUDE.md. Default-question every "create a new module" instruction in a multi-phase plan against what's already in place.
- **Folding adjacent docs work into the phase that's already touching the code is strictly cheaper.** Phase 4 was supposed to do the spec rewrite; it was folded into Phase 3 because the same context was hot. Phase 4 ended up much smaller (this entry + a provenance line). The rollout plan's protocol was right that docs ship with code; the specific allocation of which-phase-does-what-doc was less important than landing it together with the code that motivated it.

### Files updated

- `content/reference/case-study-taxonomy.md` — Provenance section: assessment Q1 alignment line specifies Phase 3, import pattern, slug list, migration name, spec v3 reference

---

## 2026-05-07 (continued) — Case study taxonomy rollout, Phase 3 (assessment Q1 alignment + 6 new industry pools)

**Goal:** Align the assessment's Q1 industry vocabulary with the canonical case-study taxonomy. Rename 8 existing slugs, add 6 new industries (`photography`, `comics`, `comedy`, `media`, `hospitality`, `gaming`), and write 6 new Section 4B question pools. Bring the spec doc back in sync with the live code.

This is Phase 3 of the rollout planned in `content/reference/case-study-taxonomy-rollout-plan.md`. After Phase 3, Phase 4 (final cross-cutting cleanup) is significantly smaller because the spec update happened here while the code was being touched.

### What shipped

- **Q1 vocabulary expanded 10 → 16 industries.** The 8 legacy slugs were renamed to align with the case-study taxonomy (`visual_arts` → `visual_art`, `film_video` → `film_tv`, `music_audio` → `music`, `performing_arts` → `theater`, `architecture_interiors` → `architecture`, `fashion_apparel` → `fashion`, `advertising_marketing` → `advertising`, `technology_creative_tech` → `technology`); 6 new industries added (`photography`, `comics`, `comedy`, `media`, `hospitality`, `gaming`). `design` and `writing` were already aligned and kept their slugs.
- **`src/lib/assessment/questions.ts` now imports `INDUSTRY` from `src/lib/case-studies/taxonomy.ts`.** Q1 options are built from the canonical 16-industry list — labels and order mirror that module exactly. Q1 needs human-readable description hints listing typical sub-disciplines; those live locally in `Q1_DESCRIPTIONS: Record<IndustrySlug, string>` since the canonical taxonomy module doesn't carry them. This means `case-studies/taxonomy.ts` is now the **single source of truth for the 16-industry vocabulary, shared between case studies AND the assessment** — no separate `src/lib/profile/disciplines.ts` module was created (the rollout plan suggested one but it would have been a redundant layer; documented in CLAUDE.md "Shared vocab modules").
- **`SUB_DISCIPLINES` typed strictly internally for build-time exhaustiveness.** Internal `SUB_DISCIPLINES_TYPED: Record<IndustrySlug, AssessmentQuestion>` forces TypeScript to fail at build time if any industry is missing or has an unknown key. Exported as `Record<string, AssessmentQuestion>` for consumer indexing with DB string values (`assessments.discipline`). This pattern is reusable when you want exhaustiveness on the producer side and permissive lookup on the consumer side.
- **6 new question pools authored.** Each pool is 2 questions following spec §4B's canonical pattern (one ownership/rights norm, one deal/structure norm). New question IDs: `Q-IND-PHOTO-1/2`, `Q-IND-COMICS-1/2`, `Q-IND-COMEDY-1/2`, `Q-IND-MEDIA-1/2`, `Q-IND-HOSP-1/2`, `Q-IND-GAMING-1/2`. Stage indicator ladders (Stage 1 work-for-hire → Stage 4 portfolio / holding-co) modeled on the existing `industry_music` and `industry_design` pools. Editorial drafts shared and approved before writing into the file.
- **Pool keys renamed to mechanical `industry_${slug}` form** in `INDUSTRY_POOLS`. `industry_art` → `industry_visual_art`, `industry_film` → `industry_film_tv`, `industry_performing` → `industry_theater`. Other 7 keys (which already used canonical short forms) stay put. **Question IDs intentionally NOT renamed** — they're stable persistent identifiers in `assessments.industry_questions` JSONB; renaming them would orphan historical answers.
- **Type-level updates.** `src/types/assessment.ts` — `DisciplineGroup` union expanded to 16 slugs; `QuestionPool` union expanded with the new `industry_*` keys; `DISCIPLINE_GROUP_MAP` rebuilt for all 16 industries; `DISCIPLINE_TO_GROUP` extended with sub-discipline → industry mappings for the 6 new industries (~26 new sub-discipline keys total). Reorganized: visual_art now excludes illustration + photography sub-options (they moved to `comics` and `photography` per the case-study taxonomy's IN/OUT rules); theater excludes comedy_spoken_word (moved to `comedy`); technology excludes game_design (moved to `gaming`).
- **Advisor reactions updated.** `getReaction()` in `src/lib/advisor/assessment-state-machine.ts` — Q1 label map renamed/extended to 16 industries.
- **Migration `00018_normalize_assessment_industry.sql`.** Idempotent UPDATE statements for the 8 renamed slugs. The 6 new slugs require no backfill since no existing rows hold those values. Must be applied to Supabase **before** code lands on main.
- **Seed update.** `scripts/seed-test-users.ts` — Jordan Rivera's `discipline: "directing"` (a sub-slug used at the top level — non-canonical even pre-Phase-3) → `discipline: "film_tv", sub_discipline: "directing"`. Other 4 seeded users were already on canonical slugs (`design` × 3, `music` × 1).
- **Spec rename: `seq-assessment-build-spec-v2.md` → `seq-assessment-build-spec-v3.md`.** v3 freshness note + Q1 table (§3) + Section 4B pools rewritten to reflect the live 16-industry vocab. References updated in `CLAUDE.md` (3 places), `case-study-taxonomy-rollout-plan.md`, `seq-ai-advisor-experience-v1.md`, and `deal-evaluator-spec-v2.md`.

### Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — full Next.js build passed (95 pages, no errors).
- (Browser preview verification documented separately at end of session.)

### Lessons / patterns worth remembering

- **Strict-internal-loose-export pattern for vocabulary maps.** When a Record is keyed by a typed slug union but consumed via DB string values, declare the strict version internally for exhaustiveness checking, then re-export as the loose `Record<string, ...>`. Prevents the consumer from having to either (a) loosen the definition (losing build-time guarantees) or (b) thread type-narrowing predicates through every call site:

  ```ts
  const FOO_TYPED: Record<IndustrySlug, X> = { /* exhaustive */ };
  export const FOO: Record<string, X> = FOO_TYPED;
  ```

  The internal map fails at build if any IndustrySlug is missing; the exported map indexes happily by `assessments.discipline` (a `string | null` from Supabase). Same pattern that already exists implicitly with `INCOME_RANGE_OPTIONS` — making it explicit here.

- **Question IDs are persistent identifiers; don't rename them when their grouping changes.** I renamed pool keys (`industry_art` → `industry_visual_art`) but kept question IDs (`Q-IND-ART-1`) — the IDs are stored as JSONB keys in `assessments.industry_questions`, so renaming them would orphan past answers without a JSON-key migration. The naming mismatch (Q-IND-ART inside `industry_visual_art`) is mild cognitive dissonance vs. data loss; chose the dissonance. Documented in the `INDUSTRY_POOLS` JSDoc.

- **Don't create a redundant "single source of truth" module if one already exists.** The rollout plan called for `src/lib/profile/disciplines.ts` as the canonical industry vocab. But `src/lib/case-studies/taxonomy.ts` was already that module (created in Phase 1) — adding another layer would have created two places to update. Skipped the new module; the assessment imports `INDUSTRIES` directly. The CLAUDE.md "Shared vocab modules" note now documents that taxonomy.ts is shared between case studies AND assessment Q1.

- **The legacy-singular-display-string-vs-typed-array-of-slugs pattern recurs.** Case studies have a singular freeform `discipline: string` for human display + a typed `disciplines: DisciplineSlug[]` for filtering. Assessments have a typed `discipline` (single industry slug, IndustrySlug) + a `sub_discipline` (string, more granular). Different shapes, same naming, kept distinct intentionally — when working on either side, pay attention to which `discipline` you're holding.

- **Phase 4's Q1 spec update was easier to fold into Phase 3 than to defer.** The rollout plan parked the spec rewrite in Phase 4 to keep Phase 3 scoped to code. But the code touched the question pools so heavily that re-walking the spec while the context was hot was strictly cheaper than coming back to it. Folded in: spec v2 → v3 rename + content rewrite. Phase 4 is now smaller; recommend collapsing it into a single docs-cleanup commit.

- **Sub-discipline reorganization isn't free.** Moving illustration from `visual_art` → `comics` and photography_fine_art from `visual_art` → `photography` means any user who had selected those sub-options pre-Phase-3 now has an orphaned sub_discipline value relative to the new parent. Live migration handles parent slug; sub_discipline values are NOT migrated (no existing rows hold them since the seed users don't use those particular sub-options). If real users ever held `illustration` with parent `visual_arts`, their sub_discipline would now point at a non-existent option for the renamed `visual_art` parent. Acceptable given the no-real-users-pre-launch state, but worth noting if we ever do a full-corpus retag of sub-disciplines.

### Files added

- `supabase/migrations/00018_normalize_assessment_industry.sql` — slug-rename migration

### Files updated

- `src/lib/assessment/questions.ts` — Q1 imports + 16-industry options + 16 sub-discipline configs + 12 new questions + renamed pool keys
- `src/types/assessment.ts` — `DisciplineGroup`, `QuestionPool`, `DISCIPLINE_GROUP_MAP`, `DISCIPLINE_TO_GROUP` (all 4 expanded to 16 industries)
- `src/lib/advisor/assessment-state-machine.ts` — `getReaction()` Q1 labels
- `scripts/seed-test-users.ts` — Jordan Rivera discipline correction
- `CLAUDE.md` — Source-of-truth specs, Spec freshness, Scoring engine constraints, Shared vocab modules note, Phase 3 block in "What this session built"
- `content/reference/seq-assessment-build-spec-v3.md` (renamed from v2) — freshness note + Q1 table + §4B pools rewritten
- `content/reference/case-study-taxonomy-rollout-plan.md` — Phase 4 task note: spec update folded into Phase 3
- `content/reference/seq-ai-advisor-experience-v1.md`, `content/reference/deal-evaluator-spec-v2.md` — spec name reference updated v2 → v3

---

## 2026-05-07 — Case study taxonomy rollout, Phase 2 (sidebar filter UI)

**Goal:** Replace the single-axis tab bar on `/library/case-studies` with a two-axis sidebar facet filter — Industries (16, grouped by domain) + Disciplines (10) — backed by the canonical taxonomy from Phase 1. URL-persistent filter state, dynamic counts, mobile bottom-sheet drawer.

This is Phase 2 of the rollout planned in `content/reference/case-study-taxonomy-rollout-plan.md`. Phases 3 (assessment Q1 alignment + 6 new industry pools) and 4 (cross-cutting docs) still pending.

### What shipped

- **`src/components/portal/case-studies-filters-sidebar.tsx`** — new client component replacing `case-studies-filters.tsx` (deleted). Two facet groups: Industries with sub-headings for the 5 `INDUSTRY_GROUPS` domains, and Disciplines as a flat list. Multi-select within facet (OR), AND across facets. Selection lives in URL search params (`?industries=music,film_tv&disciplines=production`) so links are sharable + refreshable.
- **Dynamic per-option counts.** Each option's count reflects the filtered set if THIS facet's selection were just `{option}` while OTHER facets stayed constrained — i.e. it tells you "if you toggle this, here's how many results you'd get given your current other filters." Options that would yield zero are visually disabled (50% opacity, no pointer events) but still toggleable to keep the URL hydration round-trip valid.
- **Active-filter chips** above the grid: one chip per active option with axis prefix (`Industry · Music`) and an X-to-remove. A `+ Clear all` chip when ≥1 filter active.
- **Empty state** when zero studies match — renders inside `.csf-empty` with a "Clear all filters" CTA.
- **Mobile (≤900px)**: sidebar collapses; a sticky `Filters` button appears at the top with a count pill. Tapping it opens a bottom-sheet drawer (`.csf-drawer-overlay` + slide-up animation, body-scroll locked while open). Drawer footer has Clear all + a `View N results` apply button that just closes the drawer (filtering happens live as boxes are checked).
- **Featured-1 + featured-2 hero treatment preserved** even when filters are active (matches the prior tab-bar's "first match becomes the hero" behavior). Filtered set ≥3 → 1 hero + 2 sub + flat grid; smaller → just hero or hero+sub.
- **`/library/case-studies` page** now mounts `<CaseStudiesFiltersSidebar />` — old hand-rolled `industries: Array<{slug,label}>` derivation removed (the sidebar derives everything from the canonical taxonomy module).
- **Old tab-bar component deleted.** `case-studies-filters.tsx` had no remaining callers after the page swap.

### CSS

Added a new `csf-*` style block at the end of `portal.css` (~280 lines). Classes: `.csf-shell` (outer 240px-sidebar grid), `.csf-sidebar` (sticky), `.csf-facet`, `.csf-facet-group`, `.csf-facet-opt`, `.csf-facet-opt-count`, `.csf-chip`, `.csf-chip-axis`, `.csf-empty`, `.csf-mobile-bar`, `.csf-mobile-btn`, `.csf-drawer-overlay`, `.csf-drawer`, `.csf-drawer-apply`. Dark-mode overrides for the buttons that would invert when `--white` flips (csf-empty-btn:hover, csf-drawer-apply, csf-facet-count-active) — hardcoded `#e8e6e3` / `#1a1a1a` per the established pattern (see CLAUDE.md "Dark mode gotchas").

### Verification (browser preview, demo-sales user)

- Desktop 1280×800: sidebar 240px + content 728px (`grid-template-columns: 240px 1fr`), sticky under topbar, scrollable on its own. 16 industry checkboxes, 10 discipline checkboxes, 5 group sub-headings.
- Filter `Music` → 17 results (matches Phase 1 distribution). `Music + Production` → 11 (AND). URL: `?industries=music&disciplines=production`.
- Reload `?industries=architecture&disciplines=performance` → 0 results, empty state renders, 11 facet options now disabled (correctly: with `architecture` industry constraint, all disciplines except `direction`/`design`/`leadership` go to 0).
- Mobile 375×812: sidebar hidden, `Filters` button + `104 of 104` count visible at top. Tapping opens bottom-sheet drawer with all 26 options + apply CTA showing live count.
- Pre-existing hydration warning on `PageHeader` (`page-header rv vis` server vs `page-header rv` client) is from the global `RevealProvider` mutating className post-mount — not introduced by Phase 2.

### Lessons / patterns worth remembering

- **Worktrees need their own `.env.local` and `node_modules` symlinks for `next dev` to work via the launch.json preset.** The default `dev` config in `.claude/launch.json` uses relative `./node_modules/.bin/next`, which doesn't resolve when the worktree is missing those. Solution: `ln -s ../../../.env.local .env.local && ln -s ../../../node_modules node_modules` from the worktree root. Without `.env.local` the auth POST hangs silently — Supabase URL / anon key are missing in the client bundle, so the form submission goes nowhere and there's no error log on the server side. Cost ~10 minutes of "why is sign-in spinning forever." Probably worth a `scripts/setup-worktree.sh` one-liner if we keep doing per-phase worktrees.
- **Don't pick a port already used by another worktree's preview.** The pre-existing port-3000 server was serving a different worktree (`frosty-johnson-2d6a65`); my code edits weren't visible until I stopped that and started a fresh one. `lsof -i :3000` + `ps -ef | grep "next dev"` shows you which cwd the running dev server lives in.
- **Per-option facet counts should constrain on OTHER facets, not on the option itself.** First draft showed each industry's count as "studies tagged with this industry, regardless of discipline." That makes "Music" still say 17 even if you've also selected Photography (where Music+Photography = 0), which is misleading. The fix: when computing an option's count, build a probe-state with `{thisFacet: {option}, otherFacets: currentSelection}` and run the full match against it. Now toggling that option would actually yield the displayed number. The 0-counted options become a discoverability cue: "this combination would empty your set."
- **Disabled checkboxes still need to be hydratable from URL.** If a user shares the link `?industries=architecture&disciplines=performance` (which yields 0 results), both checkboxes must visibly remain checked even though their counts are 0 — otherwise the user's URL state silently drops on hydration. Solution: `disabled = count === 0 && !checked` (i.e. only disable when this option ISN'T currently in the selection). That keeps the URL round-trip lossless.
- **Featured-hero pattern survives filtering even with very small result sets.** Filtering to 3 results → 1 hero + 2 sub + 0 grid is fine. Filtering to 1 → hero only is fine. The hero treatment doesn't read as "editorially curated" when the user has clearly just narrowed to a single result; it reads as "here's your match, and it's the one that matters." Kept the existing behavior for consistency with the prior tab-bar.

### Files added

- `src/components/portal/case-studies-filters-sidebar.tsx` — sidebar + drawer + URL state component

### Files updated

- `src/app/(portal)/library/case-studies/page.tsx` — swapped to the sidebar component, dropped per-page industry derivation
- `src/app/(portal)/portal.css` — new `csf-*` style block + dark-mode overrides

### Files removed

- `src/components/portal/case-studies-filters.tsx` — old single-axis tab-bar component

---

## 2026-05-07 — Vercel Preview env var coverage

Audited which env vars were ticked for the Preview environment. 12 were Production/Development-only and silently failed any Preview portal/AI/Stripe flow. Added all 12 to Preview via `vercel env add NAME preview "" --value V --yes` (the empty third positional means "all preview branches"; the documented `--value/--yes` form alone errors with `git_branch_required`). For 11 vars (Stripe is test-mode, Anthropic + flags are environment-neutral) the Production value matches Development; `NEXT_PUBLIC_APP_URL` uses the Dev value (`https://sequence-weld.vercel.app`) per CLAUDE.md convention. Updated `CLAUDE.md` "Schema gotchas" with the explicit Preview-required var list and the CLI workaround. Also flagged Vercel's "Needs Attention" badges on `SEQ_ANTHROPIC_API_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `SUPABASE_SERVICE_ROLE_KEY` — recommendation to mark those as Sensitive for stricter access control. The originally reported "MIDDLEWARE_INVOCATION_FAILED" symptom was actually the Resend build-time crash already fixed in commit `92325ec`; today's most recent Preview was already returning correct redirects, so this work hardens AI / Stripe / book-download flows on future Preview deploys rather than fixing a live middleware bug.

---

## 2026-05-07 — Case study taxonomy rollout, Phase 1 (schema + backfill)

**Goal:** Get the new 16 industries × 10 disciplines taxonomy from doc into the codebase. Migrate all 104 existing case studies. Build doesn't break, filtering keeps working. Filter UI redesign is Phase 2.

This is Phase 1 of the multi-phase rollout planned in `content/reference/case-study-taxonomy-rollout-plan.md`. Phases 2 (sidebar filter UI), 3 (assessment Q1 alignment + 6 new industry pools), and 4 (cross-cutting docs) ship from their own worktrees later.

### What shipped

- **`src/lib/case-studies/taxonomy.ts`** — single source of truth: `INDUSTRIES` (16, 5 groups) + `DISCIPLINES` (10) + `INDUSTRY_GROUPS` (5) const arrays with `IndustrySlug` / `DisciplineSlug` types via `as const`. Includes `isIndustrySlug` / `isDisciplineSlug` predicates and `industriesByGroup()` for grouped UI rendering. Mirrors the `src/lib/profile/income-ranges.ts` pattern.
- **`CaseStudyMeta` schema** — added `industries: IndustrySlug[]` + `disciplines: DisciplineSlug[]`. Removed the legacy `industry: string` (singular). Kept `discipline: string` (the prose display string per the taxonomy doc).
- **104 case studies migrated** — every `.mdx` in `content/case-studies/` now has `industries[]` and `disciplines[]` in frontmatter, and the legacy `industry:` line is gone. Backfill done via Claude API.
- **Build-time validator** in `src/lib/content.ts` — `validateCaseStudyTaxonomy()` runs on every case-study read; throws in dev (`NODE_ENV !== "production"`), warns in production. Catches bad slugs the moment they land in frontmatter, so future authoring drift is fail-loud locally.
- **Consumers updated** to the new shape (Phase 1 minimum-shim, no UI redesign):
  - `src/app/(portal)/library/case-studies/page.tsx` — derives tab-list from `INDUSTRIES` filtered to those present in the corpus, passes `{slug,label}` pairs to the filter component
  - `src/components/portal/case-studies-filters.tsx` — switched to `s.industries[0]` (primary industry) for tab filtering, displays canonical labels
  - `src/app/api/search/route.ts` — replaced `cs.industry` with `cs.industries` + `cs.disciplines` (the existing `matches()` helper already supports `string[]`)
  - `src/lib/recommendations.ts` — primary-industry substring match against `cs.industries[0]`. The slugs (`film_tv`, `music`, `design`) still contain the legacy keyword tokens, so `DISCIPLINE_KEYWORDS` keeps matching without rewriting.

### Backfill workflow (one-off)

`scripts/backfill-case-study-taxonomy.ts` ships with the phase. Two passes:

1. **Propose pass** — feeds each MDX (frontmatter + first 1500 chars of body) to Claude with the full taxonomy doc as system prompt, gets back JSON `{industries, disciplines, confidence, rationale, flagged}`. Output is validated against the canonical slug lists; unknown slugs are dropped + flagged. Runs incrementally, writes a checkpoint every 5 cases.
2. **Apply pass** — reads the proposals JSON and rewrites each MDX frontmatter, inserting `industries:` and `disciplines:` lines (idempotent — safe to re-run).

The proposals JSON files (`content/case-study-taxonomy-proposals*.json`) are gitignored; regeneratable from the script. The script reads `SEQ_ANTHROPIC_API_KEY` from `.env.local` (matching the rest of the codebase). Model: `claude-sonnet-4-20250514` (matches production routes).

### Calibration → mass-run iteration

First calibration on 10 hand-picked diverse cases hit only 5/11 worked-example fidelity, with three hard misses (Sahil Lavingia missed `writing`; Brandon Stanton missed `photography` AND tried to put `photography` as a discipline; Loveis Wise tagged `design` instead of `comics` per the editorial-illustration scope rule). Tightened the prompt with four fixes:

1. Explicitly enumerate the 16 industry + 10 discipline slugs as TS-style enums in the JSON output schema (no more cross-axis confusion).
2. Promote the worked-examples table to "GROUND TRUTH — copy verbatim if listed."
3. Mark the `prior_industry` / `prior_discipline` legacy fields as data points, NOT authoritative — explicitly call out the illustration → comics gotcha.
4. Require the rationale to cite a scope rule or worked example.

Re-run: 9/11 worked-example exact, 2 minor variations (Sagmeister `writing → leadership`, Red Antler added `investing` — both defensible). Mass run on the other 94 came back clean with 4 manual edits before `--apply` (sahil-lavingia, mrbeast, rich-tu, loveis-wise — all editor's calls reflecting reading of the case beyond what the prompt could see).

### Distribution check (post-backfill)

```
design  34   |  film_tv 18  |  music 17  |  media 25  |  technology 15  |  writing 10
visual_art 8 |  photography 6 | fashion 5 | theater 4 | advertising 3 | comics 2
hospitality 2 | architecture 1 | comedy 0 | gaming 0
```

`comedy` and `gaming` empty as expected — the slugs exist for the assessment vocabulary + future cases, not the current corpus. `leadership` discipline appears on 78% of cases — high but accurate; most Sequence cases are about owner-operators.

### Worked-examples table — added Brandon Stanton + Mimi Chao

Added to `case-study-taxonomy.md` to lock in two non-obvious calls the prompt iteration surfaced:
- **Brandon Stanton** as `[photography, media]` — anchors the photo-led-media-business pattern
- **Mimi Chao** as `[comics, writing]` — anchors illustrator-author-of-illustrated-books → `comics` (Loveis was originally added but was overruled to `[design]`, so swapped to Mimi as the canonical illustration→comics example)

Sahil Lavingia worked example updated from `[writing, technology]` / `[writing, leadership]` → `[design, technology]` / `[leadership, design]` per editorial call (his case is structurally about Gumroad-the-platform regression and design-roots, not writing).

### Lessons / patterns worth remembering

- **`SEQ_ANTHROPIC_BASE_URL` includes `/v1` and the SDK appends `/v1/messages` — passing it produces 404.** Production routes correctly construct `new Anthropic({ apiKey })` with no `baseURL`, letting the SDK use its default. Any new Node script using the SDK should match — never read `SEQ_ANTHROPIC_BASE_URL`. The env var exists for tooling that expects a fully-formed base URL; the official SDK is not in that camp. Cost ~10 minutes of "why is every call returning 404" before checking how production initializes.
- **Tagging at scale needs enum-typed schemas in the prompt.** First-pass prompt said `industries: string[]`. Model returned `photography` as a discipline (not a discipline) because nothing in the prompt forced the cross-axis distinction. Fix: literally `industries: ("visual_art" | "design" | ...)[]`. Zero unknown slugs in the second run.
- **Worked-examples tables only work as ground truth if the prompt says so.** With the same taxonomy doc as system prompt, calibration v1 ignored the Sahil Lavingia row and re-derived (wrong). Calibration v2 with "if the case is in this table, copy its tagging exactly. Do not re-derive." returned the table value verbatim. Lesson: putting facts in the prompt isn't enough; you have to tell the model how to *use* them.
- **Prior values inherit silently if not flagged.** The legacy `industry: Design` field on Sahil's MDX kept appearing in the model's output as `design` discipline even when the case body talked about books. Adding "DO NOT INHERIT FROM LEGACY: prior_industry / prior_discipline are deprecated data points, not authoritative" stopped that.
- **Run small calibration before mass-tagging, ALWAYS.** 10 cases caught three classes of error that would have polluted 100+ cases. Cost: ~$0.03 in tokens + 30 seconds of runtime + 5 minutes of editorial review. Cheap.
- **Worktree path discipline matters.** All edits in this session initially landed on parent `main` because absolute paths used `/sequence/src/...` instead of `/sequence/.claude/worktrees/<name>/src/...`. Recovery: `git stash push -u` in parent, `git stash pop` in worktree (worktrees share the stash list — useful trick). This phase shipped from a worktree per the rollout plan; the next 3 phases will too. Discipline check: when CWD is a worktree, every absolute path must include the worktree segment.

### Files added

- `src/lib/case-studies/taxonomy.ts` — canonical industry + discipline vocab module
- `scripts/backfill-case-study-taxonomy.ts` — one-off migration script (gitignored proposals JSON)
- 2 new entries in `case-study-taxonomy.md` worked-examples table

### Files updated

- `src/lib/content.ts` — `CaseStudyMeta` schema + validator
- `src/components/portal/case-studies-filters.tsx`, `src/app/(portal)/library/case-studies/page.tsx`, `src/app/api/search/route.ts`, `src/lib/recommendations.ts` — consumer shims
- 104 × `content/case-studies/*.mdx` — frontmatter migration
- `.gitignore` — added proposals JSON pattern
- `content/reference/case-study-taxonomy.md` — provenance line + 2 worked-example rows

---

## 2026-05-06 (continued) — Public refinements + signup polish

**Goal:** Five small public-site refinements requested in a single batch — bump the case-study count headline (the corpus is now ~100 cases post-audit), simplify Full Access pricing to monthly-only, tighten the contact form, add a website field to signup, and polish the plan-selection step's visual hierarchy.

### Case study count bump (70+ → 100+)

- Updated everywhere the count appears as headline copy: home (`/`), `/platform`, `/pricing`, `/about`, `/the-library`, `/resources`, structures gate, signup plan features, FAQ accordion. 11 files / ~15 occurrences.
- Did NOT touch in-content "70+" mentions inside individual case studies (Spotify users on tobias-van-schneider, cities on refik-anadol, employees on artists-equity) — those are factual claims about case subjects, not corpus metrics.
- Why now: post-Phase-7b audit the library sits at 98 published cases, so "70+" was both stale and undersold the catalog.

### Pricing: drop Full Access annual

- Removed the $190/yr option — Full Access is now monthly-only ($19/mo).
- Files touched:
  - `src/app/(public)/pricing/page.tsx` — stripped the "or $190/year (save $38)" line from the Full Access card description
  - `src/components/faq-accordion.tsx` — FAQ copy "$19/month or $190/year" → "$19/month"
  - `src/app/(auth)/signup/page.tsx` — removed the `Billing` type, `billing` state, monthly/annual toggle UI, and conditional price/period rendering; `getPriceDisplay` / `getPriceLabel` simplified to one arg; Stripe checkout call now always sends `monthly` for full_access
- The Stripe checkout route (`/api/stripe/checkout`) still defensively accepts `billing: "annual"` but the signup flow no longer triggers that branch. Stripe price IDs unchanged — `STRIPE_PRICES.full_access_annual` remains exported for any direct/admin callers.
- Why: simpler decision for the buyer (one number, one cadence). Annual was only saving $38 — small enough that the cognitive load of the toggle wasn't worth it.

### Contact form

- All five fields now `required` (name, email, inquiry type, subject, message) — added the HTML attribute on each input/select/textarea AND added an early-return guard in `handleSubmit` that checks all five before fetching `/api/contact`.
- Renamed "Support" inquiry type → "Platform Support" (option `value="support"` unchanged so the API + email routing stay identical; only the visible label changed).
- File: `src/components/contact-form.tsx`.

### Signup polish

- **New optional Website field above Email** — kept email + password adjacent so they read as the portal credentials. Field uses `type="text"` (not `type="url"`) so `yoursite.com` without a scheme passes the browser validator; `autoComplete="url"` retained for browser autocomplete hint. Persisted to Supabase `auth.users.user_metadata.website` (`null` if blank).
- **Plan-step visual hierarchy** — the Library / Full Access cards previously column-aligned perfectly with the Back / Continue actions below them, which read as a single grid and was visually confusing. Fix:
  - Added 1px top rule + 28px / 20px breathing room to `.auth-actions` (sits between cards and buttons; also picks up the same treatment on the Payment step's Back / Complete Purchase pair, which has an inline `marginTop: 20px` so its rule sits a bit tighter)
  - Selected card now shows a 3px black bar across the top via `::before` pseudo-element with matching corner radii — mimics the pricing page's "Most Popular" `.pr-plan-card--featured::before` pattern
  - Unselected card mutes price + feature-list text + checkmarks to `var(--light)` so the active choice clearly leads
- Files: `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/auth.css`.

### Schema

- New writer to `auth.users.user_metadata`: `website` (string | null) from `/signup`. No migration needed — Supabase `user_metadata` is schemaless JSONB. Distinct from the `profiles.website` column added by the portal session's migration `00016_profile_social_links.sql`. Both are valid; the signup write could be promoted to `profiles.website` later via a sync trigger if we want a single canonical store.

### Lessons / patterns worth remembering

- **`type="url"` is too strict for friendly UX.** The browser validator requires a scheme (`http://` / `https://`); users typing `www.example.com` get rejected with "Please enter a URL." For optional informational URL fields, prefer `type="text"` + `autoComplete="url"`. If you need scheme validation downstream, do it server-side with a parser (and normalize while you're there).
- **Two parallel sessions on a single day → use the `(continued)` convention even if your code shipped first.** The convention is about doc-write order, not commit order. Whoever writes their CHANGELOG entry second adds `(continued)` and inserts above the first entry.
- **Direct-to-main is fine when worktrees don't overlap.** This batch + the portal batch had zero file overlap; both sessions pushed direct without rebase pain. The portal session captured the broader workflow notes in its 2026-05-06 entry below.

---

## 2026-05-06 — Portal refinements + vocab cleanup

**Goal:** Apply a batch of portal UX refinements (Portfolio Overview restructure, Roadmap auto-refresh, Settings social links). What started as scoped UX work surfaced — via the income_range "Other" addition — three different writers writing three different vocabularies to the same column name. Audit + cleanup pass followed.

### Portal refinements

- **Dashboard `Portfolio State` → `Portfolio Overview`** — section title rename + asset count added as the leftmost column in the valuation hero. Hero is now 3 columns (Assets cataloged | Estimated value | Leverage score) instead of 2. New `.dash-val-hero--three` 5-column grid + matching mobile collapse.
- **Roadmap "All three steps complete" banner** — previously required a page refresh to appear after marking the third action complete. Now appears the instant the third action flips, and auto-scrolls into view. Status state lifted from `ActionCard` (was local) into `RoadmapDisplay` so the parent re-renders on every status change. `ActionCard` is now a controlled component (takes `status` + `onStatusChange`).
- **Settings → Profile — Links subgroup** — added website / instagram / tiktok / X-Twitter / linkedin fields. Save handler strips leading `@` on handles and converts empty strings to null. Migration `00016_profile_social_links.sql` adds the five columns. Kept Settings as a 2-tab layout (Profile + Creative Identity) — preferences subgroup stays nested in Profile.

### Vocab cleanup (audit-driven)

Adding "Other" to the Income Range field exposed that `profiles.income_range` had three writers with three vocabularies (Settings hyphenated, deleted-Onboarding display labels, Assessment canonical underscore-delimited). One audit later:

- **`profiles.income_range` unification** — created `src/lib/profile/income-ranges.ts` as the single source of truth for the canonical vocabulary (matches the assessment's `Q6_INCOME` options). Settings imports from it. "Other" became `prefer_not` (matches the assessment's existing opt-out value). Migration `00017_normalize_profile_income_range.sql` backfills any legacy values to canonical.
- **`/onboarding` route deleted** — the page existed at `src/app/(auth)/onboarding/page.tsx` but was unreachable: no callers in the codebase, auth callback redirects to `/dashboard`, no middleware gate. A leftover from the pre-Batch-E "onboarding paths" model. Deleting prevents anyone from manually navigating to it and writing legacy-vocab data into `profiles`.
- **Evaluator dead `prefill_if_assessment` cleanup** — five questions (F5 income_range, F10 risk_tolerance, L1/L2/L7 business_structure) declared `prefill_if_assessment` but the state machine never reads that directive for non-percentage questions, AND the source/target vocabularies don't align. Replaced with `always_ask` (the existing valid alternative) + comments explaining each mismatch. Prevents a future footgun where someone wires up select-input prefill without writing translation maps first.

### Schema

- New columns on `profiles`: `website`, `instagram`, `tiktok`, `twitter`, `linkedin` (all nullable text).
- `profiles.income_range` legacy values backfilled to canonical (`under_50k`, `50k_75k`, …, `1m_plus`, `prefer_not`). Lossy where legacy brackets spanned multiple canonical brackets — mapped to lower bound (conservative, won't over-state stated income).

### Files added

- `src/lib/profile/income-ranges.ts` — canonical income-range vocabulary module (`INCOME_RANGE_OPTIONS` + `IncomeRangeValue` type)
- `supabase/migrations/00016_profile_social_links.sql`
- `supabase/migrations/00017_normalize_profile_income_range.sql`

### Files deleted

- `src/app/(auth)/onboarding/page.tsx` — orphaned route, pre-Batch-E leftover

### Build hygiene (mid-session fix)

Pushing the portal branch surfaced a Vercel build failure: `Missing API key. Pass it to the constructor 'new Resend("re_123")'` during `Collecting page data`, then a follow-on `Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY` during `Generating static pages` for `/admin/assessments`. Both pre-existing — neither caused by the portal commits — but blocking the deploy. Fixed in a separate small commit (`fix/lazy-sdks-and-dynamic-admin` → main as `92325ec`).

- **Lazy-instantiate Resend** (`src/lib/email/send.ts`) — the module-level `const resend = new Resend(process.env.RESEND_API_KEY)` was throwing during build's page-data collection any time the env var was missing in the build environment (e.g. Vercel Preview on Hobby plan). Replaced with a `getResend()` helper that constructs on first use. Build is now env-independent; runtime behavior unchanged. Matches the lazy pattern already used in `/api/book/download` and `/api/newsletter/subscribe`.
- **`force-dynamic` on `/admin/assessments`** — the page is a server component that calls `createAdminClient()` at render time. Without the `dynamic` directive, Next.js tried to prerender it during build; missing Supabase env vars then crashed the whole build. Added `export const dynamic = "force-dynamic"` (mirrors the existing directive in `/settings/page.tsx`). Auth-gated stateful pages should never be prerendered anyway.

### More lessons worth remembering

- **Module-level `new SDK(process.env.X)` is a build-time landmine.** Next.js evaluates route modules during the page-data collection step. Any constructor that throws on missing env crashes the build, even for routes that never actually call the SDK. Always lazy-instantiate at first use.
- **Server components calling `createAdminClient()` need `export const dynamic = "force-dynamic"`.** Otherwise Next.js tries to statically generate them and crashes when env vars aren't set in the build environment. Auth-gated pages don't benefit from prerendering anyway.
- **Vercel Hobby plan scopes env vars per-variable, not "all environments by default."** When adding a new env var or rotating one, double-check it's available in Production AND Preview AND Development. Preview deploys silently fail otherwise. Convention: Preview should use the Development key (separate sender domain, doesn't pollute production metrics).
- **Adding an option to a field is a good moment to grep all writers of that column.** The "Other" addition was a 30-second change that surfaced a multi-month-old vocab drift bug. Worth doing this every time the option list gets touched.
- **Same column name across features ≠ same vocabulary.** When a feature gets built in isolation, its options drift from the canonical set. The fix is a shared module + a TypeScript `as const` array so future drift is loud.
- **Dead config is worse than no config.** The `prefill_if_assessment` declarations on select-type evaluator questions were cosmetic — never actually read — but would have silently mistranslated values the moment someone implemented prefill plumbing for selects. Removing them is cheap insurance.

### Workflow note: parallel worktrees

This was the first session where two Claude sessions worked simultaneously in separate worktrees (this portal session + a public-site session). Notes:

- **No file overlap → no conflicts.** Confirmed by `git diff --name-only HEAD..origin/main` before rebasing. Public session touched 11 files in `(public)/`, `(auth)/{signup,auth.css}`, `contact-form`, `faq-accordion`. Portal session touched portal-side files. Zero overlap → clean rebase.
- **CHANGELOG.md is the highest-conflict doc** when both sessions update it (both insert at the top). Mitigation: whoever ships first lands a clean entry; second session inserts above with a `(continued)` heading or new dated heading. Mechanical to resolve, not creative.
- **Doc updates belong in the same commit as the code that motivated them.** Deferring docs to "later" loses context. The end-of-session protocol (top of this file) exists for a reason.

---

## 2026-05-05 (continued) — Phase 7b case study audit closing polish + audit complete

**Goal:** Close the May 2026 case study audit. Polish the editorial conventions doc to reflect the now-complete state, ensure cross-references between the two reference docs, and update the project-level CLAUDE.md descriptor.

### Polish edits to `case-study-editorial-conventions.md`

- **§12 (Verification block) status block** — replaced the in-progress text ("Phase 6.1.b will populate the placeholders" / "Drift not yet normalized — deferred to Phase 7b") with the closing-state report: "Library state (post-audit)" with the ~1,094 data point total + an enumerated list of known structural drift carry-forward (4 cases use Verification Notes vs Verification Info, 9 cases with multiple themed Primary groups, 6 with no Secondary, ohneis non-canonical title, sahil-lavingia missing Gaps). These drift items are documented in audit-handoff memory; Phase 7b explicitly chose not to mass-edit 98 files for ordering / title normalization.
- **Authoring checklist** — added item 13 covering §11 (stat header chips + case-level confidence frontmatter)
- **Provenance** — rewritten as a closing summary noting all 14 sections are populated, all phases done, and pointing at the sister components doc

### Polish edits to `CLAUDE.md`

- **`case-study-editorial-conventions.md` descriptor** — updated from a partial list (4 systemic patterns) to the full TOC sketch covering §11–14 plus the authoring checklist. Future Claude sessions reading CLAUDE.md will know the full scope of the conventions doc.

### Audit complete

After 7b, the audit is closed. Summary:

**14 phases shipped over 2 working days (May 4–5, 2026):**

1. **Phase 0** — `publishedAt` backfill (98 cases)
2. **Phase 1** — Structure-mapping audit + approval gate (30 items, all approved)
3. **Phase 1.5** — Structure-mapping corrections applied (21 cases)
4. **Phase 2** — Language pattern application (calibration + 6 batches, ~500 edits across 98 cases)
5. **Phase 3** — Era audit (10 cases restructured, 340→331 era markers)
6. **Phase 4** — Related-cases audit (14 case-card additions; recency cap paused; conventions §14)
7. **Phase 5** — "What Wouldn't Transfer" lesson (5 calibration + 36 bulk + 13 drift fixes; 98/98 cases now have the lesson)
8. **Phase 6.1.a** — Verification block format restructure (`<CbVerifiedDataPoints>` + `<CbDataPoint>` components; 56 cases converted + 41 placeholder)
9. **Phase 6.1.b** — Verified Data Points generation (8 calibration approved + 33 bulk; ~1,094 data points across the corpus)
10. **Phase 6.1.c** — Section nav + frontmatter mass update (98 cases canonicalized)
11. **Phase 6.2** — Confidence Badge component + per-case assignment (46 disclosed / 43 mixed / 9 inferred)
12. **Phase 6.3** — Stat header `estimated` prop (component extension + 181 flags applied across 98 cases)
13. **Phase 7a** — Components reference doc updated for new components + conventions
14. **Phase 7b** — Editorial conventions doc closing polish + cross-link

**Bookkeeping:**
- ~80 commits during the audit, all direct-to-main per the audit-handoff convention
- ~98 case study files materially improved (some restructured 5+ times across phases)
- 4 new MDX components shipped (`<CbVerifiedDataPoints>`, `<CbDataPoint>`, `<CbConfidenceBadge>`, plus `estimated` extension on `<CbMetric>`)
- 2 new reference docs persisted to repo (`case-study-editorial-conventions.md`, `library-expansion-candidates.md`)
- `case-study-components.md` updated with new components + the canonical 5-subsection verification block + extended frontmatter template

**Deferred items** (logged in `~/.claude/projects/.../memory/audit-handoff.md`):
- jeremy-kirkland: case file self-flags as "draft pending direct interview" — full retro after the interview lands
- 11 default-to-medium cases from Phase 6.1.a need re-rating in a future polish pass
- ~24 cases with structural drift in verification block (title / order normalization)
- viktoria-harrison case-body "co-founder" framing may need a body-level correction
- Phase 0 `publishedAt = updatedAt` issue blocks recency-cap re-enablement; future Phase 0 follow-up using git first-touch dates would fix
- flag-bulk-A from Phase 4 (61 cases at axis coverage `{1, 4}` due to descriptive desc lines) — sweep deferred indefinitely; future cases get §14 guidance from the start

**Workflow change post-audit:** Per the operating learning from the audit-handoff memory, the direct-to-main convention was specific to audit phases. Post-audit, the project shifts to a PR-based feature-branch workflow with Vercel preview URLs for safer phase-by-phase review.

### Files touched in 7b

`content/reference/case-study-editorial-conventions.md` (3 edits — §12 status, checklist item 13, Provenance), `CLAUDE.md` (1 edit — descriptor update), `CHANGELOG.md` (this entry).

1 commit this phase.

---

## 2026-05-05 (continued) — Phase 7a `case-study-components.md` updated for new components + conventions

**Goal:** Bring the components reference doc up to date with the new components shipped in Phases 6.1.a, 6.2, and 6.3, plus the new frontmatter fields and the canonical 5-subsection verification block structure.

### Updates to `content/reference/case-study-components.md`

- **`CbMetrics` example** — added `estimated` prop usage on `CbMetric` (rubric pointer to conventions §11)
- **`CbSources` section** — replaced minimal example with the canonical 5-subsection structure: Verification Info / Primary Sources / Secondary Sources / `<CbVerifiedDataPoints>` / Gaps to Verify, all wrapped in `<CbSection id="sources">`
- **New `CbVerifiedDataPoints + CbDataPoint` section** — usage, `confidence` prop values (`very-high` | `high` | `medium`) with rubric for each, conservative-bias note, pointer to conventions §12
- **New `CbConfidenceBadge` section** — clarifies it auto-renders from frontmatter `confidence:` field (typical path), but is registered for direct MDX use too. Three states: `disclosed` | `mixed` | `inferred`
- **Frontmatter Template** — extended with `confidence:` field (with comment), `stats[].estimated` flag (with comment showing both flagged and unflagged entries), required `sections:` array entries for `lessons`, `sources`, `related`, plus `publishedAt:` field. Field Notes appendix updated with new fields and pointers to conventions sections.
- **Standard Case Study Structure** — section 5 now requires the "What Wouldn't Transfer" lesson per §13; section 6 references the canonical 5-subsection verification block; section 7 references the §14 relational desc-line guidance.
- **New "Cross-references" section** — explicit pointer to `case-study-editorial-conventions.md` as the sister doc covering HOW to write inside the components, vs. WHAT components are available here.

### Files touched

`content/reference/case-study-components.md` — single edit pass. Build clean (no MDX changes; doc-only).

1 commit this phase.

### Phase status after 7a

Only **7b** remaining — polish editorial-conventions doc + cross-link with components doc. The components doc now points at the conventions doc; 7b will return the cross-link and polish any remaining drift.

The audit's content-and-component substance is complete. Phase 7b is the closing polish.

---

## 2026-05-05 (continued) — Phase 6.3 Stat header `estimated` prop + per-case audit

**Goal:** Extend `<CbMetric>` and the top-of-case stat header rendering with an `estimated` prop that renders an "Est." chip below the value. Audit all 98 cases and flag estimated metrics.

### Component extension

- **`<CbMetric>`** (in-body MDX) — added optional `estimated?: boolean` prop. Renders `cb-metric-est` chip when true.
- **Top-of-case stat header** (`cs-stat`) — extended frontmatter `stats:` array entry type with optional `estimated?: boolean`. CaseStudyHeader renders `cs-stat-est` chip per entry when true.
- **Frontmatter type** (`src/lib/content.ts`) — `stats:` array updated to allow `estimated?: boolean`.
- **CSS** — `.cs-stat-est, .cb-metric-est` shared rules. Mono 8px, `.12em` letter-spacing, `var(--light)` color, slight negative margin-top to position below value as a quiet annotation.

The chip is intentionally subtle per the briefing — not a separate badge.

### Per-case audit (3 parallel subagent batches)

181 estimated flags applied across 98 cases (113 top-stats + 68 in-body):

- **Batch A** (`dc4c0a5`, 33 cases a–em): 79 flags (47 top-stats + 32 in-body)
- **Batch B** (`a557aec`, 33 cases fu–oh): 53 flags (31 top-stats + 22 in-body)
- **Batch C** (`fcde9df`, 32 cases paul–wes): 49 flags (35 top-stats + 14 in-body)

### Calibration calls — confidence-tier prior held

The Phase 6.2 `confidence:` frontmatter served well as a prior:
- **Disclosed** cases (e.g., paula-scher, ryan-coogler, sean-baker, sahil-lavingia, sylvan-esso, taylor-swift, viktoria-harrison, wes-kao) averaged 0–1 flags
- **Mixed** cases varied — george-lucas (canonical disclosed) had 3 top-stat flags ($7B Forbes net worth, $20B+ lifetime merch, 14,000x derived multiple) per the brief's prediction
- **Inferred** cases (blumhouse 4/4, codie-sanchez 4/4, temi-coker 6, tom-cruise 6, virgil-abloh 6) got the most aggressive flagging

Conservative bias preserved throughout. Box Office Mojo / AMPAS / SEC-disclosed values left unflagged even with `+` rounding; the audit only flagged values where source quality was demonstrably weak.

Surprise zero-flag inferred case: **paul-trillo** — frontmatter avoids dollar figures entirely; every stat is a named institution or verifiable timeframe.

### Browser preview verified

Started dev server on port 3010 (port 3000 still busy with Neil's main-checkout server). Curl-verified EST chip rendering on:
- george-lucas top stats: `$7B` (Est.), `$4.05B` (no chip), `$20B+` (Est.), `14,000x` (Est.) — matches spec
- a24 top stats: `$2.5B+` (Est.), `~$6M` (Est.), `12x` (Est.), `3` (no chip — categorical) — matches spec
- george-lucas in-body CbMetric: `$20B+` (Est.), `$4.05B` (no chip), `2,000+` (Est.), `$7B` (Est.) — matches spec

Visual styling iteration is yours when convenient — chip uses `var(--light)` mono small caps to match the briefing's "quiet annotation" intent.

### Conventions §11 populated

`content/reference/case-study-editorial-conventions.md` §11 (Stat header chip conventions) was the last placeholder; now populated. Documents the two-surface convention (frontmatter + MDX), the per-metric judgment rubric (mark / don't mark / borderline), and the confidence-tier calibration prior.

### Provenance now complete

All numbered sections (§1–14) of the editorial conventions doc are populated. Phase 7b will polish and cross-link with `case-study-components.md` at audit close.

### Files touched

4 new/extended component-system files (`cb-metrics.tsx`, `case-study-header.tsx`, `content.ts`, `globals.css`). 68 case studies (`content/case-studies/*.mdx`) modified. Conventions doc + CHANGELOG.

5 commits this phase: `825eb23` component extension, `dc4c0a5` batch A, `a557aec` batch B, `fcde9df` batch C, plus this CHANGELOG. Build clean throughout.

### Phase status after 6.3

Remaining phases:
- **7a** — Component-level docs in `case-study-components.md` for the new components shipped in 6.1.a, 6.2, and 6.3 (`<CbVerifiedDataPoints>`, `<CbDataPoint>`, `<CbConfidenceBadge>`, `estimated` prop on `<CbMetric>`).
- **7b** — Polish editorial-conventions doc + cross-link with components doc.

Both are documentation phases. The audit is essentially complete from a content-and-component standpoint; Phase 7 closes the loop on reference docs.

---

## 2026-05-05 (continued) — Phase 6.2 Confidence Badge: new component + per-case assignment

**Goal:** Build a new `<CbConfidenceBadge>` component that renders next to the existing case header labels, and assign each of 98 cases a `confidence: disclosed | mixed | inferred` frontmatter value.

### New component

`src/components/mdx/case-study/cb-confidence-badge.tsx` — text-only chip per the v5 briefing's "no color coding" placeholder treatment for v1:

- `[ DISCLOSED ]` / `[ MIXED ]` / `[ INFERRED ]` rendered in monospace small caps
- Hover-darkening transition matching the existing `cs-header-cat` style
- Click scrolls to `#sources` anchor
- `title` attribute carries the long-form definition; `aria-label` for screen readers

Registered in the MDX components map (so MDX can also use it directly) and re-exported.

### Header plumbing

- `CaseStudyHeader` accepts an optional `confidence` prop
- Badge renders in the meta row after `readTime` (separated by the existing dot pattern)
- Public + portal page.tsx pass `fm.confidence` through
- `CaseStudyFrontmatter` type extended with optional `confidence: "disclosed" | "mixed" | "inferred"` + `publishedAt: string`

### Confidence assignment math

Iteratively refined logic ran across all 98 cases (Python script over the worktree):

- **Inputs:** VDP confidence distribution (very-high / high / medium counts), Gaps to Verify count, Verification Info text scanned for estimate-language signals (regex over "estimat", "industry-comparab", "privately held", "self-reported", etc.).
- **Heuristics (v3):**
  - `inferred` if VDP <40% high+very-high, OR (≥3 medium VDP items AND ≥2 estimate signals in VI)
  - `disclosed` if VDP ≥85% high+very-high AND 0 medium AND ≤4 gaps AND ≤2 estimate signals (Lucas pattern: SEC-verified core with scope-limited carve-outs)
  - `mixed`: everything else (the briefing-anticipated default — "most cases will fall here")

### Calibration vs. worked examples

The briefing names 5 worked-example anchors. v3 math agreed on 3 (george-lucas, liz-lambert, tyler-the-creator), conflicted on 2:

- **a24** — math said disclosed; expected mixed. Override applied. Verification Info explicitly says financial figures are estimates.
- **temi-coker** — math said disclosed; expected inferred. Override applied. Heavy-inference case per audit register; Phase 6.1.b pushed mediums to body prose, leaving a clean-looking VDP.

### Final distribution

**46 disclosed / 43 mixed / 9 inferred** across 98 cases.

### Browser preview verified

Started a dev server on port 3010 (port 3000 was in use by Neil's existing main-checkout server). Curl-verified badge rendering across 4 representative cases: george-lucas (disclosed), a24 (mixed override), temi-coker (inferred override), beeple (inferred math). Badge HTML emits correct `class="cb-confidence-badge cb-confidence-badge--<level>"` + `title` + `aria-label` for each. Visual confirmation of styling deferred to Neil whenever he hits the local main checkout (after a `git pull` to fast-forward the main checkout to match origin).

### Files touched

2 new files (`cb-confidence-badge.tsx` + `phase-6-2-confidence-assignment.md` proposal). 7 modified component-system files. 98 case study frontmatter additions.

3 commits this phase: `874dac9` component + plumbing, `e378c3e` 98-case frontmatter mass mutation, plus this CHANGELOG.

### Phase status after 6.2

Remaining phases: **6.3** (Stat header `estimated` prop — extends existing `<CbMetric>` component, also populates conventions §11), **7a** (component-level docs in `case-study-components.md` for the components shipped in 6.1.a + 6.2 + 6.3), **7b** (polish editorial-conventions doc + cross-link).

Phase 6.3 is mechanical extension of an existing component. Phase 7 closes out the audit.

---

## 2026-05-05 (continued) — Phase 6.1.c section nav update across all 98 cases

**Goal:** Bring all 98 cases to a canonical section nav structure with `Sources & Verification` as a navigable peer item between Lessons and Related — both in `sections:` frontmatter and as `<CbSection id="sources">` body wrapper.

### Inventory before sweep

- 60 cases had `id: sources` in frontmatter with label "Sources" (older form)
- 38 cases were missing `id: sources` from frontmatter entirely (the cases that received VDP placeholder/population in Phase 6.1.a + 6.1.b but lacked the surrounding section anchor)
- 1 case (ohneis-andries-ohneisser) was missing `id: related` from frontmatter

### Three sub-task sweep (single commit `f861070`)

- **Sub-task A — 60 cases:** standardized `label: Sources` → `label: Sources & Verification` to match the v5 briefing's canonical label.
- **Sub-task B — 37 cases:** inserted `- id: sources / label: Sources & Verification` into frontmatter between `lessons` and `related`, AND wrapped the body's `<CbSources>...</CbSources>` block with `<CbSection id="sources">...</CbSection>`. (Reconciliation note: brief listed 38 candidates but only 37 actually needed Sub-task B — `artists-equity` and `mschf` had `id: sources` already and were handled by Sub-task A; `ohneis-andries-ohneisser` was handled by Sub-task C.)
- **Sub-task C — 1 case:** ohneis-andries-ohneisser was missing `id: related` from frontmatter; added the entry and wrapped the body's `<CbRelated>` block with `<CbSection id="related">...</CbSection>` so both new section nav anchors would resolve cleanly.

### Final corpus integrity

Strict per-file regex check showed 0 anomalies across 98 files. Every case study now has:
- Exactly 1 frontmatter `- id: sources` entry (canonical label `Sources & Verification`)
- Exactly 1 frontmatter `- id: related` entry
- Exactly 1 body `<CbSection id="sources">` wrap
- Exactly 1 body `<CbSection id="related">` wrap

Section nav across the library is now homogeneous. The `Sources & Verification` link in any case's left rail jumps to the verification block.

### Files touched

98 case studies (`content/case-studies/*.mdx`). Single commit (`f861070`): 294 insertions (+) / 60 deletions (-). Build clean.

### Phase status after 6.1.c

Remaining phases: **6.2** (Confidence badge — new MDX component + per-case `confidence: disclosed | mixed | inferred` frontmatter field), **6.3** (Stat header `estimated` prop — extends existing `<CbMetric>` component, also populates conventions §11), **7a** (component-level docs in `case-study-components.md`), **7b** (polish editorial-conventions doc + cross-link).

Phase 6.2 is the next visible UI addition. Phase 6.3 is mechanical extension. Phase 7 closes out the audit.

---

## 2026-05-05 (continued) — Phase 6.1.b Verified Data Points generation: 41 cases populated (8 calibration + 33 bulk)

**Goal:** Generate confidence-rated Verified Data Points for the 41 cases that had a TODO placeholder injected in Phase 6.1.a. The placeholder pattern enables a calibration approval gate before bulk generation.

### Calibration approval gate

8 cases drafted fresh and surfaced for Neil's review at `audit-output/phase-6-1-b-calibration-proposal.md`: a24, aries-moross, bjarke-ingels, liz-lambert, loveis-wise, ryan-coogler, steph-smith, temi-coker. The pre-existing populated cases (george-lucas, tyler-the-creator) were displayed as canonical reference exemplars per the v5 briefing.

Per-item confidence calibration:
- **`very-high`** — SEC filings, official press releases (Disney/Hyatt/Apple/Google etc.), AMPAS/Grammy/awards body records, Box Office Mojo, named on-record interviews, Wikipedia for verifiable chart/award/release facts
- **`high`** — multiple credible secondary sources, named primary statements without separate corroboration, trade press confirmation (Variety/Deadline/THR/Axios/Dezeen), LinkedIn-confirmed roles
- **`medium`** — single secondary source, industry-comparable estimates, analyst projections, self-reported figures without third-party verification

Medium-tier items mostly stay in **Gaps to Verify** with parens-text per the Lucas/Tyler convention. VDP card itself is majority high + very-high.

Calibration approved 2026-05-05. Applied via `ddab017` (8 cases, 86 inserted).

### Bulk pass

3 parallel subagent batches, 11 cases each, 33 cases total:
- **Batch A** (`3793c16`) — 11 cases (a-em + futura). 127 items, distribution 49 vh / 70 h / 8 m.
- **Batch B** (`d75f028`) — 11 cases (jacob-paula). 140 items.
- **Batch C** (`ddeb724`) — 11 cases (rich-virgil). 132 items, only 1 medium-tier item across the batch (Goodman's 250+ mural count self-report).

Total: **399 confidence-rated data points** generated across the 33 bulk cases.

### Phase 6.1.b complete state

**Library is now 98/98 cases with populated `<CbVerifiedDataPoints>` components.** Zero TODO placeholders remain (verified via `grep -r "TODO: Phase 6.1.b" content/case-studies/` → 0 matches).

Combined item totals:
- 8 calibration cases: 86 items (Neil-approved)
- 33 bulk cases: 399 items
- Pre-existing converted cases (Phase 6.1.a 1A + 1B): ~609 items
- **Total VDP items across the library: ~1,094**

### Notable judgment calls flagged

- **viktoria-harrison** "co-founder" framing softened to "Joined charity: water in 2007 as brand manager / designer" — secondary-source chain doesn't fully support the case-body co-founder claim. Flag for editorial review whether the case body needs its own correction.
- **paul-trillo** has the highest medium-tier proportion in any single VDP — case body is explicit that structures are still emerging, calibration matches case-body honesty.
- **chris-koerner** has 4 medium-tier items — gross-revenue claims rest only on his own podcast/newsletter without third-party verification.

### Carry-forward (Phase 7b polish + future targeted edits)

- **viktoria-harrison co-founder framing** — see above; possible case-body correction needed.
- **11 default-to-medium cases from Phase 6.1.a** (barrel-holdings, beeple, blumhouse, bonobo, brandon-sanderson, brandon-stanton, brett-williams, codie-sanchez, kyla-scanlon, refik-anadol, roxane-gay, ryan-reynolds) — converted-but-flagged items from the 6.1.a parens-strip pass. These are still labeled `confidence="medium"` from the conversion default; a future re-rating pass against the calibrated register would lift legitimately-high items to `confidence="high"` where source quality supports it. Not blocking; logged for Phase 7b or a focused follow-up.
- **Phase 6.1.a structural drift** continues to wait for Phase 7b normalization (Verification Notes vs Verification Info, multiple themed Primary Sources groups, etc.).

### Files touched

41 case studies (`content/case-studies/*.mdx`) + this CHANGELOG.

4 commits this phase (`ddab017` calibration apply, `3793c16` batch A, `d75f028` batch B, `ddeb724` batch C). Build clean throughout.

### Phase status after 6.1.b

Remaining phases: **6.1.c** (Section nav + frontmatter mass update — adds Sources & Verification to sections array across all 98 cases), **6.2** (Confidence badge component + per-case assignment), **6.3** (Stat header `estimated` prop + populates §11), **7a** (component-level docs in case-study-components.md for the new components), **7b** (polish editorial-conventions doc + cross-link).

Phase 6.1.c is mechanical (frontmatter mutation across 98 cases). Phase 6.2 introduces a new component. Phase 6.3 extends an existing component.

---

## 2026-05-05 (continued) — Phase 6.1.a Verification block format restructure + new components

**Goal:** Bring all 98 cases' verification blocks into a canonical 5-subsection structure with the new structured `<CbVerifiedDataPoints>` / `<CbDataPoint>` components. Phase 6.1.a is format-only — content generation for missing data points is Phase 6.1.b's job.

### New components

- **`<CbVerifiedDataPoints>`** — wraps children, renders the "Verified Data Points" subheading inside `<CbSources>`. Replaces the old `<CbSourceGroup title="Verified Data Points">` pattern.
- **`<CbDataPoint confidence="very-high|high|medium">`** — renders text + small confidence chip with theme-aware styling (very-high: solid black/white; high: light translucent; medium: bordered transparent). ARIA label for screen readers.

Files: `src/components/mdx/case-study/cb-verified-data-points.tsx` (new), `src/components/mdx/case-study/index.tsx` (registered in MDX components map + re-exports), `src/app/globals.css` (chip styling).

### Inventory before sweep

- Cases with all 5 subsections in canonical form: **11 / 98**
- Cases missing Verification Info: 13
- Cases missing Secondary Sources: 67
- Cases missing Verified Data Points: 41 (becomes 42 once we account for components and a slug correction)
- Cases missing Gaps to Verify: 1
- Cases using `<CbVerifiedDataPoints>`: **0**

### Three-batch sweep across 97 cases (george-lucas was pilot-converted in the component commit)

- **george-lucas pilot** (`014a805`) — components built + first conversion. Validated the `(very high)` / `(high)` / `(medium)` parens-text → `confidence="..."` translation.
- **Batch 1A** (`afa7b42`, 28 cases a–jo) — VDP component conversion. 318 insertions = 318 deletions. 54 items defaulted to `confidence="medium"` (no explicit confidence marker in the original) — flagged for Phase 6.1.b re-rating in batch summary.
- **Batch 1B** (`55cb783`, 28 cases jo–w) — VDP component conversion. 291 data points processed. 4 items flagged with non-canonical `(medium-high)` markers stripped to `confidence="medium"` (kyla-scanlon, refik-anadol, roxane-gay, ryan-reynolds).
- **Batch 2** (`e569e45`, 41 cases) — VDP placeholder injection. Each gets a `<CbVerifiedDataPoints>{/* TODO: Phase 6.1.b — generate confidence-rated claims */}</CbVerifiedDataPoints>` placeholder, positioned canonically AFTER the last Sources group, BEFORE Gaps to Verify (or as last group if no Gaps section).

### Phase 6.1.a complete state

Every case in the library now has a `<CbVerifiedDataPoints>` component — 57 populated with confidence-rated data points, 41 with TODO placeholders. Phase 6.1.b is unblocked: a `grep -r "TODO: Phase 6.1.b" content/case-studies/` finds the 41 cases that need data-point generation.

### Editorial conventions §12 populated

`content/reference/case-study-editorial-conventions.md` §12 (Verification block structure) was a placeholder; now populated. Documents the canonical 5-subsection order, the new component reference, confidence calibration (very-high / high / medium), and the Phase 6.1.a status. Provenance updated.

### Drift deferred to Phase 7b

Surfaced during the sweep — not normalized in 6.1.a:

- 4 cases use "Verification Notes" instead of "Verification Info" (emma-chamberlain, jason-fried, mark-rober, sahil-lavingia)
- 9 cases use multiple themed Primary Sources groups instead of separate Primary / Secondary splits (aries-moross, ava-duvernay, coralie-fargeat, liz-lambert, mikkel-eriksen-stargate, ryan-coogler, sean-baker, steph-smith, tina-roth-eisenberg)
- 6 cases drift to Primary→Verification Info→Gaps ordering (no Secondary)
- 4 cases have Verification Info + Primary + Gaps (no Secondary): paul-trillo, tash-sultana, temi-coker, virgil-abloh
- 1 case (ohneis-andries-ohneisser) has non-canonical title "Gaps to Verify (Outreach Recommended)"
- 1 case (sahil-lavingia) has no Gaps to Verify subsection

These are title and ordering issues, not structural — the component is in place across all 98 cases. Phase 7b will normalize.

### Operational learnings

- **Browser preview verification was blocked by port 3000 in use** (Neil's existing dev server in main checkout). Visual chip rendering not verified during the sweep — Neil can verify when convenient by hitting `/case-studies/george-lucas` after fast-forwarding the main checkout.
- **Default-to-medium for missing confidence markers** is the safe call. 58 items across the library defaulted; the calibration pass in Phase 6.1.b will re-rate them based on source quality.

### Files touched

97 case studies (`content/case-studies/*.mdx`) + 1 new component file + 2 modified component-system files + 1 CSS file + 1 conventions doc + this CHANGELOG.

5 commits this phase (`014a805`, `afa7b42`, `55cb783`, `e569e45`, plus this doc commit). Build clean throughout.

### Phase 6.1.b unblocked

Calibration batch (10 cases per the briefing's fixed list — george-lucas, ryan-coogler, a24, liz-lambert, tyler-the-creator, loveis-wise, steph-smith, bjarke-ingels, temi-coker, aries-moross) → Neil approval gate → bulk pass on remaining 31 cases with TODO placeholders. The 58 default-to-medium items in already-populated cases also get re-rated.

---

## 2026-05-05 (continued) — Phase 4 Related-cases audit: 14 cases gain peer links + conventions §14

**Goal:** Audit the `<CbRelated>` block at the bottom of every case study. Two rules in the v5 briefing: each block should pull from at least 3 of 5 relational axes (structural overlap / outcome contrast / stage progression / discipline contrast / counterfactual), and no more than 50% of case-card links should point to cases published within 90 days.

### Two systemic findings reshaped the phase

The inventory subagent surfaced two issues that materially changed the phase's shape:

- **Recency cap is structurally unsatisfiable.** Every case has `publishedAt >= 2026-02-25` because Phase 0 backfilled `publishedAt = updatedAt` and the audit happened in late April / early May 2026. The 90-day cutoff is 2026-02-04 — zero cases predate it. So any case with even one peer case-card link is at 100% recent ratio.
- **61 of 98 cases sit at axis coverage `{1, 4}`.** The dominant authorial pattern in case-card desc lines is descriptive ("Another holding-company case — different model, same principle") rather than relational. Conservative axis classification registers descriptive cards as axis 1 only, plus axis 4 if disciplines differ. Editorial issue, not card-selection issue.

### Neil's directional decisions

- **Recency cap → pause** until the library has a wider age distribution (or until a Phase 0 follow-up uses git first-touch dates instead of `updatedAt` for `publishedAt`).
- **3-axis test → tolerate `{1, 4}`** as the de-facto bar; document the 3-axis aspiration in the conventions doc as forward-looking guidance for new cases, not as a sweep target.

### What landed

- **12 auto-updates** (`2308cee`) — case-card additions on cases that had structure-only Related blocks (zero peer case cards). Adds 1–3 case cards per case with relational desc lines (axis 2/3/4/5 framing). Cases: ava-duvernay, tash-sultana, mark-rober, ryan-coogler, coralie-fargeat, sean-baker, tina-roth-eisenberg, mikkel-eriksen-stargate, jason-fried, sahil-lavingia, emma-chamberlain, temi-coker.
- **Path-β extension** (`455d3aa`) — 2 more structurally-thin cases (virgil-abloh, ohneis-andries-ohneisser) get peer additions analogous to the 12 auto-updates.
- **Editorial conventions §14** (`455d3aa`) — new section documenting the 5-axis selection rule, desc-line templates for axes 2 / 3 / 5 with in-library models (taylor-swift, donald-glover, chase-jarvis, emma-chamberlain), authoring expectation (2–3 structure cards + 2–3 case cards with at least one relational desc), recency cap pause status with rationale.
- **Authoring checklist** updated to add §14 check (item 12).
- **18 flag-for-review proposals** triaged: 11 resolved by recency pause (recency-only failures), 5 in 2-axis tolerance bucket, 2 absorbed into path-β. None required Neil's per-item annotation under the relaxed framing.

### What didn't land (and why)

- **flag-bulk-A** (61 cases at coverage {1, 4} — desc-line drift). Skipped per the "tolerate {1, 4}" decision. Future cases get relational desc lines via the §14 convention; existing 61-case sweep deferred indefinitely.
- **flag-bulk-B** (cases failing recency cap). Skipped per the recency-cap pause.
- **The desc-rewrite work on rick-rubin / belsky-corea / brett-williams** (genuinely failing axes under any framing). Deferred to a future polish pass; the cards are right, only the desc lines need reframing.

### Operational learnings

- **The recency cap reveals a Phase 0 data-integrity issue.** `publishedAt = updatedAt` makes "publication date" a moving target — cases edited during the audit got new `publishedAt` values. A Phase 0 follow-up using git first-touch dates would fix this. Worth doing before a future related-cases pass with the recency cap re-enabled.
- **Conservative axis classification + editorial pattern drift = under-fire.** When a rule's binding constraint is editorial pattern rather than card selection, the rule's enforcement mechanism is the editorial-conventions doc, not a sweep. §14 is the right place for the relational-desc-line guidance.

### Files touched

14 case studies (`content/case-studies/*.mdx`) — auto-update peer additions. `content/reference/case-study-editorial-conventions.md` — new §14, authoring checklist item 12, provenance update. `CHANGELOG.md` — this entry.

3 commits this phase (`2308cee`, `455d3aa`, plus the doc update). Build clean throughout.

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
