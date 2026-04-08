# The Deal Evaluator — Product Spec
## In Sequence Member Portal · Interactive Decision Framework
### Version 2.0 · February 2026

---

## What This Is

A single interactive tool that helps creative professionals answer the question: **"Should I take this deal?"**

Not a document to read. Not a guide to study. A tool you use when you're staring at a contract, a handshake offer, or an email with terms — and you need clarity before you respond.

The Deal Evaluator walks members through a structured evaluation of any deal they're considering, surfaces the specific risks and opportunities in that deal, tells them what to negotiate, and connects them to the exact library resources they need. It's the spine of the entire In Sequence knowledge base, delivered at the moment of maximum relevance.

---

## Relationship to the Strategic Assessment

The Deal Evaluator and the Strategic Assessment are two tools in a connected system:

| | Strategic Assessment | Deal Evaluator |
|---|---------------------|----------------|
| **Question** | "Where am I in my career?" | "Should I take this specific deal?" |
| **Frequency** | Quarterly | As-needed (deal by deal) |
| **Output** | Strategic roadmap, stage placement, 3 actions | Go/no-go signal, negotiation actions, library resources |
| **Data** | Career-level (income, skills, goals, portfolio) | Deal-level (terms, partner, structure, risk) |
| **Timing** | Reflective (looking back and forward) | Urgent (decision deadline approaching) |

The assessment is the map. The evaluator is the compass at a specific fork in the road.

**When the assessment is completed,** the evaluator gets dramatically smarter: it skips redundant questions, uses assessed stage (more accurate than self-reported), surfaces contextual warnings from misalignment flags, and connects the verdict to the member's roadmap. When it hasn't been completed, the evaluator works as a fully standalone tool.

The spec below is written with assessment integration as a first-class feature — not a bolt-on. Every section notes how behavior adapts based on assessment state.

---

## Assessment Context Object

When a member with a completed assessment opens the Deal Evaluator, the system loads their assessment context:

```typescript
type AssessmentContext = {
  hasAssessment: boolean;
  
  // From assessment (null if hasAssessment = false)
  detected_stage: 1 | 2 | 3 | 4 | null;
  stage_score: number | null;                    // raw weighted score (e.g., 1.75)
  transition_readiness: 'low' | 'moderate' | 'high' | null;
  creative_mode: 'maker' | 'service' | 'hybrid' | 'performer' | 'builder' | 'transition' | null;
  discipline: string | null;
  sub_discipline: string | null;
  income_range: string | null;
  income_structure: Record<string, number> | null;  // {salary: 20, fees: 60, royalties: 10, ...}
  equity_positions: string | null;
  demand_level: string | null;
  business_structure: string | null;
  risk_tolerance: string | null;                   // from Q-AMB-2
  misalignment_flags: string[] | null;
  archetype_primary: string | null;
  archetype_secondary: string | null;
  
  // From roadmap (null if no roadmap generated yet)
  roadmap_actions: {
    order: number;
    type: 'foundation' | 'positioning' | 'momentum';
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  }[] | null;
  recommended_structures: number[] | null;         // structure IDs from roadmap
  
  // From advisor infrastructure questions (Stage 3 pool, may be null)
  has_advisors: string | null;                     // from Q-S3-ADVISORS
  financial_management: string | null;             // from Q-S1-FIN or Q-S3-ADVISORS
};
```

This object is loaded once at evaluator entry and referenced throughout the flow. Questions check `assessmentContext.hasAssessment` to determine whether to ask, skip, or pre-fill.

---

## The Core Insight

Every deal a creative professional encounters, regardless of industry or structure type, can be evaluated across six dimensions. The weight of each dimension shifts depending on the deal type, but the dimensions themselves are universal:

1. **Financial Readiness** — Can you afford the terms of this deal?
2. **Career Positioning** — Does this deal move you forward or sideways?
3. **Partner Quality** — Is the other party trustworthy and capable?
4. **Deal Structure Quality** — Are the terms fair and well-constructed?
5. **Risk Profile** — What could go wrong, and can you absorb it?
6. **Legal & Tax Readiness** — Are you prepared for the complexity?

A deal that scores green across all six dimensions is rare — and when you find one, move fast. Most deals score mixed: strong on some dimensions, weak on others. The evaluator's job is to make those tradeoffs visible so the member can decide with clarity instead of anxiety.

---

## User Entry Points

Members arrive at the Deal Evaluator from three contexts, each requiring a different entry experience:

### Entry Point 1: "I Have a Specific Deal"
The member has a contract or offer in hand. They know the terms (or most of them). They need evaluation.

→ Route to: **Full Evaluation Flow**
- With assessment: ~15-18 questions, 5-8 minutes
- Without assessment: ~22-28 questions, 8-12 minutes

### Entry Point 2: "I'm Exploring a Type of Deal"
The member is considering pursuing a structure but hasn't received an offer yet. They want to know if they're ready.

→ **With assessment:** Redirects to roadmap with filtered view. "Your roadmap already maps your readiness. Here's what it says about [deal type] deals at your stage." Then offers: "Want to evaluate a specific deal instead?" and "Want to take the full assessment?" (if roadmap is incomplete or stale).
→ **Without assessment:** Routes to **Readiness Assessment** (shorter, 10-15 questions, 5-7 minutes, focused on Dimensions 1-3 and 6). Output includes: "Want a full strategic assessment? [Take the assessment →]"

### Entry Point 3: "I'm Comparing Two Deals"
The member has multiple offers and needs to choose.

→ Route to: **Comparison Mode** (runs Full Evaluation on both, outputs side-by-side analysis)

### Entry Screen Design

**With assessment completed:**

The entry screen opens with a personalized header:

> **Stage 2: Judgment Positioning** · Archetype: The Established Practitioner
> 
> Based on your assessment, the deal types most relevant to your stage are **Advisory Roles** and **Equity Deals**.
> 
> [Evaluate an advisory deal →] [Evaluate an equity deal →]
>
> [I have a different type of deal] [I'm comparing two deals]

Below: "Your Past Evaluations" showing saved evaluations with date, deal name, and traffic light.

**Without assessment:**

Standard entry screen. Three entry points as large cards:
- "I Have a Specific Deal" → Full Evaluation
- "Am I Ready for This Type of Deal?" → Readiness Assessment
- "I'm Comparing Two Deals" → Comparison Mode

Below: "Your Past Evaluations" + subtle nudge: "Complete your strategic assessment for more precise evaluations. [Take the assessment →]"

---

## Creative Mode: Language Adaptation

The evaluator adapts its language based on creative mode. For members with a completed assessment, this comes from `assessmentContext.creative_mode`. For members without, the evaluator asks one question before deal identification:

**Pre-Question (no assessment only): "How does your creative work reach the world?"**

*UI: Select one. Same as Assessment Q2.*

- I make things and sell/license them directly → `maker`
- I make things for clients or employers → `service`
- I do both — personal creative work + client/commercial work → `hybrid`
- I perform, direct, or lead creative projects → `performer`
- I'm building something — a studio, label, brand, or creative business → `builder`
- I'm between things or figuring it out → `transition`

**Language adaptation map:**

| Default (`service`) | `maker` | `performer` | `builder` |
|---------------------|---------|-------------|-----------|
| client | buyer / gallery / collector | production / venue / label | partner / collaborator |
| scope of work | the work / the piece / the project | the role / the production | the venture / the project |
| normal rate | market value of work like this | standard compensation for this type of role | comparable deal terms |
| deliverables | the work product | your performance / contribution | milestones / deliverables |
| project fees | sales / commissions | performance fees / day rates | revenue / investment |
| portfolio / resume | body of work / catalog | credits / appearances | ventures / track record |

This adaptation applies to all question text, interstitial descriptions, and verdict page language. Stored as `creative_mode` on the evaluation record.

---

## Deal Type Identification

Before evaluation begins, the system needs to identify what kind of deal this is. This determines which questions are asked and how dimensions are weighted.

### Step 1: Category Selection

The member selects one:

| Category | Description | Routes To |
|----------|-------------|-----------|
| Service Agreement | "Someone wants to hire me for a project or ongoing work" | Service path |
| Equity Deal | "I'm being offered ownership stake in a company" | Equity path |
| Licensing Deal | "Someone wants to use my work, or I want to license something" | Licensing path |
| Partnership / JV | "We're building something together with shared ownership" | Partnership path |
| Revenue or Profit Share | "My pay is tied to how well something performs" | Revenue path |
| Advisory Role | "They want my strategic guidance, not my execution" | Advisory path |
| I'm Not Sure | "I have terms in front of me but I don't know what to call this" | Identification flow |

**Description text adapts by creative mode.** Example for `maker`: "Someone wants to buy, commission, or license my work" (Service), "A gallery, brand, or publisher wants ongoing rights to use my work" (Licensing).

### Step 2: "I'm Not Sure" — Deal Identification Flow

Five qualifying questions that route to the correct path:

**Q1: "Are you being asked to do hands-on work (design, write, build, create)?"**
- Yes → likely Service or Equity deal
- No → likely Advisory, Licensing, or Partnership

**Q2: "Will you receive ownership (stock, equity, membership interest) in a company?"**
- Yes → Equity path (or Partnership if Q3 = Yes)
- No → Service, Licensing, or Revenue path

**Q3: "Are you and another party creating something new together that neither owns alone?"**
- Yes → Partnership path
- No → continues to Q4

**Q4: "Is your payment tied to how well the project/product/company performs?"**
- Yes → Revenue path (or Equity if Q2 = Yes)
- No → Service or Licensing path

**Q5: "Are you giving someone permission to use work you've already created (or will create and retain ownership of)?"**
- Yes → Licensing path
- No → Service path

**Output:** "Based on your answers, this looks like a [Deal Type]. Here's what that means in 2 sentences." + "Does that sound right?" (Yes / No, let me pick manually)

### Step 3: Structure Mapping

Once deal type is identified, the system maps to the most relevant In Sequence structures. This mapping determines which structure-specific questions are included and which library resources are surfaced in the output.

| Deal Category | Primary Structures | Secondary Structures |
|--------------|-------------------|---------------------|
| Service Agreement | #1 Premium Service, #2 Retainer + Bonus | #26 Hybrid Fee + Backend |
| Equity Deal | #3 Project Equity, #17 Equity-for-Services, #18 Founder Equity, #19 Vesting, #20 Performance Equity | #21 Convertible Notes |
| Licensing Deal | #27 Non-Exclusive, #28 Exclusive, #29 Rights Reversion, #30 Subsidiary Rights, #31 Territory/Media Splitting | #25 Royalties |
| Partnership / JV | #5 Co-Creation JV, #6 Product Partnership, #8 Creative Collective | #7 Platform Cooperative |
| Revenue / Profit Share | #22 Gross Participation, #23 Net Profit, #24 Revenue Share, #25 Royalties | #34 Profit Participation + Mgmt Fee |
| Advisory Role | #4 Advisory/Consultant | #2 Retainer + Bonus, #26 Hybrid |

**With assessment:** Structure recommendations are further filtered by the member's `recommended_structures` from their roadmap. Structures that appear in both the deal-type mapping AND the roadmap are highlighted as "Recommended for Your Stage."

---

## The Six Evaluation Dimensions

Each dimension below specifies: universal questions (all deal types), deal-type-specific additions, assessment integration behavior, and scoring weight.

### Dimension 1: Financial Readiness

**What it measures:** Can you afford the economic terms of this deal — both the upfront reality and the downstream implications?

**Universal questions (all deal types):**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| F1 | What's the total cash compensation in this deal? | Currency input | Context-dependent (compared to F2) | Always ask (deal-specific) |
| F2 | What would your normal market rate be for this scope of work? | Currency input | Cash ratio = F1/F2. Below 40% = red. 40-70% = yellow. 70%+ = green. | Always ask (deal-specific) |
| F3 | Do you have savings or other income to cover your expenses if this deal pays less than your normal rate? | Scale: Comfortably / Tight but manageable / Would create hardship | Hardship = red flag | **Skip if assessment.** Infer from `income_range` + `income_structure`. If 70%+ of income is from fees/salary and income < $150K → auto-score as "Tight." If diversified or income > $300K → "Comfortably." Member can override. |
| F4 | How many months of living expenses do you have in savings? | Number input | Under 3 = red. 3-6 = yellow. 6+ = green. | Always ask (assessment doesn't capture savings) |
| F5 | What percentage of your total income would this deal represent? | Percentage slider | Over 50% = yellow flag (concentration risk). Over 75% = red. | **Pre-fill if assessment.** Calculate from F1 ÷ midpoint of `income_range`. Member sees pre-filled value with "Based on your assessment" label. Can adjust. |

**Equity-specific additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| F6 | What equity percentage are you being offered? | Percentage input | Compared against ranges from structure docs by company stage | Always ask |
| F7 | At what valuation is the equity being calculated? | Currency input | Cross-referenced with F8 | Always ask |
| F8 | Is this based on a 409A valuation, last funding round, or the company's own estimate? | Select: 409A / Funding round / Company estimate / Don't know | Company estimate = yellow flag. Don't know = red flag. | Always ask |
| F9 | What's the ratio of equity value to cash foregone? | Auto-calculated from F1, F2, F6, F7 | Pre-seed: need 3-5x. Seed: 2-4x. Series A: 1.5-3x. Series B+: 1-2x. Below threshold = red. | Auto-calculated |
| F10 | Can you afford to wait 3-7 years for this equity to become liquid? | Yes / Probably / No | No = red flag for equity deals | **Inform with assessment.** If `risk_tolerance` = "Conservative" → pre-select "Probably" and note: "Your assessment noted conservative risk tolerance. Consider whether this timeline works." |

**Revenue/profit share additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| F11 | Is there a guaranteed minimum payment regardless of performance? | Yes + amount / No | No minimum = yellow flag | Always ask |
| F12 | How is revenue/profit defined in the agreement? | Select: Gross revenue / Adjusted gross / Net profit / Not specified | Net profit = yellow flag. Not specified = red flag. | Always ask |
| F13 | Are there deductions, fees, or costs subtracted before your share is calculated? | Yes / No / Don't know | Yes or don't know = trigger follow-up questions | Always ask |

**Licensing additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| F14 | Is the license fee one-time or recurring? | One-time / Recurring / Royalty-based | One-time for exclusive = yellow flag | Always ask |
| F15 | Does the fee scale with usage, distribution, or revenue? | Yes / No / Partially | No for broad usage = red flag | Always ask |

**Scoring weight by deal type:**

| Deal Type | Financial Readiness Weight |
|-----------|--------------------------|
| Service Agreement | 20% |
| Equity Deal | 30% (highest — cash sacrifice is real) |
| Licensing | 15% |
| Partnership / JV | 25% |
| Revenue / Profit Share | 25% |
| Advisory | 15% |

---

### Dimension 2: Career Positioning

**What it measures:** Does this deal strengthen your trajectory — moving you toward ownership, leverage, and the next stage — or does it pull you sideways or backward?

**Universal questions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| C1 | Which stage best describes your current position? | Select: Execution ($75-200K) / Judgment ($200-500K) / Ownership ($500K-2M+) / Capital ($2M+) | Sets context for all positioning questions | **Skip if assessment.** Use `detected_stage`. Display as informational: "Based on your assessment: Stage 2 — Judgment Positioning." Not editable (to prevent self-inflation — the assessment's behavioral signals are more accurate than self-report). |
| C2 | Does this deal move you toward or away from the next stage? | Select: Clearly toward / Neutral / Not sure / Clearly away | Away = red. Not sure = yellow. | Always ask (deal-specific judgment) |
| C3 | Will this deal be visible in your portfolio or on your resume? | Yes, prominently / Somewhat / No, it's under NDA or white-label | White-label with no other value = yellow flag | Always ask. Language adapts: `maker` → "your body of work." `performer` → "your credits." |
| C4 | Does this deal give you new access — to networks, markets, skills, or audiences you don't currently have? | Yes, significant / Some / No | Significant access can offset financial concerns | Always ask. Language adapts by creative mode. |
| C5 | If this deal succeeds, does it make future deals easier to negotiate? | Yes / Neutral / No, it might lock me in | Lock-in = red flag | Always ask |
| C6 | Does this deal require you to do work below your current capability? | Yes, mostly / Some / No, it stretches me | Mostly below = yellow flag (regression) | Always ask |

**Stage-specific additions (determined by `detected_stage` or C1 answer):**

*Stage 1 (Execution) members:*

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| C7 | Does this deal position you as a specialist or a generalist? | Specialist / Generalist / Neither | Specialist = green for Stage 1 | Always ask |
| C8 | Will the other party see you as a strategic partner or a vendor? | Strategic partner / Vendor / Not clear | Vendor-only at Stage 1 = neutral (expected). Vendor at Stage 2+ = yellow. | Always ask. Language adapts: `maker` → "a creative they want to collect/represent" vs. "one of many artists on their roster." |

*Stage 2 (Judgment) members:*

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| C9 | Are you being asked for your judgment ("what should we do?") or your execution ("can you do this?")? | Judgment / Execution / Both | Pure execution at Stage 2 = yellow | Always ask. **With assessment:** If `what_they_pay_for` from assessment already indicated judgment-level work, note: "Your assessment showed you're already delivering judgment-level value. This deal should reflect that." |
| C10 | Does this deal include any ownership, equity, or participation component? | Yes / No, but I could propose it / No, and it's not appropriate | No with no path to it at Stage 2 = flag for exploration | Always ask |

*Stage 3+ (Ownership/Capital) members:*

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| C11 | Does this deal add a new asset to your portfolio (equity position, IP, revenue stream)? | Yes / No | No at Stage 3+ = yellow (should be accumulating) | Always ask. **With assessment:** If `equity_positions` shows 4+ positions, this is confirmation. If 0-1, this is a growth area. |
| C12 | Does this deal create leverage for other deals in your portfolio? | Yes / Neutral / No | Portfolio synergy is a green signal | Always ask |

**Scoring weight by deal type:**

| Deal Type | Career Positioning Weight |
|-----------|--------------------------|
| Service Agreement | 25% |
| Equity Deal | 20% |
| Licensing | 20% |
| Partnership / JV | 20% |
| Revenue / Profit Share | 15% |
| Advisory | 30% (highest — advisory is pure positioning) |

---

### Dimension 3: Partner Quality

**What it measures:** Is the person or organization on the other side of this deal trustworthy, capable, and likely to fulfill their commitments?

**Universal questions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| P1 | How long have you worked with this person/company? | Select: First time / Under 1 year / 1-3 years / 3+ years | First time with complex deal = yellow flag | Always ask |
| P2 | Do they have a track record of successful projects or businesses? | Strong track record / Some successes / Unproven / Don't know | Don't know = yellow. Unproven + complex deal = red. | Always ask. Language adapts by mode. |
| P3 | Have they treated other creative partners fairly? | Yes, I've verified / I believe so / Don't know / I've heard concerns | Heard concerns = red flag | Always ask |
| P4 | Are they financially stable? | Yes, well-funded or profitable / Adequate / Tight / Don't know | Tight or don't know + equity deal = red flag | Always ask |
| P5 | How transparent have they been about terms, financials, and expectations? | Very transparent / Reasonably / Somewhat evasive / Actively opaque | Evasive or opaque = red flag | Always ask |
| P6 | Do they have a history of scope creep, delayed payments, or changing terms mid-project? | No / Occasionally / Yes / Don't know | Yes = red flag | Always ask |
| P7 | Is there a clear decision-maker, or will your work be subject to committee approval? | Clear decision-maker / Small group / Large committee / Unclear | Large committee = yellow flag (scope/revision risk) | Always ask |

**Equity-specific additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| P8 | Does the founding team have prior startup experience? | Yes, with exits / Yes, without exits / First-time founders | First-time + pre-seed = highest risk (flag, don't block) | Always ask |
| P9 | Is the company funded, and how much runway do they have? | 18+ months / 12-18 months / Under 12 months / Not funded | Under 12 months = yellow. Not funded = red. | Always ask |
| P10 | Has the company achieved product-market fit? | Clear PMF / Early signals / Not yet / Don't know | Not yet + significant equity ask = elevated risk | Always ask |
| P11 | What's the total addressable market (TAM)? | $1B+ / $100M-$1B / Under $100M / Don't know | Under $100M limits exit potential | Always ask |

**Licensing-specific additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| P12 | Does the licensee have distribution capabilities to actually exploit the license? | Strong distribution / Moderate / Weak / Don't know | Weak = license may generate no revenue | Always ask |
| P13 | Has the licensee honored past licensing agreements with other creators? | Yes / Don't know / No | No = red flag | Always ask |

**Scoring weight by deal type:**

| Deal Type | Partner Quality Weight |
|-----------|----------------------|
| Service Agreement | 20% |
| Equity Deal | 25% (highest — you're betting on these people) |
| Licensing | 15% |
| Partnership / JV | 25% |
| Revenue / Profit Share | 20% |
| Advisory | 15% |

*Note: Dimension 3 has no assessment-skippable questions. Partner quality is always deal-specific.*

---

### Dimension 4: Deal Structure Quality

**What it measures:** Are the terms of this deal well-constructed, fair, and protective of your interests? This is where the In Sequence knowledge base is most directly applied.

**Universal questions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| D1 | Where does this deal fall on the value capture hierarchy? | Select: Work-for-hire / Assignment / Non-exclusive license / Revenue participation / Equity ownership | Work-for-hire at Stage 2+ = yellow flag | Always ask. **With assessment:** Scoring uses `detected_stage` for the stage-based flags (more accurate). |
| D2 | Does the agreement clearly define scope of work, deliverables, and timeline? | Yes, very clearly / Mostly / Vaguely / No written agreement | Vaguely or no agreement = red flag | Always ask. **With assessment:** If Q-S1-CONTRACT showed "most work is informal," add context note: "Your assessment noted that your work often lacks formal agreements. This makes it even more important to get clear terms here." |
| D3 | Does the agreement specify what happens if either party wants to end the relationship? | Yes, with clear terms / Partially / No | No termination clause = red flag | Always ask |
| D4 | Do you retain any rights to the work you create? | Full ownership, licensing use / Partial rights / No, it's work-for-hire | Context-dependent — work-for-hire is fine if price is right | Always ask. **With assessment:** If Q-S1-IP showed "client owns everything (work-for-hire)" as current pattern, add context: "Your assessment noted that most of your work has been work-for-hire. This deal continues that pattern. Consider whether licensing would be possible here." |
| D5 | Is there a non-compete or exclusivity clause? | No / Yes, narrow and reasonable / Yes, broad / Don't know | Broad non-compete = red flag | Always ask |
| D6 | Does the agreement include audit rights or financial transparency provisions? | Yes / No / Not applicable | No audit rights on performance-based deals = red flag | Always ask |

**Equity-specific additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| D7 | What type of equity? | Common stock / Stock options / Restricted stock / Phantom equity / Profit interest / Don't know | Don't know = red flag. Options vs. stock has major tax implications. | Always ask |
| D8 | What's the vesting schedule? | Input: cliff period + total vesting period | 4-year vest on 3-month project = misaligned (yellow flag) | Always ask |
| D9 | Is there acceleration on change of control (acquisition)? | Single-trigger (100% vests) / Double-trigger / No / Don't know | No acceleration = red flag. Don't know = yellow. | Always ask |
| D10 | Do you have pro-rata rights to participate in future funding rounds? | Yes / No / Don't know | No = dilution risk (yellow). Critical at seed/Series A. | Always ask |
| D11 | Do you have information rights (quarterly financials, cap table access)? | Yes / No / Don't know | No = flying blind (red flag for equity deals) | Always ask |
| D12 | Do you have anti-dilution protection? | Yes / Partial / No / Don't know | No at pre-seed/seed = standard. No at Series A+ = yellow. | Always ask |

**Revenue/profit share additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| D13 | Is your share calculated on gross revenue, adjusted gross, or net profit? | Gross / Adjusted gross / Net profit / Don't know | Net profit = yellow flag (manipulation risk). Don't know = red. | Always ask |
| D14 | Are deductions capped? | Yes, with specific caps / No caps / No deductions | No caps on deductions = red flag (Hollywood accounting) | Always ask |
| D15 | Is there a minimum guaranteed payment floor? | Yes / No | No floor + net participation = high risk | Always ask |
| D16 | How are accounting disputes resolved? | Independent audit / Arbitration / Litigation / Not specified | Not specified = red flag | Always ask |

**Licensing additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| D17 | Is the license exclusive or non-exclusive? | Exclusive / Non-exclusive | Exclusive = higher value, higher risk | Always ask |
| D18 | What's the license term? | Fixed (input years) / Perpetual / In perpetuity | Perpetual exclusive = red flag unless premium price | Always ask |
| D19 | Does the license include reversion rights (rights return to you if unused)? | Yes / No / Not applicable | No reversion on exclusive = yellow flag | Always ask |
| D20 | Are territory and media rights clearly defined and limited? | Yes, specific / Broad but defined / "All media, worldwide, in perpetuity" | "All media worldwide perpetuity" = red flag | Always ask |
| D21 | Does the licensee have sublicensing rights? | No / Yes, with restrictions / Yes, unrestricted | Unrestricted sublicensing = red flag | Always ask |

**Partnership/JV additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| D22 | Is there a written operating agreement? | Yes, detailed / Yes, basic / Verbal only / Not yet | Verbal only = red flag | Always ask |
| D23 | How are decisions made? | Equal vote / Majority rules / One party controls / Not defined | Not defined = red flag | Always ask |
| D24 | What happens if one partner wants out? | Buyout provision / Dissolution terms / Not addressed | Not addressed = red flag | Always ask |
| D25 | How is IP ownership allocated for work created within the partnership? | Clearly defined / Partially defined / Not addressed | Not addressed = red flag | Always ask |

**Scoring weight by deal type:**

| Deal Type | Structure Quality Weight |
|-----------|------------------------|
| Service Agreement | 20% |
| Equity Deal | 15% |
| Licensing | 30% (highest — terms are the entire deal) |
| Partnership / JV | 25% |
| Revenue / Profit Share | 25% |
| Advisory | 15% |

*Note: Dimension 4 has no assessment-skippable questions. Deal structure quality is entirely deal-specific. Assessment context enriches the scoring interpretation and contextual notes, but every question is asked.*

---

### Dimension 5: Risk Profile

**What it measures:** What could go wrong with this deal, how likely is it, and can you absorb the downside?

**Universal questions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| R1 | What's the worst realistic outcome of this deal? | Text input (member describes) | AI-assisted risk categorization in V2. V1: used for debrief context. | Always ask |
| R2 | If this deal fails completely, what do you lose? | Multi-select: Money / Time / Reputation / Opportunity cost / Rights to my work / Relationships | More than 3 selected = elevated risk profile | Always ask |
| R3 | How diversified is your income? | This deal is one of 5+ income sources / One of 2-4 / My primary income source | Primary income source + high-risk deal = red flag | **Skip if assessment.** Calculate from `income_structure`. If 3+ categories have >10% allocation → "5+ sources." If 2 categories → "2-4." If 1 dominant category >70% → "primary source." Display as pre-filled with assessment source label. |
| R4 | Have you done a deal like this before? | Yes, multiple times / Once or twice / Never | Never + complex structure = yellow flag (not blocking, but flag for education) | Always ask |
| R5 | Is there a way to limit your downside (caps, minimums, escape clauses)? | Yes, built into the deal / I could negotiate for them / No, the risk is open-ended | Open-ended risk = red flag | Always ask |

**Equity-specific additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| R6 | What's your realistic exit timeline expectation? | 1-3 years / 3-5 years / 5-7 years / 7+ years / No idea | No idea = yellow flag. 7+ years + high cash sacrifice = red flag. | Always ask |
| R7 | How many other equity positions do you currently hold? | None / 1-3 / 4-7 / 8+ | Context for portfolio diversification. None + big bet = yellow. | **Skip if assessment.** Use `equity_positions` directly. "Never had one" → None. "1 position" → 1-3. "2-3" → 1-3. "4+" → 4-7 or 8+. |
| R8 | What's the company's burn rate relative to runway? | Comfortable / Moderate / Aggressive / Don't know | Aggressive burn = yellow flag. Don't know = flag for inquiry. | Always ask |

**Scoring weight by deal type:**

| Deal Type | Risk Profile Weight |
|-----------|-------------------|
| Service Agreement | 10% (lowest — limited downside) |
| Equity Deal | 20% |
| Licensing | 10% |
| Partnership / JV | 15% |
| Revenue / Profit Share | 15% |
| Advisory | 10% |

---

### Dimension 6: Legal & Tax Readiness

**What it measures:** Are you prepared for the legal and tax complexity of this deal? This dimension catches the "you don't know what you don't know" problems.

**Universal questions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| L1 | Do you have a lawyer who has reviewed (or will review) this agreement? | Yes, entertainment/IP attorney / Yes, general counsel / No, but I plan to / No | No lawyer on deals over $25K = red flag | **Inform with assessment.** If `has_advisors` includes industry-specific attorney → pre-select "Yes, entertainment/IP attorney." If "no professional advisors" → note: "Your assessment noted you don't have professional advisors yet. For deals over $25K, legal review is essential." |
| L2 | Do you understand the tax implications of this deal structure? | Yes, confirmed with accountant / I think so / No | No on equity or complex deals = red flag | **Inform with assessment.** If `financial_management` shows CPA/accountant → more likely "Yes." If "I don't really separate business from personal" → flag. |
| L3 | Is the agreement in writing? | Yes, formal contract / Yes, email/letter agreement / Verbal only | Verbal on anything material = red flag | Always ask |
| L4 | Are there jurisdiction or governing law provisions? | Yes / No / Don't know | Don't know = yellow flag | Always ask |

**Equity-specific additions:**

| # | Question | Input Type | Scoring Logic | Assessment Behavior |
|---|----------|------------|---------------|-------------------|
| L5 | Have you discussed 83(b) election with a tax advisor? | Yes / No / Not applicable / What's an 83(b)? | "What's that?" on restricted stock = red flag (needs education before proceeding) | Always ask (deal-specific tax question) |
| L6 | Do you understand the difference between stock options and restricted stock for tax purposes? | Yes / Somewhat / No | No = yellow flag. Links to Rights & Ownership primer. | Always ask |
| L7 | Is the entity structure appropriate for this deal? | LLC / C-Corp / S-Corp / Sole proprietor / Don't know | Don't know = yellow flag | **Pre-fill if assessment.** Use `business_structure`. If "sole proprietor by default" + equity deal → auto-flag: "Your assessment showed no formal entity. You'll need at least an LLC to hold equity. See your roadmap Action 1." |

**Scoring weight by deal type:**

| Deal Type | Legal/Tax Weight |
|-----------|-----------------|
| Service Agreement | 5% (lowest) |
| Equity Deal | 10% |
| Licensing | 10% |
| Partnership / JV | 10% |
| Revenue / Profit Share | 5% |
| Advisory | 5% |

---

### Assessment Integration: Question Count Summary

| Dimension | Total Questions (no assessment) | Skipped/Pre-filled (with assessment) | Net Questions (with assessment) |
|-----------|-------------------------------|-------------------------------------|-------------------------------|
| Financial Readiness | 5 universal + 2-5 type-specific | 2 skipped, 1 pre-filled | 2-3 universal + type-specific |
| Career Positioning | 6 universal + 2 stage-specific | 1 skipped (C1) | 5 universal + 2 stage-specific |
| Partner Quality | 7 universal + 2-4 type-specific | 0 skipped | No change |
| Deal Structure | 6 universal + 4-6 type-specific | 0 skipped (context enriched) | No change |
| Risk Profile | 5 universal + 0-3 type-specific | 2 skipped (R3, R7) | 3 universal + type-specific |
| Legal & Tax | 4 universal + 0-3 type-specific | 2 pre-filled (L1, L7) | 2 universal + type-specific |
| **Creative Mode** | **1 (pre-question)** | **0 (pulled from assessment)** | **0** |
| **Total reduction** | | | **~8 fewer questions asked** |

**Net time savings:** Assessment completers answer ~15-18 questions in ~5-8 minutes vs. ~22-28 questions in ~8-12 minutes.

---

## Scoring System

### Per-Dimension Scoring

Each question within a dimension produces a score from 0-10. Questions are weighted within their dimension based on importance (critical questions like "is there a written agreement" weight more than nice-to-haves like "is there a non-compete").

**Dimension Score = Weighted average of question scores within that dimension.**

**Assessment enhancement:** For pre-filled or skipped questions, the assessment-derived answer is scored using the same 0-10 scale. The score is included in the dimension calculation but marked as `source: 'assessment'` in the data model (vs. `source: 'evaluator'`). This allows future analysis of whether assessment-derived answers produce different score distributions than self-reported answers.

Dimension scores map to traffic lights:

| Score Range | Signal | Meaning |
|-------------|--------|---------|
| 8.0 - 10.0 | 🟢 Green | Strong position. Proceed with confidence. |
| 5.0 - 7.9 | 🟡 Yellow | Caution. Specific areas need attention or negotiation. |
| 0.0 - 4.9 | 🔴 Red | Serious concerns. Address before proceeding, or walk away. |

### Overall Score

Overall score is the weighted sum of all six dimension scores, where weights vary by deal type (as specified in each dimension section above). The weights always sum to 100%.

**Overall Score → Overall Traffic Light:**

| Score | Signal | Headline |
|-------|--------|----------|
| 8.0+ | 🟢 Green | "This deal has strong fundamentals. Proceed with confidence." |
| 6.5-7.9 | 🟡 Yellow | "This deal has potential, but [X] areas need attention before you commit." |
| 5.0-6.4 | 🟡 Yellow (cautious) | "Significant concerns. This deal needs renegotiation or restructuring." |
| Below 5.0 | 🔴 Red | "This deal has fundamental problems. Consider walking away or restructuring entirely." |

### Red Flag Override

Certain individual answers trigger an automatic red flag regardless of overall score. These are "deal-breaker" indicators:

| Trigger | Override Action |
|---------|----------------|
| No written agreement on deal > $10K | Red flag: "Never proceed without a written agreement." |
| Work-for-hire with no commensurate premium | Red flag: "You're transferring all rights without adequate compensation." |
| Net profit participation with no audit rights | Red flag: "Net profit without audit rights historically pays $0." |
| No lawyer review on deal > $50K | Red flag: "This deal size warrants legal review." |
| Equity with no information rights | Red flag: "You're investing without visibility." |
| Perpetual exclusive license with no reversion | Red flag: "Permanent exclusive rights transfer should command premium pricing." |
| Partner has history of unfair treatment | Red flag: "Past behavior predicts future behavior." |
| Cash sacrifice creates financial hardship | Red flag: "This deal puts your financial stability at risk." |

---

## The Verdict Page

After completing the evaluation, the member sees a results page. The page has 5 sections for all members, plus 2 additional sections for assessment completers.

### Section 1: The Signal

Large, clear traffic light (green/yellow/red) with a one-line headline and a 2-3 sentence summary.

**Example (Yellow):**
> 🟡 **This deal has potential, but the equity terms need work.**
> 
> The partner quality is strong and the career positioning is right for your stage. But the vesting schedule is misaligned with your scope of work, you're missing information rights, and the equity-to-cash ratio is below threshold for a seed-stage company. Three specific improvements would move this to green.

### Section 2: The Radar Chart

Six-axis radar chart showing dimension scores. Instantly visual — strong dimensions push outward, weak dimensions pull inward. Member can hover/tap any axis to see the dimension summary.

**Design spec:** D3.js or Recharts implementation. Six axes at 60° intervals. Score plotted 0 (center) to 10 (edge). Fill area: green (#2A9D5C) at 8+, yellow (#F2C12E) at 5-7.9, red (#E84225) below 5 — blended based on overall score. Grid lines at 2.5, 5.0, 7.5, 10.0.

### Section 3: Dimension Breakdown

Each of the six dimensions displayed as an expandable card:

**Collapsed:** Dimension name + traffic light + one-line summary
**Expanded:** Score details, specific answers that flagged concerns, and actionable guidance

Each flagged item links to relevant library content:
- Red flag on equity terms → links to Structure #3 (Project Equity), Protective Mechanisms section
- Yellow on audit rights → links to Deal Foundations Guide, Protective Mechanisms section
- Red on net profit definition → links to Structure #23 (Net Profit Participation), Common Manipulations section

**Assessment enrichment:** For questions where assessment data informed the score (skipped or pre-filled), the expanded view shows: "Based on your assessment: [value used]" with a subtle label distinguishing assessment-derived data from deal-specific answers.

### Section 4: Misalignment Warnings *(assessment completers only)*

**This section only appears when the member has active misalignment flags relevant to the deal being evaluated.** It renders between the radar chart and the dimension breakdown — visually prominent because these are the highest-value insights the system can deliver.

**Header:** "Based on Your Assessment"

**Content:** 1-3 contextual warnings, each as a distinct callout card:

| If Flag = | And Deal Type = | Warning Text |
|-----------|----------------|--------------|
| `judgment_not_priced` | Service Agreement | "Your assessment flagged that you're delivering strategic-level value for execution-level compensation. Before accepting another service deal at this level, consider whether this relationship could be restructured to include advisory, equity, or participation components. [See Structure #4: Advisory/Consultant →]" |
| `judgment_not_priced` | Advisory Role | "Your assessment flagged that your judgment is underpriced. This advisory deal is exactly the kind of structure your roadmap recommends. Make sure the terms reflect the value — don't discount to get the first one." |
| `ip_not_monetized` | Service (work-for-hire) | "Your assessment showed you have unmonetized IP and a pattern of work-for-hire agreements. This deal transfers all rights. Have you considered licensing specific usage instead of assigning ownership? [See Structure #27: Non-Exclusive Licensing →]" |
| `ip_not_monetized` | Licensing Deal | "Your assessment flagged unmonetized IP. This licensing deal directly addresses that gap. Make sure the terms are well-structured — particularly reversion, exclusivity scope, and territory limitations." |
| `relationships_not_converted` | Any deal with long-term partner (P1 = 3+ years) | "You've worked with trusted partners for years without equity participation. If this is one of those relationships, this deal might be the moment to propose ownership or participation. [See Structure #3: Project Equity →]" |
| `income_exceeds_structure` | Equity Deal | "Your assessment flagged that your entity structure doesn't match your income level. Before signing equity agreements, ensure your business entity can hold equity efficiently. [See your Roadmap Action 1 →]" |
| `talent_without_structure` | Any complex deal (equity, partnership, JV) | "Your assessment flagged that you need professional advisory infrastructure. For a deal this complex, consult an attorney before proceeding. [See your Roadmap →]" |
| `demand_exceeds_capacity` | Service below market (F1/F2 < 70%) | "You're in a position of high demand — your assessment showed you're regularly turning down work. You don't need to accept below-market terms. Your leverage is stronger than you think." |

**Design:** Uses the `.is-warn` card pattern from the web design system (⚠ prefix). Each warning links to the relevant structure page and/or the member's roadmap.

### Section 5: Recommended Actions

A numbered list of specific things the member should do before proceeding, ordered by priority:

**Example output:**
1. **Negotiate information rights into the agreement.** You're taking equity without visibility into company performance. See Structure #3, Protective Mechanism #1.
2. **Request 409A valuation instead of accepting the company's self-reported valuation.** The equity value may be overstated. See Structure #3, Valuation Negotiation Framework.
3. **Shorten vesting to 2 years with 6-month cliff** (your scope is 4 months — 4-year vesting is misaligned). See Structure #19, Vesting Equity.
4. **Add single-trigger acceleration clause** to protect your equity if the company is acquired before vesting completes.
5. **Consult a tax advisor about 83(b) election** before signing if equity is restricted stock.

Each action includes "Sample language" — copy-to-clipboard script blocks pulled from the relevant structure document's negotiation section.

### Section 6: How This Deal Fits Your Roadmap *(assessment completers only)*

**This section appears after Recommended Actions for members with a completed assessment and roadmap.** It answers three questions:

**1. Stage Alignment**

Compares the deal's primary structures against the member's stage-recommended structures:

- **Aligned:** "This [advisory deal] aligns with your current stage (Stage 2: Judgment Positioning). Structure #4 is one of your stage's recommended structures. This is exactly the type of deal your roadmap encourages."
- **Below stage:** "This is a Stage 1 deal (pure execution for a flat fee). Your assessment places you at Stage 2. Taking this deal isn't wrong, but it doesn't advance your trajectory. Consider whether you could restructure the terms to include advisory or equity components."
- **Above stage:** "This deal involves structures typically associated with Stage 3 (Ownership Accumulation). Your assessment places you early in Stage 2. The deal itself might be right, but make sure your infrastructure — entity structure, legal counsel, financial systems — can support it. [Check your Roadmap Action 1 →]"

**2. Misalignment Connection**

Whether this deal addresses or reinforces active misalignment flags:

- **Addresses:** "Your roadmap flagged 'judgment not priced' — you're delivering strategic value for execution fees. This advisory deal directly addresses that misalignment. Prioritize getting this right."
- **Reinforces:** "Your roadmap flagged 'IP not monetized.' This work-for-hire deal continues the pattern of creating value without retaining ownership. Before signing, explore whether licensing is possible. [See Structure #27 →]"
- **Neutral:** No misalignment connection for this deal type. Section sub-item omitted.

**3. Roadmap Action Connection**

Whether a current roadmap action maps to this deal:

- **Direct connection:** "Your Roadmap Action 2 is 'Draft a restructured engagement proposal.' This deal could be the opportunity to execute that action. [View your Roadmap →]"
- **Infrastructure prerequisite:** "Your Roadmap Action 1 is 'Form your business entity.' Complete that before signing this equity agreement. [View your Roadmap →]"
- **No connection:** Sub-item omitted.

### Section 7: Relevant Library Resources

A curated list of structure documents, case studies, and guide sections specific to this deal:

**Your Deal → Read These:**
- Structure #3: Project Equity Model (your primary deal type)
- Structure #19: Vesting Equity (vesting schedule deep-dive)
- Case Study: [relevant to stage + discipline + deal type]
- Negotiation Playbook: "That's our standard equity package" scenario
- Rights & Ownership Primer: Section 2 (Types of Rights)

**With assessment:** Resources are additionally filtered by the member's roadmap `recommended_structures` and discipline. Structures that appear in both the deal-type mapping AND the roadmap are marked "Recommended for Your Stage."

---

## Comparison Mode

When a member enters via "I'm Comparing Two Deals," they complete the Full Evaluation for both deals. The comparison output adds:

### Side-by-Side Table

| Dimension | Deal A | Deal B |
|-----------|--------|--------|
| Financial Readiness | 🟢 8.2 | 🟡 6.4 |
| Career Positioning | 🟡 6.8 | 🟢 8.5 |
| Partner Quality | 🟢 8.0 | 🟡 7.2 |
| Deal Structure | 🟡 5.5 | 🟢 7.8 |
| Risk Profile | 🟡 6.2 | 🟡 6.0 |
| Legal & Tax | 🟢 8.0 | 🔴 3.5 |
| **Overall** | **🟡 7.0** | **🟡 6.9** |

### Overlay Radar Chart

Both deals plotted on the same radar chart with different fill colors (Deal A in teal, Deal B in plum). Instantly shows where each deal is stronger.

### Trade-Off Analysis

A narrative section (V1: template-driven, V2: AI-generated) explaining the key trade-offs:

> "Deal A offers better financial terms and a more protective structure, but Deal B positions you significantly better for your next career stage. Deal A is safer; Deal B has higher upside. If you can negotiate information rights and a shorter vesting schedule into Deal B (see Recommended Actions), it would score higher than Deal A across the board."

**With assessment (V2):** The trade-off analysis references the member's stage and roadmap: "Given your Stage 2 position and your roadmap's emphasis on building ownership, Deal B's equity component aligns better with your trajectory — if you can fix the legal readiness gaps."

### The Recommendation

Not "take Deal A" — but rather: "Here's what would make each deal green, and here's what you'd need to give up in each case." The member decides. The tool provides clarity, not directives.

---

## Data Model

### Evaluation Record

```
evaluation {
  id: uuid
  member_id: uuid
  created_at: timestamp
  updated_at: timestamp
  status: 'in_progress' | 'completed'
  
  // Creative context
  creative_mode: enum (maker, service, hybrid, performer, builder, transition)
  creative_mode_source: 'assessment' | 'evaluator'  // where the mode came from
  
  // Deal identification
  deal_type: enum (service, equity, licensing, partnership, revenue_share, advisory)
  mapped_structures: int[] (structure numbers)
  deal_name: string (member-provided label, e.g. "Acme Corp rebrand")
  
  // Assessment linkage
  assessment_id: uuid | null           // linked assessment at time of evaluation
  assessment_stage: int | null         // detected_stage at eval time (snapshot)
  assessment_flags: string[] | null    // misalignment_flags at eval time (snapshot)
  archetype_primary: string | null     // archetype at eval time (snapshot)
  
  // Answers (each answer records its source)
  answers: jsonb {
    financial: { 
      F1: { value: any, source: 'evaluator' },
      F3: { value: any, source: 'assessment' },  // skipped, derived from assessment
      ... 
    },
    career: { ... },
    partner: { ... },
    structure: { ... },
    risk: { ... },
    legal: { ... }
  }
  
  // Scores (calculated)
  scores: jsonb {
    financial: { score: float, signal: enum, flags: string[] },
    career: { score: float, signal: enum, flags: string[] },
    partner: { score: float, signal: enum, flags: string[] },
    structure: { score: float, signal: enum, flags: string[] },
    risk: { score: float, signal: enum, flags: string[] },
    legal: { score: float, signal: enum, flags: string[] },
    overall: { score: float, signal: enum }
  }
  
  // Output
  red_flags: string[]
  misalignment_warnings: jsonb[] | null    // generated from assessment flags × deal type
  roadmap_alignment: jsonb | null          // stage fit + flag connection + action connection
  recommended_actions: jsonb[]
  recommended_resources: jsonb[]
  
  // Comparison
  comparison_id: uuid | null (links to paired evaluation in comparison mode)
  
  // Deal outcome tracking
  deal_outcome: 'accepted' | 'declined' | 'renegotiated' | 'pending' | null
  outcome_notes: string | null
  outcome_recorded_at: timestamp | null
}
```

### Member Evaluation History

Members accumulate evaluations over time. Dashboard shows:
- Total evaluations completed
- Score trends (are deals getting better?)
- Most common flag areas (where do they consistently need improvement?)
- Structures most frequently evaluated
- Deal outcomes (accepted/declined/renegotiated) with score correlation

**Assessment retake integration:** When a member retakes their assessment after 90 days, the system can surface evaluation history: "Since your last assessment, you've evaluated [N] deals. You accepted [X] and declined [Y]. Your accepted deals scored an average of [Z] across dimensions." This provides concrete evidence of progression.

---

## Build Phases

### V1: Static Evaluation with Assessment Integration (Launch with library)

**Goal:** Working evaluation tool with all questions, scoring, output, and full assessment intelligence — but no AI-generated narratives.

| Component | Spec |
|-----------|------|
| Assessment context loading | Load `AssessmentContext` object on evaluator entry. Determine `hasAssessment` state. |
| Creative mode detection | Ask pre-question for non-assessment members. Pull from assessment for completers. Adapt all question language. |
| Deal type identification | Full flow with "I'm Not Sure" routing. Stage-aware entry screen for assessment completers. |
| Question sets | All six dimensions, all deal-type variants. Skip/pre-fill logic for assessment completers. |
| Scoring engine | Weighted scoring algorithm, per-dimension and overall. Uses `detected_stage` for assessment completers (not self-reported). Records answer `source` (assessment vs. evaluator). |
| Red flag detection | Override triggers on critical answers |
| Misalignment warnings | Generate from assessment flags × deal type matrix. Display on verdict page. |
| Roadmap alignment | Compute stage alignment, flag connection, and action connection. Display on verdict page. |
| Verdict page | Traffic light, radar chart, misalignment warnings (if applicable), dimension breakdown, recommended actions, roadmap fit (if applicable), library resources. |
| Resource linking | Static links to relevant structures, guides, case studies. Stage-filtered for assessment completers. |
| Save & history | Evaluations saved to member profile with assessment snapshot. |
| Comparison mode | Side-by-side table and overlay chart |
| Progress save | Auto-save on each question, resume later |
| Mobile-optimized | Full experience works on phone (real-time deal evaluation use case) |
| Readiness redirect | "Am I Ready?" routes to roadmap for assessment completers, standalone flow for others. |
| Deal outcome tracking | Post-evaluation: mark deal as accepted/declined/renegotiated/pending. |

**What V1 does NOT include:**
- AI-generated narrative in trade-off analysis (uses templates)
- AI-generated recommended actions (uses rule-based logic from structure documents)
- Real-time negotiation script generation
- Integration with AI Advisory Chat
- Assessment retake integration (surfacing evaluation history during retake)

### V2: AI-Enhanced Evaluation

| Component | Spec |
|-----------|------|
| AI narrative generation | Claude API generates personalized summary, trade-off analysis, and action recommendations based on full answer set + assessment context |
| Dynamic script generation | AI generates custom negotiation language based on specific deal terms entered |
| Context-aware resource ranking | AI ranks library resources by relevance to specific deal situation + member stage/discipline |
| Evaluation refinement | AI follow-up questions when answers are ambiguous or contradictory |
| Comparison narrative | AI-generated trade-off analysis referencing member's stage and roadmap |
| Assessment retake integration | Evaluation history surfaced during assessment retake. Score trend analysis. |

### V3: Integrated Evaluation Ecosystem

| Component | Spec |
|-----------|------|
| AI Chat integration | "Discuss this evaluation" button launches AI Advisory Chat with full evaluation context + assessment context pre-loaded |
| Negotiation prep mode | Evaluation output feeds directly into Negotiation Playbook role-play simulator with deal-specific scenario |
| Community anonymized benchmarks | "Deals like yours typically score X in this dimension" (requires N>50 evaluations of same type) |
| PDF export | Styled PDF of evaluation results (including roadmap alignment) for sharing with lawyer, advisor, or business partner |
| Outcome learning loop | Aggregated outcome data (which scores correlated with accepted vs. declined deals) refines scoring weights over time |

---

## UX Flow: Full Evaluation (Screen-by-Screen)

### Screen 0: Pre-Check (Assessment Completers Only — Not a Visible Screen)
System loads `AssessmentContext`. Determines which questions to skip, pre-fill, or enrich. Sets creative mode and stage. No user-facing interaction.

### Screen 1: Entry
**With assessment:** Personalized header showing stage + archetype + recommended deal types. Past evaluations below.
**Without assessment:** Three entry point cards. Past evaluations + assessment nudge below.

### Screen 1.5: Creative Mode (No Assessment Only)
Single question: "How does your creative work reach the world?" Sets `creative_mode` for the rest of the flow.

### Screen 2: Deal Identification
Category selection (7 options). Descriptions adapt by creative mode. If "I'm Not Sure" → 5-question identification flow. Each question is a single screen with large, tappable options. Progress indicator shows position in flow.

Confirmation: "This looks like a [Deal Type]" with 2-sentence description. "Does that sound right?" Yes / No, let me pick manually.

**With assessment:** If deal type matches roadmap-recommended structures, add confirmation: "This type of deal aligns with your roadmap recommendations."

### Screen 3: Deal Label
"Give this deal a name so you can find it later." Free text, optional. Default: "[Deal Type] — [Today's Date]"

### Screens 4-9: Dimension Evaluation (one screen per dimension)
Each dimension gets its own screen (or scrollable section on desktop). Questions presented one at a time (mobile) or in short groups (desktop).

**Key UX principles:**
- Never more than 3-4 questions visible at once
- Input types match the question (don't make someone type when a slider works)
- Progress bar shows overall completion and current dimension
- "Why are we asking this?" expandable tooltip on each question — explains what this question evaluates, in plain language
- Auto-save on every answer
- Skip option on questions that don't apply (with "I don't know" always available)
- **Pre-filled answers (assessment completers):** Shown with a subtle "Based on your assessment" label and the pre-filled value. Member can accept (tap next) or override (tap to edit). Pre-filled questions feel fast — they confirm rather than ask.
- **Skipped questions (assessment completers):** Not shown at all. The dimension has fewer visible questions. Progress bar adjusts accordingly.

**Dimension transition:** Brief interstitial between dimensions showing the dimension name, a one-line description of what it evaluates, and the count of questions. For assessment completers, note the reduced count: "Partner Quality · 7 questions · Is the other party trustworthy and capable?"

### Screen 10: Calculating (Brief)
3-second animation showing the six dimensions being scored. Not a fake delay — this is the actual scoring computation, but the animation makes it feel deliberate rather than instant.

Radar chart draws itself axis-by-axis: Financial → Career → Partner → Structure → Risk → Legal. Each axis fills to its score with a subtle animation. The fill color (green/yellow/red) appears as the chart completes.

### Screen 11: The Verdict
Full verdict page as described above. Scrollable. Persistent "Save This Evaluation" and "Share" buttons. If comparison mode: "Now evaluate your second deal" button.

**With assessment:** Verdict page includes Misalignment Warnings (Section 4) and Roadmap Fit (Section 6) sections.

---

## Content Integration Map

The Deal Evaluator is the connective tissue between the member's real situation and the In Sequence library. Every evaluation output connects to specific content:

| Evaluation Output | Links To |
|-------------------|----------|
| Deal type identified | Relevant structures (1-3 primary, 1-3 secondary) |
| Financial red flags | Deal Foundations Guide → Compensation Architecture |
| Career positioning concerns | Understanding Deal Structures → Progression Framework |
| Partner quality concerns | Negotiation Playbook → Pre-Negotiation Preparation |
| Structure quality gaps | Specific structure detail page → Protective Mechanisms |
| Manipulation risks flagged | Specific structure detail page → Common Manipulations |
| Negotiation actions needed | Negotiation Playbook → Scenario Playbooks + Script Blocks |
| Rights concerns | Rights & Ownership Primer → relevant section |
| Legal readiness gaps | Rights & Ownership Primer → Section 5 (Protecting What You Own) |
| Tax concerns | Structure-specific tax notes (83(b), entity type, etc.) |
| **Misalignment warnings** | **Specific structure pages + Member's Roadmap** |
| **Stage alignment** | **Member's Roadmap + Stage-relevant structures** |
| **Roadmap action connection** | **Member's Roadmap → specific action** |

This means the Deal Evaluator functions as the *primary discovery mechanism* for the rest of the library. Members don't need to browse — the evaluator tells them exactly what to read and why. For assessment completers, it also functions as the *primary activation mechanism* for the roadmap — connecting strategic advice to real-time decisions.

---

## Edge Cases & Guardrails

### The "Everything Is Green" Deal
If a deal scores 8+ across all dimensions, the output should acknowledge this is rare and confirm specific strengths rather than just saying "go for it." Include: "Deals that score this well are uncommon. The fundamentals are strong. Your primary risk is opportunity cost — make sure you're not passing on even better deals."

### The "Everything Is Red" Deal
If a deal scores below 5 across all dimensions, the output should be direct but not dismissive: "This deal has fundamental problems across multiple dimensions. Before proceeding, we'd recommend [specific structural changes]. If the other party isn't willing to address these, this may not be the right deal for you." Never say "walk away" — say "address these before proceeding."

### Assessment Stale or Incomplete
If a member has an assessment older than 180 days, the evaluator still uses it but adds a note: "Your assessment was completed [X months ago]. Some details may have changed. [Retake your assessment →]" Scoring still uses assessment data; the nudge is informational, not blocking.

If a member started but didn't complete the assessment, treat as `hasAssessment: false`. Don't use partial data.

### Incomplete Evaluations
Members who abandon mid-flow can return and resume. Their partial data is saved. The system should surface incomplete evaluations on the member dashboard: "You started evaluating [deal name] 3 days ago. Pick up where you left off?"

### "I Don't Know" Answers
"I don't know" is always a valid answer. Multiple "I don't know" responses within a dimension lower the score for that dimension and trigger a specific action item: "You need more information about [X]. Before making a decision, ask the other party to clarify [specific questions]."

### Assessment Override
When a member overrides a pre-filled assessment value (e.g., changes the pre-calculated income concentration percentage), the evaluation uses the override. The data model records both: `{ value: [override], source: 'evaluator', assessment_value: [original] }`. This captures drift between assessed position and deal-specific reality.

### Not Legal Advice Disclaimer
Persistent but unobtrusive footer on all evaluation screens: "The Deal Evaluator is an educational tool. It does not constitute legal, financial, or tax advice. Consult qualified professionals before entering into any agreement."

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Completion rate | >65% overall, >75% for assessment completers | Assessment integration should boost completion via shorter flow |
| Return usage | >40% of members use it 2+ times | Tool is useful enough to come back to |
| Verdict → Library click-through | >50% click at least one recommended resource | Integration with library is working |
| Verdict → Roadmap click-through | >40% of assessment completers click a roadmap link | Assessment-evaluator loop is working |
| Verdict → Action taken | Track via follow-up prompt 7 days later | Members are acting on recommendations |
| Comparison mode adoption | >20% of evaluations are comparisons | Members evaluating multiple options |
| Time to complete (no assessment) | 8-12 minutes | Not too short (shallow) or too long (abandoned) |
| Time to complete (with assessment) | 5-8 minutes | Assessment integration delivers real time savings |
| Deal outcome capture | >50% of evaluations have an outcome recorded within 30 days | Members closing the loop |
| Assessment conversion from evaluator | >15% of non-assessed members take the assessment within 7 days of first evaluation | Evaluator drives assessment adoption |
| NPS on evaluation output | >50 | Members find the output genuinely useful |

---

*Deal Evaluator Spec v2.0 — February 2026*
*Companion to: SEQ Guides Development (guides-development.md), Assessment + Roadmap Spec (seq-assessment-build-spec-v2.md)*
