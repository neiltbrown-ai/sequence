# Case Study Taxonomy — Rollout Plan

**Drafted:** 2026-05-06 (during the portal refinements + vocab cleanup session)
**Companion to:** `case-study-taxonomy.md` (the canonical taxonomy itself)
**Purpose:** Self-contained implementation plan for migrating the codebase to the locked 16-industry × 10-discipline taxonomy. Designed to be pasted as the opening message of a new Claude Code session.

When you're ready to start the implementation work, open a fresh Claude Code session in the repo root and paste the block below as the opening message.

---

# Implementation: Case Study Taxonomy Migration + Sidebar Filter UI + Assessment Vocab Alignment

We just landed `content/reference/case-study-taxonomy.md` (canonical 16 industries × 10 disciplines). Now implement it across the codebase. Read that doc first — it's the source of truth for all vocabulary in this work.

## Background you need

- **Taxonomy file**: `content/reference/case-study-taxonomy.md` — full definitions, scope rules, worked examples, edge cases
- **Why this exists**: case studies have ~103 unique freeform `discipline: string` values across 104 cases, plus a 9-bucket `industry: string` enum where Writing/Media/Publishing/Audio overlap. Filter UX is impossible to ship coherently. About to author 100 more cases — need a tight system before that
- **Decision: align case studies AND assessment Q1 vocabulary** to the same 16 industries (Path 1 — full assessment expansion, not rollup mapping). This means assessment Q1 needs renames + 6 new slugs + 6 new Section 4 question pools
- **Current state recap**:
  - Case study `industry` field has 9 values: Design (41), Film (22), Music (17), Writing (6), Photography (6), Agency (5), Media (4), Publishing (1), Audio (1)
  - Assessment Q1 in `src/lib/assessment/questions.ts` (`Q1_INDUSTRY` or similar — find it) has 10 slugs: visual_arts, design, film_video, music_audio, writing, performing_arts, architecture_interiors, fashion_apparel, advertising_marketing, technology_creative_tech
  - Both vocabularies are being unified to the 16 from the taxonomy doc
- **Archetype impact**: `matchArchetype()` in `src/lib/assessment/archetype-matching.ts` does NOT use industry/discipline — it scores on stage + creative_mode + misalignment_flags only. Industry expansion is safe; archetypes don't change
- **Existing similar pattern**: see `src/lib/profile/income-ranges.ts` (single source of truth for income vocab) — replicate that pattern

## Workflow — one worktree per phase

Each phase ships from its own git worktree on its own feature branch. **Do not work on `main` directly.** Each phase is substantial enough that you'll want a Vercel preview deploy to verify before merging — and isolation so you can pause mid-phase if something urgent comes up.

### Pattern (run from the parent repo, NOT inside an existing worktree)

```bash
cd /Users/neilbrown/Documents/00-Neil/01-In-Sequence/sequence
git fetch origin && git checkout main && git pull --ff-only origin main

# Pick a phase suffix that's descriptive (e.g. taxonomy-schema, taxonomy-filter-ui,
# taxonomy-assessment) — the worktree dir + branch name share it
PHASE=taxonomy-schema-$(openssl rand -hex 3)

git worktree add .claude/worktrees/$PHASE -b claude/$PHASE
cd .claude/worktrees/$PHASE
```

Open a fresh Claude Code session **inside the worktree directory** and start coding the phase.

### Per-phase shipping

When the phase is done and the Vercel preview is green:

```bash
# from inside the worktree
git push -u origin claude/$PHASE                  # pushes feature branch + creates Vercel preview
# verify preview is green at sequence-git-claude-...vercel.app
git push origin claude/$PHASE:main                # fast-forward push to main
git push origin --delete claude/$PHASE            # clean up the remote feature branch
```

Then tear down the worktree from the parent repo:

```bash
cd /Users/neilbrown/Documents/00-Neil/01-In-Sequence/sequence
git worktree remove .claude/worktrees/$PHASE
git branch -D claude/$PHASE
```

### If main moves while you're in the middle of a phase

(Possible if a parallel session — case study publishing, urgent fix — pushes during your phase work.)

```bash
git fetch origin
git pull --rebase origin main      # rebase your feature branch on the new main
git push --force-with-lease         # update remote feature branch
```

`--force-with-lease` is safer than `--force` — it refuses to overwrite if someone else pushed to your feature branch in the meantime. (For a single-author feature branch this is just paranoia, but it's free paranoia.)

### Why per-phase, not one worktree for the whole rollout

- **Each phase ships independently to main** — a clean, atomic, well-tested PR per phase. Easier to review, easier to roll back if needed.
- **Phase 2 needs Phase 1 already on main** (the sidebar UI consumes `industries[]` / `disciplines[]` fields that Phase 1 introduces). New worktree off the latest main = always starts from a known-good state.
- **No context bleed.** Switching branches inside a single worktree resets the working tree — easy to lose half-finished edits or auxiliary scripts you wrote during a phase.

## End-of-phase protocol — must complete before pushing to main

Every phase ships **code + docs in the same fast-forward push**. Don't defer docs to "later" — context decays and the next session won't know what you did. This is the four-question protocol from the top of `CHANGELOG.md` applied to every phase:

| # | Question | Action if yes |
|---|----------|---------------|
| 1 | Did we change architecture? (new patterns, schema columns, conventions, file paths) | Update `CLAUDE.md` — likely Schema gotchas, Key file paths, or "What this session built" |
| 2 | Did we hit a bug worth remembering? (something that took >15 min to debug, or has a misleading symptom) | Add a Symptom → Root cause → Fix entry to `content/reference/troubleshooting.md` |
| 3 | Did we ship a new pattern or reusable component? | Update `design.md` (root) — only if the pattern is reusable across the platform, not one-off |
| 4 | Did anything material happen at all? | One dated entry in `CHANGELOG.md` (newest at top; use `(continued)` if a same-day entry already exists) |

Each phase will hit at least #1 and #4. Phases 1 and 3 will likely hit #2 (migration gotchas, scoring edge cases). Phase 2 might hit #3 (sidebar facet pattern is reusable for filters elsewhere).

### What "in the same push" looks like

A phase's final commit graph should look like this (multiple code commits + a single docs commit, all pushed together):

```
docs: <phase> — CHANGELOG + CLAUDE + troubleshooting + (design.md if applicable)
<phase>: <last code commit>
<phase>: <middle code commit>
<phase>: <first code commit>
<commit on main when phase started>
```

Don't push the code commits, then later push the docs commit. Push everything together so production never sees code without its corresponding docs entry.

### Pre-merge checklist (run through before fast-forwarding to main)

- [ ] All four protocol questions answered (CLAUDE.md / troubleshooting.md / design.md / CHANGELOG.md updated as needed)
- [ ] CHANGELOG entry includes a "Lessons / patterns worth remembering" section (≥1 bullet) — even small ones are valuable for future sessions
- [ ] Vercel preview deploy is **green** for the feature branch
- [ ] `npx tsc --noEmit` passes locally
- [ ] If the phase included a Supabase migration: it's been applied to Supabase BEFORE the code lands on main (otherwise main is broken until you apply it)
- [ ] Spot-checked the actual UX on the Vercel preview URL (don't trust "the build is green" alone — eyes on the rendered output)

Only after all six are checked: fast-forward push to main.

## Phase 1 — Schema foundation + content backfill

**Goal**: get the taxonomy into TypeScript types and migrate the 103 existing case studies to use the new fields. Build doesn't break, filtering doesn't yet exist.

### Files to create

- `src/lib/case-studies/taxonomy.ts` — exports `INDUSTRIES` and `DISCIPLINES` const arrays of `{slug, label, group}` objects (matching the taxonomy doc), plus `IndustrySlug` and `DisciplineSlug` types via `as const`. Also export the 5 industry groups as a separate const for UI grouping.

### Files to update

- `src/lib/content.ts` — `CaseStudyMeta` type gains `industries: IndustrySlug[]` and `disciplines: DisciplineSlug[]`. Keep `industry: string` (singular) and `discipline: string` for now — `industry` is deprecated and removed at end of this phase; `discipline` stays as the human-readable display string per the taxonomy doc.
- Add a build-time validator: when reading frontmatter, log a warning if any case study's `industries[]` or `disciplines[]` contains a value not in the canonical list. Fail-loud during dev; log-only in production.

### Backfill the 103 cases

- Write a one-off Node script `scripts/backfill-case-study-taxonomy.ts` that:
  - Reads all `content/case-studies/*.mdx`
  - For each: feeds its frontmatter (title, discipline display string, current industry value, excerpt, first 500 chars of body) to a Claude API call with the taxonomy doc as system prompt
  - Asks Claude to propose `industries` (1-2) and `disciplines` (1-3) per the taxonomy
  - Writes a JSON report `case-study-taxonomy-proposals.json` for human review (not yet committed to MDX)
- After the report, present a `# Case Study Taxonomy Migration` review summary to the user (counts per industry, counts per discipline, any cases the script flagged as ambiguous)
- After human sign-off, run a second pass that writes `industries:` and `disciplines:` into each MDX frontmatter (preserving everything else)
- Commit migrated frontmatter as `Backfill: case study industries[] + disciplines[] (103 cases)`

### Cleanup at end of Phase 1

- Remove the deprecated `industry: string` field from frontmatter and from `CaseStudyMeta` type
- Update `src/components/portal/case-studies-filters.tsx` reference to `s.industry` to use `s.industries[0]` as a temporary shim (the proper sidebar UI is Phase 2; this is just to keep the build green)

### Done criteria for Phase 1

- All 103 cases have valid `industries[]` and `disciplines[]` per the taxonomy
- Build passes
- Existing tab-bar filter still functions (using `industries[0]` as the primary)
- The `industry: string` field is gone

## Phase 2 — Sidebar filter UI

**Goal**: replace the current single-axis tab bar with a two-axis sidebar facet filter on `/library/case-studies` and `/case-studies` (public).

### Component design

- `src/components/portal/case-studies-filters-sidebar.tsx` — replaces `case-studies-filters.tsx`
- Layout:
  - Left sidebar (250-300px), sticky, scrollable on its own
  - Two facet groups: **Industries** (16 checkboxes, grouped by domain heading per `INDUSTRY_GROUPS`) + **Disciplines** (10 checkboxes, no sub-grouping)
  - "Clear all" button at top of sidebar when any filter is active
  - Each facet shows count of matching cases next to its label, dynamically updated as other filters change
- Filtering semantics:
  - Multi-select within facet (checkbox = OR within facet)
  - AND between facets (a case must match selected industry AND selected discipline)
  - Empty selection in a facet = no constraint from that facet
- Active-filter chips above the case grid: chip per active filter with X-to-remove
- Mobile: sidebar collapses into a "Filter" drawer button at the top of the grid; bottom sheet on mobile with the same facets
- Empty state: "No case studies match these filters. [Clear all]"

### URL state

- Use `useSearchParams` to persist filter state in URL: `?industries=music,film_tv&disciplines=production`
- Sharable / refreshable links

### Files to update

- `src/app/(portal)/library/case-studies/page.tsx` — replace `<CaseStudiesFilters>` with the new sidebar component
- `src/app/(public)/case-studies/page.tsx` — same swap if it exists (verify; it may use the same component)
- `src/app/(portal)/portal.css` (or new `case-studies-filters.css`) — sidebar layout styles, drawer styles
- `src/components/portal/case-studies-filters.tsx` — delete after migration is complete

### Done criteria for Phase 2

- Sidebar renders on portal `/library/case-studies` with all 16 industries (grouped) and 10 disciplines
- Multi-select within facet, AND between facets, works as specified
- URL state persists filter selection
- Mobile drawer works
- Old tab-bar component is deleted

## Phase 3 — Assessment vocabulary alignment + extension

**Goal**: align the assessment's Q1 industry options with the case study taxonomy. Rename 8 existing slugs for consistency, add 6 new slugs, write 6 new Section 4 industry-specific question pools.

### Slug renames (8 existing assessment slugs)

| Old slug | New slug |
|----------|----------|
| `visual_arts` | `visual_art` |
| `film_video` | `film_tv` |
| `music_audio` | `music` |
| `performing_arts` | `theater` |
| `architecture_interiors` | `architecture` |
| `fashion_apparel` | `fashion` |
| `advertising_marketing` | `advertising` |
| `technology_creative_tech` | `technology` |

`design` and `writing` keep their existing slugs (already aligned with the taxonomy).

### New slugs to add (6)

- `photography`
- `comics`
- `comedy`
- `media`
- `hospitality`
- `gaming`

### Files to update

- `src/lib/assessment/questions.ts`:
  - `Q1_INDUSTRY` (find the actual export name) — rename the 8 slugs and add the 6 new ones with appropriate labels (use the labels from `case-study-taxonomy.md`)
  - `INDUSTRY_POOLS: Record<string, AssessmentQuestion[]>` — rename the 8 existing keys, AND write 6 new pools (~3-5 questions each) for the new slugs. **Editorial work**: each pool probes industry-specific Stage indicators. Use the existing pools as calibration. Examples of the kind of question:
    - `comics` Stage 2-3 indicator: "Do you own back-end royalties on your published work, or did you sign work-for-hire?"
    - `comedy` Stage 3 indicator: "Have you negotiated a special with a streamer, and did you retain any back-end?"
    - `hospitality` Stage 3 indicator: "Do you own equity in any of the venues operating under your name?"
    - `gaming` Stage 2 indicator: "If you've shipped a game, do you retain IP and any sequel/IP-extension rights?"
- `src/lib/assessment/scoring.ts` — verify if anything keys off the renamed slugs; if so, update
- `src/lib/assessment/archetypes.ts` — `context_keys` references include `'discipline'`; these refer to the slug stored in `assessments.discipline`, so they pick up the new vocab automatically. Verify no hardcoded slug strings.
- `src/lib/profile/disciplines.ts` (NEW) — single source of truth for discipline → label mapping shared between case studies and assessment, mirroring `income-ranges.ts`. Imported by both `case-study-taxonomy.ts` and assessment Q1 config.

### Migration

- New migration `supabase/migrations/00018_normalize_assessment_industry.sql`:
  - For each of the 8 renamed slugs, `update assessments set discipline = 'new_slug' where discipline = 'old_slug'`
  - Idempotent (filter on the old slug values)
- Update test-user seed (`scripts/seed-test-users.ts` if it references industry slugs)
- Update `content/reference/test-users.md` if it lists discipline values per test user

### Done criteria for Phase 3

- All 8 existing assessment slugs are renamed to align with the case study taxonomy
- 6 new slugs are added with their own Section 4 question pools
- Migration applied to Supabase (manual step — list it in the deploy checklist)
- Existing test-user assessments all still pass through scoring without throwing
- A user completing the assessment with one of the 6 new industries gets relevant Section 4 questions, not a generic fallback

## Phase 4 — Cross-cutting reconciliation

Per-phase CHANGELOG / CLAUDE / troubleshooting entries should already be in place (they shipped with each phase per the protocol). Phase 4 handles the cross-cutting docs that DON'T cleanly belong to a single phase, plus a final coherence check.

### Cross-cutting docs

- Update `content/reference/seq-assessment-build-spec-v3.md` Q1 section to reflect the new 16-industry vocab + the 6 new question pools written in Phase 3. This spec spans all three earlier phases, which is why it's not in any of them. *(Update 2026-05-07: this was actually folded into Phase 3 since the worktree was already touching the spec — file was renamed v2 → v3 and the Q1 / §4B sections updated. Phase 4 is now smaller.)*
- (Optional) Add a roll-up entry to `CHANGELOG.md` that links the three earlier phase entries — useful for someone reading the history later. Format: a short "## 2026-05-?? — Case study taxonomy rollout complete" entry that points at the three phase entries with one-line summaries each.

### Final coherence pass

- Re-read `CLAUDE.md` Schema gotchas + Key file paths sections — make sure the per-phase additions read as a coherent whole, not three disconnected bullets. Edit prose if needed.
- Verify `content/reference/case-study-taxonomy.md` still describes the as-shipped state (it should, since it was authored against the final design — but if anything drifted during implementation, fix it).
- Verify the "Shared vocab modules" subsection in `CLAUDE.md` Key file paths includes `src/lib/case-studies/taxonomy.ts` and `src/lib/profile/disciplines.ts` (added in Phases 1 and 3 respectively).

### What you should NOT need to do in Phase 4

Don't write per-phase CHANGELOG / CLAUDE / troubleshooting entries here. Those should have already shipped with each phase. If they didn't — go back and add them to a follow-up commit on the relevant phase's branch (or on main, since they're already merged) before doing Phase 4. The point of the per-phase protocol is that this final phase is small.

## Risks / things to watch

- **Backfill quality.** Claude's industry/discipline tagging on existing cases may need iteration. Run a small calibration batch (10 cases) before mass migration. Don't trust mass migration without spot-check.
- **Industry pool authoring is real editorial work.** Don't rush the 6 new pools. Use the existing pools as calibration. If a new industry doesn't have clear Stage 2/3 indicators, that's a signal the industry might not differentiate stages well — call it out for product discussion.
- **Migration ordering matters.** The slug-rename migration (00018) must apply BEFORE deploying the renamed code, OR the code must handle both old and new slug values in a transition period. Recommend: apply migration → deploy code in same window. Coordinate with user.
- **No active users beyond test/demo accounts** (per the May 2026 session) so migration is low-stakes data-wise. Still apply migration carefully — habits matter.

## Constraints

- This is a multi-day implementation. Each phase can ship independently. Phase 1 unblocks new case study authoring (so the user can write the next 100 with proper tags). Phase 2 unblocks UX improvement. Phase 3 unblocks personalization. They don't have to ship at the same time.
- **One git worktree per phase, fast-forward to main when phase is verified green on Vercel preview.** See the "Workflow — one worktree per phase" section above for the exact commands. Don't work on `main` directly — main is for the verified output, not work in progress.
- Each phase should commit docs in the SAME push as the code (per the End-of-session protocol at the top of `CHANGELOG.md`)
- Apply migrations to Supabase manually (SQL Editor) before merging the code that depends on them.

## Suggested phase ordering

1. Phase 1 (schema + backfill) — unblocks authoring
2. Phase 2 (filter UI) — unblocks UX
3. Phase 3 (assessment alignment) — unblocks personalization
4. Phase 4 (cleanup + docs) — final polish

Each phase = 1 session, ~3-5 hours. Phase 3 is the heaviest because of editorial work for the 6 new question pools.

When you start, confirm:
1. You've read `content/reference/case-study-taxonomy.md` end to end
2. You've read the "Workflow — one worktree per phase" section above and you're working in the correct worktree (NOT on `main` directly)
3. You've internalized the "End-of-phase protocol" section above — every phase ships code + docs in the same fast-forward push
4. Which phase you're starting with (default: Phase 1)
5. Any decisions you want from the human before coding (e.g., naming conventions, edge cases not covered in the taxonomy doc)

Then proceed.
