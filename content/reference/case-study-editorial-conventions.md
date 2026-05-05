# Case Study Editorial Conventions

In-repo persistent reference for case study authors and editors. Sister doc to `case-study-components.md` — that doc covers WHAT components to use; this doc covers HOW to write inside them: voice register, evidence honesty, verb selection, framing conventions.

These conventions emerged from the multi-phase case study audit (May 2026). They apply to every case study in the library — both new cases being created and edits to existing ones. The 5 calibration cases — `george-lucas`, `a24`, `temi-coker`, `tyler-the-creator`, `reese-witherspoon` — are the gold-standard exemplars referenced throughout.

> **Cross-references:**
> - `case-study-components.md` — component syntax (what to use)
> - `library-expansion-candidates.md` — when none of the 35 structures fits a case cleanly, flag the pattern there rather than stretching an existing structure
> - `voice-guide.md` — broader project voice principles this doc operationalizes for case studies specifically

---

## 1. Voice register — the two registers

Case studies operate in exactly two registers. Anything between them — the throat-clearing middle — is the audit's anti-pattern.

**Register A — Declarative.** Use when evidence supports the claim. Direct, confident, no qualifier:
> "The Disney acquisition closed at $4.05 billion in October 2012."
> "Star Wars grossed $775M worldwide on first release."
> "Big Little Lies won 8 Emmy Awards."

**Register B — Attributed / sourced.** Use when evidence is inferred, estimated, or based on industry comparables:
> "Industry analysts estimate Hello Sunshine generated cumulative revenue in the $X–$Y range."
> "Coker has indicated in interviews that …"
> "Cumulative licensing revenue is estimated to have passed the low millions, based on the cadence of partnerships and industry-comparable fees."

**The rule:** Pick one register per claim. Never the middle.

### Banned phrases (the throat-clearing middle)

These phrases imply attribution without actually attributing, or hedge without naming the gap. Banned:

- "appears to apply"
- "seems to have used"
- "what looks like"
- "could be characterized as"
- "may have likely"
- "reportedly" *(unless paired with an actual citation in the same paragraph)*
- "according to industry sources" *(unless naming a specific source)*
- "it has been suggested"
- "industry watchers note"
- "is said to be"

If you find yourself reaching for one of these, you're in the throat-clearing middle. Step out either by:
- Strengthening to Register A if the evidence supports it
- Stepping back to Register B (named gap or named source) if it doesn't

---

## 2. Evidence-honesty principle

Every case study has a verification block (Sources & Verification section) that lists Primary Sources, Secondary Sources, Verified Data Points (with confidence levels), and Gaps to Verify. The body must match what the verification block can support.

### Two-track judgment

For any claim in the body, separate two distinct things:

| Track | What it means | Examples |
|-------|---------------|----------|
| **Track A** — Verified | Confirmed in the verification block (verified-high or verified-very-high), or in primary sources | Awards, prize recognitions; box office / streaming metrics; acquisition prices in SEC filings or press confirmations; direct quotes from the creator in cited sources |
| **Track B** — Asserted | Claims about the creator's structural choices, deal terms, IP retention, strategic patterns, specific contract clauses, career-long behaviors | Deal terms ("X% of adjusted gross"); IP retention or transfer; "X consistently accepted lower fees"; "rights reverted after 18 months" |

**The rule:** Where Track B outruns Track A, soften Track B to general structural principle for that tier of work, not creator-specific assertion.

### The Lucas exception

Most behaviors in the `george-lucas` case ARE in primary sources — Tom Pollock interview, SEC filings, named trade-press reporting. Lucas can support more declarative Track-B claims than most cases because the primary-source record is unusually rich.

Most other cases need more Track-B softening. When in doubt, default to softening — it's better to under-claim and stay honest than to over-claim and have the verification block contradict the body.

---

## 3. The three-verb system for structure attribution

Every `<CbStructureBadge>` reference in body prose is preceded by a verb that signals how confident the structural attribution is. The audit's worst anti-pattern was using "Applied" as the universal default — it implies the creator was working from the In Sequence library framework, which they weren't.

Use one of three verb tiers based on interpretive confidence:

### Tier 1 — Documented

> **"Applied" / "Used" / "Structured the deal as"**

Use when the deal terms are publicly documented and clearly match the structure.

**Examples:**
- George Lucas's 1973 trade with Fox — documented in Tom Pollock interview cited in case sources → "**Structured the deal as** #30 Subsidiary Rights Retention"
- Lucas's 1980 Empire self-financing — documented in business press → "**Used** #9 Holding Company Model"
- Witherspoon's 2021 Hello Sunshine partial-exit — Bloomberg + THR sourced → "**Structured the deal as** #18 Founder Equity"

### Tier 2 — Inferred-with-public-mechanics

> **"The deal pattern matches" / "The arrangement is structured as"**

Use when the specific terms are inferred but the public record establishes the basic mechanics.

**Examples:**
- A24's 2016 production shift — budget caps documented in trade press, specific contracts not public → "**The arrangement is structured as** #13 Constraint-Based Production"
- Coker's Adobe Creative Residency — documented as a licensing-adjacent program structure, specific contract not public → "**The arrangement is structured as** #27 Non-Exclusive Licensing"

### Tier 3 — Analytical-framing

> **"Consistent with" / "Functions as" / "Resembles"**

Use when the structure is an analytical framing of behavior we've inferred from outcomes — the creator didn't structure their work this way; we're reading the framework onto a body of public work.

**Examples:**
- Tyler, the Creator's interlocking verticals — Tyler doesn't legally operate as a holding company, his verticals function like one → "**Functions as** #9 Holding Company Model"
- Lucas's 1983 ILM/Skywalker Sound diversification — Lucas built tools he needed and then sold the surplus, not consciously diversifying per a model → "**Functions as** #10 Diversified Revenue Streams"

### Critical: applies to high-disclosure cases too

Lucas knew he was retaining rights. He did NOT know he was "applying Structure #30." The verb must reflect that we are reading our framework onto historical deals, regardless of disclosure level.

### Decision tree

```
Is the deal term publicly documented in the case's verification block?
├── Yes, with high/very-high confidence → Tier 1 (Used / Applied / Structured the deal as)
└── No
    ├── Are the basic mechanics public (e.g., "Coker did licensing work for brands") even if specific terms aren't?
    │   ├── Yes → Tier 2 (The deal pattern matches / The arrangement is structured as)
    │   └── No → Tier 3 (Functions as / Consistent with / Resembles)
    └── Edge case: structure mapping itself feels uncertain → flag for structure-mapping review, do not change verb
```

When uncertain between two tiers, default to the lower (more conservative) tier.

---

## 4. The Pattern 6 disclosure sentence

Every thesis paragraph that introduces the structures applied must include explicit framing that the structure mapping is analytical, not biographical. **One sentence (or one consolidated sub-paragraph) per case.**

### Voice rules

- **No literal template.** Voice-tune to each case (Lucas direct, A24 institutional, Coker careful, Tyler defiant, Witherspoon analytical).
- **Position at end of thesis paragraph.** Either replace the existing closing sentence or insert as new closing sentence.
- **Honest, not apologetic.** The creator did things; we are interpreting them through a framework. Worth naming once at the top.

### What the disclosure must convey

- The structure mapping is the case study's analytical reading
- The creator did not pick these structures off a menu
- The fit between what the creator did and what the structures describe is what makes the case useful (the closing cadence — variations welcome)

### Worked examples (from the 5 calibration cases)

**Lucas (direct, slightly contrarian):**
> "It is also the purest expression of Structure #30 in the inventory — though the framework is ours, not Lucas's. He didn't sit down in 1973 to 'apply subsidiary rights retention.' He fought for sequel and merchandise rights because Fox wouldn't pay him what he wanted in cash, and the rights were what he could get instead. The structure name is how we read the deal half a century later. The fit is what makes the case useful."

**A24 (institutional):**
> "Together, these structures turned taste into an appreciating asset. We're reading three structures from the In Sequence library onto A24's history — the company didn't build itself from a deal-structure menu. But the fit between what they did and how the structures behave is what makes the case worth studying."

**Coker (careful, instructional):**
> "We read three structures from the In Sequence library against Coker's career: product partnerships with major brands, non-exclusive licensing for editorial and multi-brand work, and selective exclusive licenses on flagship campaigns. Where Coker has publicly described his deal terms (the Adobe Creative Residency, editorial assignments), the licensing reading is well-supported. Where he hasn't (the headline tech-brand campaigns), we use industry-typical terms for designer-led work at this tier as the comparison — specific contract structure for those deals is not public, and the case is honest about which figures and structures are inferred."

**Tyler (direct, slightly defiant):**
> "The aesthetic itself functions as intellectual property. Tyler didn't build any of this from a deal-structure manual — he built what he wanted, in the order it occurred to him. The structures we map onto his career (holding company, product partnership, diversified revenue) are our reading of what the ecosystem behaves like, not a plan he ran. The behavior is what makes the case useful."

**Witherspoon (analytical / case-method):**
> "And she is the clearest demonstration of the counterfactual: acting alone → $150–200M over nine years; acting + company → $650–800M. The structures we read onto her decisions — holding company, diversified revenue, founder equity — are our framework, not the playbook she carried into 2012. Witherspoon and Sarah Harden built a company; we map structures onto what they built. The fit between the two is what makes the case useful."

---

## 5. Body-softening register (extended Pattern 6)

The Pattern 6 disclosure at the end of the thesis is necessary but not sufficient. **If the rest of the case body asserts the same structural mechanism that the closing disclosure walks back, those body assertions must be softened too.** Otherwise the disclosure reads as a contradictory hedge after the body has already over-claimed.

### Where the body-softening sweep applies

Scan for declarative-as-fact assertions across:

- **Drop-cap and thesis paragraphs** (not just the closing disclosure sentence)
- **Pull-quotes** (visually emphasized — especially worth getting right)
- **Section intros** (the prose between `<CbHeading>` and the first chart/table/accordion)
- **Accordion cards** (`<CbAccordionCard>` body text)
- **Lesson cards** (Transferable Lessons section)
- **Tab notes** (`<CbTabNote>` content)

### What to soften

The pattern is consistent. Look for body claims that assert as fact:
- Deal mechanism — "X structured deals," "X used licensing," "X negotiated equity"
- IP retention — "X retained ownership," "the underlying work stayed with X"
- Specific contract terms — "rights reverted after 18 months," "X paid Z%"
- Career-long strategic patterns — "X consistently accepted lower upfront fees"

### How to soften

Two moves work:

**(a) Generalize.** Rewrite the assertion as a description of how the structure typically works for this tier of creator, not a creator-specific claim.

> Before: "Coker's first structural shift was moving from flat-fee commissions to product partnerships. He contributed creative IP; the brand contributed manufacturing, distribution, and marketing. Revenue was shared based on contribution."

> After: "Designer-led product partnerships at Coker's tier typically work this way: the designer contributes recognizable creative IP and brand authority; an operational partner contributes capital, distribution, and marketing infrastructure. Revenue scales with contribution rather than hours billed. Coker's brand collaborations look from the outside like this pattern; specific contract terms for his individual deals are not public."

**(b) Name the gap.** Acknowledge directly that the specific terms are not on the public record while keeping the structural reading.

> Before: "After 18 months, all rights reverted to Coker."

> After: "Coker's Google Pixel campaign is publicly documented; specific deal structure (whether exclusive, term length, fee, reversion conditions) is not on the public record. The framing above describes how exclusive licensing typically works for designer-led work at this tier, not Coker's specific contract."

### The Coker case as worked example

The `temi-coker` case shows the full sweep applied — thesis body, three structure-section intros, four accordion cards inside the #28 section, and lesson card #05. Read it end-to-end before applying body-softening to a new case.

---

## 6. Pattern 1 — Specific dollar attached to specific named deal

**Drift:** Specific dollar amounts attached to specific named deals (e.g., "Google Pixel campaign — $180K single deal") stated as fact when they are inferred from industry comparables.

**Rule:** A specific dollar figure attached to a specific named deal can only be stated unattributed if the figure is on the public record (court filing, SEC, the creator's own statement to a credible outlet, trade-press reporting that names a primary source). Otherwise:

**Option A — Attributed range with explicit framing:**
> "Industry comparables for [creator type] at this brand tier suggest fees in the $X–$Y range; specific terms are not public."

**Option B — Decoupled framing:** Describe the deal mechanics without the specific figure.
> "Exclusive license with a defined window. Fees for designer-led exclusive campaigns at this brand tier typically run several multiples of equivalent non-exclusive work."

### How to judge

Check the case's verification block. If a figure is in Verified Data Points with high or very-high confidence, it's disclosed — leave alone. If marked estimated/medium/inferred, or absent from verification, treat as inferred and apply Option A or B.

---

## 7. Pattern 2 — Cumulative or annual revenue stated as fact

**Drift:** "Cumulative licensing revenue passes $2.8M" stated as a milestone, when figure is estimated.

**Rule:** Cumulative and annual revenue figures for private creators are almost always estimated. Body must carry the qualifier the verification block carries:

- "Estimated cumulative [revenue type] of approximately $X, based on [evidence type]."
- "Industry comparables suggest cumulative revenue in the $X–$Y range."
- Source attribution: "X has indicated in interviews that …"

**Exception:** Public-company revenue, SEC-filed transaction values, and box-office aggregations from Box Office Mojo / The Numbers are publicly verifiable — those can stay declarative.

---

## 8. Pattern 3 — Industry-comparable rate ranges in tables

**Drift:** Deal Comparison tables (`<CbTabs>` with deal terms; `<CbChart>` with fee comparisons) present industry-comparable rate ranges as if they were the creator's specific terms.

**Rule:** When a rate range is illustrative of industry practice rather than the specific creator's known terms, the framing must say so.

### Tab labels

Update the `tabsJson` label and the corresponding `<CbTabNote>`:

- ❌ `tabsJson='["Coker Partnership Terms",...]'`
- ✅ `tabsJson='["Designer-Brand Partnership Terms (Industry-Comparable)",...]'`

If specific terms ARE known for this creator, label the column accordingly. Don't conflate "what we know about this creator" with "industry standard."

### Chart titles and rows

Update `<CbChart>` titles to flag tier-based / industry-comparable framing, and replace named-brand rows with structural tier descriptors.

**Before (Coker, original):**
```mdx
<CbChart title="Revenue Per Brand Partnership (Est.)">
  <CbChartRow label="Google Pixel" value="$180K" pct="100" />
  <CbChartRow label="Apple iPad" value="$130K" pct="72" />
  <CbChartRow label="Adobe Creative" value="$100K" pct="56" />
  ...
</CbChart>
```

**After (calibrated):**
```mdx
<CbChart title="Industry-Comparable Designer-Brand Partnership Fees (Est., by tier)">
  <CbChartRow label="Tier 1 (flagship tech, exclusive)" value="$150–200K" pct="100" />
  <CbChartRow label="Tier 2 (flagship tech, non-exclusive)" value="$100–140K" pct="70" />
  <CbChartRow label="Tier 3 (creative platform partnership)" value="$80–110K" pct="55" />
  ...
</CbChart>
```

### Worked-example tab notes

When a tab note describes a hypothetical scenario that reads like a real Coker (or whoever) deal, flag it as a worked example:

**Before:** "Same creative effort. A product partnership for a tech campaign reaching 10M users: $25K upfront + 10% of $1M in attributable revenue = $125K total. The partnership model pays 12x — and Coker still owns the art."

**After:** "Worked example, not a specific contract. A product partnership for a tech campaign reaching 10M users at industry-comparable terms: ~$25K upfront + ~10% of ~$1M in attributable revenue = ~$125K total. The partnership model pays roughly 12x — and the designer still owns the art."

---

## 9. Systemic structure-mapping patterns (Phase 1 outputs)

These four patterns surfaced during the Phase 1 structure-mapping audit. Authoring discipline rules to prevent recurrence in new cases.

### #11 Franchise / Licensing Model — system replication only

Use only when a proven business system is being replicated by independent operators (Skillshare-style course licensing, franchise systems, wholesale distribution to many independent retailers).

❌ Do NOT use for:
- Single-buyer territorial / format / publication licensing → use **#28 Exclusive Licensing**
- Recording artist distribution deals → use #28
- Traditional book publishing → use **#25 Royalty Structures** (or #28 if it's the case's structural focus)
- Gallery representation → use #28

### #14 Catalog / IP Securitization — actual SPV/bond transactions only

Use only when the case body describes an actual financialization mechanism: SPV formation, bond issuance, institutional investors purchasing royalty streams (Bowie Bonds, Stargate's Shamrock deal, Sanderson exploring securitization for the Cosmere).

❌ Do NOT use for:
- "Catalog appreciating in cultural value over time" — that's not a financial transaction
- General "IP-as-asset" framings without an actual securitization
- A24's catalog valuation discussions until/unless an actual securitization transaction exists

### #15 DAO / Web3 Governance — actual blockchain governance only

Use only when the case body describes actual decentralized blockchain governance, smart-contract revenue distribution, or token-holder voting (e.g., Holly Herndon's Holly+).

❌ Do NOT use for:
- Web2 venture-backed creator platforms (Patreon, Substack, Craigstarter) → use **#12 Creator-as-Platform Model**
- Co-founder venture funding rounds → use **#18 Founder / Co-Founder Equity**
- Creative collaborations between named principals → use **#5 Co-Creation Joint Venture**

### #03 Project Equity Model — fees-for-stakes-in-client-companies only

Use only for the canonical pattern: a creative professional accepts reduced fees in exchange for equity in the client's business (a Series A startup, a brand, etc.).

❌ Do NOT use for:
- Film backend / first-dollar gross / adjusted gross participation → use **#22 Gross Participation**
- Net profit participation in film → use **#23 Net Profit Participation**
- Pre-sale of distribution rights → use **#28 Exclusive Licensing** (possibly + **#33 Milestone Payments** if advance-against-deliverables)

---

## 10. The anti-hedge rule

When softening unverified claims, do **not** reach for citation-hedge words that imply attribution without an actual source. The audit's anti-pattern is using these to "sound careful" while making no actual statement of evidence:

### ❌ Banned (citation hedges with no actual source)

- "reportedly"
- "according to industry sources"
- "industry watchers note"
- "it has been suggested"
- "is said to be"

### ✅ Required pattern when softening

Either name the actual evidence OR name the gap directly.

**Evidence-naming examples:**
- "documented in the Pollock interview cited in the verification block"
- "marked verified-high in the case's Verified Data Points"
- "publicly described by [creator] in [venue]"

**Gap-naming examples:**
- "specific contract terms are not on the public record"
- "no primary source has disclosed the deal structure"
- "the framing above describes how [structure type] typically works for [tier], not [creator]'s specific contract"

### Why this matters

"Reportedly" without a source is dishonesty pretending to be carefulness. It implies someone reported something we can point to, when no such report exists. The audit's central voice rule is the two registers — declarative when evidence supports, attributed when it doesn't. Citation-hedge words occupy the throat-clearing middle the rule bans.

---

## 11. Stat header chip conventions

Every metric in a case's stat header (top-of-case `stats:` frontmatter array AND in-body `<CbMetric>` blocks) carries an implicit confidence judgment. Estimated figures should carry the `estimated` prop/flag, which renders a small "Est." chip below the value. Disclosed figures get no qualifier.

### Two surfaces, one convention

**Top-of-case stat header (frontmatter):**

```yaml
stats:
  - value: "$7B"
    label: "Net Worth (2025)"
    estimated: true                   # Forbes estimate — flag
  - value: "$4.05B"
    label: "Disney Acquisition"        # SEC-verified — no flag
```

**In-body `<CbMetric>` blocks (MDX):**

```mdx
<CbMetric value="$7B" label="Net Worth (2025)" estimated />
<CbMetric value="$4.05B" label="Disney Acquisition Price" />
```

Both surfaces render the same chip styling — `cs-stat-est` and `cb-metric-est` use shared CSS rules.

### Rubric: when to flag a metric as estimated

**Mark estimated:**
- Contains `~` prefix (e.g., `~$10M`, `~50`)
- Contains `+` after a financial figure where the suffix signals "at least N" (e.g., `$20B+`, `$2.8M+`)
- Forbes / Bloomberg / Celebrity Net Worth figures
- Lifetime merchandise totals (industry estimates, not audited)
- Annual revenue figures unless from public-company filings
- Subscriber counts when self-reported with `+`
- Tour gross figures unless disclosed by the artist/promoter
- Derived multiples (`12x ROI`, `14,000x Return`)
- Catalog valuations (most are analyst estimates)
- "Est." or "Estimated" appearing in label

**Don't mark as estimated:**
- Years and dates (`2014`, `Sept 17, 2019`)
- Time spans where the lower bound is verifiable (`13+ yrs of operation`, `30 yrs`)
- Specific named transactions verified by SEC filings, official press releases, or named primary interviews — even with rough rounding (e.g., `$4.05B Disney Acquisition`, `$1.347B Black Panther`, `$370.2M Sinners`)
- Awards counts (`4 Personal Oscars`, `12 Tony Noms`, `Coretta Scott King Honor`)
- Box office numbers from Box Office Mojo
- Trade-press-disclosed deal values (e.g., `$22M Ti Amo! Distribution Deal`)
- Award/honor names
- Counts that are publicly visible in third-party systems (`8,500+ Retail Stores` if verified via Walmart/Target listings)
- Categorical or sequential labels (`3 Structures Applied`)

**Borderline — judgment call:**
- Subscriber counts: `72M+ YouTube Subscribers` is platform-verified; `100K+ Instagram Following` with `+` leans estimated
- Multi-year revenue figures: `$80M+ 2024 Revenue` — `+` typically estimated; lean estimated unless case body cites a specific public source

### Calibration anchor

The case's `confidence:` frontmatter (set in Phase 6.2) is a useful prior:
- **disclosed** cases: most metrics verified, flag only obvious estimates (Forbes net worth, lifetime merch, `+`/`~` prefixes, derived multiples). Lucas's 4 stats include 3 estimated.
- **mixed** cases: more aggressive flagging. Annual revenues, valuations, deal-side estimates. A24's 4 stats include 3 estimated.
- **inferred** cases: most metrics estimated. Temi-coker's stats are mostly flagged.

But the case-level confidence is just a prior. Apply per-metric judgment regardless. Even disclosed cases have estimated metrics (Forbes net worth, lifetime totals); even inferred cases may have a verifiable metric.

### Visual treatment

The "Est." chip is intentionally subtle — quiet annotation, not a separate badge. Mono small caps, slightly muted color, positioned below the figure but inside the metric block. Style matches `--mid` color tone.

---

## 12. Verification block structure

Every case study ends with a `<CbSources>` block that wraps a "Sources & Verification" toggle. The block contains five sub-sections in this canonical order:

1. **Verification Info** (`<CbSourceGroup title="Verification Info">`) — 2–3 short bullets describing the overall confidence character of the case. What's disclosed vs. estimated vs. privately held.
2. **Primary Sources** (`<CbSourceGroup title="Primary Sources">`) — Named sources, linked where possible. Interviews, SEC filings, press releases, official sites.
3. **Secondary Sources** (`<CbSourceGroup title="Secondary Sources">`) — Named secondary sources, linked where possible. Trade press, analysis, encyclopedic references.
4. **Verified Data Points** (`<CbVerifiedDataPoints>` with `<CbDataPoint confidence="...">` children) — Bulleted list of the case's key factual claims with confidence levels. Three values: `confidence="very-high"`, `confidence="high"`, `confidence="medium"`. The new component renders the confidence as a chip after the claim text.
5. **Gaps to Verify** (`<CbSourceGroup title="Gaps to Verify">`) — Bulleted list of what isn't disclosed.

### Canonical reference: `george-lucas`

`content/case-studies/george-lucas.mdx` is the canonical reference. Read its `<CbSources>` block before writing or auditing a verification block.

### Component reference

```mdx
<CbSources>
  <CbSourceGroup title="Verification Info">
    <CbSourceItem>...</CbSourceItem>
  </CbSourceGroup>
  <CbSourceGroup title="Primary Sources">
    <CbSourceItem>...</CbSourceItem>
  </CbSourceGroup>
  <CbSourceGroup title="Secondary Sources">
    <CbSourceItem>...</CbSourceItem>
  </CbSourceGroup>
  <CbVerifiedDataPoints>
    <CbDataPoint confidence="very-high">Disney acquisition $4.05B — SEC filings</CbDataPoint>
    <CbDataPoint confidence="high">Salary reduction $500K → $150K — Deadline, NFS, CNW</CbDataPoint>
    <CbDataPoint confidence="medium">Net worth $7B — Forbes 2025</CbDataPoint>
  </CbVerifiedDataPoints>
  <CbSourceGroup title="Gaps to Verify">
    <CbSourceItem>...</CbSourceItem>
  </CbSourceGroup>
</CbSources>
```

### Confidence calibration

- **`very-high`** — primary-source verified (SEC filing, official press release, named on-record interview, court filing). The claim is essentially indisputable.
- **`high`** — multiple independent secondary sources agree, or one strong primary source. Industry-standard reporting context.
- **`medium`** — single source, self-reported, or inferred from comparables. Use this when the claim is plausible but not independently confirmed.

### Library state (post-audit)

All 98 case studies have populated `<CbVerifiedDataPoints>` blocks with confidence-rated `<CbDataPoint>` items. Library total: ~1,094 data points across the corpus. The format-restructure pass (Phase 6.1.a) and the editorial generation pass (Phase 6.1.b, with calibration gate against Neil's judgment) shipped together in May 2026.

**Known structural drift (carry-forward for future polish):**
- 4 cases use `<CbSourceGroup title="Verification Notes">` instead of "Verification Info" — emma-chamberlain, jason-fried, mark-rober, sahil-lavingia
- 9 cases use multiple themed Primary Sources groups instead of a Primary / Secondary split — aries-moross, ava-duvernay, coralie-fargeat, liz-lambert, mikkel-eriksen-stargate, ryan-coogler, sean-baker, steph-smith, tina-roth-eisenberg
- 6 cases drift to Primary → Verification Info → Gaps ordering (no Secondary subsection) — bjarke-ingels, emily-cohen, jeremy-o-harris, loveis-wise, rich-tu, timothy-goodman
- 4 cases have Verification Info + Primary + Gaps but no Secondary — paul-trillo, tash-sultana, temi-coker, virgil-abloh
- ohneis-andries-ohneisser uses non-canonical title "Gaps to Verify (Outreach Recommended)"
- sahil-lavingia has no Gaps to Verify subsection at all

These are title and ordering issues, not structural — the component is in place across all 98 cases. Worth a focused polish pass when the audit's other carry-forward items are cleaned up.

---

## 13. The "What Wouldn't Transfer" lesson

Every case study must close its Transferable Lessons accordion with a card titled **"What Wouldn't Transfer"** (or the equivalent "What Would Not Transfer" — the contraction is preferred but pre-existing label variants are tolerated). The lesson is required across all 98 cases regardless of data confidence level. It is a quality marker, not a disclosure mechanism for inferred cases.

Why it's load-bearing: the case's other lessons name the moves that worked. Without a "What Wouldn't Transfer" close, the reader walks away thinking the moves are universally applicable. They aren't. The honest case names what was singular about the creator's position AND what's still actionable for the reader anyway.

### Card position and structure

Insert the card as the **final** card in the existing `<CbAccordion>` inside `<CbSection id="lessons">`. The card's `num=` is one greater than the last existing card (most cases land at `num="06"` after 5 prior lessons). Two paragraphs total, both wrapped in `<p className="cb-card-text">`:

```mdx
  <CbAccordionCard num="06" label="What Wouldn't Transfer">
    <p className="cb-card-text">[Para 1 — wouldn't-transfer factors]</p>
    <p className="cb-card-text">[Para 2 — closing transferable-pattern turn]</p>
  </CbAccordionCard>
</CbAccordion>
```

### Paragraph 1 — Wouldn't-transfer factors

3–4 factors, each opening with a **bold lead phrase** followed by a one-sentence reason. Each factor must be specific to the creator's circumstances. Generic factors ("hard work pays off", "talent matters", "right place right time") are wrong — they're not specific enough to be useful.

Pull factors from these five source categories:

1. **Scale** — institutional capital, audience size, headcount, multi-property catalogs that take decades to build
2. **Timing** — specific industry moment, generational catalyst, founding-era window, technology inflection
3. **Network** — institutional door-openers, mentor relationships, tier-1 access, capital networks
4. **Identity** — constitutive identity factors, geographic-cultural authority, lineage credentials
5. **Discipline accident** — genre economics, specific industry mechanics that don't generalize across disciplines

For **heavy-inference cases** (Verification Info notes "estimated" / "industry-comparable"), include a financial-data caveat as the closing factor: `**Financial data is estimated.** Specific deal terms are not public; figures are based on industry comparables for [the relevant tier].`

3 factors + caveat for inferred cases. 4 factors (no caveat) for institutional/well-disclosed cases.

### Paragraph 2 — Closing transferable-pattern turn

This is the most important part of the lesson. **Do not omit it.** A WWT card without a closing turn is a disclaimer, not a lesson — it tells the reader what was singular without telling them what's still actionable. Required structure:

1. **Opens with `**But [the structural pattern] is universal.**`** (or close variant: "But the X transfers completely" / "But the Y is universal" — the bold-lead with **But** is required).
2. **Names 3–5 transferable moves in concrete, actionable language** a Creative Majority practitioner could apply tomorrow. The moves should come from the case's existing lessons (cards num=01 through num=05) restated in transfer-mode, not invented.
3. **Closes with a sentence anchoring to the case's specific scale**, not generic boilerplate. Required form: "These principles work whether [scale extreme A] or [scale extreme B]." Examples: "whether the firm is 700 people or 7" / "whether the operating budget is $80M or $80K" / "whether the catalog is one boutique hotel or twelve" / "whether the licensee is Apple or a regional brand."

### Length targets

- Paragraph 1: ~95–120 words (3 factors), or ~120–145 words (4 factors with caveat)
- Paragraph 2: ~60–90 words

If you go much longer, edit down. If much shorter, you may be missing factors or missing the close.

### Anti-patterns

- **Missing closing turn.** A WWT card with only the wouldn't-transfer paragraph is voice-register drift. Phase 5 Stream B fixed 13 cases with this pattern; the canonical drift case was `brett-williams` before its fix.
- **Generic factors.** "Talent." / "Hard work." / "Right place, right time." Not specific to the case.
- **Closing turn boilerplate.** "These principles work at any scale" alone is not enough. Always close with case-specific scale extremes.
- **Closing turn that invents new moves.** The transferable moves must come from the case's actual lessons (cards num=01 through num=05) restated in transfer-mode — not new principles introduced for the first time in the WWT.
- **Hedging without source** (the §10 anti-hedge rule applies). "Reportedly," "according to industry sources" without an actual source is banned.

### Canonical references

Read these to internalize the voice register:

- `content/case-studies/tyler-the-creator.mdx` — original canonical reference, ecosystem-architecture register
- `content/case-studies/temi-coker.mdx` — heavy-inference register (financial-data caveat as 4th factor)
- `content/case-studies/a24.mdx` — institutional-mixed register, slate-economics framing
- `content/case-studies/bjarke-ingels.mdx` — long-career platform-builder register
- `content/case-studies/loveis-wise.mdx` — identity-aligned authorship register
- `content/case-studies/liz-lambert.mdx` — long-career founder register, third-act framing

---

## 14. Related-cases conventions

Every case study ends with a `<CbRelated>` block inside `<CbSection id="related">`. Two conventions govern what goes in it.

### Selection: aim for at least 3 of 5 relational axes

A case's Related cards should collectively pull from at least **3 of these 5 axes** (a single card can satisfy multiple axes):

1. **Structural overlap** — same Structure # appears in another case
2. **Outcome contrast** — what happened when someone *didn't* do this; the cautionary parallel
3. **Stage progression** — the same structural move at a different career stage (Stage 2 → Stage 3 endpoint, or earlier-stage antecedent)
4. **Discipline contrast** — the same structure used in a different discipline
5. **Counterfactual** — the opposite structural choice produced a different outcome

The 3-axis aspiration is the target, not a hard test. Most existing cases sit at coverage `{1, 4}` — structural overlap plus discipline contrast — because case-card desc lines have historically been descriptive ("Another holding-company case — different model, same principle") rather than relational. That's tolerable but underwired. New cases should aspire to richer axis coverage by writing **relational** desc lines.

### Desc-line templates (prefer relational over descriptive)

The fastest way to lift a Related block from coverage `{1, 4}` to `{1, 2/3/4/5}` is to rewrite at least one desc line using one of these explicit relational forms:

| Axis | Desc-line template | In-library models |
|------|--------------------|-------------------|
| Axis 2 (outcome contrast) | "When this didn't work — ..." / "The cautionary version: ..." / "What happens without [structure] — ..." / "Another broken flywheel — ..." | donald-glover (chance-the-rapper card) |
| Axis 3 (stage progression) | "Earlier in the same arc — ..." / "Stage-3 endpoint of the same playbook — ..." / "Before [milestone] they ..." | (added in Phase 4 auto-updates: emma-chamberlain → charli-marie) |
| Axis 5 (counterfactual) | "Counter-case: ..." / "Instead of X, this person did Y" / "The alternative path — ..." / "The opposite choice — ..." | taylor-swift ("Counter-case:" twice), chase-jarvis ("the alternative") |

Descriptive desc lines ("another X case — Y") aren't wrong, but they make the relationship invisible to the reader and to any tooling that classifies cards by axis. Prefer relational framing.

### Authoring expectation

A new case's `<CbRelated>` block should contain:

1. **2–3 structure cards** for the structures the case applies (axis 1 by definition)
2. **2–3 case cards** linking to peer cases, with at least one desc line written in a relational form (axis 2/3/5)

Avoid Related blocks that are **structure-only** (no case cards) — these are discoverability gaps. The Phase 4 auto-update pass landed on 14 cases that had this pattern; fill it from the start.

### Recency cap (paused as of May 2026)

The original convention included a 50%-recency cap on case-card links — no more than half of a case's case-card cross-references should point to cases published within the last 90 days. This cap is **paused** until the library has a wider age distribution. Every existing case has `publishedAt >= 2026-02-25` (Phase 0 backfilled `publishedAt = updatedAt`), so the 90-day cutoff lands at zero pre-cutoff cases — the cap is structurally unsatisfiable. Revisit when the library matures or when a Phase 0 follow-up uses git first-touch dates instead of `updatedAt` for `publishedAt`.

### Canonical references

- `content/case-studies/taylor-swift.mdx` — model for axis-5 "Counter-case:" framings
- `content/case-studies/donald-glover.mdx` — model for axis-2 "Another broken flywheel" framing + axis-5 "the contrast"
- `content/case-studies/chase-jarvis.mdx` — model for axis-5 "the alternative"
- `content/case-studies/emma-chamberlain.mdx` (post-Phase-4) — model for axis-3 "Earlier in the same arc"

---

## Authoring checklist for new case studies

When writing or substantially editing a case study, walk through this checklist:

1. **Voice register** — Is every claim in either Register A (declarative, evidence-supported) or Register B (attributed, gap-named)? No throat-clearing middle.
2. **Verification block** — Have you populated Sources & Verification (all five subsections per §12) with confidence ratings? Body claims should not outrun what the verification block can support (per §2).
3. **Three-verb system** — For every `<CbStructureBadge>` reference in body prose, is the preceding verb at the right tier (per §3)? Default to the more conservative tier when uncertain.
4. **Pattern 6 disclosure** — Does the thesis paragraph end with a voice-tuned analytical-framing disclosure sentence (per §4)?
5. **Body-softening** — Do body claims (drop-cap, paragraphs, pull-quote, section intros, accordion cards, lesson cards, tab notes) avoid asserting deal mechanism / IP retention / specific contract terms / career-long behaviors as fact when those claims aren't in the verification block (per §5)?
6. **Pattern 1** — Are all specific dollar figures attached to specific named deals either verified-high in Verified Data Points or framed as industry-comparable ranges with named gap (per §6)?
7. **Pattern 2** — Are cumulative / annual revenue claims qualified as estimated unless from public-company filings or other publicly verifiable sources (per §7)?
8. **Pattern 3** — Do rate-range tables and deal comparison tabs carry industry-comparable framing in their titles / labels / tab notes when the rates aren't creator-specific (per §8)?
9. **Structure mapping** — Are the structures attributed actually the right structures for what the case body describes? Re-read §9 for the four systemic mismapping patterns to avoid.
10. **Anti-hedge** — Have you avoided every banned phrase from §10? Either name evidence or name gap.
11. **"What Wouldn't Transfer" lesson** — Is the case's Transferable Lessons section closed by a "What Wouldn't Transfer" item per the §13 convention?
12. **Related cases** — Does the `<CbRelated>` block include 2–3 case cards (not just structure cards) with at least one desc line written in a relational form (axis 2 / 3 / 5) per §14?
13. **Stat header chips** — Have you added `estimated: true` (frontmatter `stats:`) and `estimated` (in-body `<CbMetric>`) to metrics whose values are estimates rather than disclosed/verified figures (per §11)? And set the case-level `confidence:` frontmatter field (per §12)?

When in doubt about any of these, read the corresponding section of the calibration exemplar (`george-lucas` for high-disclosure; `temi-coker` for heavy-inference; `tyler-the-creator` for analytical-framing) and pattern-match.

---

## Provenance

This document was created during the May 2026 case study audit and reflects calibration learnings from every phase: structure-mapping (Phase 1), language patterns (Phase 2), era audit (Phase 3), Related-cases conventions (Phase 4 → §14), the "What Wouldn't Transfer" lesson (Phase 5 → §13), Verification block structure (Phase 6.1.a → §12), Verified Data Points generation (Phase 6.1.b — pressure-tested the verification conventions), Confidence Badge component (Phase 6.2), Stat header chip conventions (Phase 6.3 → §11), and the closing polish (Phase 7a + 7b). All 14 numbered sections are populated. Component documentation lives in the sister doc `case-study-components.md`.

Five gold-standard exemplars are referenced throughout. Read them in full before writing or auditing a case:

- `content/case-studies/george-lucas.mdx` — high-disclosure, primary-sourced behaviors
- `content/case-studies/a24.mdx` — institutional voice, mixed-confidence
- `content/case-studies/temi-coker.mdx` — heavy-inference, full body-softening register applied
- `content/case-studies/tyler-the-creator.mdx` — analytical-framing-heavy, defiant voice
- `content/case-studies/reese-witherspoon.mdx` — analytical / case-method voice
