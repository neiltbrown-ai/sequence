> **⚠️ SPEC FRESHNESS NOTE — read first**
>
> The integration logic described here (evaluator skipping / pre-filling questions when assessment context exists, surfacing misalignment warnings on verdicts) is current.
>
> **Doesn't reflect:**
> - Bidirectional flow — deal verdicts now feed BACK INTO roadmap regeneration. The shared `src/lib/roadmap/generate-plan.ts` pulls last 90 days of deals + their verdict `recommended_actions` and folds patterns into the plan
> - "Refresh Roadmap" CTA on verdicts that triggers `/api/roadmap/refresh`
> - "Creative Identity" rebrand — "Assessment" naming throughout this doc refers to what the UI now calls Creative Identity
>
> **For the current architecture, read `CLAUDE.md` first**, then this spec for the integration intent.

---

# Deal Evaluator × Assessment: Integration Analysis
## How the Assessment Spec Reshapes the Evaluator
### February 2026

---

## The Relationship

You're right that these evaluate two fundamentally different things. But having read the full assessment spec, I think the relationship is tighter than "different tools for different moments." They form a system:

**Assessment = "Where am I?"** (strategic position, structural gaps, stage, trajectory)
**Deal Evaluator = "Should I take this?"** (specific deal, specific terms, specific counterparty)

The assessment is a map. The evaluator is a compass you pull out at a specific fork in the road. The map makes the compass dramatically more useful — but the compass has to work without the map too.

Here's what shifts in the Deal Evaluator based on the assessment spec:

---

## Shift 1: The Assessment Provides Context the Evaluator Currently Asks For

The Deal Evaluator spec (as written) asks members to self-report their stage, income, risk tolerance, and business structure as part of the evaluation. But if they've completed the assessment, we already know all of this — and we know it more accurately because the assessment infers stage from behavioral signals rather than asking directly.

**What changes:**

For members who HAVE completed the assessment, the Deal Evaluator should:

- **Skip or pre-fill Dimension 1 (Financial Readiness) questions F3, F4, F5** — we already have income range, income structure, and diversification from Q6, Q7, Q10.
- **Skip Dimension 2 (Career Positioning) question C1** entirely — we don't need them to self-select their stage. We know it from `detected_stage`.
- **Skip Dimension 6 (Legal & Tax) questions L5, L6, L7** — we know their entity structure from Q11 and their professional advisor situation from Q-S3-ADVISORS (if Stage 3 pool was shown).
- **Pre-populate context for scoring** — the evaluator's scoring weights can be calibrated to the member's actual stage, not their self-reported stage. This is more accurate.

For members who HAVEN'T completed the assessment, the evaluator works exactly as currently spec'd — it asks everything it needs. But it should surface a gentle nudge: "Your evaluation will be more precise if you've completed your strategic assessment first. [Take the assessment →]"

**Implementation:**

```
if (member.hasCompletedAssessment) {
  // Pull from assessment data
  const context = {
    stage: assessment.detected_stage,
    income_range: assessment.income_range,
    creative_mode: assessment.creative_mode,
    discipline: assessment.discipline,
    entity_structure: assessment.business_structure,
    risk_tolerance: assessment.risk_tolerance,  // from Q-AMB-2
    income_structure: assessment.income_structure,
    equity_positions: assessment.equity_positions,
    has_advisors: assessment.stage_questions?.['Q-S3-ADVISORS'] || null,
    misalignment_flags: assessment.misalignment_flags,
  };
  
  // Shorter evaluation: skip ~8 questions already answered
  // More precise scoring: use assessed stage, not self-reported
  // Richer output: connect to existing roadmap actions
} else {
  // Full evaluation: ask everything
  // Add soft CTA: "Complete your strategic assessment for a more precise evaluation"
}
```

**Net effect:** Assessment completers get a shorter, faster, more accurate evaluation. The 8-12 minute target drops to 5-8 minutes. Non-completers still get the full experience.

---

## Shift 2: Misalignment Flags Should Inform Red Flags

The assessment spec defines six misalignment patterns:

| Flag | What It Means |
|------|---------------|
| `income_exceeds_structure` | Earning $300K+ with no entity or sole prop |
| `judgment_not_priced` | Delivering strategic value, capturing execution fees |
| `relationships_not_converted` | Long-term trust relationships, zero equity |
| `ip_not_monetized` | Sitting on catalog/IP, no licensing income |
| `demand_exceeds_capacity` | Turning down work, still solo practitioner |
| `talent_without_structure` | Cultural influence, minimal infrastructure |

These aren't just assessment outputs — they're predictors of how someone is likely to get taken advantage of in a deal. A member flagged `judgment_not_priced` is exactly the person who'll accept a service agreement when they should be proposing advisory + equity. A member flagged `ip_not_monetized` is the person who'll sign a work-for-hire contract when they should be licensing.

**What changes:**

For assessment completers, the Deal Evaluator adds a **contextual warning layer** based on active misalignment flags:

| If Flag = | And Deal Type = | Evaluator surfaces |
|-----------|----------------|-------------------|
| `judgment_not_priced` | Service Agreement | "You're currently delivering judgment-level value for execution-level compensation. Before accepting another service deal, consider whether this relationship could be restructured as advisory + equity. See Structure #4." |
| `ip_not_monetized` | Work-for-hire service | "Your assessment shows you have unmonetized IP. This work-for-hire deal transfers all rights. Have you considered licensing instead? See Structures #27-28." |
| `relationships_not_converted` | Any deal with existing partner | "You've worked with trusted partners for years without equity participation. If this is one of those relationships, this deal might be the right moment to propose ownership. See Structure #3." |
| `income_exceeds_structure` | Equity deal | "Your entity structure may not be set up to hold equity efficiently. Complete your roadmap Action 1 (entity restructuring) before signing equity agreements." |
| `talent_without_structure` | Any complex deal | "Your assessment flagged that you need professional advisory infrastructure. For a deal this complex, consult an attorney before proceeding. See your roadmap." |
| `demand_exceeds_capacity` | Service agreement below market | "You're in a position of high demand. You don't need to accept below-market terms. Your leverage is stronger than you think." |

These warnings appear as a special section between the radar chart and the dimension breakdown on the Verdict page — a "Based on Your Assessment" callout that only appears for members with active misalignment flags relevant to the deal being evaluated.

---

## Shift 3: The Verdict Should Connect to the Roadmap

Right now, the Deal Evaluator's output ends with "Recommended Actions" and "Relevant Library Resources." For assessment completers, there's a much richer connection available.

**What changes:**

New section on the Verdict page (assessment completers only): **"How This Deal Fits Your Roadmap"**

This section answers three questions:

**1. Does this deal align with your current stage?**
- If the deal's primary structures match the member's stage-recommended structures: "This deal aligns with your current stage (Stage 2: Judgment Positioning). The advisory component is exactly the kind of deal your roadmap recommends pursuing."
- If the deal is below their stage: "This is a Stage 1 deal (pure execution). Your assessment places you at Stage 2. Taking this deal isn't wrong, but it doesn't advance your trajectory. Consider whether you could restructure the terms to include advisory or equity components."
- If the deal is above their stage: "This deal involves structures typically associated with Stage 3 (Ownership Accumulation). Your assessment suggests you're still building Stage 2 foundations. The deal itself might be right, but make sure your infrastructure — entity structure, legal counsel, financial systems — can support it."

**2. Does this deal address or conflict with your active misalignments?**
- If the deal addresses a misalignment: "Your roadmap flagged that you have 'judgment not priced' — you're delivering strategic value for execution fees. This advisory deal directly addresses that misalignment. This is the kind of deal to prioritize."
- If the deal reinforces a misalignment: "Your roadmap flagged 'IP not monetized.' This work-for-hire deal would add to the pattern of creating value and not retaining ownership. Consider restructuring as a license."

**3. Does this deal connect to your roadmap actions?**
- If a roadmap action maps: "Your Roadmap Action 2 is 'Draft a restructured engagement proposal.' This deal could be the opportunity to execute that action. [View your roadmap →]"

---

## Shift 4: The Evaluator Becomes a Roadmap Feedback Loop

The assessment generates a strategic roadmap with three actions. The Deal Evaluator gives the member data about actual deals they're encountering. Over time, this creates a feedback loop:

**Assessment → Roadmap → Member encounters deals → Evaluator scores them → Patterns emerge → Retake assessment → Updated roadmap**

**What changes in the data model:**

Add a field to the evaluation record that links to the assessment:

```
evaluation {
  // ... existing fields ...
  
  // Assessment linkage
  assessment_id: uuid | null       // linked assessment (if completed)
  stage_at_evaluation: int | null  // member's detected_stage at time of evaluation
  misalignment_flags_at_evaluation: string[] | null  // flags active at eval time
  roadmap_alignment: jsonb | null  // computed alignment analysis
  
  // Deal outcome tracking (V2)
  deal_outcome: 'accepted' | 'declined' | 'renegotiated' | 'pending' | null
  outcome_notes: string | null
  outcome_recorded_at: timestamp | null
}
```

When a member retakes their assessment after 90 days, the system can surface: "Since your last assessment, you've evaluated 3 deals. You accepted 2 and declined 1. Your accepted deals scored an average of 7.2 across dimensions, up from 5.8 on deals you evaluated before your roadmap." That's powerful evidence of progression.

---

## Shift 5: Creative Mode and Discipline Should Adapt Evaluator Language

The assessment spec does something clever: it establishes a `creative_mode` flag (maker/service/hybrid/performer/builder/transition) and adapts all question language accordingly. "Client" becomes "collaborator." "Revenue" replaces "billing." The assessment feels native to painters, musicians, and actors — not just service providers.

The current Deal Evaluator spec doesn't do this. It defaults to service-provider language throughout ("client," "scope of work," "deliverables"). For assessment completers, we know their creative mode. For non-completers, we should ask.

**What changes:**

**For non-completers:** Add a lightweight creative mode question at the very start of the evaluator (before deal type identification). One question, same as Q2 from the assessment:

> "How does your creative work reach the world?"
> - I make things and sell/license them directly → `maker`
> - I make things for clients or employers → `service`
> - I do both → `hybrid`
> - I perform, direct, or lead creative projects → `performer`
> - I'm building something → `builder`

**For all members:** Evaluator question language adapts by creative mode:

| Default (service) | Maker variant | Performer variant |
|-------------------|---------------|-------------------|
| "What's your normal rate for this scope?" | "What's the market value of work like this?" | "What's standard compensation for this type of role/project?" |
| "Does the client have a track record?" | "Does the buyer/gallery/label have a track record?" | "Does the production/venue/label have a track record?" |
| "Does this deal give you new access to networks?" | "Does this deal give you new access to audiences, collectors, or markets?" | "Does this deal give you new access to audiences, roles, or platforms?" |

This is cosmetic but it matters. A sculptor evaluating a gallery representation deal shouldn't feel like they're filling out a freelance contract checklist.

---

## Shift 6: The Archetype System Can Pre-Filter Deal Type Paths

The assessment spec defines 6 archetypes (with more coming from V1 data). Each archetype has a set of recommended structures. The Deal Evaluator currently treats all deal types as equally likely starting points. But if we know the archetype, we can weight the entry experience.

**What changes:**

For assessment completers, the Deal Evaluator entry screen adds a personalized recommendation:

> "Based on your assessment, you're currently in **Stage 2: Judgment Positioning**. The deal types most relevant to your stage are **Advisory Roles** and **Equity Deals**. [Evaluate an advisory deal →] [Evaluate an equity deal →]"

Plus the standard "I have a different type of deal" option for anything else.

This doesn't restrict — it orients. The member still has full access to all deal types. But the nudge toward stage-appropriate structures reinforces the framework.

---

## Shift 7: The "Readiness Assessment" Entry Point Gets Absorbed

The current evaluator spec has three entry points: "I have a specific deal," "I'm exploring a type of deal" (Readiness Assessment), and "I'm comparing two deals."

The Readiness Assessment entry point overlaps significantly with the strategic assessment. For someone who hasn't taken the assessment, the readiness check makes sense — it's a lighter-weight version of "am I ready for this kind of deal?" But for someone who HAS taken the assessment, their roadmap already tells them what they're ready for.

**What changes:**

- **For assessment completers:** The "Am I Ready?" entry point redirects to their roadmap with a filtered view: "Your roadmap already maps your readiness. Here's what it says about [deal type] deals at your stage." Then offers: "Want to evaluate a specific deal instead?"
- **For non-completers:** The Readiness Assessment works as spec'd, but at the end, the output includes: "Want a full strategic assessment? The In Sequence assessment maps your complete position and generates a personalized roadmap. [Take the assessment →]"

This creates a natural funnel: Readiness check → Assessment → Roadmap → Deal Evaluator. Each tool leads to the next.

---

## Summary: What Changes in the Deal Evaluator Spec

| Area | Change | Priority |
|------|--------|----------|
| **Question skipping** | Pre-fill/skip ~8 questions for assessment completers | P0 (build with V1) |
| **Creative mode adaptation** | Add creative mode question for non-completers; adapt language throughout | P0 |
| **Misalignment warnings** | Surface contextual warnings on Verdict page based on active flags | P1 (build with V1 if assessment is live) |
| **Roadmap connection** | "How This Deal Fits Your Roadmap" section on Verdict page | P1 |
| **Stage-appropriate nudges** | Personalized entry screen recommending stage-relevant deal types | P1 |
| **Readiness redirect** | Redirect "Am I Ready?" to roadmap for completers | P1 |
| **Data model linkage** | `assessment_id` field in evaluation record | P0 |
| **Feedback loop** | Deal evaluation history surfaced during assessment retake | P2 (V2) |
| **Scoring precision** | Use `detected_stage` for scoring weights instead of self-reported | P0 |
| **Archetype-filtered structures** | Pre-sort recommended structures by archetype relevance | P2 |

---

## What Doesn't Change

The core evaluator design holds. The six dimensions are right. The scoring system works. The red flag overrides are independent of assessment data. The comparison mode is unaffected. The deal identification flow works the same. The Verdict page structure stays.

The assessment doesn't replace the evaluator — it makes it smarter and faster for the members who've invested in understanding their position. And for the members who haven't, the evaluator works as a standalone tool that quietly demonstrates the value of taking the full assessment.

That's the right product design: each tool is useful alone, but they're dramatically better together.

---

## Recommended Next Step

Update the Deal Evaluator spec to incorporate these seven shifts as a "With Assessment" mode vs. "Standalone" mode running through the same engine. The conditional logic is straightforward — it's mostly question skipping, language adaptation, and additional output sections on the Verdict page. The core scoring engine doesn't change.

The build sequence stays the same: build the evaluator as standalone first (it ships with the library in V1), then layer in assessment integration when the assessment ships in Phase 2.
