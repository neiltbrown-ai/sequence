# Sequence, Simplified

**Strategy for rethinking the experience — brand, positioning, features, intake, and outputs — for the creative who has never read a term sheet.**

July 2026 · Source: three full code audits (public site, intake flows, portal outputs) + two design tracks (product architecture, language system) + working session with Neil, 2026-07-10.

<title>Sequence, Simplified</title>

---

## TL;DR

The promise lands. The mechanism alienates. "Own what you create" is plain and strong; but every time Sequence explains *how*, it switches into private-equity register — and the product asks a designer to complete 24 wizard questions, 6-field asset forms, and up to 60 evaluator questions across five separate AI engines before the loop pays them anything.

The fix is one architecture and one language rule:

- **One advisor, one file, one plan.** The advisor becomes the connective tissue of the product. Guided sessions replace wizards — a scripted spine with adaptive follow-ups, rendered in chat with tappable answers and a docked progress frame, so the wizard's guidance and progress visibility survive while its rigidity dies. Everything the advisor learns lands in one member-visible file that powers one living plan.
- **Plain first, precise second.** A financial or legal term is never a label, heading, score, or button. It appears once per surface, in parentheses or help text: "the right to check their math (audit rights)." We teach the jargon; we never speak in it.

Navigation drops from 11 items to 5: **Home (Your Plan) · Portfolio · Advisor · Library** (+ Settings). The 107-case-study corpus — the register that already works — moves from a silo to the spine of the journey: a named human backs every recommendation.

---

## 1. Diagnosis

### 1.1 The register gap

The audits found the same pattern on every surface: emotional copy in plain English, mechanical copy in finance-speak.

What lands (keep verbatim):

> "Own what you create"
> "Work-for-hire is a wealth transfer program. You build the asset; someone else keeps it."
> The 50X gap

What alienates (all live copy today):

> "Transform your portfolio of projects into a portfolio of assets" (~5× on home alone)
> "Hollywood accounting, overhead allocation abuse, dilution without protection, net vs. gross gaming, and rights creep" — five insider terms, one line, zero definitions
> "Audit rights, acceleration clauses, termination provisions, and anti-dilution protections"
> Stage names: "Execution Excellence / Judgment Positioning / Ownership Accumulation / Capital Formation"
> Archetype frictions: "Governance fatigue across boards," "Allocation paralysis," "Income exceeds entity structure"
> Empty portfolio state: "Audit your unmonetized assets"
> Signup subtitle: "Start building leverage in your creative career"

The sharpest finding: **Neil's own voice guide already bans this.** It flags "leverage" as jargon, warns against "abstractions without concrete anchors" and "jargon without translation" — and the live funnel copy violates all three. Meanwhile the case studies follow the guide perfectly. The case studies talk like Neil; everything else talks like the analyst Neil hired.

### 1.2 Positioning drift

Three taglines compete: "Own Your Future" (root metadata), "Own what you create" (home H1), "portfolio of projects → portfolio of assets" (everywhere). Feature names drift across surfaces (Portfolio Analysis / Portfolio / Asset Inventory; Roadmap / Career Assessment; AI Advisor / AI Strategic Advisor). Pricing is inconsistent: the coaching page shows a $2,250/mo group tier the pricing page omits; home shows two tiers, pricing shows three.

### 1.3 Five admissions offices, one classroom

A member must learn **five separate AI engines**, each with its own vocabulary, output schema, and visual language:

| Engine | Intake burden | Output burden |
|---|---|---|
| Creative Identity wizard | ~24 questions, ~12 min; income-allocation exercise and "LLC taxed as S-Corp" options at Q7–12 | stage + archetype + flags |
| Portfolio Inventory | 6 fields per asset; type pills are bare jargon ("IP / Judgment / Relationship / Process / Audience / Brand" — no descriptions) | ~30-field analysis incl. its own duplicate "Action Roadmap" |
| Deal Evaluator | 35–60 questions; equity path demands 83(b), 409A, anti-dilution answers with required exact numbers and no "I don't know" escape | 1 score + 6 dimension scores + flags + actions + resources |
| Strategic Roadmap | — | ~40 AI-generated fields across 9 sections |
| Advisor chat | broken first-run: "Choose a path above" with no paths rendered; zero suggested prompts | freeform |

Redundancy compounds it: two roadmaps, valuation/leverage shown in 3 places, deals listed in 3 places, recommended reading in 5 places, the flywheel/entity/dimension visualizations implemented 3–4 times. 11 nav items, ~14 surfaces. And the best content in the product — 107 verified case studies — sits behind a nav item, disconnected from the journey.

Ship-hygiene issues members can see: a "TEMP: Regenerate button — remove after testing" in the roadmap header; advisor modes stubbed "[Deal evaluation will be implemented in Phase B.]"

### 1.4 What this feels like to the target member

A 29-year-old illustrator or gigging musician — no LLC, a bad contract in her inbox — hits: a dashboard greeting that's a rotating philosophical tagline with no "start here"; an empty portfolio page telling her to "audit her unmonetized assets"; a wizard that asks how her income is "structured" before it's earned her trust; an evaluator that asks whether she's discussed an 83(b) election with her tax advisor; and an advisor that opens with a bare text box. Every one of these moments says: *this product was built for someone who already knows the vocabulary.* She is exactly the person the promise spoke to, and exactly the person the mechanism turns away.

---

## 2. The North Star: one advisor, one file, one plan

Mental model, borrowed from the member's own world: **you just got a manager.** Musicians, filmmakers, and photographers already know what a good manager does — knows your situation, reads your deals, tells you your next move, and remembers everything. Sequence becomes exactly that.

### 2.1 The architecture

```
HOME — "Your Plan"            Position · Next 3 moves · Deals · People like you
PORTFOLIO                     What you own: asset list + analysis + quick-add form
ADVISOR                       Guided sessions + open conversation + Deal Check
LIBRARY                       107 cases · 35 structures · articles (one entry, tabs)
(+ Settings)
```

Nav labels are single words (Neil's rule, 2026-07-10): the surface is **Portfolio**; "what you own" survives as its promise language (page description, Home tile label), not as the nav item.

Five nav items instead of eleven. Deals live on Home; Deal Check launches from a button. Coaching becomes a contextual human upsell ("this equity deal is worth an hour with a human"), not a nav item.

### 2.2 The Member File

One canonical data object: facts with source and confidence.

```
{ fact: "discipline",    value: "musician / touring + sync",       source: "stated",   confidence: "high" }
{ fact: "owns_masters",  value: false,  source: "inferred from 'label owns everything'", confidence: "medium" }
{ fact: "entity",        value: "none — paid personally",          source: "stated",   confidence: "high" }
{ fact: "stage",         value: 1,                                 source: "computed", confidence: "high" }
```

- The advisor extracts facts from anything the member says — not just answers to the current question. Member mentions "my podcast" in passing → an asset appears in the Portfolio (with a confirmation nudge).
- Deterministic scoring stays server-side (`scoring.ts`, `archetypes.ts`, `evaluator/scoring.ts`) — the advisor calls them as tools when the file has enough facts. The model collects; the code computes.
- **"I don't know" is a valid answer everywhere.** It records low confidence, triggers a one-sentence teach, and moves on. Never a penalty, never a blocked Continue button.
- The file is **member-visible and editable** ("What Sequence knows about you"). Trust requires visibility. Wrong inferences get corrected inline, not buried.
- **Design constraint from the long-term vision:** every fact is schematized and aggregatable. The future — MCP access, industry benchmarks, anonymized insight across thousands of members — requires comparable data. Conversation is how data gets *in* pleasantly; it is not a replacement for data having shape.
- Migration: one-time backfill of existing assessments/inventory/deals into file facts tagged `imported`. Existing members never re-onboard; their first session opens "I've reviewed your file — here's what I have."

### 2.3 The advisor is a writer, not just a talker

The advisor's tools write to the same stores the pages render: `add_asset`, `start_deal_check` / `update_deal`, `add_plan_move` / `update_plan`, `update_member_file` (extending the existing `markActionStatus` / `saveAssessmentAnswer` pattern in `src/lib/advisor/tools.ts`). "Add that to my portfolio," "make this a next step on my plan," "start a deal check on this email" — all work mid-conversation, and every page updates because pages are views over the same data, not separate engines.

---

## 3. Guided, not blank

The wizards' real value was never the forms — it was **visible progress over a fixed timeframe**, and a path the member didn't have to invent. Both survive. What dies is the rigidity.

### 3.1 Scripted spine, adaptive follow-ups

Guided flows are **designed sequences with known length**. The model gets freedom *between* the beats — reactions, follow-ups, teach-on-request — never over the path itself. You design the path; nothing depends on the model deciding what to ask.

### 3.2 The session frame

Because the spine is scripted, its length is known — so guided sessions get wizard chrome as an overlay on the chat:

- A **docked header** above the thread: bead progress, "3 of 8 · ~4 min left," pause/resume.
- Adaptive follow-ups render as **indented beats that don't move the bar.** The bar tracks the spine only — it never lies, never goes backward.
- On completion the frame **collapses into a summary card** in the thread, and chat returns to normal.

Chat is the container; wizard chrome appears only during guided work. This is a first-class design element, not a nice-to-have.

### 3.3 The six guidance guarantees

1. **The advisor always leads.** During any structured task the member never decides what to say next — the advisor asks, exactly like a wizard screen. Open chat is a capability, never a requirement.
2. **Every question is tappable.** Chips, multi-select, sliders render inside the chat (already built: `showOptionCards`, `showMultiSelect`, `showAllocationSliders`). The entire first session is completable **without typing a single word.**
3. **Progress is always visible** — the session frame.
4. **Named entry points, not invented prompts.** Flows launch from labeled buttons on Home: "See where you stand," "Check a deal," "Add something you've made."
5. **The advisor earns its keep between beats**: reacts, skips what it already knows, follows up on what's interesting ("you mentioned a podcast — do you own it?"), and lets the member break out to ask "wait, what's an LLC?" without losing their place — the four things a static wizard can't do.
6. **Blank input never appears empty.** Wherever free chat exists: four personalized chips (always including "I honestly don't know where to start") and a real example as placeholder ("e.g. 'They offered me 2% — is that good?'").

The honest description of the new intake isn't "a chatbot." It's a **guided session that looks like messaging** — the same one-question-at-a-time structure the wizard has today, in plain language, with tappable answers and visible progress, plus an intelligence layer the form could never have.

---

## 4. The first ten minutes

Design target: the illustrator with the bad contract in her inbox. Signup lands directly in the advisor.

- **0:00** — "What do you make?" Sixteen discipline chips. One tap.
- **0:15** — **The mirror.** Before any question about her: "You're a photographer. These three started where you are." Three matched case studies with one-line arcs. *[Read one — 20 min] [Skip to: where do you stand — 8 min].* The register that already works becomes the trust-builder, before any data entry.
- **1:00–6:00** — **Where You Stand**, the guided session. Session frame docked. Eight scripted beats, plain language, ownership questions early (the emotional core), money and paperwork last with a why-line ("Last part — the unglamorous stuff. Two minutes. This is what makes your plan real instead of generic."). Tappable throughout. "I don't know" everywhere.
- **6:00–7:00** — Thinking beat: "Reading your answers…"
- **7:00–10:00** — **Your Read**, delivered in chat and written to Home simultaneously:
  1. **Where you stand** — one paragraph in her vocabulary ("You're paid when you work. When you stop, it stops. Your print sales are the exception — that's the thread to pull.")
  2. **The one thing you're leaving on the table** — the sharpest flag, translated ("Your client contracts hand over everything you make, forever, for a one-time fee.")
  3. **One move for this week** — exact first step, done signal.
  4. **Someone like you who fixed it** — a named case study with the one-line arc.

The wow is 2 + 4 together: *a specific diagnosis, plus a named human who proves it's fixable.* No generic AI can fake a verified 107-case corpus. Everything else — entity diagrams, flywheels, three-year vision — becomes on-demand depth the advisor renders in chat when asked.

---

## 5. Deal Check: starts before the document

A deal is not a contract to score. It's **a relationship with a timeline**:

```
CONVERSATION  →  OFFER  →  DRAFT  →  SIGNED
```

The real negotiation happens in texts, emails, and phone calls — long before a document exists. A creative who starts negotiating at the draft stage has already lost. So Deal Check opens at first contact, with messy input: a pasted email thread, forwarded texts, a described phone call.

- **Early stages output positioning, not verdicts**: what to ask for, what to find out, and actual reply drafts — "here's a message you can send back." The member becomes the interrogator instead of the interrogated.
- **The scored verdict fires when real terms exist.** The six-dimension structure and green/yellow/red signal survive unchanged (`evaluator/scoring.ts`) — structure in the output is what makes it trustworthy and comparable. Low-confidence dimensions render as "unknown — here's what to find out," never as blockers.
- **One living deal record carries the whole arc.** The 55-question equity gauntlet inverts: paste the document and Claude reads it, instead of the member translating a contract into dropdowns. Legal depth arrives just-in-time — when an actual equity grant is on the table, the 83(b) explainer appears as a plain-language teaching moment ("there's a one-page tax form with a 30-day deadline that can save you serious money"), plus a "this is worth an hour with a human" coaching prompt.

Deal Check is also the retention engine: it's the one feature tied to an external trigger that recurs naturally, and the lifecycle model turns a one-shot score into a touchpoint across the weeks a deal takes to close. **Deal-check frequency is the north-star metric.**

---

## 6. Portfolio: the page that changes how they think

This surface stays a visible page with a real form — deliberately. Three reasons:

1. **Seeing a financial analysis of their body of work is THE mind-shift moment.** The valuation is what makes a creative start thinking differently about their work, their creativity, their business relationships. It needs a permanent, visitable home — not a chat transcript.
2. **A visible form with chips is genuinely the fastest input for list-shaped data.** Quick-add stays: name, type, ownership, a line of context.
3. **The data accumulates over years.** Negotiating better terms takes many projects. The portfolio must be a structured record that grows — which also feeds the benchmark future.

What changes:

- **Plain labels with mandatory descriptions.** "Things you've made — songs, designs, photos, scripts (the technical term is IP)" · "Your taste — people pay you to decide, not just do" · "Who trusts you" · "How you work" · "Who follows you" · "Your name." A pill with no description is a quiz you can fail.
- **Empty state becomes an invitation**: "See what you're sitting on. List the things you've made, the people who trust you, the name you've built. Most members find something worth money in the first ten minutes."
- **Dual input.** The form and the advisor write the same asset store. The advisor nudges accumulation over time ("you mentioned a zine in our chat — want me to add it?").
- **The duplicate "Action Roadmap" inside the analysis dies.** One plan, on Home. The analysis keeps valuation, what's working for you, and risks — in the new vocabulary.

---

## 7. The language system

### 7.1 Positioning

**"Own what you create."** That's the line. It's an imperative a musician can feel; every case study proves it.

- "Own Your Future" (root metadata) dies — any bank could say it.
- "Portfolio of projects → portfolio of assets" demotes to supporting copy: a good sentence exactly once per surface, never the slogan.

Every surface says three things, in this order:

| Level | Job | Register |
|---|---|---|
| **Promise** | Own what you create | Emotional, imperative. No finance nouns. |
| **Mechanism** | The difference is the deal — and deals can be learned | Plain English: contract, song, royalty, signature. Finance terms only as parenthetical translation. |
| **Proof** | Here's how Jessica Hische did it | Story. Names, years, dollar amounts. Already correct — don't touch. |

Candidate copy (drafted, ready for Neil's edit):

> **Home hero.** H1: *Own what you create.* Sub: *You've spent a career making valuable things — songs, brands, films, photographs — and signing them away on the last page of someone else's contract. The difference between the creators who ended up owning their work and the ones who didn't wasn't talent. It was the deal. Sequence teaches you how the deal works: what to ask for, what never to sign, and how people like you got it right.*
>
> **Pricing lead.** *$19/month. One caught clause pays for a decade of it.* A lawyer bills $400 an hour to tell you what "net profits" means. Sequence is on your side of the table for every deal you'll ever sign.
>
> **Signup subtitle.** *Start keeping what you make.* (replaces "Start building leverage in your creative career")

Keep verbatim: the 50X callout, "Work-for-hire is a wealth transfer program." Change one word in the 50X block: "…isn't talent, effort, or your network. It's **the deal**." ("Deal structure" stays in the Library, where it's a shelf label.)

The coaching page rewrites out of investor register entirely. RIAs and family offices move to the credentials paragraph, translated.

### 7.2 The naming system

Feature names a musician would repeat to a friend — and note they now tell the journey by themselves:

| Current | New | The sentence it enables |
|---|---|---|
| Creative Identity (assessment) | **Where You Stand** | "It's a ten-minute conversation that tells you where you stand." |
| Portfolio Analysis / Inventory | **Portfolio** (nav) — page leads with "what you own, what it's worth" | "It went through everything I've made and told me what I actually own." |
| Strategic Roadmap | **Your Next Three Moves** | "It gives you your next three moves." (nav short form: Your Plan) |
| Deal Evaluator | **Deal Check** | "Run it through Deal Check before you sign." |
| AI Advisor | **The Advisor** | Drop "AI" from the member-facing label. |
| The Library | **The Library** | Already right. |

The four stages — one word each, glossed in the member's own economics:

| Stage | Name | Gloss (help text) |
|---|---|---|
| 1 | **Making** | You get paid to make things. The money stops when you stop. |
| 2 | **Directing** | People pay for your judgment, not just your hands. |
| 3 | **Owning** | You keep pieces of what you help build — royalties, shares, rights. |
| 4 | **Backing** | You fund and own other people's making. |

"I'm at Making, trying to get to Owning" — sayable without embarrassment. Income bands move to help text; leading with dollar brackets makes a stage feel like a tax form. The internal 4-stage model, scoring weights, and archetypes are untouched — this is presentation.

### 7.3 The translation dictionary

Governing rule, enforced in every AI prompt and every copy review: *a financial or legal term may never be a label, heading, score name, or button. It may appear once per surface, in parentheses or help text, introduced as "the technical term is X." We teach the jargon; we never speak in it.*

| Current | Replacement |
|---|---|
| Leverage Score | **Negotiating Power** (tooltip: "what the industry calls leverage") |
| Structural Misalignments | **Value Leaks** — "five places your setup is quietly working against you" |
| Drivers of Value | **What's Working For You** |
| Transition Readiness | A sentence: **"You're close — two things are holding you back."** |
| Value Flywheel | **How It Compounds** |
| Entity Structure (diagram) | **How Your Business Is Set Up** |
| "value capture" | "keeping what you make" |
| "leverage" (noun, sitewide) | "bargaining power," "your position," "a stronger hand" |
| "deal structure" (promise-level copy) | "the deal," "how the deal is built" (Library keeps **Deal Structures** as a shelf label) |
| "Audit your unmonetized assets" | **"See what you're sitting on."** |
| Archetype frictions ("Governance fatigue across boards," "Allocation paralysis," "Taste dilution at scale," "Income exceeds entity structure") | "Too many boards, not enough making" · "Too many places to put your money, no conviction about which" · "Your name is on more things than you can actually touch" · "You're earning more than your paperwork can handle" |

Jargon stacks become lessons:

> **"The five ways a deal quietly pays you less than you earned"** — Hollywood accounting: the project "never profits," so your share of profits is zero. Overhead games: their costs come out of your side. Dilution: your slice shrinks every time they raise money. Net vs. gross: "10% of net" can mean 10% of nothing. Rights creep: the contract takes more than the project needs.
>
> **"The four protections to ask for"** — The right to check their math (audit rights). Your shares vest if they sell the company (acceleration). A clean way out (termination terms). Your percentage can't be quietly shrunk (anti-dilution).

### 7.4 Question rewrites — the pattern

Every question that could embarrass gets an "I don't know" option that scores neutrally and triggers a one-sentence teach. Jargon moves to option descriptions. Intimate asks (money, savings) explain why they're being asked. The ten worst, rewritten (full set drafted; four representative examples):

| Before | After |
|---|---|
| "How is that income structured?" (allocation sliders) | **"Where does the money come from? Rough guesses are fine — nobody has exact percentages."** With "Honestly, it's messy — just ask me the top two" as an escape. |
| "What is your current business structure?" (options incl. "LLC taxed as S-Corp") | **"Is there a company between you and the checks — or does everything run through you personally?"** With "I genuinely don't know" — desc: "that's common, and it's the first thing we'll help you sort out." |
| "What percentage of your income comes from sources that don't require you to actively produce or perform?" | **"If you took a month off, how much money would still show up?"** Help text: "This is the single best test of whether you own assets or a job." |
| "Have you discussed 83(b) election with a tax advisor?" | **"If you're getting stock that you earn over time, there's a one-page tax form with a 30-day deadline that can save you serious money. Has anyone walked you through it?"** With "Never heard of it — tell me more." |

Others in the full set: 409A ("They told you the company is worth something. Where did that number come from?"), anti-dilution ("Every time the company raises money, your slice gets smaller. Did anyone say anything about protecting your percentage?"), acceleration ("If the company gets sold before your shares finish vesting, what happens to the part you haven't earned yet?"), audit rights ("They'll owe you a share of the money. Does the contract let you check their math?"), gross-vs-net ("When they say you get a percentage — a percentage of what?"), equity/ownership ("Beyond getting paid for the work itself, do you ever keep a piece of what you help build?").

### 7.5 The VOICE block

One shared block, imported by every AI prompt (advisor, plan generator, evaluator, portfolio analysis):

```
VOICE RULES — apply to every sentence you produce:
1. PLAIN FIRST, PRECISE SECOND. Say the plain thing, then teach the term once
   in parentheses: "the right to check their math (audit rights)". Never the
   reverse. Never a technical term as a heading, label, or verdict.
2. BANNED AS PRIMARY LANGUAGE: leverage (noun), value capture, misalignment,
   entity, allocation, optimize, monetize, asset class, capital formation,
   "unmonetized". Expand the concept into a sentence with the member as the
   subject: not "high-leverage unmonetized IP" but "you own this outright and
   nobody is paying you for it yet."
3. STAGES ARE: Making, Directing, Owning, Backing. Scores: "negotiating
   power", never "leverage score". Diagnostics: "value leaks", never
   "misalignments".
4. NAME A HUMAN. Every recommendation cites at least one case study by name —
   "the same move Issa Rae made in 2016" — not just a structure number.
5. CONCRETE ANCHORS. Dollar amounts, years, deadlines, one-page forms,
   signatures. If a sentence has no noun you could photograph, rewrite it.
6. SPEAK THEIR DISCIPLINE. A musician has a catalog and masters; a designer
   has identity systems and clients. Never "service provider"; never
   "creator" when you know what they make.
7. "I DON'T KNOW" IS A GOOD ANSWER. It's a finding, not a failure. Teach in
   one sentence and give the exact question to ask and who to ask it of.
8. SHORT SENTENCES. One idea each. No throat-clearing, no filler enthusiasm.
9. HONEST OVER FLATTERING, WARM OVER CLINICAL. You can say a deal is bad in
   plain words. You cannot sound like a due-diligence memo.
```

Note: the current plan-generator prompt's own example output ("high-leverage unmonetized IP") violates rule 2 — prompts that contain jargon-register examples produce jargon-register output. The examples inside every prompt get rewritten too.

---

## 8. Kill / merge / keep

**Dies**

- The `/assessment` wizard UI + the 710-line assessment state machine (the question bank survives as the advisor's repertoire — "what a thorough advisor knows to ask," rephrased per §7.4)
- The `/evaluate` question wizard + the 815-line evaluator state machine (Deal Check replaces it; scoring survives)
- `/roadmap` as a standalone page (merges into Home) and the duplicate "Action Roadmap" inside the portfolio analysis
- ~12 dashboard CTA components (the relay race existed only to funnel members into five engines)
- The broken "Choose a path" advisor opening
- "Own Your Future" as metadata; the finance register everywhere (per §7)
- The 9-section / ~40-field plan schema: entity diagram, value flywheel, vision block, reading path, standalone misalignment section — all become on-demand depth in chat
- The "TEMP: Regenerate" button and the stubbed "[Phase B/C]" advisor modes

**Merges**

- Dashboard + Roadmap + deal history → **Home (Your Plan)**: Position · Next 3 moves (each citing a case) · Deals · People like you
- The 3–4 duplicate visualization implementations → the existing chat visual tools + at most two Home components
- Saved → a Library filter; Articles/Case Studies/Structures → one Library entry with tabs

**Keeps**

- The corpus: 107 case studies, 35 structures, 23 articles, and the taxonomy module as the matching engine for "people like you"
- **Portfolio as a page with a form** (§6) — dual input with the advisor
- All deterministic scoring (`scoring.ts`, `archetypes.ts`, `evaluator/scoring.ts`) — as advisor-callable tools
- The 6-dimension verdict structure and green/yellow/red signal
- Advisor infrastructure + the structured chat components (chips, sliders, cards)
- The approved-providers whitelist (quietly one of the best trust decisions in the codebase)
- PDF export, re-pointed at the new one-page Plan

**Open decision (flagged, not decided):** the $12 Library tier and the coaching tier structure. Track A argues for one $19/mo membership with coaching as a contextual upsell; this changes revenue mechanics and is Neil's call, not a design conclusion.

---

## 9. Phasing

Each phase ships independently and is valuable alone.

**Phase 1 — Language + output collapse (~2–3 weeks, zero data-model risk)**
One tagline everywhere. Stage renames. The translation dictionary applied across portal and public site. The VOICE block into every AI prompt. Plan schema cut to the five-part living Plan. New Home (dashboard + roadmap merge; CTA components deleted). Nav to 5. Fix the advisor first-run bug + add the four chips (a day of work; the current first-run is a broken dead-end). Remove the TEMP button and stubs. Portfolio relabel + empty-state rewrite + mandatory type descriptions.

**Phase 2 — Guided onboarding (~3 weeks)**
`member_file` + `update_member_file`. The session frame component. "Where You Stand" as a guided session (scripted spine, adaptive follow-ups) replaces the wizard. Scoring/archetype run as tools on the file. Backfill migration; existing members never re-onboard. Delete `/assessment` UI + state machine.

**Phase 3 — Deal Check lifecycle (~3 weeks)**
Paste-a-deal + messy-input intake. The Conversation → Offer → Draft → Signed deal record. Positioning outputs at early stages; scored verdict when terms exist. Kill the evaluator wizard. Advisor-to-portfolio extraction nudges ("want me to add it?").

**Phase 4 — The living advisor (ongoing)**
Memory as file facts. Plan auto-patching ("Updated after your deal check on Tuesday"). Weekly one-move email. Case-match drops ("this week's case is a photographer"). Pricing decision, if taken. Foundations for benchmarks: fact schema versioning, aggregation-safe storage.

Sequencing logic: Phase 1 de-risks everything — if the simplified language and Plan don't land, nothing structural was lost. Phase 2 is the biggest experience delta for new members. Phase 3 completes the architecture. Validate Phase 1 with real members before committing Phase 2 code.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Conversational intake reliability (extraction quality, wrong inferences poisoning outputs) | Scripted spine keeps the path deterministic; strict file schema validation; confidence tags; confirm beats before computing the Read; the file is visible and editable. Budget real eval time on onboarding transcripts. |
| Cost of per-beat model calls | ~$0.05–0.15 per onboarding conversation — noise at $19/mo. |
| Blank-canvas anxiety | The six guidance guarantees (§3.3). The mock exists to pressure-test this before any code. |
| Losing perceived substance (the 9-section roadmap *looks* like a $19 product in a screenshot) | The minimal Plan must compensate with specificity: the named case match, the exact leaving-money-on-the-table line. Vague output in the new format is fatal — prompt quality matters more after the cut, not less. |
| Retention shifts to deal-check frequency | Make it the north-star metric; invest in paste-a-deal and the lifecycle touchpoints accordingly. |
| Existing-member whiplash | Backfill + "I've reviewed your file" opening — non-negotiable, ships with Phase 2. |

---

## 11. The UI pattern language (from the Portal v2 reference prototypes)

Four prototypes from a parallel design session (demo data: Marcus Cole / test-performer) supply the visual system this strategy needs — Dashboard "Instruments," Roadmap "One Move," Portfolio (tabbed), Advisor "Thread." They were built under a different objective (minimize visual load) and keep the old IA and vocabulary, so: **adopt the patterns, not the architecture.** The patterns to canonize:

**Structure & disclosure**
- **Overview + peek rows.** Every major page opens with a minimal Overview: one hero element plus small label-cards ("peeks") carrying one headline stat each, which jump to deeper tabs ("What it's costing you · $110K–$290K/yr → Position"). This is the progressive-disclosure primitive that keeps every surface's first screen tiny.
- **One move above the fold, three on the tab.** The plan's resting state leads with a single big move card ("Continue this move" / "Ask the Advisor") and a small vertical 3-step map; the full move list lives one tab away. This sharpens §2's "Next 3 moves" — one is the headline, three is the depth. ("Your Read" is day one; "One Move" is every day after.)
- **Reveals over sections.** Why-it-matters, how-we-got-this-number, and about-this-asset content sits behind `details` reveals, not stacked sections.

**Editorial UI**
- **One insight caption per tile/metric.** Every number gets one plain sentence of judgment: "The gap is organization, not quality." / "Weakest bar = biggest unlock." No metric ships without its sentence. (The VOICE rules as a UI rule.)
- **Cost-first diagnostics.** Value Leaks lead with the dollar figure ("$110K–$260K / yr"), then the plain sentence, then "why it matters" behind a reveal.
- **Now vs. Potential gap bars** — current income vs. market potential as two bars. The mind-shift moment (§6) as a picture; belongs on the Portfolio overview.
- **"You'll Know It's Working When"** — success signals as three plain-language cards (replaces "Transition Signals").
- **Greeting as position**: "Morning, Marcus. Here's your position." + "Updated Mar 11."
- **"How we got this number"** — every AI-generated valuation shows its comparables math behind a reveal.

**The living system, made visible**
- **Deal → Plan signal line**: "The Hipgnosis offer may change move 3 — respond and this plan refreshes around the outcome." One sentence that shows the plan is alive.
- **Analysis feeds the plan, explicitly.** Portfolio fixes are labeled "Feeds moves 1–2 on your roadmap"; footer: "This analysis rebuilt your plan on Mar 11." Fixes feed the one plan instead of forming a second one.
- **Member notes on moves and assets** ("Your note: Reached out to 3 agencies…") — dual authorship; each note is a Member File fact.
- **"Your turn" deal status** — every deal always shows whose move it is; pairs with the Conversation → Offer → Draft → Signed lifecycle (§5).

**Advisor thread**
- **History remembered by outcome.** Conversation-rail snippets are verdicts ("Decline. Don't counter — walk away…"), not first messages — chat history as a decision log.
- **Context chips on the thread** ("Deal · Hipgnosis 6.3 · Structure № 14 · Roadmap · Move 3") — conversations visibly linked to the objects they touch; the write-through architecture (§2.3) rendered as UI.
- **Proactive opener from state**: "Hipgnosis is waiting on you… Our call: counter at 30% and keep sync approval," with action pills. The advisor initiates; the member never invents a prompt.
- **The comparison table** (their offer vs. your counter, term by term) — canonical Deal Check component.
- **Composer copy**: "Drop in a contract — it gets read before you do."

**Resolve when adopting:** (1) the prototypes still triplicate valuation/gauge across Dashboard, Portfolio, and Roadmap — under the 5-item nav the gauge lives once, on Portfolio, and Home's tile shows the number and links; (2) every screen still needs the §7 translation pass ("leverage is hiding," "Structural Misalignments," "securitization" all appear verbatim); (3) the prototypes' 11-item sidebar is superseded by §2.1.

### Fidelity guardrails (from Neil's mockup review, 2026-07-10)

The risk in execution is not bad design — it's **generic drift**: every new screen quietly reverting to stock AI/UI patterns instead of Sequence's own. These are rules, not preferences; they bind every future mockup and Phase 1+ implementation:

1. **New screens are recompositions of existing portal components.** Sidebar chrome (same logo row, same icons, working collapse), PageHeader, set-tabs, lib-card variants, GenerationProgress, action pills. A net-new visual pattern requires explicit sign-off before it ships — the default answer is "which existing component does this?"
2. **Never a colored left-border as a highlight or accent on a card.** Signal states use the portal's existing language: a signal dot + mono label.
3. **Case-study cards keep the dark lib-card treatment** (cover images and conic-gradient variants included); structures stay light. Text on the dark variant hardcodes white (the dark-surface rule in CLAUDE.md).
4. **Small corner radii** — match current portal values, not the v2 prototypes' 8px. When in doubt: 4px cards, 3px controls.
5. **Mobile nav is a hamburger + slide-over sidebar** (the current pattern). Never a horizontal chip strip.
6. **CTA hierarchy per screen:** exactly one primary action pill (solid); secondary actions are mono text-links; statuses are inline dot + text, never boxed chips stacked over boxed buttons. This is the existing head + body-link + action-pill pattern from design.md.
7. **The stage spectrum is identity, not progress.** It lives in Where You Stand (Settings / Creative Identity), never on Home. Home's only progress UI is near-term: the move map and session progress.
8. **Settings loses nothing.** Profile (account + Links subgroup + billing) carries over whole; Where You Stand absorbs the Creative Identity portrait (shared archetype-sigil component, never re-inlined) plus the Member File panel.

**What mockups are for (scoping note, 2026-07-10):** standalone HTML mockups (including Portal v3) are decision tools for IA, vocabulary, hierarchy, and behavior — they are NOT pixel-authoritative. They render in system fonts (the artifact sandbox can't load Geist/PT Mono), rebuild approximations of components rather than importing `portal.css`/`globals.css`, and can't reproduce lib-card cover images or the settings/CI panels. In-codebase execution corrects this **by construction** under rule 1: screens are recompositions of the real components (`settings-tabs.tsx`, `lib-card.tsx`, `creative-identity-panel.tsx`, …), so they look like the current portal because they *are* the current portal, rearranged. The first true fidelity check is a feature branch with a Vercel preview, not any mock.

---

## 12. What to react to

1. **The architecture** — one advisor, one file, one plan; 5-item nav; Portfolio as the standing page. (§2, §6)
2. **The session frame** — does the mock deliver the wizard's progress-visibility inside chat? (companion prototype)
3. **The names** — Making/Directing/Owning/Backing; Where You Stand / Portfolio / Your Next Three Moves / Deal Check; Negotiating Power; Value Leaks. (§7.2–7.3)
4. **The candidate copy** — home hero, pricing lead, signup subtitle. (§7.1)
5. **The pricing question** — single tier vs. current three. (§8, flagged open)
6. **Phase 1 scope** — comfortable shipping the language + Home collapse before any conversational intake exists?
7. **The pattern language** (§11) — which of the Portal v2 patterns to lock in as the visual system for Phase 1's new Home and Portfolio.
