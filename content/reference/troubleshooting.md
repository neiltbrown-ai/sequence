# Sequence — Troubleshooting Playbook

Symptom → root cause → fix for recurring bugs we've hit. Consult this before rediscovering a problem from scratch.

---

## Build / Deploy

### Symptom: Vercel build fails with `Missing API key. Pass it to the constructor 'new SDK("re_123")'` during "Collecting page data"

**Reports as:** Vercel deploy fails. Build log shows the SDK error during the `Collecting page data using N workers` step, often pointing at an API route file (`/api/book/download`, `/api/newsletter/subscribe`, etc.). Compile step succeeds; failure is at page-data collection.

**Root cause:** A `lib/` module instantiates an SDK at module level — e.g. `const resend = new Resend(process.env.RESEND_API_KEY)` at the top of `src/lib/email/send.ts`. Next.js evaluates route modules during page-data collection. Any module-level constructor that throws when its env var is missing crashes the **entire build**, even for routes that never call the SDK. Most commonly hits Vercel Preview deploys when env vars aren't scoped to all environments.

**Fix:** Convert to lazy instantiation — construct the client on first use, not at import time.

```ts
// BEFORE — throws during build if env is missing
const resend = new Resend(process.env.RESEND_API_KEY);

// AFTER — build is env-independent; constructor runs at first call
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendEmail(...) {
  const resend = getResend();
  // ...
}
```

**Pattern to remember:** `lib/` modules should never do `const x = new SDK(process.env.X)` at the top. Always lazy. The two existing Resend callsites in routes (`/api/book/download`, `/api/newsletter/subscribe`) already construct inside the request handler — same idea, request-time instantiation.

To grep for this antipattern across the codebase:
```bash
grep -rn "^const .* = new \|^export const .* = new " src/lib/ --include="*.ts"
```
Filter the results — `new Set([...])` and `new Map(...)` are fine; SDK constructors that take env vars are the danger.

---

### Symptom: Vercel build fails with `Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY` during "Generating static pages"

**Reports as:** Build log shows `Error occurred prerendering page "/admin/<route>"` followed by the missing-env-var error. Compile + page-data collection succeed; failure is during static-page generation.

**Root cause:** A server component page (no `"use client"` at top) calls `createAdminClient()` at render time, and Next.js tries to statically generate it during build. Without `dynamic = "force-dynamic"`, Next.js evaluates the page in the build environment, which doesn't always have Supabase env vars set (e.g. Vercel Preview on Hobby).

**Fix:** Add the dynamic directive to the page module:

```tsx
// src/app/(admin)/admin/<route>/page.tsx
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";  // ← add this

export default async function AdminPage() {
  const admin = createAdminClient();
  // ...
}
```

Auth-gated stateful pages should never be statically generated anyway — `force-dynamic` is the correct semantics, not just a build-fix workaround.

**Existing examples:**
- `src/app/(portal)/settings/page.tsx` — declares `dynamic = "force-dynamic"`
- `src/app/(admin)/admin/assessments/page.tsx` — declares `dynamic = "force-dynamic"` (added May 2026)

`/roadmap/page.tsx` doesn't need an explicit declaration because it accesses cookies via `await supabase.auth.getUser()`, which Next.js auto-detects as dynamic.

**To audit:** find all server components that call admin/server clients without the directive:
```bash
# Server components calling createAdminClient (no "use client" at top)
for f in $(grep -rL "use client" src/app --include="*.tsx"); do
  if grep -q "createAdminClient\b" "$f" 2>/dev/null; then
    if ! grep -q 'dynamic = "force-dynamic"' "$f"; then
      echo "Missing force-dynamic: $f"
    fi
  fi
done
```

---

### Symptom: Vercel preview deploys fail on env vars that production builds had no problem with

**Reports as:** Production deploys (push to main) succeed. Preview deploys (push to feature branch) fail on missing env var errors — Resend, Supabase, anything that needs a key at build time.

**Root cause:** On Vercel Hobby plan, env vars are scoped per-environment-tick (Production / Preview / Development). When you add or rotate a variable, Vercel doesn't automatically propagate it to all environments. The "Production" tick is often the only one set, so Preview builds run without the var.

**Fix:** In Vercel → Project Settings → Environment Variables, ensure each env var has **all relevant environment ticks** set:
- Production
- Preview
- Development (for `vercel dev` local runs)

For SDK keys with sender domains (Resend, SendGrid, etc.) the convention:
- Production env → Production key
- Preview env → Development key (separate sender, doesn't pollute production metrics)
- Development env → Development key

If you can't expand the environments dropdown for a particular variable, the value field may be empty — Vercel locks the dropdown until a value is provided. Paste the key first, then the env-tick checkboxes become interactive.

**Better long-term:** apply the lazy-instantiation pattern (above) to ALL SDK clients in `lib/`. Then build never depends on env vars; only runtime does. This reduces blast radius — a missing key fails the route that uses it, not the entire build.

---

### Symptom: Anthropic SDK calls from a Node script return `404 Not Found` even though the API key is valid

**Reports as:** Every `anthropic.messages.create(...)` call returns:
```
404 {"type":"error","error":{"type":"not_found_error","message":"Not found"},"request_id":"req_..."}
```
Same script with no other changes works against curl. API key is correct (logs show `sk-ant-api03...`).

**Root cause:** The script is reading `SEQ_ANTHROPIC_BASE_URL` from `.env.local` and passing it to `new Anthropic({ apiKey, baseURL })`. That env var contains `https://api.anthropic.com/v1`, but the official `@anthropic-ai/sdk` already appends `/v1/messages` to the base URL itself — so the request goes to `https://api.anthropic.com/v1/v1/messages`, which 404s.

The env var exists for tooling that expects a fully-formed base URL (curl wrappers, custom HTTP clients). The Anthropic SDK is not in that camp.

**Fix:** Drop the `baseURL` parameter. Match what production routes do:
```ts
const apiKey = process.env.SEQ_ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("SEQ_ANTHROPIC_API_KEY missing");
const client = new Anthropic({ apiKey });   // no baseURL — SDK uses its default
```

Reference impls already in the repo: `src/app/api/inventory/analyze/route.ts:222`, `src/app/api/evaluator/complete/route.ts:218`, `src/lib/roadmap/generate-plan.ts:386`. None pass baseURL — and none should.

**Pattern to remember:** if you're starting a new Node script that uses the Anthropic SDK, just read `SEQ_ANTHROPIC_API_KEY` and do nothing with `SEQ_ANTHROPIC_BASE_URL`. If your script genuinely needs a custom endpoint (e.g. routing through a proxy), strip the trailing `/v1` before passing to the SDK.

---

## Schema / Vocab

### Symptom: Recommendations engine produces low-quality matches even though the user has a fully filled-in profile

**Root cause:** Two (or more) features write to the same `profiles` column with different vocabulary sets. Most common offender historically: `profiles.income_range` was written by Settings (hyphen-delimited: `under-50k`), Onboarding (display labels: `"Under $50K"`), and Assessment (canonical: `under_50k`). The recommendation maps in `src/lib/recommendations.ts` are keyed off ONE vocabulary; rows written by the other features silently fail to match and contribute nothing to the score.

This is the silent-corruption class of bug — no error, no exception, just degraded output that's hard to attribute back to the cause.

**Fix:**

1. **Grep every writer of the column** before adding or changing options:
   ```bash
   grep -rn "<column_name>" src --include="*.ts" --include="*.tsx"
   ```
2. **Pick a canonical vocabulary** — usually the assessment's, since it's tied to scoring logic that can't move.
3. **Put the option list in a shared module** (`src/lib/profile/<field>.ts` or `src/lib/assessment/<field>.ts`) and `export const X = [...] as const` so TypeScript catches drift. Pattern: `src/lib/profile/income-ranges.ts`.
4. **Backfill legacy data** in a migration. Lossy where legacy brackets span multiple canonical brackets — map to lower bound (conservative).
5. **Update all writers** to import from the shared module. Settings + Onboarding + assessment Q-config all reference the same array.

**Pattern for new enum-like fields:**
```ts
// src/lib/profile/<field>.ts
export const X_OPTIONS = [
  { value: "canonical_slug", label: "User-facing label" },
  ...
] as const;

export type XValue = (typeof X_OPTIONS)[number]["value"];
```

This catches any new code path that uses a non-canonical value at compile time.

**Suspect fields worth auditing periodically:** `disciplines`, `interests`, `career_stage`, `business_structure`, asset types, deal types — anywhere the option list lives in multiple form components.

### Symptom: A page (e.g. `/onboarding`) renders if you URL-type to it, but no UI flow ever sends users there

**Root cause:** Orphan route — page file exists at `src/app/<group>/<route>/page.tsx` but no `redirect()`, `router.push()`, sidebar link, or middleware rule references it.

**Fix:** First confirm it's truly orphaned:
```bash
grep -rn "/<route-name>\|push.*<route>\|redirect.*<route>" src --include="*.ts" --include="*.tsx"
```
If grep returns only the page file itself, the route is dead. Two options:
1. **Delete the route** (`rm -r src/app/<group>/<route-name>`). Safe when you've confirmed grep is clean — no callers means no broken links.
2. **Wire it up properly** if it's supposed to be reachable — typically by adding a `redirect("/<route>")` in the auth callback, or by linking from a dashboard CTA.

Don't leave orphan routes in place. They're a footgun: anyone who URL-types to them can write data the rest of the app doesn't expect (the original 2026-05 case: orphan `/onboarding` would have written legacy-vocab values into `profiles.income_range`).

---

## AI / Roadmap

### Symptom: "Refresh Roadmap" button creates the regeneration screen, then reloads with the same 3 actions still marked complete (banner stays up)

**Reports as:** User completes all 3 roadmap actions → "All steps complete — refresh your roadmap" banner appears → click "Refresh Roadmap" → see the regeneration progress screen → page reloads — but the same 3 actions are still showing as completed and the banner is still there.

**Root cause:** `handleRegenerate` in `roadmap-display.tsx` was POSTing to `/api/assessment/regenerate`, which **mutated the existing `strategic_plans` row in place** (same `plan_id`, just new `plan_content`). Because plan_id never changed, the `assessment_actions` rows scoped to that plan_id were still showing "completed" status when the page reloaded — so `allActionsComplete` still evaluated true and the banner kept showing.

**Fix:** Point `handleRegenerate` at `/api/roadmap/refresh` instead. That endpoint calls `createStrategicPlan()` to create a NEW row with a fresh plan_id. After reload, `assessment_actions` scoped by the new plan_id returns empty → all 3 actions render as pending → banner correctly hides.

```tsx
// src/components/assessment/roadmap-display.tsx
const res = await fetch("/api/roadmap/refresh", {  // not /api/assessment/regenerate
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ triggerReason: "manual" }),
});
```

The legacy `/api/assessment/regenerate` endpoint still exists (admin `/regenerate-all` references it) but should be considered deprecated for member-facing use. The `/api/roadmap/refresh` flow is the correct create-new-plan pattern documented earlier in this file.

---

### Symptom: Giant X icon appears in the admin sidebar after a portal sidebar refactor

**Reports as:** After removing the redundant X close button from the portal sidebar (only the carrot collapse button remains), an oversized X icon appears in the admin sidebar header.

**Root cause:** The portal-side cleanup removed BOTH the JSX `<button className="sb-close">` AND the `.sb-close` CSS rules. But the admin sidebar (`src/components/admin/sidebar.tsx`) still rendered the same `<button className="sb-close">`. With no CSS to style it, the button rendered with default browser styling — large, unpositioned, and very visible.

**Fix:** Remove the orphaned JSX from the admin sidebar (and the unused `CloseIcon` import). The carrot collapse button alone handles both close-on-mobile and toggle-on-desktop in both surfaces.

```tsx
// REMOVE from src/components/admin/sidebar.tsx:
<button className="sb-close" onClick={closeSidebar}>
  <CloseIcon />
</button>
```

**Pattern to remember:** when removing a CSS-styled component from one surface, search every other place that uses the same className. Shared CSS classes are landmines for this kind of orphan-JSX bug.

---

### Symptom: Dashboard Valuation card hero shows the leverage_score as a giant orange sentence instead of just "High"

**Reports as:** The dashboard Valuation card's right hero (where "High / Medium / Low" should display in big colored type) instead renders a full sentence in oversized hero font: "High — catalog is the primary asset with significant untapped licensing potential."

**Root cause:** The `summary.leverage_score` field was originally typed as a free-form string. The Claude prompt + seed data populated it with a full sentence. The Valuation card was designed for a one-word value rendered at hero size with color coding.

**Fix:** Schema split. `leverage_score` is now contractually one word (`low | medium | high`); a separate optional `leverage_rationale` field holds the explanation sentence.

```ts
// src/types/inventory.ts
summary: {
  leverage_score: string;          // one word: low | medium | high
  leverage_rationale?: string;     // 1-2 sentence explanation
  ...
}
```

The render layer (`DashValuationCard`) handles both new and legacy data shapes:

```ts
function parseLeverage(raw: string) {
  const m = raw.toLowerCase().match(/\b(high|medium|low)\b/);
  return m ? { word: m[1], className: `dash-leverage--${m[1]}` } : { word: "Unknown" };
}

function extractLegacyRationale(raw: string): string | null {
  // Pulls "the explanation part" out of "High — the explanation part"
  const m = raw.match(/^(?:high|medium|low)\s*[—\-:.]+\s*(.+)$/i);
  return m ? m[1].trim() : null;
}
```

The Claude prompt in `/api/inventory/analyze/route.ts` was updated to emit the two fields separately. Seed data in `scripts/seed-test-users.ts` was updated. Re-running `npx tsx scripts/seed-test-users.ts --reset` backfills.

---

### Symptom: Drivers axis label "High" renders huge in default sans, while "Low" + "Medium" render correctly in mono

**Reports as:** Under the bar chart in the dashboard Valuation card, the axis labels are inconsistent — Low and Medium look right (small mono caps) but High renders in oversized body sans.

**Root cause:** The CSS only styled `:nth-child(2)` of the 3-span axis row, leaving `:nth-child(1)` ("Low") and `:nth-child(3)` ("High") with whatever default styling cascaded through. The original CSS had assumed the 3 labels would be inside a single child for `space-between` flex distribution.

**Fix:** Wrap the 3 labels in a single track span placed in grid column 2 (under the bar). All 3 children inherit mono / 9px / `.12em` tracking from the parent.

```tsx
<div className="dash-drivers-axis" aria-hidden>
  <span className="dash-drivers-axis-track">
    <span>Low</span><span>Medium</span><span>High</span>
  </span>
</div>
```

```css
.dash-drivers-axis { display: grid; grid-template-columns: 150px 1fr 70px; }
.dash-drivers-axis-track {
  grid-column: 2;
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--light);
}
```

**Pattern to remember:** if styling N sibling elements that share visual treatment, apply the rule to all of them (or to a wrapper that they inherit from) — never via `:nth-child(2)` alone.

---

### Symptom: Roadmap stuck in "generating" forever

**Reports as:** Wizard submits → "Saving your Creative Identity" flashes → `/roadmap` shows the progress bar → it stays at 50–90% → eventually "This is taking longer than expected."

**Root cause:** Vercel serverless function was killed before the Claude call completed. Fire-and-forget Promise (`.catch(...)` without awaiting) gets terminated when the response returns.

**Fix:** Use `after()` from `next/server` to schedule the Claude call as a post-response task, and set `export const maxDuration = 60` so the function has runway.

```ts
import { NextResponse, after } from "next/server";
export const maxDuration = 60;

export async function POST() {
  const { planId, runGeneration } = await createStrategicPlan(...);
  after(runGeneration);
  return NextResponse.json({ planId });
}
```

**Files to check:** `/api/assessment/complete`, `/api/inventory/analyze`, `/api/roadmap/refresh`, `/api/assessment/regenerate` — all should use this pattern.

---

### Symptom: Evaluator verdict missing Recommended Actions + Library Resources

**Reports as:** Deal verdict page shows signal + dimension breakdown but the Recommended Actions section and Library Resources section are empty or absent.

**Root cause:** Claude's response was truncated past `max_tokens`, causing JSON parse to fail. Fallback empty verdict was written to DB.

**Fix:**
1. Bump `max_tokens` to **4096** (2000 was truncating routinely)
2. Use resilient JSON parse with code-fence fallback:

```ts
const textBlock = response.content.find((b) => b.type === 'text');
let verdict: DealVerdict;
try {
  verdict = JSON.parse(textBlock.text);
} catch {
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Claude response');
  verdict = JSON.parse(jsonMatch[0]);
}
```

**Files:** `src/app/api/evaluator/complete/route.ts`

---

### Symptom: Value flywheel arrows cut through the center of the diagram

**Root cause:** Claude sometimes outputs non-sequential edges in `value_flywheel.edges` (e.g., `{from: 0, to: 2}` — a diagonal across the diagram instead of around the perimeter).

**Fix:** In `RoadmapFlywheel`, ignore `data.edges` entirely and always draw the outer cycle (`node[i] → node[i+1]`, wrapping). A flywheel is by definition a cycle.

**Files:** `src/components/assessment/roadmap-flywheel.tsx`

---

### Symptom: Completed actions persist across roadmap regeneration

**Reports as:** User marks action #1 complete → regenerates roadmap → old completed action still appears as completed on the new plan.

**Root cause:** Roadmap page was querying `assessment_actions` by `user_id`, pulling actions from all plans for this user. Actions are actually scoped per plan.

**Fix:** Query by `plan_id`:

```ts
const { data: actions } = await admin
  .from("assessment_actions")
  .select("*")
  .eq("plan_id", plan.id)
  .order("action_order", { ascending: true });
```

And the PATCH endpoint `/api/assessment/actions` dedups on `(user_id, plan_id, action_order)` — make sure to include `plan_id` in the WHERE clause.

---

### Symptom: Roadmap AI recommends nonsense providers (fake names, broken URLs)

**Root cause:** Claude hallucinates provider names and URLs.

**Fix:** Filter all providers through the whitelist at `src/lib/roadmap/approved-providers.ts`. Only names that match an approved entry pass through, with the canonical URL substituted. If none match, hide the providers section entirely.

---

## Settings / Creative Identity

### Symptom: Creative Identity tab shows "Start" button for a user who completed CI

**Root cause:** The settings page query selected `updated_at` from the `assessments` table, which doesn't exist. Supabase silently returned the error without data, and the page fell through to the empty state.

**Fix:** Don't select columns that don't exist. Use `completed_at` as the definitive completion signal. The `assessments` table has: `id`, `user_id`, `status`, `current_section`, `current_question`, `detected_stage`, `archetype_primary`, `creative_mode`, `discipline`, `sub_discipline`, `misalignment_flags`, `completed_at`, `created_at`, `started_at`, plus all JSONB question fields.

**Debug endpoint:** `GET /api/debug/creative-identity` returns the user's assessment rows + the error (if any). Use it to diagnose similar issues.

**Files:** `src/app/(portal)/settings/page.tsx`

---

### Symptom: Latest CI assessment doesn't render; older in-progress row shadowing completed one

**Root cause:** User completed CI, later clicked Refine, autosave created a new `in_progress` row. A naive "latest by created_at" query picks up the in-progress row and hides the completed one.

**Fix:** Prefer most-recent **completed** over most-recent any-status:

```ts
const [completed, anyLatest] = await Promise.all([
  admin.from("assessments").select(...).eq("user_id", userId).eq("status", "completed")
    .order("completed_at", { ascending: false }).limit(1).maybeSingle(),
  admin.from("assessments").select(...).eq("user_id", userId)
    .order("created_at", { ascending: false }).limit(1).maybeSingle(),
]);
const assessment = completed.data ?? anyLatest.data;
```

---

## Dark mode

### Symptom: Cover image cards appear all-black in dark mode (fine in light)

**Root cause:** An old dark-theme rule `[data-theme="dark"] .lib-card--dark::before { background: #111 }` was covering the cover image variant. The rule had higher specificity than the cover's gradient overlay.

**Fix:** Scope that rule to exclude cover:

```css
[data-theme="dark"] .lib-card--dark:not(.lib-card--cover)::before {
  background: #111;
}
```

---

### Symptom: Button / title text invisible or nearly invisible on dark-gradient surfaces

**Root cause:** Text used `color: var(--white)`, which flips to `#1a1a1a` in dark mode. Always-dark surfaces (gate, hero overlays, dark cards) keep their dark background but the text becomes near-black on black.

**Fix:** On always-dark surfaces, hardcode `#ffffff` for text. Do not use `var(--white)`.

**Surfaces that got bitten** (now hardcoded):
- `.cs-gate`, `.cs-gate-title`, `.btn--white`
- `.cs-featured-name`, `.cs-featured-sub-name`
- `.lib-card--dark .lib-card-title/-desc/-type/-num`

---

### Symptom: Progress bar invisible in dark mode

**Root cause:** Bar fill uses `var(--black)` which flips to near-white. Pct label uses hardcoded `#fff`. Near-white fill + white text = invisible.

**Fix:** Explicit dark-mode override — fill to pure white, pct text to dark:

```css
[data-theme="dark"] .gen-progress-bar { background: rgba(255,255,255,0.12); }
[data-theme="dark"] .gen-progress-bar-fill { background: #ffffff; }
[data-theme="dark"] .gen-progress-pct { color: #1a1a1a; }
```

---

### Symptom: Diagram SVGs have unreadable text / invisible boxes in dark mode

**Root cause:** SVG was authored with hardcoded hex attributes (`fill="#1a1a1a"`, `stroke="#d9d6d1"`). CSS theme overrides can't modify SVG attributes from outside.

**Fix:** SVG must use CSS variables in `fill`/`stroke`:

```jsx
<rect fill="var(--diag-parent-bg)" stroke="var(--diag-parent-border)" />
<text fill="var(--diag-parent-text)">...</text>
```

Variables are scoped to `.rdmp-diagram-svg-wrap` and `.cs-flywheel`. Light defaults in `globals.css`, dark overrides in `portal.css`.

**Known gap:** Case study MDX files that author their own SVG (e.g., Cowart flywheel) still have hardcoded hex and won't respect dark mode. Future sweep.

---

## UI rendering

### Symptom: Cover image doesn't fill card — shows at top with text below

**Root cause:** `<img>` element rendering inline (natural height) instead of absolute-positioned. The global `img { height: auto }` reset was beating our absolute positioning without `!important`.

**Fix:** Use `!important` on positioning properties + elevated selector specificity:

```css
.lib-card .lib-card-cover-img,
img.lib-card-cover-img {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}
```

**Why not CSS background-image?** We tried. The conic-gradient rules on `:nth-child(N)` kept shadowing inline `style={backgroundImage}` in the cascade. Real `<img>` elements are unambiguous — if URL loads, pixels show.

---

### Symptom: Cover card overlay totally transparent despite gradient being set

**Root cause:** An earlier `.lib-card--dark::before { opacity: 0 }` rule (for dark-variant fade-in on hover) was shadowing the cover overlay's opacity, leaving it at 0 at rest.

**Fix:** Cover overlay must explicitly set `opacity: 1 !important`:

```css
.lib-card--cover::before {
  background: linear-gradient(...);
  opacity: 1 !important;   /* critical — resets .lib-card--dark::before */
  ...
}
```

---

### Symptom: Hairline image peeking through at rounded corners of cover card

**Root cause:** `::before` overlay was `inset: 0` — exactly matching the card edges. Border-radius rendering can expose 1px of the underlying image.

**Fix:** Extend the overlay 1px past the card:

```css
.lib-card--cover::before {
  inset: -1px;
  border-radius: inherit;
}
```

---

### Symptom: Hero image doesn't load on first navigation to case study (fine after refresh)

**Reports as:** Click recommended case study from dashboard → case study page loads but hero image stays hidden. Refresh the page → image appears.

**Root cause:** `.anim-reveal-down` starts with `clip-path: inset(100% 0 0 0)` (fully hidden). `RevealProvider` adds `.vis` at a 150ms timeout — but cross-route-group navigation (portal → public) streams the hero container in later than 150ms. The MutationObserver catches it but only calls `observer.observe(el)`, waiting for IntersectionObserver to fire, which can be delayed.

**Fix:** MutationObserver detects hero containers and immediately calls `revealHeroContent()` to force-apply `.vis`, rather than letting IntersectionObserver handle them. Also added a safety-net 500ms timer.

**Files:** `src/components/reveal-provider.tsx`

---

### Symptom: Programmatic horizontal scroll snaps back instead of moving smoothly

**Reports as:** Setting `track.scrollLeft = 400` jumps to a snap point (e.g. 365) or stays at 0. rAF-driven mouse-follow scroll feels jittery, jerks between snap points, never moves smoothly with the cursor.

**Root cause:** `scroll-snap-type: x mandatory` (or `proximity`) on the track is fighting the rAF programmatic scroll. The browser snaps `scrollLeft` to the nearest snap point on every frame, overriding the per-frame lerp writes. `scroll-behavior: smooth` compounds this by adding an async smoothing layer that the rAF loop has to fight too.

**Fix:** Either use scroll-snap *or* programmatic mouse-follow scroll, not both. For the mouse-follow pattern (see `src/components/platform/archetype-scroller.tsx`):

```css
.archetype-scroller-track {
  overflow-x: auto;
  scroll-behavior: auto;     /* not smooth — rAF lerp handles smoothing */
  /* no scroll-snap-type here */
}
.archetype-scroller-track .archetype-card {
  flex: 0 0 340px;
  /* no scroll-snap-align — would pull scrollLeft back */
}
```

**Verification:** in DevTools, run `track.scrollLeft = 500; await new Promise(r => setTimeout(r, 100)); track.scrollLeft;` — should return ~500, not a snap point or 0.

---

### Symptom: Portal case study → click related → taken to public view

**Root cause:** Case study MDX files author related-card `href` with public URLs (`/case-studies/foo`), not portal URLs.

**Fix:** `CbRelatedCard` now detects portal context via `usePathname()` and rewrites `/case-studies/*` → `/library/case-studies/*` (plus articles and structures). No MDX edits required.

**Files:** `src/components/mdx/case-study/cb-related.tsx`

**Note:** If you build a new inline MDX component that renders content links, apply the same rewrite pattern.

---

## Forms / inputs

### Symptom: Optional URL field rejects valid-looking input ("Please enter a URL.")

**Reports as:** A user pastes or types `www.example.com` (no scheme) into a website / homepage / portfolio URL field. On form submit, the browser's native validator pops a "Please enter a URL." tooltip pinned to the field. The string looks fine to a human — most users have muscle memory for typing URLs without `https://`.

**Root cause:** `<input type="url">` per the HTML spec requires an *absolute* URL with a scheme. `www.example.com`, `example.com`, `@handle`, even `mailto:foo@bar.com` (the validator wants `http(s)://`) — all rejected. Marking the field optional (`required={false}`) doesn't help: the validator still runs on any non-empty value at submit time.

**Fix:** For optional, informational URL fields where downstream code doesn't need a strict URL (you're just saving the string and maybe linking it later), switch to `type="text"` + `autoComplete="url"`. Browsers still surface URL-style autocomplete suggestions; downstream storage accepts whatever string you save.

```tsx
// BEFORE — rejects "yoursite.com"
<input type="url" placeholder="https://yoursite.com" autoComplete="url" />

// AFTER — accepts any text; autoComplete still triggers URL suggestions
<input type="text" placeholder="yoursite.com" autoComplete="url" />
```

If you DO need scheme validation (e.g. you'll fetch the URL server-side), do it in your own handler with a URL parser — that lets you give a clearer error message AND normalize before storage (`example.com` → `https://example.com`). Don't rely on the input type as your validation layer.

**Pattern to remember:** `type="url"` is appropriate for *strict* URL inputs (admin tools, embed-source fields, link-shortener targets — anywhere the form's job is "submit a real URL"). For *human-typed website fields* on signup / profile / contact forms, use `type="text"`. Same logic applies to `type="email"` if you ever build a form where you specifically don't want validation, though there's much less reason to skip email validation.

**Existing examples:**
- `src/app/(auth)/signup/page.tsx` — Website field uses `type="text"` + `autoComplete="url"` (added May 2026 after a tester typed `www.neiltbrown.com` and got blocked)

---

## Content

### Symptom: Case study title shows concatenated words (e.g., "DJto", "$350,000Trade")

**Root cause:** Earlier sweep removed `<br />` from case study titles but didn't replace with a space.

**Fix:** Scan with:

```bash
grep -rn "^title:" content/case-studies/ | grep -E "[a-z][A-Z]|[0-9][A-Z]"
```

Fix each with a targeted sed. Legitimate camelcase names (McMullin, McKinnon) are false positives.

**Useful narrower patterns when the regex above is too noisy:**

```bash
# Missing space before "to" or "the" after a lowercase word
grep -iE "[a-z](to|the) [A-Z]" content/case-studies/*.mdx

# All-caps acronym fused to a following word (e.g., "AITransition", "APIDriven")
grep -E "[A-Z][A-Z]+[A-Z][a-z]+" content/case-studies/*.mdx | grep -v "^Binary"
```

Run this sweep whenever a title appears to read oddly. Past rounds have caught: `DJto`, `$350,000Trade`, `Loopsto Full`, `Videosto Gagosian`, `Ticketsto the`, `Designerto $385`, `Publishedthe Numbers`, `AITransition`. The pattern recurs because markdown editors and title-case transforms sometimes strip separators silently.

---

### Symptom: MDX page returns 500 — "Unexpected character `\"` (U+0022) before attribute name"

**Reports as:** Newly authored case study / structure / article MDX file fails to compile. The error mentions an unexpected `"` or `'` and points roughly at a `*Json` prop.

**Root cause:** An apostrophe inside a JSON-string prop (e.g. `rowsJson='[["Levi'\''s",...]]'`) was escaped using bash-style escaping (`'"'"'`). MDX parses that as 4 separate characters and the JSON is broken. Bash escape syntax is for the shell, not for MDX.

**Fix:** Use an HTML entity instead — `&rsquo;` (right single quote) reads cleanly in the rendered output and never confuses the parser:

```mdx
<!-- WRONG (bash-style; breaks the JSON) -->
rowsJson='[["Levi'"'"'s","Co-branded apparel"]]'

<!-- RIGHT (HTML entity) -->
rowsJson='[["Levi&rsquo;s","Co-branded apparel"]]'
```

For other special characters in JSON strings: use `&amp;` for `&`, `&quot;` if you need a literal `"` inside a JSON string (rare; usually rewrite to avoid).

---

### Symptom: MDX page returns 500 — "Unexpected character `8` (or other digit) before name"

**Reports as:** Newly authored MDX file fails to compile with an error pointing at a digit. The digit usually appears immediately after a `<` somewhere in body prose.

**Root cause:** Body prose like "lets `<80` people run 4+ products" hits the MDX/JSX parser. `<` triggers tag-name parsing; a digit can't start a tag name; compile fails. JSX attribute values (`value="<80"`) are unaffected because the string content isn't parsed as JSX — only tag-text and standalone JSX expressions are.

**Fix:** Either rewrite the prose, or escape the `<`:

```mdx
<!-- WRONG (parsed as start of a JSX tag) -->
This is what lets <80 people run 4+ products at $80M+ revenue.

<!-- RIGHT (rewrite) -->
This is what lets fewer than 80 people run 4+ products at $80M+ revenue.

<!-- ALSO RIGHT (HTML entity escape) -->
This is what lets &lt;80 people run 4+ products at $80M+ revenue.
```

**Other danger patterns to scan for** before authoring MDX:
- `<` followed by a digit (`<80`, `<10%`, `<5 minutes`)
- `<` followed by space-then-text (treated as broken tag)
- `>` standalone in prose is generally fine — only `<` triggers tag parsing

---

### Symptom: Recommended Actions in Portfolio Analysis don't show structure badges

**Root cause:** Regex `/\(Structure #(\d+)\)/` only matched parenthetical form. Claude often outputs `Structure #29: Rights reversion clauses…` (prefix form, no parens).

**Fix:** Regex matches both shapes:

```ts
const match = action.match(/(?:\(Structure #(\d+)\)|Structure #(\d+))/i);
```

Extract the description by stripping the full structure reference:

```ts
const description = action
  .replace(/\(Structure #\d+\)/i, "")
  .replace(/Structure #\d+\s*[:—-]?\s*/i, "")
  .trim();
```

**Files:** `src/components/portal/inventory-analysis-view.tsx`

---

## Dev / deploy

### Symptom: Screenshots + CapCut temp folders showing up in commits

**Root cause:** Screenshots saved to `public/videos/` (CapCut default export path) get auto-staged with `git add -A`.

**Fix:** Before committing, check `git status` for stray files:

```bash
git status --short | grep -v "^ M \|^A "
```

Remove any `Screenshot*.png`, `.__capcut_export_temp_folder_*`, or `-1.mp4` duplicates before committing.

---

### Symptom: Vercel deploy failing silently; users see old code

**Root cause:** Build error in a route that wasn't exercised during local `npm run build`, OR Vercel CDN cached the previous CSS/JS bundles.

**Fix:**
1. Run `npm run build` locally — it catches ~90% of what would fail on Vercel
2. Check Vercel dashboard → Deployments → see if the latest commit actually built successfully
3. Hard refresh (`Cmd+Shift+R`) on the live site to bypass CDN cache
4. If needed, promote a previous deploy via Vercel Dashboard → Deployments → three-dot menu → "Promote to Production" (instant rollback)
