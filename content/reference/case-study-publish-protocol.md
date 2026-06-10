# Case Study Publish Protocol

The end-to-end sequence for shipping a case study — from a finished MDX file to live on the site and reflected in the Airtable pipeline. Follow this every time a case study (or a batch of them) goes live. The goal is a repeatable, low-rediscovery process: every ID, field value, and step needed is in this doc.

> Companion docs: `case-study-components.md` (component toolkit), `case-study-editorial-conventions.md` (voice/evidence), `diagram-system.md` (Compounding Effect diagrams), `case-study-taxonomy.md` (industries/disciplines slugs). This doc is the *publish* step that comes after authoring.

---

## When to run

When one or more case-study MDX files are authored, image-sourced, and ready to go live. The protocol has three phases: **(A) verify**, **(B) ship the code**, **(C) update the Airtable pipeline**. Phase C is the step most easily forgotten — Neil maintains the pipeline by hand and expects it updated whenever cases ship.

---

## Phase A — Verify (pre-publish gate)

Before shipping, confirm each case clears the bar:

1. **Build passes.** `npm run build` (PATH must include `/Users/neilbrown/.nvm/versions/node/v24.14.0/bin`). Zero errors; page count rises by 2 per new case (public + portal route). A clean build also means `validateCaseStudyTaxonomy()` passed — every `industries[]` / `disciplines[]` slug is canonical.
2. **Frontmatter complete.** `industries[]` + `disciplines[]` (canonical slugs, not the legacy singular `industry:`), `confidence`, `stats[]` with `estimated` flags where due, `published: true`, `slug`, `number`, `publishedAt` / `updatedAt`.
3. **Diagram hygiene.** The Compounding Effect diagram uses `var(--diag-*)` (never hardcoded hex), leads cards with the descriptive name, and matches one of the five types in `diagram-system.md`.
4. **Editorial closings.** "What Wouldn't Transfer" lesson with the closing universal-pattern turn; full `<CbSources>` block (5 subsections); `<CbRelated>` with ≥3 structure + ≥3 case cards (6 total).
5. **Images.** hero / secondary / cover frontmatter present (this is the pipeline's "Images Sourced" gate).

---

## Phase B — Ship the code

1. Stage only the case-study files (and their images frontmatter). Leave unrelated untracked files alone.
2. Commit with the house style; end the message with the `Co-Authored-By:` trailer.
3. `git push origin main` → Vercel auto-deploys in ~60–90s.
4. Live URL is `https://insequence.so/case-studies/<slug>` (public) and `/library/case-studies/<slug>` (portal).

If images are added in a later pass, that's a second commit (`Case studies: hero/cover/secondary image frontmatter for <slugs>`).

---

## Phase C — Update the Airtable pipeline

Base: **"In Sequence — Case Studies"** — `appysSx11QTVyGHmM` (Airtable MCP). Two writes: update each Pipeline row, then log it.

### C1. Find the Pipeline row(s)

`search_records` on the **Pipeline** table (`tblcY33eogcAp8R1D`) by subject name → get the `recordId`. Names may carry accents or suffixes (e.g. "Yves Béhar / fuseproject", "Red Antler (Heyward + Osborne)"); search a distinctive token (`Bierut`, `fuseproject`) and confirm against the `Candidate` field. Fuzzy search can return extra rows — verify before writing.

### C2. Set the published-state fields

`update_records_for_table` on the same table. The **published convention** (consistent across 100+ rows):

| Field | Field ID | Value |
|---|---|---|
| Status | `fldu5ePq5ScUaif0C` | `"published"` (singleSelect — pass the name string) |
| MDX Done | `fldgjx1UyCIotEmFF` | `true` |
| Images Sourced | `fldcbCYCz5U2uaKk7` | `true` |
| Live URL | `fldTlkqF6mhkhkPyn` | `https://insequence.so/case-studies/<slug>` (no `www.`) |

`Research Done` (`fldS0jAILtPuTvUwv`) and `Draft Done` (`fldb20F6zQTxujv5A`) are normally already `true` from the drafting stage — confirm, set if missing.

**Conventionally left blank:** `Slug` (`fldANBEM3YSZEB5yF`) and `Date Published` (`fldC0aZV3WMvd2J5Z`). Only one legacy row (red-antler) fills them. Don't populate unless Neil asks to start (if he does, also backfill the recent cohort).

Batch all rows in one `update_records_for_table` call (up to 50). Example shape for two cases:

```json
{
  "baseId": "appysSx11QTVyGHmM",
  "tableId": "tblcY33eogcAp8R1D",
  "records": [
    {"id": "<recId-A>", "fields": {"fldu5ePq5ScUaif0C": "published", "fldgjx1UyCIotEmFF": true, "fldcbCYCz5U2uaKk7": true, "fldTlkqF6mhkhkPyn": "https://insequence.so/case-studies/<slug-a>"}},
    {"id": "<recId-B>", "fields": {"fldu5ePq5ScUaif0C": "published", "fldgjx1UyCIotEmFF": true, "fldcbCYCz5U2uaKk7": true, "fldTlkqF6mhkhkPyn": "https://insequence.so/case-studies/<slug-b>"}}
  ]
}
```

### C3. Log it in the Update Log

`create_records_for_table` on the **Update Log** table (`tblZAfy9nxGgPgdgM`). One row per publish event:

| Field | Field ID | Value |
|---|---|---|
| Date | `fldbJhXP2O6idduMF` | today, `YYYY-MM-DD` |
| Summary | `fld9l9UZYSftOm6u2` | descriptive, in the log's existing voice — what shipped + the structural angle |
| Records Affected | `fldmSUNkSZ5BPGOJk` | count of Pipeline rows changed |

The log is actively maintained (~86 entries) and records drafting, publishing, and schema changes. Match the voice of recent entries: lead with the action, name the case(s), note the structural read.

---

## Status lifecycle (reference)

`queued → in_progress → drafted → published` (`fldu5ePq5ScUaif0C` choices: `sellDwVFC3nKNNWh5`, `selJWcWtEdUP0vuQw`, `selvZ8gF81z20bSAl`, `selAE2vgj944xttYR`). Publishing moves a row from `drafted` to `published`.

## Other Pipeline tables (not part of publish)

`Holding` (`tblf7tCUgiaWsVDxf`), `Cut` (`tblZmht3nrMbMplwZ`), `Creative Influencers` (`tblEd39xZ1O56IQTL`), `Personal Contacts` (`tblfEIXAbsX08WbFj`). The Pipeline table also carries outreach fields (Outreach Status/Channel/Notes, Contact, Date Contacted, Next Follow-up) — separate workflow, not touched on publish.

---

## Quick checklist

- [ ] `npm run build` clean (taxonomy valid, page count +2/case)
- [ ] Frontmatter, diagram hygiene, WWT + Sources + Related, images all present
- [ ] Commit + `git push origin main`; Vercel deploy confirmed
- [ ] Pipeline row(s): Status→`published`, MDX Done✓, Images Sourced✓, Live URL set (batched)
- [ ] Update Log row added (Date, Summary, Records Affected)

---

## Making it more automatic

This protocol is executable by a session in two MCP calls (one `update_records_for_table`, one `create_records_for_table`) once the record IDs are known. If publishing becomes frequent, consider wrapping Phase C in a slash command / skill that takes a list of `{slug, recordId}` and runs both writes + the log entry. Not built yet — flag if wanted.

## Provenance

Written June 2026 after formalizing the publish convention observed across the live library (104 published rows, consistent four-field published state). Field IDs verified against the base on 2026-06-10; if a write fails on an ID, re-fetch with `list_tables_for_base` / `get_table_schema` — schema can drift.
