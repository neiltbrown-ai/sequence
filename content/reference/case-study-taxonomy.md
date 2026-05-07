# Sequence — Case Study Taxonomy

Canonical list of industries and disciplines for tagging case studies. Read before authoring any new case study, or when retagging an existing one. The vocabularies below are also the canonical source for the assessment's Q1 industry options (`src/lib/assessment/questions.ts`) — keep these in sync.

---

## Why two axes?

- **Industries** describe the *sector* the case study lives in — where the work serves, what economic ecosystem it operates in.
- **Disciplines** describe what the practitioner *does* — their craft, their professional identity.

A music producer working on film scores → `industries: ["music", "film_tv"]`, `disciplines: ["production"]`
A graphic designer running a brand studio → `industries: ["design"]`, `disciplines: ["design", "leadership"]`

Two axes enables filtering like:
- "All Music industry cases" → Rubin, Eno, FKA Twigs, Beats by Dre
- "All Direction discipline cases across any industry" → film directors + creative directors + theater directors
- "Music + Production" → producers specifically

---

## Frontmatter pattern

```yaml
industries: ["music"]                                      # 1-2 typically, max 3
disciplines: ["production", "direction"]                    # 1-3 typically, max 4
discipline: "Music Production / Strategic Direction"        # human-readable display string
```

- **`industries: string[]`** — for filtering, recommendation rollup, analytics. Slugs from the canonical list below.
- **`disciplines: string[]`** — for filtering across the second axis. Slugs from the canonical list below.
- **`discipline: string`** — the prose header rendered on the case study detail page. Freeform; describes the practitioner's specific configuration.

The legacy `industry: string` field (singular) is **deprecated** as of May 2026 — kept temporarily for backward-compat during migration, then removed.

---

## Tagging rules

1. **Industries**: 1–2 typically. Max 3 only if the case is genuinely cross-industry (e.g., a fashion designer who has also built a hospitality brand). One-off project crossovers don't count.
2. **Disciplines**: 1–3 typically. Max 4. Be honest about what they actually *do* day-to-day.
3. **Order matters**: most-prominent first. The first industry is the "primary" — used for default sorting and rollup.
4. **Be conservative.** Don't over-tag. A case primarily about music production with a tangential film-score project is `industries: ["music"]`, not `["music", "film_tv"]`.

---

## Industries (16)

Grouped by domain for cognitive structure. Filter UI surfaces them as one flat list with checkbox multi-select.

### Visual / craft

#### `visual_art` — Visual Art

**Scope.** Fine art, sculpture, painting, illustration-as-art, gallery practice. Work where the primary economic relationship is artist↔collector or artist↔institution. Editions, originals, commissions, museum acquisitions.

**IN.** Practicing artists with gallery representation; sculptors; painters; conceptual artists; printmakers; mixed-media artists.

**OUT.** Commercial illustration → `comics`. Graphic design → `design`. Photography → `photography`. NFT-only artists with no physical practice → judgment call (often `comics` if illustrative, `design` if generative).

#### `design` — Design

**Scope.** Graphic design, brand identity, product design, motion design, web/UX. Visual problem-solving for clients, audiences, or internal teams.

**IN.** Brand identity studios; graphic designers; motion designers; UX/product designers; web designers; type designers.

**OUT.** Fashion design → `fashion`. Architectural design → `architecture`. Advertising creative direction (campaign-led) → `advertising`. Game design → `gaming`.

#### `photography` — Photography

**Scope.** Editorial, commercial, fine-art, photojournalism, portraiture, fashion photography. Image-making as the primary craft.

**IN.** Magazine photographers; commercial photographers; fine-art photographers; documentary photographers.

**OUT.** Photo-based fine artists who primarily exhibit → `visual_art`. Filmmakers who shoot stills → primary discipline is film.

#### `comics` — Comics & Illustration

**Scope.** Comics, graphic novels, commercial illustration, editorial illustration, cartooning. Narrative or commercial image-making at scale.

**IN.** Comic creators; graphic novelists; editorial illustrators; commercial illustrators; cartoonists; sequential storytellers.

**OUT.** Illustration-as-fine-art → `visual_art`. Brand illustration system work → `design`.

#### `architecture` — Architecture

**Scope.** Architecture, interior design, urbanism, landscape architecture, spatial design.

**IN.** Architects (residential, commercial, institutional); interior designers; urbanists; landscape architects; spatial designers.

**OUT.** Stage / set design → judgment call (`theater` if for live performance; `design` if exhibition design). Furniture design → `design`.

#### `fashion` — Fashion

**Scope.** Fashion design, apparel, accessories, footwear, retail brand-building. Garment-led work.

**IN.** Fashion designers; apparel brands; accessory designers; fashion houses; streetwear founders.

**OUT.** Costume design for film/theater → primary discipline is the medium (`film_tv` / `theater`). Fashion photography → `photography`.

### Time-based / performing

#### `film_tv` — Film & TV

**Scope.** Feature film, episodic television, documentary, distribution, streaming originals. Long-form moving-image storytelling.

**IN.** Directors, producers, screenwriters, distributors, studios, indie production companies, streamers.

**OUT.** Music videos primarily → `music` (with film_tv as secondary if substantial). Short-form social video → `media`.

#### `music` — Music

**Scope.** Recording, performance, songwriting, production, music publishing, touring. Music as the central artifact.

**IN.** Artists, producers, songwriters, labels, music publishers, touring acts, composers (when working in music industry contexts).

**OUT.** Composers primarily working in film → `film_tv`. Sound design → judgment call (if for film, `film_tv`; if standalone, `music`).

#### `theater` — Theater & Performing Arts

**Scope.** Theater, dance, opera, live performance art, immersive experience.

**IN.** Theater directors, choreographers, dancers, opera, performance artists, immersive experience designers.

**OUT.** Stand-up / sketch comedy → `comedy`. Live music → `music`.

#### `comedy` — Comedy

**Scope.** Stand-up, sketch, comedy specials, comedy writing rooms, comedy podcasts, late-night.

**IN.** Stand-up comedians, sketch performers, comedy writers, comedy podcasters, late-night hosts/writers, sitcom writer-performers.

**OUT.** Sitcom production-side → `film_tv`. Theater comedy that's primarily theatrical → `theater`.

### Word / editorial

#### `writing` — Writing & Publishing

**Scope.** Books, longform journalism, fiction, nonfiction, screenwriting (when book-tracked), poetry, author-led newsletters where the writer is the brand.

**IN.** Authors, novelists, longform journalists, essayists, author-led Substacks, poet, ghost writers.

**OUT.** Publication-led media (where the brand outlives the founder) → `media`. Screenwriting for film as career → `film_tv`. Comedy writing → `comedy`.

#### `media` — Media & Editorial

**Scope.** Podcasts, content businesses, magazines, publication-led newsletters, content networks. The brand outlives any single founder.

**IN.** Podcast networks, magazine founders, publication-led newsletters (Defector, Puck, Air Mail), content businesses, video creators when running a media business.

**OUT.** Author-as-brand → `writing` (Sahil Lavingia is `writing`; Defector is `media` — even though both are subscription content). Single-creator YouTube → judgment call.

### Commercial / experiential

#### `advertising` — Advertising

**Scope.** Advertising agencies, brand campaigns, marketing strategy at scale, brand consultancies.

**IN.** Agencies (creative, brand, digital), independent creative directors operating campaign-led, brand strategists, marketing consultants.

**OUT.** Brand identity / design studios → `design`. PR / comms-only → not Sequence-relevant typically.

#### `hospitality` — Hospitality

**Scope.** Restaurants, bars, hotels, F&B brands, experiential venues, food businesses.

**IN.** Restaurateurs, hoteliers, F&B brand founders, experiential venue operators, chefs operating businesses.

**OUT.** Food media (cookbooks, food shows) → `writing` or `media`. Pure F&B product → judgment call (CPG is more `design` / `leadership`).

### Tech

#### `technology` — Technology

**Scope.** Software, hardware, creative tools, consumer tech products, platforms, infrastructure.

**IN.** Software companies, hardware companies, creative tool makers (Figma, Notion), consumer tech, indie SaaS, platform companies.

**OUT.** Gaming → `gaming`. Tech that's primarily content (e.g., a tech-enabled magazine) → `media`.

#### `gaming` — Gaming

**Scope.** Game design, game development, game publishing, esports, interactive entertainment.

**IN.** Game studios, indie game devs, game publishers, esports orgs, interactive narrative.

**OUT.** Gamification of non-game products → `technology`.

---

## Disciplines (10)

What the practitioner *does*. Multi-tag (`disciplines: string[]`).

#### `direction` — Direction

Creative direction, art direction, film direction, theater direction, executive creative oversight. Setting the vision and quality bar for the work others execute.

**Examples:** Film directors, creative directors at agencies, art directors at magazines, fashion creative directors, theater directors.

#### `production` — Production

Producing — making things happen end to end. Music production, executive production, content production, line production, A&R as production.

**Examples:** Music producers, film producers, executive producers, podcast producers, content producers running shows.

#### `writing` — Writing

Word-craft as profession. Screenwriting, fiction, journalism, criticism, copywriting, essay-writing, comedy writing, songwriting (lyrics-led).

**Examples:** Authors, screenwriters, journalists, essayists, comedy writers, songwriters who primarily write lyrics.

#### `design` — Design

The act of designing. Graphic design, brand design, product design, motion design, type design, UX/web design.

**Examples:** Graphic designers, brand identity designers, product designers, motion designers.

#### `performance` — Performance

The act of performing. Acting, music performance, dance, stand-up, theater performance, voice work.

**Examples:** Actors, musicians-as-performers, dancers, stand-up comedians, voice actors, theater performers.

#### `leadership` — Leadership

Running an enterprise. Founder, CEO, studio principal, label head, business architect.

**Examples:** Studio founders, label heads, agency principals, magazine founders, hotel-group operators.

#### `investing` — Investing

Capital allocation as professional practice. Angel investing, fund management, GP/LP roles, advisory equity.

**Examples:** Angels with thesis-driven practice, fund managers, GPs at creative-industry funds.

#### `distribution` — Distribution

Operations, releasing, platform-running, distribution strategy. Getting work to audiences at scale.

**Examples:** Indie film distributors, label A&R/marketing leads, podcast network ops, music streaming product, festival programmers.

#### `education` — Education

Teaching, advisory, mentorship, public scholarship. Knowledge transfer as professional practice.

**Examples:** University-affiliated teachers, course creators, podcasters who primarily educate, advisory-only operators, public intellectuals.

#### `engineering` — Engineering

Technical craft. Software dev, hardware engineering, fabrication, technical direction in creative tooling.

**Examples:** Software engineers running products, hardware founders, creative-tool engineers, technical directors in immersive work.

---

## Quick lookup — worked examples

Real cases from the corpus, hand-tagged as authoritative examples. Use these as calibration when tagging similar cases.

| Case study | `industries` | `disciplines` |
|------------|-------------|---------------|
| Rick Rubin | `["music"]` | `["production", "direction"]` |
| A24 | `["film_tv"]` | `["production", "distribution", "leadership"]` |
| Stefan Sagmeister | `["design"]` | `["design", "direction", "writing"]` |
| Es Devlin | `["theater", "design"]` | `["design", "direction"]` |
| Red Antler | `["design"]` | `["design", "leadership"]` |
| Brian Eno | `["music", "visual_art"]` | `["production", "direction", "writing"]` |
| Ira Glass | `["media"]` | `["production", "direction"]` |
| Erik Spiekermann | `["design"]` | `["design", "education", "leadership"]` |
| Sahil Lavingia | `["design", "technology"]` | `["leadership", "design"]` |
| Brandon Stanton | `["photography", "media"]` | `["writing", "leadership"]` |
| Mimi Chao | `["comics", "writing"]` | `["writing", "design", "education", "leadership"]` |

---

## Edge cases / common pitfalls

1. **Multi-hyphenate cases** (designer-author, producer-director) — list ALL the disciplines; pick the PRIMARY industry. A graphic designer who also writes books is `industries: ["design"]`, `disciplines: ["design", "writing"]`. Industry is about reputation/scene; discipline is about craft.

2. **Crossover cases** (designer working in film) — both industries OK only if the secondary work is substantial and ongoing. Resist if the secondary is just one project. When in doubt, primary industry only.

3. **Founder + craft cases** — almost always tag both `leadership` and the primary craft discipline. A founder of a brand studio who still designs hands-on is `disciplines: ["design", "leadership"]`. A founder who has stepped fully into operations is just `["leadership"]` (rare for the cases Sequence covers).

4. **Performer-creator cases** (musicians who write and perform their own work) — usually `["performance", "writing"]` if songwriting is central; `["performance"]` alone if interpretive. `["production"]` adds only if they self-produce.

5. **Studio-as-brand cases** (MSCHF, Pentagram) — primary industry of the work, plus `disciplines: ["leadership"]` and the practice discipline. `industries: ["design"]` if visual; `industries: ["design", "advertising"]` if campaign-led.

6. **Case studies that span eras** (someone whose career changed industries) — tag the industries the case study materially covers. If the case is about their pivot, both industries belong.

7. **"Other" doesn't exist.** If a case genuinely doesn't fit any of the 16 industries, that's a signal we should add an industry — not that we should bucket it loosely. Surface it with the librarian for taxonomy review rather than picking the closest-fit.

---

## Provenance

Defined: 2026-05-06 (during the portal refinements + vocab cleanup session).
Backfilled into the corpus: 2026-05-07 (Phase 1 of the rollout — 104 cases tagged via Claude API, with human review of calibration + final proposals).
Replaces: ad-hoc freeform `discipline: string` (~104 unique values across 104 cases) and a 9-value `industry: string` enum that had collapsing categories like Writing / Media / Publishing / Audio.
Aligned with: assessment Q1 industry vocabulary (extended to match these 16 in the same May 2026 work).
Companion docs:
- `case-study-components.md` — MDX component toolkit
- `case-study-editorial-conventions.md` — voice register, evidence rules, structure conventions
- `library-expansion-candidates.md` — patterns surfaced by the audit that don't yet have a structure
