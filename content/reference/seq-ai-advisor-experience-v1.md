> **⚠️ SPEC FRESHNESS NOTE — read first**
>
> Architectural intent (layered prompts, structured chat components inline in conversation, unified pre-/post-assessment surface) is still right and reflected in the live code.
>
> **Outdated or not yet covered in this spec:**
> - `buildMemberContext()` injection pattern — every AI endpoint pulls a shared member-context block (see `src/lib/advisor/context-builder.ts`)
> - Shared roadmap generator at `src/lib/roadmap/generate-plan.ts` (Batch B)
> - Serverless `after()` + `maxDuration` pattern for long Claude calls — fire-and-forget without `after()` gets killed on Vercel
> - "Creative Identity" rebrand — "Assessment" naming in this spec refers to what the UI now calls Creative Identity
> - Persistent advisor memory — see `content/reference/advisor-memory-spec.md` (proposed, not yet implemented)
>
> **For the current architecture, read `CLAUDE.md` first**, then this spec for the conversational UX intent.

---

# In Sequence — AI Advisor Experience
## Unified Conversational Interface Spec

**Version:** 1.0  
**Date:** March 2026  
**Status:** Design Spec  
**Depends on:** Assessment Build Spec v2, Deal Evaluator Spec v2, PRD Phase 1 (Auth + Library)  

---

## 1. What This Is

A single page that adapts based on the member's state. For new members, it's a guided AI advisor that helps them map their position, evaluate deals, and explore the framework — delivered through a conversational interface with structured data capture. For returning members with a completed assessment, it becomes their strategic dashboard with the AI advisor always available in context.

The AI advisor is not a chatbot. It's a strategic tool that uses conversation as the interface for structured frameworks. Every interaction captures data, updates the member's profile, and connects to the In Sequence knowledge base.

---

## 2. Two States, One Page

### State 1: Pre-Assessment (New Member)

**URL:** `/advisor`  
**What the member sees:** A focused page built around the AI conversation.

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                              │
│  In Sequence · AI Advisor                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  INTRO BLOCK (compact, above the chat)              │
│  ┌────────────────────────────────────────────┐     │
│  │  "Your strategic advisor for navigating     │     │
│  │   the creative economy."                    │     │
│  │                                             │     │
│  │  One line of context about what this does.  │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │                                             │     │
│  │           AI CHAT WINDOW                    │     │
│  │                                             │     │
│  │  [Welcome message + 3 path cards]           │     │
│  │                                             │     │
│  │                                             │     │
│  │                                             │     │
│  │                                             │     │
│  │  ┌──────────────────────────────────────┐  │     │
│  │  │  Message input                        │  │     │
│  │  └──────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  LIBRARY TEASERS (below fold)                        │
│  ┌──────┐ ┌──────┐ ┌──────┐                        │
│  │ 35   │ │ 37+  │ │ 4    │                        │
│  │Struct│ │Cases │ │Stage │                        │
│  └──────┘ └──────┘ └──────┘                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Key principles:**
- The chat IS the page. Minimal chrome. No dashboard widgets competing for attention.
- Intro block is 2-3 lines max — enough to orient, not enough to read before engaging.
- Library teasers below the fold are subtle — they establish depth without demanding attention.
- The AI's first message is pre-loaded when the page renders. No empty state.

---

### State 2: Post-Assessment (Returning Member with Roadmap)

**URL:** `/advisor` (same URL, different state)  
**What the member sees:** Strategic dashboard with embedded AI advisor.

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                              │
│  In Sequence · Your Roadmap                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  STAGE BADGE + SUMMARY                               │
│  ┌────────────────────────────────────────────┐     │
│  │  Stage 2: Judgment Positioning              │     │
│  │  "You're delivering strategic value.        │     │
│  │   Time to price it that way."               │     │
│  │                                    [Retake] │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  THREE ACTIONS                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Action 1 │ │ Action 2 │ │ Action 3 │           │
│  │ ✅ Done  │ │ ◉ Active │ │ ○ Next   │           │
│  │          │ │          │ │          │           │
│  │          │ │ [Get     │ │          │           │
│  │          │ │  help →] │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                      │
│  MISALIGNMENT ALERTS (if active)                     │
│  ┌────────────────────────────────────────────┐     │
│  │  ⚠ You're delivering judgment-level value   │     │
│  │    at execution-level pricing.              │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  AI ADVISOR (embedded panel)                         │
│  ┌────────────────────────────────────────────┐     │
│  │  "Welcome back. You completed Action 1      │     │
│  │   last week. Ready to work on Action 2?"    │     │
│  │                                             │     │
│  │  [Work on Action 2]  [Evaluate a deal]      │     │
│  │  [Ask a question]                           │     │
│  │                                             │     │
│  │  ┌──────────────────────────────────────┐  │     │
│  │  │  Message input                        │  │     │
│  │  └──────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  RECOMMENDED FROM YOUR LIBRARY                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │Str#4 │ │Str#3 │ │Case: │ │Case: │              │
│  │Advsr │ │Equty │ │Temi  │ │Virgil│              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                      │
│  LONG-TERM VISION (expandable)                       │
│  ┌────────────────────────────────────────────┐     │
│  │  12-month target: Close first advisory...   │     │
│  │  3-year horizon: ...                  [more]│     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Key principles:**
- The roadmap is the page. The AI advisor is embedded within it, not separate.
- Each action card has a "Get help" link that activates the AI advisor with that action as context.
- The advisor's greeting is contextual — it knows what they've done and what's next.
- Library recommendations are personalized from the roadmap, not generic.
- The advisor panel can expand to full-screen for deeper conversations (deal evaluation, negotiation prep).

---

## 3. The Opening Experience (State 1 — New Members)

### AI's First Message

Pre-loaded when the page renders. The member never sees an empty chat.

```
ADVISOR MESSAGE:
━━━━━━━━━━━━━━━

Welcome to In Sequence. I'm your strategic advisor — built on 
research into how the creative economy is restructuring and 
what creative professionals can do about it.

I can help in a few ways. Where would you like to start?
```

Immediately below the message, three tappable cards:

```
┌─────────────────────────────────────────────┐
│                                              │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ 📋          │  │ 🤝          │           │
│  │ I HAVE A    │  │ MAP MY      │           │
│  │ DEAL TO     │  │ POSITION    │           │
│  │ EVALUATE    │  │             │           │
│  │             │  │ Understand  │           │
│  │ Get clarity │  │ where you   │           │
│  │ on a        │  │ stand and   │           │
│  │ specific    │  │ what to     │           │
│  │ offer or    │  │ do next.    │           │
│  │ opportunity.│  │             │           │
│  └─────────────┘  └─────────────┘           │
│                                              │
│  ┌─────────────────────────────┐            │
│  │ 🔍                          │            │
│  │ I'M JUST EXPLORING          │            │
│  │                              │            │
│  │ Browse the framework,        │            │
│  │ ask questions, see           │            │
│  │ what's possible.             │            │
│  └─────────────────────────────┘            │
│                                              │
└─────────────────────────────────────────────┘
```

**Card sizing:** "I have a deal" and "Map my position" are equal-width, side by side. "I'm just exploring" is full-width below them. This visual hierarchy puts the two action-oriented paths first, with the exploratory path as a comfortable fallback.

**After the member clicks a card,** the card choice appears as their first message in the chat (as if they typed it), and the AI responds. The three cards never appear again in this conversation.

---

### Path 1: "I Have a Deal to Evaluate"

**The active deal segment.** These members want to solve a problem NOW.

**AI Response after selection:**

```
ADVISOR:
━━━━━━━

Good — let's look at it together.

First, what kind of creative work do you do?
```

*[Discipline cards appear — same as Assessment Q1, tappable grid]*

After discipline selection:

```
ADVISOR:
━━━━━━━

Got it — directing. And how does your work typically 
reach the world?
```

*[Creative mode cards appear — same as Assessment Q2]*

After creative mode:

```
ADVISOR:
━━━━━━━

Now tell me about this deal. What type is it?
```

*[Deal type cards appear — the 7 deal categories from the evaluator spec, with descriptions adapted to their creative mode]*

The AI then runs the deal evaluator flow conversationally. Each dimension's questions appear as structured options in the chat. The AI provides brief context before each dimension:

```
ADVISOR:
━━━━━━━

Let's look at the financial side first. 

What's the total cash compensation in this deal?
```

*[Currency input appears inline in chat]*

```
ADVISOR:
━━━━━━━

And what would the standard market rate be for this 
scope of work in your field?
```

*[Currency input]*

The AI responds to each answer conversationally — not just collecting data, but reacting. If the cash ratio is below 40%:

```
ADVISOR:
━━━━━━━

That's a significant discount from market rate. That can be 
fine if there's meaningful equity or participation to offset 
it — we'll get to that. Let's keep going.
```

**At evaluation completion,** the AI presents the verdict inline:

```
ADVISOR:
━━━━━━━

Here's what I see in this deal:

🟡 PROCEED WITH CHANGES

The partner quality is strong and the positioning is right 
for where you are. But the equity terms need work — you're 
missing information rights and the vesting is misaligned 
with your scope.

Three things to negotiate before signing:

1. Add information rights (quarterly financials, cap table)
2. Shorten vesting to match your engagement timeline
3. Add single-trigger acceleration on acquisition

Want me to help you prepare for that negotiation?
```

*[Two option cards: "Help me prepare" → enters negotiation mode | "Show me the full breakdown" → expands the radar chart and dimension detail]*

**Assessment bridge:** After the deal evaluation is complete and the member has gotten value:

```
ADVISOR:
━━━━━━━

One more thing — this evaluation would be more precise 
if I had a fuller picture of your situation. The deal 
questions I asked gave me a partial view, but mapping 
your complete position would sharpen every future 
evaluation and give you a strategic roadmap.

Want to do that now? It's a 10-minute conversation.
```

*[Two options: "Let's do it" → enters assessment mode, skipping questions already answered | "Maybe later" → conversation continues normally, nudge doesn't repeat]*

**Data handling:** Every answer from the deal evaluation that overlaps with assessment questions (discipline, creative mode, income range, business structure) is stored in a `partial_assessment` record. If the member later does the full assessment, these answers pre-populate. Nothing is wasted.

---

### Path 2: "Map My Position"

**The explorer segment — but the motivated ones.** They want to understand where they stand.

**AI Response after selection:**

```
ADVISOR:
━━━━━━━

Let's figure out where you are — and where you could go.

This is a conversation, not a form. I'll ask you about 
your creative work, how you earn, what you own, and what 
you want. Takes about 10 minutes. Everything you share 
makes the guidance more specific.

Ready?
```

*[Single option: "Let's go"]*

The AI then runs the full assessment through the chat. The question flow follows the assessment spec exactly (Sections 1-5), but delivered conversationally with structured answer options.

**Key UX pattern — structured answers in chat:**

For single-select questions, the AI presents tappable option cards:

```
ADVISOR:
━━━━━━━

What's your primary creative discipline?

┌──────────┐ ┌──────────┐ ┌──────────┐
│Visual Art│ │ Design   │ │Film &    │
│          │ │          │ │Video     │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐
│Music &   │ │Writing   │ │Performing│
│Audio     │ │          │ │Arts      │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐
│Architect.│ │Fashion   │ │Advertis. │
│& Interior│ │& Apparel │ │& Market. │
└──────────┘ └──────────┘ └──────────┘
┌────────────────────────┐
│ Creative Tech          │
└────────────────────────┘
```

For ranking questions, a drag-to-rank widget appears inline:

```
ADVISOR:
━━━━━━━

What kind of creative work gives you the most energy? 
Drag to rank, most energizing at top.

  ≡ Making — the craft itself
  ≡ Shaping — solving creative problems
  ≡ Building — something bigger than a project
  ≡ Sharing — teaching, connecting with audience
```

For allocation questions (income structure), a slider set appears:

```
ADVISOR:
━━━━━━━

How is your income structured? Drag the sliders 
to approximate percentages.

  Project fees ████████████░░░░░░░░  60%
  Salary       ████████░░░░░░░░░░░░  20%
  Royalties    ████░░░░░░░░░░░░░░░░  10%
  Other        ████░░░░░░░░░░░░░░░░  10%
                              Total: 100%
```

For free text (the dream question), the regular text input is used:

```
ADVISOR:
━━━━━━━

Let's zoom out for a moment. Forget the practical. 
If money wasn't an issue, you could be anywhere, 
do anything, work with anyone — what would your 
creative life look like?

Just tell me what comes to mind.
```

**Between sections, the AI provides conversational transitions:**

```
ADVISOR (after Section 2 → Section 3):
━━━━━━━

Good — that gives me a sense of what matters to you. 
Now let's look at where things actually stand today. 
The business side.
```

```
ADVISOR (after Section 3 → Section 4):
━━━━━━━

I'm getting a clear picture. Based on what you've 
shared, I want to go deeper on a few things specific 
to your situation.
```

**The AI reacts to significant answers — it doesn't just collect data silently:**

If income structure is 100% project fees at $250K:
```
ADVISOR:
━━━━━━━

$250K from project fees alone — that's strong execution 
income. But it means every dollar requires your time. 
We'll come back to that.
```

If they answer "Can you make this?" for what clients pay for:
```
ADVISOR:
━━━━━━━

So right now you're primarily valued for execution. 
That's not wrong — it's where most creatives start. 
The question is whether that's where you want to stay.
```

**Assessment completion → Roadmap delivery:**

Once all sections are answered, the AI doesn't just dump a report. It presents the stage detection as a conversational reveal:

```
ADVISOR:
━━━━━━━

Alright — here's what I see.

You're currently at Stage 2: Judgment Positioning. 
Your clients already value your direction and perspective — 
that's clear from how they engage you. But structurally, 
you're still capturing Stage 1 economics. All your income 
comes from fees. No equity. No ownership. No advisory 
engagements priced separately from production.

That's the gap — and it's the most common one I see.

The good news: you're closer to the transition than 
you think. Here's what I'd focus on first.
```

Then the three actions appear as rich cards in the chat:

```
YOUR THREE NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────┐
│  1 · FOUNDATION                          │
│  Identify your judgment-ready            │
│  relationship                            │
│                                          │
│  Review your clients. Find the one who   │
│  asks for your perspective, not just     │
│  your production.                        │
│                                    [→]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  2 · POSITIONING                         │
│  Draft a restructured engagement         │
│  proposal                                │
│                                          │
│  I can help you write this. We'll use    │
│  Structure #4 as the foundation.         │
│                                    [→]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  3 · MOMENTUM                            │
│  Audit your unmonetized IP and           │
│  judgment                                │
│                                          │
│  Map what you own, what you've given     │
│  away, and what you could reclaim.       │
│                                    [→]   │
└─────────────────────────────────────────┘
```

After presenting the actions:

```
ADVISOR:
━━━━━━━

These are sequenced — Action 1 first. Want to 
start working on it now, or would you rather 
explore your full roadmap?
```

*[Two options: "Start Action 1" | "Show full roadmap"]*

**"Show full roadmap" transitions to State 2.** The page reloads in dashboard mode with the full roadmap rendered above the advisor. The AI conversation history persists in the advisor panel.

---

### Path 3: "I'm Just Exploring"

**The curious segment.** No urgency, no specific need. Just interested.

**AI Response after selection:**

```
ADVISOR:
━━━━━━━

Great — welcome. In Sequence maps how the creative economy 
is restructuring and what creative professionals can do 
about it. The short version: production is commoditizing, 
judgment is becoming scarce, and capital is following that 
scarcity.

What brought you here today?
```

*[Free text input — no structured options. Let them talk.]*

The AI reads their response and routes accordingly:

| If they say something like... | AI routes to... |
|-------------------------------|-----------------|
| "I feel underpaid" / "I'm stuck" / "things feel harder" | Validation → Assessment path. "That squeeze is structural, not personal. Want to map where you sit in it?" |
| "Someone told me about this" / "I saw a video" / "I read an article" | Context → Library exploration. "What resonated? I can go deeper on any part of the framework." |
| "I want to understand equity / licensing / deal structures" | Education → Specific structure or concept. AI teaches from the library, using their discipline if shared. |
| "I'm thinking about making a change" / "I want to own more" | Motivation → Assessment path. "Let's figure out where you are first. That'll make the path clearer." |
| "I have a deal / offer / opportunity" | Redirect → Deal evaluation path. "Let's look at it." |
| General or vague response | Orienting question → "Are you a working creative professional? What's your discipline?" Then guide from there. |

**The explore path is the most conversational.** No structured questions unless the member gravitates toward assessment or deal evaluation. The AI teaches, references the framework, links to library content, and gently surfaces the assessment when the moment is right.

**The assessment nudge in explore mode should feel organic, not salesy:**

```
ADVISOR:
━━━━━━━

You keep coming back to this question of whether you 
should be charging differently. That's a real signal. 
I could give you better guidance if I understood your 
full situation — income structure, how clients engage 
you, what you own. Want to map it out? Takes about 
10 minutes.
```

*[Two options: "Sure, let's do it" | "Not right now — keep going"]*

If they say not now, the AI respects it and doesn't ask again in this session.

---

## 4. Conversation Modes

The AI advisor operates in five modes. Mode transitions happen naturally based on conversational context — the member never needs to explicitly switch modes or navigate to a different tool.

### Mode 1: Assessment

**Triggered by:** "Map my position" path, or organic transition from explore mode.  
**Behavior:** Structured question flow from the assessment spec, delivered conversationally. Questions appear as structured UI elements (cards, sliders, ranking). AI reacts to answers, provides transitions between sections.  
**Data writes to:** `assessments` table. Same schema as the wizard.  
**On completion:** Generates roadmap via Claude API. Transitions page to State 2.

### Mode 2: Deal Evaluation

**Triggered by:** "I have a deal" path, "Evaluate a deal" from dashboard, or member mentions a deal in conversation.  
**Behavior:** Deal type identification → dimension questions (structured UI), adapted by creative mode and assessment context. Scoring runs in real time.  
**Data writes to:** `deal_evaluations` table. Links to `assessments` if available.  
**On completion:** Presents verdict inline. Offers negotiation prep or full breakdown.

### Mode 3: Negotiation Prep

**Triggered by:** "Help me prepare" after deal evaluation, or member asks for help with a specific conversation.  
**Behavior:** Two sub-modes:

**3A: Script Generation.** AI drafts specific language the member can use — proposals, counter-offers, boundary statements, term sheet language. Based on the deal evaluation data + relevant structure's negotiation guidance.

```
ADVISOR:
━━━━━━━

Here's language you could use to request information rights:

"As part of my equity participation, I'd like to include 
standard information rights — quarterly financial statements, 
annual cap table updates, and reasonable access to company 
metrics relevant to my role. This is standard for equity 
holders at my level of contribution."

Want me to adjust the tone or add anything?
```

**3B: Roleplay.** AI plays the counterparty. Member practices the conversation.

```
ADVISOR:
━━━━━━━

Let's practice. I'll play the founder of the company 
offering you equity. You've just asked for information 
rights. Here's how they might respond:

---

"We don't typically share financials with equity 
participants at your level. The board gets that 
information. I can give you high-level updates 
at our quarterly all-hands."

---

How would you respond?
```

*[Free text input — member practices their response]*

The AI then coaches:

```
ADVISOR:
━━━━━━━

Good instinct to push back. Two notes:

Your response was a bit apologetic — "I hope this 
isn't too much to ask" undermines your position. You 
have equity. Information rights are standard. Try it 
more directly:

"I appreciate the quarterly all-hands, but as an 
equity holder I'd need more granular visibility to 
make good strategic decisions for you. Quarterly 
financials and cap table access are standard for 
equity participants. I'm happy to sign an NDA if 
that helps."

Want to try another round?
```

**Data writes to:** Conversation stored in `ai_conversations`. Linked to `deal_evaluations` when triggered from an evaluation.

### Mode 4: Library / Education

**Triggered by:** Member asks a question about structures, concepts, or the framework. Or from "explore" path.  
**Behavior:** AI teaches from the knowledge base. References specific structures, case studies, and thesis content. Provides inline links to library resources.  
**Data writes to:** `ai_conversations` only. No structured data capture.

### Mode 5: Action Coaching (Post-Assessment Only)

**Triggered by:** Member clicks "Get help" on a roadmap action, or asks about their next steps.  
**Behavior:** AI has the full roadmap context and helps the member execute specific actions. For actions involving drafting (proposals, term sheets, agreements), the AI generates the document collaboratively.

```
ADVISOR (Action 2: Draft a restructured engagement):
━━━━━━━

Let's draft this together. Tell me about the client 
you identified in Action 1 — the one who already values 
your judgment.

What's the relationship? How long have you worked 
together? What do you currently charge them?
```

*[Free text — the member describes the situation]*

```
ADVISOR:
━━━━━━━

Based on that, here's a draft proposal framework. 
I'm using Structure #4 (Advisory/Consultant Model) 
as the foundation, adapted for your situation:

---

ADVISORY ENGAGEMENT PROPOSAL

To: [Client]
From: [Member]
Re: Restructuring our creative engagement

Over the past [X years], our work together has 
evolved from execution to strategic direction. 
I'd like to formalize that shift with a structure 
that better reflects the value...

[Draft continues]

---

Want me to adjust anything? We can refine the tone, 
the scope, or the pricing.
```

**Data writes to:** `ai_conversations` linked to `assessment_actions`. Updates action status when member marks as started/complete.

---

## 5. Structured UI Components in Chat

The AI chat supports rich UI elements inline — not just text. These are critical for the assessment and evaluator flows.

### Component Library

| Component | Used For | Behavior |
|-----------|----------|----------|
| **Option Cards** | Single-select questions (discipline, creative mode, deal type, etc.) | Grid of tappable cards. Selecting one posts it as the member's message and triggers the AI's next response. |
| **Multi-Select Cards** | "Select up to 2" questions (constraints, drains) | Same as option cards but allows multiple selection with a "Done" button. |
| **Ranking Widget** | "Rank 1-4" questions (energy ranking) | Drag-to-rank on desktop, tap-to-rank on mobile. Posts the ranked order as the member's message. |
| **Slider** | Income range, percentage allocations | Single slider for ranges. Multi-slider with auto-balancing for allocations (must sum to 100%). Posts the value(s). |
| **Currency Input** | Deal evaluator financial questions | Formatted number input with currency symbol. |
| **Free Text** | Dream question, specific question, explore responses | Standard text area. 3-4 lines visible. |
| **Action Cards** | Roadmap actions, recommended next steps | Rich cards with title, description, and CTA. Tapping opens the relevant mode. |
| **Verdict Display** | Deal evaluation results | Traffic light + summary + expandable radar chart + dimension breakdown. Rendered as a rich block in the chat. |
| **Roadmap Summary** | Assessment completion | Stage badge + three action cards + vision summary. Rendered as a rich block. |
| **Script Block** | Negotiation prep | Copyable text block with "Copy" button. Formatted as quoted text. |
| **Roleplay Block** | Negotiation roleplay | Visually distinct from AI's normal messages. Different background color or border to indicate "this is the counterparty speaking, not your advisor." |

### Interaction Rules

- **One structured component at a time.** The AI never presents two questions simultaneously. One question, one response, then the next.
- **Structured components replace text input.** When a structured component is active (option cards, slider, etc.), the free text input is still available as a fallback — the member can always type instead of tapping. The AI handles either gracefully.
- **Components disappear after interaction.** Once the member selects an option or submits a value, the component collapses into their message. The chat stays clean.
- **Progress indicator.** During assessment and deal evaluation modes, a subtle progress bar appears below the header showing section progress (not individual question count). "Section 2 of 5" or "Financial Readiness · 3 of 5."
- **Back navigation.** Member can scroll up and tap a previous answer to change it. The AI acknowledges the change and adjusts downstream if needed.

---

## 6. AI System Prompt Architecture

The AI advisor uses a layered system prompt that adapts based on mode and member state.

### Base Layer (Always Active)

```
You are the In Sequence strategic advisor. You help creative 
professionals navigate the structural restructuring of the 
creative economy.

VOICE: Grounded, specific, economical. No filler. Warm but direct.
Humble authority from practitioner experience. Never generic, 
never preachy, never "growth mindset" clichés. Adapt vocabulary 
to the member's creative discipline — a painter is not a 
"service provider," a musician doesn't have "clients."

FRAMEWORK:
- 4 stages: Execution ($75K-$200K), Judgment ($200K-$500K), 
  Ownership ($500K-$2M+), Capital ($2M+)
- 35 deal structures organized by stage
- 37+ case studies across disciplines
- Thesis: Production commoditizes. Discernment becomes scarce. 
  Capital follows scarcity.

BEHAVIOR:
- When asking assessment or evaluator questions, present them 
  using the structured UI components. Never ask structured 
  questions as free text.
- React to answers — don't just collect data silently. Brief, 
  relevant reactions that show you're listening.
- Never re-present the opening three-path cards after initial 
  selection.
- Transition between modes naturally based on conversational cues.
- Reference specific structures by number and case studies by name 
  when relevant.
- Actions must be STRUCTURAL — entity formation, deal structures, 
  professional advisors, IP protection. NOT content strategy, 
  marketing tactics, or growth hacks.
- When the member needs to draft something (proposals, term sheets, 
  agreements), offer to generate it collaboratively.
```

### Member Context Layer (Injected Per-Session)

```
MEMBER PROFILE:
{member_profile_json}

ASSESSMENT DATA:
{assessment_data_json OR "No assessment completed. Partial data: {partial}"}

ROADMAP:
{roadmap_json OR "No roadmap generated yet."}

ACTIVE ACTIONS:
{action_status_json OR "N/A"}

DEAL EVALUATION HISTORY:
{recent_evaluations_json OR "No evaluations yet."}

CONVERSATION HISTORY:
{conversation_summary OR "New conversation."}
```

### Mode-Specific Layers (Activated by Mode)

**Assessment Mode:**
```
You are currently in ASSESSMENT MODE. Follow the question flow 
from the assessment spec. Present questions using structured UI 
components. The question bank and scoring logic are provided below.

Current section: {section_number}
Questions remaining: {count}
Answers collected so far: {answers_json}

QUESTION BANK FOR THIS SECTION:
{questions_for_current_section}

After each answer, compute running stage score and check for 
misalignment flags. React briefly to significant answers.

When all sections are complete, generate the strategic roadmap 
using the archetype matching and personalization logic.
```

**Evaluator Mode:**
```
You are currently in EVALUATOR MODE. Run the deal evaluation 
flow from the evaluator spec.

Deal type: {identified_deal_type}
Mapped structures: {structure_ids}
Creative mode: {mode}
Assessment context: {assessment_context_object}

DIMENSION QUESTIONS FOR {deal_type}:
{questions_with_skip_logic}

Present dimension questions using structured UI. Provide brief 
context before each dimension. React to concerning answers.

On completion, compute scores, detect red flags, generate verdict. 
If assessment exists, include misalignment warnings and roadmap 
alignment analysis.
```

**Negotiation Mode:**
```
You are currently in NEGOTIATION MODE.

Deal evaluation context: {evaluation_json}
Recommended actions from evaluation: {actions}
Relevant structure: {structure_detail_with_negotiation_guidance}

Two sub-modes:
- SCRIPT: Generate specific, usable language. Copy-ready. 
  Reference the structure's negotiation guidance.
- ROLEPLAY: Play the counterparty realistically. After 
  each member response, break character to coach — then 
  offer another round.
```

---

## 7. Data Architecture

### New / Modified Tables

The assessment and deal evaluation data models from the existing specs remain unchanged. The AI advisor adds:

```sql
-- AI conversation storage
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conversation metadata
  title TEXT,                                     -- auto-generated or member-provided
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  
  -- Mode tracking
  current_mode TEXT NOT NULL DEFAULT 'explore',   -- assessment | evaluator | negotiation | library | action_coaching | explore
  modes_used TEXT[],                              -- all modes entered during this conversation
  
  -- Linked records (populated as modes are entered)
  assessment_id UUID REFERENCES assessments(id),         -- if assessment was started/completed
  evaluation_id UUID REFERENCES deal_evaluations(id),    -- if deal was evaluated
  action_id UUID REFERENCES assessment_actions(id),      -- if coaching a specific action
  
  -- Messages (ordered array)
  messages JSONB[] NOT NULL DEFAULT '{}',
  -- Each message: {
  --   role: 'advisor' | 'member',
  --   content: string,
  --   structured_component?: { type, data, response },  -- for structured UI interactions
  --   mode: string,                                     -- which mode was active
  --   timestamp: ISO string
  -- }
  
  -- Context snapshot (for resuming conversations)
  context_snapshot JSONB,                        -- serialized state at last message
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial assessment data (from deal evaluator or explore conversations)
CREATE TABLE partial_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id),
  
  -- Whatever was captured outside the formal assessment
  discipline TEXT,
  creative_mode TEXT,
  income_range TEXT,
  business_structure TEXT,
  additional_data JSONB,                         -- any other assessment-adjacent data captured
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partial_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_conversations" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_partials" ON partial_assessments
  FOR ALL USING (auth.uid() = user_id);
```

### Data Flow

```
Member enters advisor page
  │
  ├─ State 1 (no assessment) → AI conversation starts
  │    │
  │    ├─ Path 1: Deal → evaluator mode → deal_evaluations + partial_assessments
  │    │    └─ optional → assessment mode → assessments + strategic_plans → State 2
  │    │
  │    ├─ Path 2: Map position → assessment mode → assessments + strategic_plans → State 2
  │    │
  │    └─ Path 3: Explore → library/explore mode → ai_conversations
  │         └─ organic → assessment mode → assessments + strategic_plans → State 2
  │
  └─ State 2 (assessment exists) → Dashboard renders
       │
       ├─ Action coaching → ai_conversations (linked to assessment_actions)
       ├─ Deal evaluation → deal_evaluations (linked to assessments)
       ├─ Negotiation prep → ai_conversations (linked to deal_evaluations)
       └─ General questions → ai_conversations
```

---

## 8. State 2: Returning Member Advisor Behavior

When a member with a completed assessment returns, the AI advisor panel on the dashboard is contextually aware.

### Greeting Logic

The AI's greeting adapts based on what's happened since the last visit:

| Condition | Greeting Pattern |
|-----------|-----------------|
| First visit after assessment | "Your roadmap is ready. Here's what I'd focus on first — [Action 1 summary]. Want to dig in?" |
| Action 1 marked complete | "Nice — [Action 1] is done. Ready for Action 2? I can help you [specific to action 2]." |
| Deal evaluation completed since last visit | "How did the [deal name] evaluation turn out? Did you end up negotiating those terms?" |
| 90+ days since assessment | "It's been [X] months since your assessment. Things may have shifted. Want to retake it and see where you stand now?" |
| No activity in 30+ days | "Welcome back. Where are things at? Anything new happening with your work?" |

### Quick Action Options

Below the greeting, contextual options based on member state:

```
[Work on Action 2]  [Evaluate a deal]  [Ask a question]
```

These change based on what's most relevant:
- If all 3 actions complete: `[Retake assessment]  [Evaluate a deal]  [Explore structures]`
- If a deal evaluation is pending outcome: `[Update deal outcome]  [Evaluate another deal]`
- If assessment is stale (90+ days): `[Retake assessment]  [Evaluate a deal]  [Ask a question]`

---

## 9. Mobile Experience

The advisor page is mobile-first. On mobile:

**State 1 (pre-assessment):**
- Intro block compresses to 1 line
- Chat is full-screen below it
- Structured components (cards, sliders) are optimized for thumb interaction
- Library teasers are hidden (accessible via nav)

**State 2 (post-assessment):**
- Stage badge + actions stack vertically
- AI advisor is a collapsible section or bottom sheet
- Tapping "Get help" on an action expands the advisor to full screen with that action as context
- Swiping down minimizes the advisor back to the dashboard view

---

## 10. Technical Implementation Notes

### Chat Architecture

```
Browser (React) 
  → Next.js API route (/api/advisor/chat)
    → Load member context (Supabase)
    → Construct system prompt (base + context + mode layers)
    → Stream response from Anthropic API
    → Parse structured component requests from AI response
    → Write to ai_conversations table
    → Return streamed response + component instructions to frontend
```

### Structured Component Protocol

The AI's response includes special markers that the frontend interprets as structured components:

```json
{
  "type": "structured_component",
  "component": "option_cards",
  "data": {
    "question_id": "Q1",
    "options": [
      {"value": "visual_arts", "label": "Visual Arts"},
      {"value": "design", "label": "Design"},
      ...
    ],
    "selection_type": "single"
  }
}
```

The frontend renders the component. When the member interacts, it sends the response back as a structured message that the AI receives as context in the next turn.

### Streaming

AI responses stream in real-time (Anthropic streaming API). Text appears token-by-token. Structured components render after the text preceding them is complete. This feels natural — the AI "says something" then "offers options."

### Session Management

- Conversations persist across browser sessions. Member returns and picks up where they left off.
- Context window management: for long conversations, older messages are summarized and compressed. The most recent 20 messages + all structured data (assessment answers, evaluation scores) are always included in full.
- Mode state is tracked server-side. If a member closes the browser mid-assessment, they resume at the exact question they were on.

---

## 11. Build Sequence

| Order | Task | Details |
|-------|------|---------|
| 1 | Chat infrastructure | WebSocket or SSE streaming from Anthropic API. Message storage. Session management. |
| 2 | Structured component system | React component library for option cards, sliders, ranking, currency input, etc. Protocol for AI → component rendering. |
| 3 | Opening experience | Three-path entry, AI first message, path routing logic. |
| 4 | Assessment mode | Assessment question flow through chat. Structured data capture. Scoring engine (reuse from wizard build). Stage detection. Archetype matching. |
| 5 | Roadmap generation | Claude API integration for roadmap. Inline roadmap display. Transition to State 2. |
| 6 | State 2 dashboard | Roadmap display, action cards, advisor panel, contextual greeting logic. |
| 7 | Deal evaluator mode | Evaluation flow through chat. Scoring, verdict display, radar chart inline. Assessment context integration. |
| 8 | Negotiation mode | Script generation. Roleplay with character switching. Coaching feedback. |
| 9 | Action coaching mode | Per-action context loading. Collaborative drafting. Action status tracking. |
| 10 | Library/explore mode | RAG integration. Citation linking. Structure and case study references. |
| 11 | Mobile optimization | Bottom sheet advisor, touch-optimized components, responsive layouts. |
| 12 | Admin review queue | For first 50-100 AI-generated roadmaps. Review, edit, approve flow. |
| 13 | Partial assessment capture | Data from deal evaluator path stored for future assessment pre-population. |
| 14 | Conversation history | Persistent history, resume, context compression for long conversations. |

### Dependency on Existing Specs

This spec does NOT replace the assessment spec or deal evaluator spec. It uses them:

| Existing Spec | What This Spec Uses From It |
|--------------|----------------------------|
| `seq-assessment-build-spec-v2.md` | Question bank, scoring weights, archetype definitions, misalignment flags, stage detection logic, roadmap output schema, action playbooks |
| `deal-evaluator-spec-v2.md` | Six evaluation dimensions, all question sets (by deal type), scoring weights, red flag overrides, verdict structure, assessment integration logic |
| `deal-evaluator-assessment-integration.md` | Misalignment warning matrix, roadmap alignment logic, creative mode adaptation map, question skip/pre-fill rules |
| `InSequence-PRD-v1.md` | Tech stack, data model, auth system, library content schema, RAG pipeline, admin dashboard |

The conversational interface is a UX layer on top of the same data architecture. The scoring engines, question banks, and output schemas are identical to the wizard-based specs.

---

## 12. What This Replaces vs. What It Preserves

| From the Original Specs | Status |
|------------------------|--------|
| Assessment wizard UI (multi-step form) | **Already built. Preserved as fallback.** If a member prefers forms over chat, the wizard still works. Data model is identical. |
| Deal evaluator wizard UI | **Replaced by evaluator mode in chat.** Same questions, same scoring, conversational delivery. |
| Separate AI advisor page | **Merged.** The advisor IS the assessment + evaluator + coaching interface. One page, one experience. |
| Separate deal evaluator page | **Merged into advisor.** Can still be deep-linked: `/advisor?mode=evaluator` opens directly in eval mode. |
| Negotiation roleplay (was V3 in evaluator spec) | **Pulled forward.** Now part of the advisor's negotiation mode. Available from launch. |
| Assessment retake (quarterly) | **Preserved.** Triggered from State 2 dashboard. Runs through assessment mode in chat. Comparison view shows progression. |

---

*End of spec. This document, combined with the assessment build spec and deal evaluator spec, provides everything needed to build the unified AI advisor experience.*
