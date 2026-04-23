# Sequence — Troubleshooting Playbook

Symptom → root cause → fix for recurring bugs we've hit. Consult this before rediscovering a problem from scratch.

---

## AI / Roadmap

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

### Symptom: Portal case study → click related → taken to public view

**Root cause:** Case study MDX files author related-card `href` with public URLs (`/case-studies/foo`), not portal URLs.

**Fix:** `CbRelatedCard` now detects portal context via `usePathname()` and rewrites `/case-studies/*` → `/library/case-studies/*` (plus articles and structures). No MDX edits required.

**Files:** `src/components/mdx/case-study/cb-related.tsx`

**Note:** If you build a new inline MDX component that renders content links, apply the same rewrite pattern.

---

## Content

### Symptom: Case study title shows concatenated words (e.g., "DJto", "$350,000Trade")

**Root cause:** Earlier sweep removed `<br />` from case study titles but didn't replace with a space.

**Fix:** Scan with:

```bash
grep -rn "^title:" content/case-studies/ | grep -E "[a-z][A-Z]|[0-9][A-Z]"
```

Fix each with a targeted sed. Legitimate camelcase names (McMullin, McKinnon) are false positives.

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
