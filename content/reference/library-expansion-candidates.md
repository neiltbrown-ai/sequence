# Library Expansion Candidates

Tracking doc for potential additions to the In Sequence structures library. These are gaps where existing structures don't cleanly fit a documented pattern, and where the pattern is recurring enough that a new structure entry would be useful.

> **Cross-references:** Companion to `case-study-components.md` (component syntax) and `case-study-editorial-conventions.md` (voice and editorial register). When writing a new case study and you find none of the 35 structures fits cleanly, flag the pattern here rather than stretching an existing structure.

---

## 1. Permanent Equity / Patient Capital Investment

**Surfaced from:** Phase 1.5 retro item C.7 (`jason-fried` Bezos minority stake on Basecamp)

**Working name:** Permanent Equity / Patient Capital Investment

**Defining elements (what makes it distinct from #18 Founder Equity or standard VC):**
1. **Instrument:** secondary common stock (not preferred), no liquidation preference
2. **Horizon:** indefinite / no forced exit timeline
3. **Returns:** ongoing per-share profit distributions, pro rata with founders
4. **Governance:** minority position, no board seat, no veto rights, no control provisions
5. **Investor profile:** long-horizon individual or patient-capital fund (vs. fund-cycle-driven VC)

**Why it deserves a library entry:**
The pattern is becoming a named alternative to VC, with active adherents and funds explicitly built around it. A new case-study author hitting this pattern shouldn't have to stretch #4 (Advisory) or #18 (Founder Equity) — neither of which fits. The pattern is recurring across our existing inventory and likely future cases:

- **Andrew Wilkinson / Tiny** — built his entire holding company on this model (acquires founder-friendly minority/majority positions, no forced exit, profit distributions)
- **Sahil Lavingia / Gumroad** — already in our inventory; he writes publicly about exploring this model via Flexile
- **Tyler Tringas / Calm Fund** — a fund operating exactly on this pattern
- **Kristian Andersen / High Alpha** — some of his deals lean this direction
- **Brent Beshore / Permanent Equity** — institutional-scale version of the same pattern

**Provisional library number:** #36 (next sequential).

**Provisional library category:** Equity-Based Structures (alongside #17–#21).

**Estimated case fit:** 4–6 future cases plus retroactive defensible attribution to Jason Fried's Bezos deal. Sahil Lavingia's case in particular currently uses other structures — would benefit from this attribution if we add it.

---

## 2. Creative Studio Company (distinct from #8 Creative Collective)

**Surfaced from:** Phase 1.5 retro items C.4 (`issa-rae` Color Creative) and C.11 (`mschf`)

**The gap:** #8 Creative Collective / Studio is currently defined as "loosely organized collectives of independent creatives sharing resources, cross-referring work, collaborating on larger projects" — explicitly "5–20 independent creatives form a loose association... separate clients, separate finances, separate legal entities."

That definition fits networks like Color Creative (a pipeline of independent writers being trained, referred, and placed) but doesn't fit unified studio companies like MSCHF (42 employees, VC-funded, single legal entity, employees not freelancers).

**Working name:** Creative Studio Company / Salaried Creative Collective

**Defining elements:**
1. Single legal entity (not loose association)
2. Salaried employees (not independent contractors)
3. Flat hierarchy / shared creative direction (vs. traditional agency hierarchy)
4. Bi-weekly or rapid-cadence shipping model (vs. project-based)
5. Often VC-funded or holding-company-backed
6. May or may not have rotating / fluid team structures within the entity

**Why it deserves a library entry:**
The "creative collective as a unified company" pattern is increasingly common (MSCHF, Mschf-style internet studios, parts of Sandwich, etc.). The strict #8 definition forces a stretched fit. A new structure or a #8a sub-classification would be cleaner.

**Provisional library number:** Either #37 (new) or #8a (sub-classification of existing #8).

**Estimated case fit:** MSCHF (already retroactively defensible if added); plus future creative-studio-company cases as the model proliferates.

**Note:** The MSCHF case in this audit was preserved at `#8` (with href fixed to `creative-collective-studio`) as the closest available structure. If this expansion is approved, MSCHF would be re-attributed.

---

## 3. (Open slot)

Future expansion candidates can be added here as the audit and post-audit case work surfaces them.

---

## How to use this doc

1. **When writing a new case study,** if you find none of the 35 structures fits cleanly, flag the pattern here rather than stretching an existing structure. Add a new section with the working name, defining elements, why it deserves a library entry, and any case fit (current or anticipated).
2. **Periodically** (e.g., quarterly), review whether any candidate has accumulated enough case fit to justify adding to the canonical 35-structure library.
3. **When a structure IS added:** update `content/structures/` (the actual structure MDX), and update `case-study-editorial-conventions.md` §9 if the addition affects systemic mapping rules. Existing cases that were retroactively defensible (noted in each candidate's "Estimated case fit") may also need badge re-attribution.

This doc was created during the May 2026 case study audit. The first two candidates emerged from the Phase 1.5 retro pass.
