# Test + Demo User Reference

Quick-glance reference for the 10 test/demo users created by `scripts/seed-test-users.ts`. Use this to spot-check after re-seeds, prep sales demos, or debug "user X is missing data."

**Last seeded:** 2026-04-30 (commit `cb184f6`)
**Password for all users:** `TestPass123!`
**Domain:** `@insequence.so` (changed from `.co` on 2026-04-24)

---

## Power users — full data, ideal for demos

These four users have the richest data shape — assessment + roadmap + portfolio analysis + multiple deals with verdicts + asset inventory. Use for walkthroughs, screenshots, and verifying the end-to-end member experience.

### `demo-sales@insequence.so` — Maya Chen
Stage 2 brand strategist · `established_practitioner` archetype · `service` mode

**The polished demo persona.** Use for sales walkthroughs and external screenshots — her data is the most narratively coherent across surfaces.

| Surface | State |
|---|---|
| Subscription | Active |
| Creative Identity | Completed |
| Strategic Roadmap | Published — Stage 2 |
| Portfolio | Full analysis — `$800K-$2.2M`, leverage `high`, 5 driver bars, 4 risks |
| Asset inventory | 4 items (frameworks, case study portfolio, network, thought leadership brand) |
| Deal evaluator | 4 deals + 4 verdicts |
| Bookmarks | Yes |

**Deals:**
1. Fintech Brand Retainer — yellow (renegotiated to fee + equity)
2. DTC Skincare Brand — green (accepted, her confidence-builder)
3. SaaS Productized Service — yellow
4. Conference Sponsorship — red (declined)

**Best for:** dashboard Portfolio State demo, deal verdict walkthroughs, "what does a complete member look like" screenshots.

---

### `test-performer@insequence.so` — Marcus Cole
Stage 3 musician · `untapped_catalog` archetype · `performer` mode

**The catalog-rich Stage 3 user.** Strong portfolio analysis with high leverage; deal mix shows the full signal range.

| Surface | State |
|---|---|
| Subscription | Active |
| Creative Identity | Completed |
| Strategic Roadmap | Published — Stage 3 |
| Portfolio | Full analysis — `$1.5M-$3.5M`, leverage `high`, 5 driver bars, 4 risks |
| Asset inventory | 7 items (200+ track catalog, production workflow, Spotify audience, etc.) |
| Deal evaluator | 3 deals + 3 verdicts |
| Bookmarks | Yes |

**Deals:**
1. Sync Licensing Agency Agreement — green (accepted)
2. Hipgnosis Catalog Partial Sale — yellow (pending; counter-offer staged)
3. Headphone Brand Ambassador — red (declined)

**Best for:** Stage 3 walkthroughs, catalog-economics demos, "untapped catalog" archetype showcase.

---

### `test-maker@insequence.so` — Jordan Rivera
Stage 3 filmmaker · `platform_builder` archetype · `maker` mode

**The director with infrastructure ambitions.** Strong narrative arc through assessment → roadmap → deals.

| Surface | State |
|---|---|
| Subscription | Active |
| Creative Identity | Completed |
| Strategic Roadmap | Published — Stage 3 |
| Portfolio | Full analysis — `$600K-$1.4M`, leverage `medium`, 5 driver bars, 4 risks |
| Asset inventory | 6 items (screenplay catalog, footage archive, production methodology, network, audience, judgment) |
| Deal evaluator | 2 deals + 2 verdicts |
| Bookmarks | Yes |

**Deals:**
1. Limited Series Equity Stake — green (accepted)
2. Documentary Distribution (Netflix) — yellow (pending)

**Best for:** filmmaker-track demos, equity-deal walkthroughs.

---

### `test-service@insequence.so` — Priya Sharma
Stage 2 product designer · `high_earner_no_ownership` archetype · `service` mode

**The talented service provider with structural gaps.** Misalignment flags include `judgment_not_priced` and `demand_exceeds_capacity` — useful for showing how the platform reframes the path forward.

| Surface | State |
|---|---|
| Subscription | Active |
| Creative Identity | Completed |
| Strategic Roadmap | Published — Stage 2 |
| Portfolio | Full analysis — `$300K-$750K`, leverage `medium`, 5 driver bars, 4 risks |
| Asset inventory | 5 items (design systems framework, case study portfolio, network, newsletter audience, judgment) |
| Deal evaluator | 2 deals + 2 verdicts |
| Bookmarks | Yes |

**Deals:**
1. Fintech Design System + Advisory — yellow (renegotiated to fee + equity)
2. Pre-Seed Startup Advisory — red (declined)

**Best for:** Stage 2 walkthroughs, judgment-pricing storyline, service-to-equity transition narrative.

---

## Edge-case users — intentional partial data

These six users have specific lifecycle states. Use for testing UI states the power users don't cover.

### `test-fresh@insequence.so` — Fresh Tester
**Empty state.** Fresh signup, full-access subscription, no Creative Identity, no portfolio, no deals.

**Best for:** testing onboarding CTAs, empty-state dashboard, the welcome → first-action UX.

### `test-assessed@insequence.so` — Assessed Tester
**Mid-funnel state.** Completed Creative Identity + roadmap, but no portfolio, no deals, no inventory items.

**Best for:** "what does the dashboard look like with a roadmap but no portfolio data" — should show the roadmap CTA prominently and Portfolio Inventory CTA.

### `test-library@insequence.so` — Library Tester
**Library-tier subscription.** Has access to library content (case studies, structures, articles) but **not** to AI tools (Creative Identity, Portfolio Analysis, Deal Evaluator, Advisor).

**Best for:** testing subscription gating, library-only experience, upgrade prompts on AI surfaces.

### `test-lapsed@insequence.so` — Lapsed Tester
**Cancelled / expired subscription.** Has had access in the past, now sees the lapsed-state UI.

**Best for:** testing reactivation flow, lapsed-user messaging, "what does it look like when subscription ends?" scenarios.

### `test-admin@insequence.so` — Admin Tester
**Admin role.** Has access to `/admin/*` routes (members, assessments, codes, AI config, newsletter).

**Best for:** admin UI testing, member-management walkthroughs.

### `demo-onboard@insequence.so` — Demo User
**Clean slate.** Identical empty state to test-fresh, but kept separate for live onboarding walkthroughs (so you can re-walk the flow without resetting test-fresh).

**Best for:** live demos of the new-member experience.

---

## How to re-seed

```bash
cd /Users/neilbrown/Documents/00-Neil/01-In-Sequence/sequence
npx tsx scripts/seed-test-users.ts --reset
```

The `--reset` flag deletes all 10 users (matched by email) before re-creating them. Reads credentials from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).

Other modes:
- `npx tsx scripts/seed-test-users.ts` — seed without delete (useful if you've manually deleted some users)
- `npx tsx scripts/seed-test-users.ts --delete` — delete only, no re-seed

**After seeding:** spot-check the power-user data with this table. If something looks off (e.g. "Marcus has only 1 deal"), the seed script likely has a regression — see commit `cb184f6` for the verdict-coverage fix as an example of what to look for.

---

## Schema dependencies

If you're updating the seed script's data shape, these fields are queried by the dashboard / portal — keep them populated:

- `assessments.detected_stage`, `archetype_primary`, `creative_mode`, `misalignment_flags`, `completed_at`
- `strategic_plans.plan_content` (StrategicRoadmap shape) + `status: published` + `source`
- `assessment_actions.plan_id` + `action_order` + `status`
- `asset_inventory_analyses.analysis_content.summary` (with one-word `leverage_score` + `leverage_rationale` + `value_drivers` + `risks`)
- `deal_evaluations.overall_signal` + `overall_score` + `deal_name` + `deal_type` + `completed_at`
- `deal_verdicts.verdict_content` (with signal, dimension_summaries, recommended_actions, resources)

See `src/types/inventory.ts`, `src/types/assessment.ts`, `src/types/evaluator.ts` for the full shapes. See `content/reference/troubleshooting.md` for the common gotchas.
