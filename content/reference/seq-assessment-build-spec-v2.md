> **⚠️ SPEC FRESHNESS NOTE — read first**
>
> This spec was the original design intent. The question bank, stage scoring weights, misalignment flag patterns, and 6 archetype definitions in this doc are **still authoritative** and should not be deviated from.
>
> **Outdated in this spec:**
> - UI naming — "Assessment" is now "Creative Identity" everywhere user-facing (DB table name `assessments` unchanged)
> - Roadmap data flow — assumed assessment was the only input. Portfolio + last 90 days of deal evaluations now also feed `src/lib/roadmap/generate-plan.ts`
> - Roadmap trigger — `strategic_plans.assessment_id` is now nullable (migration `00015_roadmap_decoupling.sql`); plans can also originate from Portfolio Analysis
>
> **For the current architecture, read `CLAUDE.md` first**, then this spec for the underlying scoring logic.

---

# In Sequence — Assessment + Strategic Roadmap
## Build Specification for Claude Code

**Version:** 2.0  
**Date:** February 27, 2026  
**Status:** Ready for Build  
**Phase:** PRD Phase 2 (depends on Phase 1: Auth + Library + Payments)

---

## 1. What This Is

A multi-step assessment that maps a creative professional's current position, industry, structural reality, and ambition — then generates a personalized strategic roadmap with near-term atomic actions and long-term vision.

**It is NOT:**
- A personality quiz
- A service-provider business growth tool
- A generic "here's your type" output

**It IS:**
- A strategic audit that produces a usable document
- Equally relevant to a painter, filmmaker, musician, or designer
- Built around the In Sequence progression framework (4 stages, 35 deal structures)
- The context foundation for the future AI advisor (Phase 3)

---

## 2. Product Decisions (Confirmed)

| Decision | Answer |
|----------|--------|
| **Gating** | Assessment is NOT required to onboard. If not completed, it appears as a CTA card on the member dashboard + a link in navigation. Encouraged, not forced. |
| **Free vs. Gated** | **Free intake, gated output.** Anyone can take the assessment. Stage detection + top misalignment shown free. Full roadmap, deep dive, personalized actions, relevant case studies, and structure recommendations gated behind membership. "Join to see your full roadmap." |
| **Human Review** | Neil reviews AI-generated plans for first 50-100 members to calibrate quality. After calibration: auto-release with periodic spot checks. Build a simple admin review queue. |
| **Referral Partners** | List recommended providers/platforms in action steps. No formal affiliate integration at launch. Structure the data model so affiliate tracking CAN be added later. |
| **AI Assistant Handoff** | Any roadmap action that involves drafting, writing, or creating a document (e.g., "draft an advisory proposal," "create a term sheet") should include a CTA to the In Sequence AI assistant (Phase 3) with pre-populated context. Build the hook now, activate when Phase 3 ships. |

---

## 3. Assessment Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSESSMENT WIZARD                             │
│                                                                 │
│  [1] CREATIVE IDENTITY        (2-3 questions)   ~1 min         │
│       ↓                                                         │
│  [2] FEELING + ENERGY         (3-4 questions)   ~2 min         │
│       ↓                                                         │
│  [3] CURRENT REALITY          (5-7 questions)   ~3 min         │
│       ↓ (stage detected here)                                   │
│  [4] ADAPTIVE DEEP DIVE       (8-12 questions)  ~4 min         │
│       ↓ (industry + stage specific)                             │
│  [5] VISION + AMBITION        (3-4 questions)   ~2 min         │
│       ↓                                                         │
│  [OUTPUT] STRATEGIC ROADMAP                                     │
│       ├── Your Position (free)                                  │
│       ├── Your Misalignments (free teaser, full gated)         │
│       ├── Your Three Next Actions (gated)                       │
│       ├── Your Long-Term Vision (gated)                         │
│       └── Your Library (gated — relevant structures + cases)    │
└─────────────────────────────────────────────────────────────────┘
```

**Total:** ~25-30 questions. Target completion: 8-12 minutes.  
**Progress:** Auto-saved after each section. User can leave and resume.  
**Mobile:** Fully responsive. Wizard format, one question or small group at a time.

---

## 4. Section-by-Section Question Design

### SECTION 1: Creative Identity (2-3 questions)

**Purpose:** Route the entire assessment. Determines which question paths, deal structures, and case studies are relevant.

**Design note:** This section must immediately signal to ALL types of creatives — painters, musicians, actors, screenwriters, sculptors, not just service providers — that this assessment is for them. The language and options should feel expansive, not corporate.

---

**Q1: What's your primary creative discipline?**

*UI: Card grid with icons. Select one. "Other" option with free text.*

| Group | Options Shown |
|-------|---------------|
| **Visual Arts** | Painting, Sculpture, Illustration, Mixed Media, Digital Art, Photography (Fine Art) |
| **Design** | Brand / Identity, Product / UX, Graphic, Motion, Environmental / Spatial, Web / Digital |
| **Film & Video** | Directing, Screenwriting, Cinematography, Editing / Post, Producing, Animation |
| **Music & Audio** | Artist / Performer, Songwriter, Producer, Composer / Scoring, Sound Design, DJ / Electronic |
| **Writing** | Fiction / Literary, Nonfiction / Journalism, Screenwriting, Copywriting, Content / Editorial |
| **Performing Arts** | Acting, Dance / Choreography, Theater (Directing / Producing), Comedy / Spoken Word |
| **Architecture & Interiors** | Residential, Commercial, Landscape, Interior Design |
| **Fashion & Apparel** | Design, Styling, Creative Direction, Manufacturing / Production |
| **Advertising & Marketing** | Creative Direction, Strategy, Media / Content, Brand Consulting |
| **Technology & Creative Tech** | Creative Coding, Game Design, XR / Immersive, AI-Augmented Creative |

*After selection, if a group contains sub-disciplines, show them as a secondary select. If user selects "Other," free text input.*

**Q2: How does your creative work reach the world?**

*UI: Select one. This replaces the service-provider-oriented "how do you work" question with language that applies to all creatives.*

- **I make things and sell/license them directly** (artist selling work, musician releasing music, author publishing books)
- **I make things for clients or employers** (freelancer, agency, in-house creative)
- **I do both** — personal creative work + client/commercial work
- **I perform, direct, or lead creative projects** (actor, director, choreographer, creative director)
- **I'm building something** — a studio, label, brand, or creative business
- **I'm between things or figuring it out**

**Mapping logic:**

| Response | Creative Mode Flag |
|----------|-------------------|
| Sell/license directly | `maker` |
| Make for clients/employers | `service` |
| Both | `hybrid` |
| Perform/direct/lead | `performer` |
| Building something | `builder` |
| Between things | `transition` |

This flag adjusts language throughout the rest of the assessment. "Client" becomes "collaborator" or "partner" for makers. "Revenue" replaces "billing." "Your work" replaces "your services." The questions adapt in tone, not just content.

---

### SECTION 2: Feeling + Energy (3-4 questions)

**Purpose:** Start with intuition and emotion before business metrics. This does two things: (1) builds trust by showing the assessment cares about the human, not just the spreadsheet, and (2) captures alignment data that shapes the roadmap's priorities.

**Design note:** This section should feel like a conversation, not a form. Warm, reflective tone.

---

**Q3: What kind of creative work gives you the most energy?**

*UI: Rank these 1-4 (drag-and-drop on desktop, tap-to-rank on mobile).*

- **Making** — the craft itself, hands on the work
- **Shaping** — solving creative problems, directing outcomes
- **Building** — creating something bigger than a single project
- **Sharing** — teaching, mentoring, or connecting with an audience

**Q4: What drains you most about your current situation?**

*UI: Select up to 2.*

- My work is undervalued relative to the impact it creates
- I spend too much time on things that aren't my creative work
- I don't have enough creative control or ownership over what I make
- I'm not sure where the industry is going — or where I fit in it
- I'm working too much for too little return
- I feel stuck but don't know what the next move is

**Q5: The dream question — no constraints.**

*UI: Free text, 3-4 line text area.*

> "Forget the practical for a moment. If money wasn't an issue, you could be anywhere, do anything, work with anyone — what would your creative life look like?"

*Placeholder text: "Describe the work, the lifestyle, the impact — whatever comes to mind."*

**Why this matters:** This answer won't determine the roadmap directly, but it does two important things. First, it loosens the user's thinking — they stop optimizing for "realistic" and start revealing what they actually want. Second, it gives the AI advisor (Phase 3) a rich piece of context for future conversations. Store this answer prominently in the user profile.

---

### SECTION 3: Current Reality (5-7 questions)

**Purpose:** Detect the user's current stage (1-4) from behavioral signals. We don't ask "what stage are you?" — we infer it.

**Design note:** Adapt question language based on the Creative Mode Flag from Q2. Examples noted below with `[service]` and `[maker]` variants.

---

**Q6: What's your approximate annual income from your creative work?**

*UI: Slider with labeled stops OR card select for ranges.*

- Under $50K
- $50K – $75K
- $75K – $100K
- $100K – $150K
- $150K – $200K
- $200K – $300K
- $300K – $500K
- $500K – $1M
- $1M+
- Prefer not to say *(still generates useful output, just less precise stage detection)*

**Q7: How is that income structured?**

*UI: Slider allocation (pie chart visual) totaling 100%. Labels adapt by Creative Mode.*

| For `service` / `hybrid` | For `maker` / `performer` | Category Key |
|--------------------------|--------------------------|--------------|
| Salary / W-2 employment | Salary / employment | `salary` |
| Project fees / invoices | Sales of original work | `fees_sales` |
| Retainer / ongoing contracts | Commissions / contracted work | `retainer_commission` |
| Royalties / licensing fees | Royalties / licensing fees | `royalties` |
| Equity / profit participation | Equity / profit participation | `equity` |
| Product revenue (courses, tools) | Merch / products / publishing | `products` |
| Other | Other | `other` |

**Q8: When people engage you or buy your work, what are they really paying for?**

*UI: Select ONE that best describes the majority of your creative income.*

*Adapts by Creative Mode:*

**For `service` / `hybrid`:**
- "Can you make this?" — They have a brief or spec, I execute it
- "Can you make this better?" — They have something, I elevate it
- "What should we make?" — They have a problem, I define the creative solution
- "Where should we go?" — They have a business or brand, I set the creative direction
- "Will you build this with us?" — They want me as a partner, not a vendor

**For `maker` / `performer`:**
- People buy my work after it's made — I create, then sell or show
- People commission me to make specific work for them
- People seek me out because of my perspective — my point of view is the product
- People want to collaborate — my vision attracts partnerships and co-creation
- People invest in what I'm building — my body of work or brand has momentum

**For `builder`:**
- I'm still primarily executing or creating for others
- I'm transitioning — some client/execution work, some building my own thing
- I'm mostly building my own venture and it's generating revenue
- I run a creative business that's growing independent of my personal production

**Scoring logic:** This is the strongest single stage signal. First options = Stage 1. Middle options = Stage 2. Later options = Stage 3+.

**Q9: Do you own equity, profit participation, royalty rights, or IP rights in anything beyond your own direct work?**

*UI: Select one.*

- No — never had an ownership or rights deal
- I've been offered one but it didn't happen
- Yes — 1 position (even if small)
- Yes — 2-3 positions
- Yes — 4+ positions or a structured portfolio

**Q10: How much demand is there for your creative work right now?**

*UI: Select one. Language adapts by Creative Mode.*

**For `service` / `hybrid`:**
- I'm actively looking for work / clients
- I have some work but need more
- I have steady work from repeat relationships
- I have more inbound than I can handle — I'm regularly saying no

**For `maker` / `performer`:**
- I'm working to build an audience / buyers / representation
- I have some traction but it's inconsistent
- I have a consistent following, collector base, or booking calendar
- Demand exceeds my output — I have waitlists, sell out, or turn down opportunities

**Q11: What is your current business structure?**

*UI: Select one.*

- No formal structure (sole proprietor by default)
- Sole proprietorship (registered)
- Single-member LLC
- LLC taxed as S-Corp
- Multiple entities (LLC + Corp, holding company, etc.)
- Corporation (C-Corp or S-Corp)
- I work through an employer (W-2) with no separate entity
- I don't know

---

#### Stage Detection Scoring

Each Q6-Q11 answer carries a weighted score toward Stages 1-4. The composite determines:

| Output | Type | Description |
|--------|------|-------------|
| `detected_stage` | `1 \| 2 \| 3 \| 4` | Which stage the majority of signals point to |
| `transition_readiness` | `low \| moderate \| high` | How many signals point to the NEXT stage |
| `misalignment_flags` | `string[]` | Where signals contradict each other |
| `creative_mode` | `string` | From Q2 — persists through entire profile |

**Misalignment examples (auto-detected):**

| Pattern | Flag Key | Description |
|---------|----------|-------------|
| High income ($300K+) + no entity or sole prop | `income_exceeds_structure` | Earning at Stage 2-3, infrastructure at Stage 0 |
| Clients ask for direction (judgment) but income is all project fees | `judgment_not_priced` | Delivering Stage 2 value, capturing Stage 1 |
| Long-term relationships but no equity ever proposed | `relationships_not_converted` | Relationship assets exist, never monetized |
| Owns IP/catalog but no licensing or royalty income | `ip_not_monetized` | Sitting on unmonetized assets |
| High demand (turning down work) but still sole practitioner | `demand_exceeds_capacity` | Could leverage team/structure, isn't |
| Strong creative reputation + no business infrastructure | `talent_without_structure` | Cultural influence without structural support |

---

### SECTION 4: Adaptive Deep Dive (8-12 questions)

**Purpose:** Go deeper based on detected stage AND creative discipline. Everyone gets 8-12 questions — the QUESTIONS change, not the count.

**Architecture:** Questions are drawn from pools. The assessment engine selects based on:
1. `detected_stage` (from Section 3 scoring)
2. `creative_mode` (from Q2)
3. `discipline` (from Q1)

---

#### 4A: Stage-Adaptive Questions

**Pool: Stage 1 (Execution Excellence)**

*These users need infrastructure and positioning foundations.*

**Q-S1-BIZ: Do you have a separate business bank account?**
- Yes — with a business credit card
- Yes — but no business credit card
- No — I use personal accounts for everything
- Not applicable (employed W-2 only)

**Q-S1-FIN: How do you handle your finances?**
- I don't really separate business from personal finances
- I use basic tools (spreadsheet, app) but manage it myself
- I have accounting software and manage it myself
- I have a bookkeeper or accountant
- I have a bookkeeper AND accountant/CPA

**Q-S1-CONTRACT: How are the terms of your work typically documented?**

*Adapts by Creative Mode:*

| `service` / `hybrid` | `maker` / `performer` |
|-----------------------|-----------------------|
| I use my own contracts for every engagement | I have standard agreements for sales, commissions, or licensing |
| I usually sign the client's terms | Galleries, labels, or partners set the terms and I sign |
| Sometimes documented, sometimes informal | Some deals are documented, some are handshakes |
| Most work is informal — no contracts | Most of my work has no formal agreements |

**Q-S1-IP: Who typically owns what you create?**

| `service` / `hybrid` | `maker` / `performer` |
|-----------------------|-----------------------|
| The client owns everything (work-for-hire) | I own everything I make |
| Mixed — some work-for-hire, some I retain rights | I own most, but have given up rights on some deals |
| I retain IP and license usage to clients | Labels, galleries, or publishers own some of my catalog |
| I've never thought about this | I'm not sure who owns what — it's never been clear |

---

**Pool: Stage 2 (Judgment Positioning)**

*These users need to formalize the judgment transition and begin ownership.*

**Q-S2-VALUE: Have you ever priced your work based on the value or outcome it creates — rather than time, materials, or standard rates?**
- No — I charge standard rates for my discipline
- I've experimented but don't do it consistently
- I do this regularly with some clients / buyers / partners
- This is how I price most of my work

**Q-S2-LEVERAGE: Do you have people who can execute or produce work under your direction?**
- No — I do everything myself
- Occasionally — I bring in collaborators for specific things
- Yes — I have 1-3 reliable people I direct regularly
- Yes — I have a team or network that handles most production

**Q-S2-FRAMEWORKS: Do you have documented approaches, methods, or frameworks that are uniquely yours?**
- No — I work intuitively
- I have informal approaches but nothing documented
- I have documented processes I use internally
- I've shared my methods publicly (writing, talks, workshops, teaching)
- My methodology or point of view is a recognized part of my reputation

**Q-S2-ADVISORY: Have you ever been paid specifically for your creative judgment — separate from making or producing anything?**

*Adapts by Creative Mode:*

| `service` / `hybrid` | `maker` / `performer` / `builder` |
|-----------------------|-----------------------------------|
| No — I wouldn't know how to position that | No — my income comes from the work itself |
| I've thought about it but haven't tried | I've been asked for opinions/direction but never charged for it |
| Yes — I have at least one advisory/consulting engagement | Yes — I've been paid for creative direction, A&R, consulting, curation, or judging |
| Strategic/advisory work is a significant part of my income | Advisory, direction, or curation is a meaningful income stream |

---

**Pool: Stage 3 (Ownership Accumulation)**

*These users need portfolio structure and professional infrastructure.*

**Q-S3-STREAMS: How many distinct types of income do you currently have?**
- 1 (all from one source)
- 2 (e.g., client work + one product, or sales + licensing)
- 3-4 (diversified across categories)
- 5+ (highly diversified)

**Q-S3-NONEXEC: What percentage of your income comes from sources that don't require you to actively produce or perform?**
*(Advisory fees, equity returns, royalties, licensing, product sales, passive revenue)*
- Less than 10%
- 10-25%
- 25-50%
- More than 50%

**Q-S3-ADVISORS: Do you have professional advisors who understand creative industries?**
- No professional advisors
- General accountant/lawyer (not creative-industry specific)
- Industry-specific accountant OR lawyer
- Industry-specific accountant AND lawyer
- Full advisory team (accountant, lawyer, financial advisor — all with creative-industry experience)

**Q-S3-STRUCTURE: How are your various income streams and business activities currently organized?**
- Everything runs through one entity or my personal name
- I have one entity but it's getting complicated
- I have multiple entities but they're not strategically organized
- I have a holding company or parent entity organizing everything
- I need help figuring out what structure makes sense

---

#### 4B: Industry-Specific Questions

*Drawn from the user's Q1 discipline selection. 2-3 questions per discipline group. These surface industry-specific ownership patterns and deal norms.*

**Visual Arts (Painting, Sculpture, Illustration, Mixed Media, Fine Art Photography):**

**Q-IND-ART-1: How do you currently sell or monetize your work?**
- Direct sales (studio, shows, online)
- Through a gallery (exclusive or non-exclusive representation)
- Commissions
- Licensing / reproduction rights
- Mix of the above
- I haven't figured out monetization yet

**Q-IND-ART-2: What happens to your work after it's sold?**
- The buyer owns it completely — I have no ongoing rights or participation
- I retain reproduction/licensing rights
- I have resale royalty agreements (or I'm in a jurisdiction with artist resale rights)
- I've never thought about what rights I retain after sale

---

**Film & Video (Directing, Screenwriting, Cinematography, Editing, Producing, Animation):**

**Q-IND-FILM-1: What's your typical compensation structure?**
- Day rate or flat fee (work-for-hire)
- Fee + deferred compensation or backend points
- Fee + profit participation
- Producer/partner role with meaningful equity or ownership
- I primarily work on my own projects

**Q-IND-FILM-2: Do you own any completed projects or IP?**
- No — everything I've worked on is owned by others
- I have personal projects (shorts, docs, etc.) but nothing commercially released
- I own 1-2 completed commercial projects
- I own a growing catalog of content
- I'm building a production company or label

---

**Music & Audio (Artist, Songwriter, Producer, Composer, Sound Design, DJ):**

**Q-IND-MUSIC-1: What's your current ownership situation with masters and publishing?**
- I don't own my masters and publishing is assigned to a label/publisher
- I own some masters but publishing is mostly with a label/publisher
- I own both masters and publishing for most of my work
- I have a catalog generating ongoing royalty income
- Not applicable to my role (engineer, sound designer, etc.)

**Q-IND-MUSIC-2: How diversified is your music income?**
- Primarily one source (streaming OR live OR sync OR session work)
- Two sources
- Three or more sources (streaming + live + sync + licensing + merch + brand deals, etc.)
- I have multiple income streams plus equity in music-related ventures

---

**Writing (Fiction, Nonfiction, Screenwriting, Copywriting, Content):**

**Q-IND-WRITING-1: How is your writing typically compensated?**
- Per-word, per-piece, or flat project fees
- Salary / staff position
- Advance + royalties (book deals)
- Revenue share, licensing, or equity in publications/platforms
- Mix of fee + ongoing participation

**Q-IND-WRITING-2: What do you own from what you've written?**
- Most of my work is owned by employers or clients (work-for-hire)
- I own some of my published work but not all
- I own most of my published work and have ongoing royalty streams
- I have a body of IP (books, scripts, etc.) that generates recurring income

---

**Performing Arts (Acting, Dance, Choreography, Theater, Comedy):**

**Q-IND-PERF-1: How is your performance work typically structured?**
- Per-gig fees or day rates
- Union scale / standard contracts (SAG-AFTRA, Equity, etc.)
- Fee + residuals or backend participation
- I produce my own work and control the economics
- I'm building a production entity or platform

**Q-IND-PERF-2: Beyond performing, do you create or own any IP?**
- No — I'm primarily a performer/interpreter
- I've created original material but don't own it formally
- I own original material (scripts, shows, choreography, specials)
- I have a growing body of owned IP that I control and monetize

---

**Design (Brand, Product/UX, Graphic, Motion, Environmental, Web):**

**Q-IND-DESIGN-1: Who typically owns the creative work you produce?**
- The client owns everything (work-for-hire standard)
- Mixed — some work-for-hire, some where I retain rights
- I retain IP and license usage to clients
- I've never really thought about this

**Q-IND-DESIGN-2: Have you ever shared in the commercial outcome of something you designed?**
- No — I get paid a fee and that's it
- I've been offered revenue share or equity but didn't take it
- Yes — once or twice
- Yes — multiple times, it's becoming part of my practice

---

**Architecture & Interiors, Fashion & Apparel, Advertising & Marketing, Technology & Creative Tech:**

*(Each gets 2 discipline-specific questions following the same pattern: one about ownership/rights norms, one about deal structure norms. Questions stored in the question bank and selected by Q1 discipline.)*

---

#### 4C: Discernment Probe (All users, 2 questions)

*These assess where the user sits on the taste/judgment spectrum — a core part of In Sequence's framework.*

**Q-DISC-1: In your field, how would you describe your ability to see where things are going?**
- I mostly respond to what the market wants right now
- I can anticipate shifts 6-12 months ahead
- I consistently see things 1-2 years before they're mainstream
- I often define new directions that others eventually follow

**Q-DISC-2: How would you describe your creative point of view?**
- I'm skilled at executing within established approaches
- I have a recognizable voice or style that people seek out
- I have a perspective on where my field should go — and I share it
- My point of view has shaped how others in my field think or work

---

### SECTION 5: Vision + Ambition (3-4 questions)

**Purpose:** Now that we've mapped current reality, zoom out to intention. This section comes AFTER feeling/energy (Section 2) and current reality (Sections 3-4) so the user is grounded before they project forward.

---

**Q-AMB-1: Where do you want to be in 3 years?**

*UI: Select ONE that resonates most.*

- Earning significantly more doing work I'm already good at
- Doing less production/execution and more direction, strategy, or advisory
- Building ownership — equity, IP, revenue streams beyond trading time
- Running multiple ventures or a creative holding company
- More creative freedom and autonomy, regardless of income
- Honestly, I just want to feel less squeezed and more in control

**Q-AMB-2: What's your relationship with risk right now?**

*UI: Select one.*

- Conservative — I need predictable income. Changes must be low-risk.
- Moderate — I can handle uncertainty if the path is clear.
- Aggressive — I'm willing to take short-term hits for long-term positioning.
- I'm already uncomfortable enough that change feels necessary.

**Q-AMB-3: What's the biggest thing holding you back right now?**

*UI: Select up to 2.*

- Financial pressure — I can't afford to earn less, even temporarily
- Time — I'm maxed out with no margin
- Knowledge — I don't know what structures or options exist for someone like me
- Confidence — I sense what to do but can't pull the trigger
- Network — I don't have the right relationships, representation, or advisors
- Infrastructure — I need business, legal, or financial setup I don't have
- Clarity — I don't have a clear picture of where I'm going

**Q-AMB-4 (optional): Anything specific you're trying to figure out right now?**

*UI: Free text, 3-4 line text area.*

*Placeholder: "e.g., How do I keep ownership of my masters? Should I form an LLC? How do I propose equity to a collaborator? How do I transition from freelancing to running a studio?"*

---

## 5. Scoring Engine

### Stage Detection (Composite Score)

Compute a weighted score across Q6-Q11 + relevant Section 4 answers.

```
STAGE SCORE WEIGHTS:

Q6  (income)           → 15%
Q7  (income structure)  → 20%
Q8  (what they pay for) → 25%  ← strongest signal
Q9  (equity positions)  → 15%
Q10 (demand level)      → 10%
Q11 (business structure) → 15%
```

Each answer maps to a stage value (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0). Weighted composite rounds to nearest stage.

**Edge cases:**
- If `income >= $300K` but `business_structure <= sole_prop`: flag `income_exceeds_structure`
- If `what_they_pay_for >= "direction/judgment"` but `income_structure is 80%+ fees/salary`: flag `judgment_not_priced`
- If `equity_positions == 0` but `demand == "turning down work"` and `income >= $200K`: flag `relationships_not_converted`
- If `creative_mode == "maker"` and `ip_ownership == "client/others own"`: flag `ip_not_monetized`
- If `discernment_score >= 3` but `business_structure <= LLC` and `advisors == "none"`: flag `talent_without_structure`

### Archetype Matching

After scoring, match user to closest archetype(s) from the library. Archetypes are the foundation for the action playbook.

```typescript
type Archetype = {
  id: string;
  name: string;
  description: string;
  stage_range: [number, number];     // e.g., [1, 1.5]
  creative_modes: CreativeMode[];     // which modes this applies to
  required_flags: string[];           // misalignment flags that must be present
  excluded_flags: string[];           // flags that disqualify this archetype
  actions: Action[];                  // the three atomic actions
  structures: number[];               // relevant structure IDs from the 35
  case_studies: string[];             // relevant case study slugs
};
```

---

## 6. Archetype Library

Each archetype defines three atomic actions following this pattern:
1. **Foundation** — Fix the most critical infrastructure gap
2. **Positioning** — Make one move that shifts trajectory
3. **Momentum** — Take one step toward the next stage

### Action Schema

```typescript
type Action = {
  order: 1 | 2 | 3;
  type: 'foundation' | 'positioning' | 'momentum';
  title: string;                      // e.g., "Form your business entity"
  what: string;                       // specific, unambiguous instruction
  why: string;                        // connected to their stage and ambition
  how: string;                        // tool, resource, or referral
  timeline: string;                   // e.g., "Complete within 2 weeks"
  done_signal: string;                // how they know it's complete
  ai_assist?: {                       // hook for Phase 3 AI assistant
    prompt_template: string;          // pre-populated prompt for the AI
    context_keys: string[];           // which assessment answers to inject
  };
  providers?: {                       // recommended tools/services
    name: string;
    url: string;
    type: 'platform' | 'service' | 'resource';
    note?: string;
  }[];
};
```

---

### Archetype Definitions

**Important design principle:** Actions must be structural and infrastructural — NOT content strategy, growth hacks, or service-provider clichés. We don't tell someone to "write a LinkedIn post about your process" or "create a content calendar." We tell them to form an entity, separate their finances, get proper contracts, meet with an attorney, audit their IP, or draft a term sheet. The specific creative and strategic work (drafting proposals, writing positioning statements, creating frameworks) is what the In Sequence AI assistant helps with.

---

#### ARCHETYPE 01: "The Unstructured Creative"
**Stage:** 1 (early)  
**Modes:** Any  
**Key flag:** No formal business entity, income under $150K

**Action 1 — Foundation: Form your business entity.**
- What: Register an LLC in your state. If income exceeds $80K, discuss S-Corp election with a CPA before filing.
- Why: An LLC is the container for everything — contracts, equity, tax efficiency, liability protection. You can't hold equity or sign business agreements without one.
- How: LegalZoom, ZenBusiness, or Tailor Brands for filing. In Sequence lists creative-industry-experienced attorneys for complex situations.
- Timeline: 2 weeks
- Done: You have an EIN number and a filed LLC.
- Providers: `[{name: "LegalZoom", url: "...", type: "platform"}, {name: "ZenBusiness", url: "...", type: "platform"}, {name: "Tailor Brands", url: "...", type: "platform"}]`

**Action 2 — Foundation: Separate your business finances.**
- What: Open a business checking account and business credit card in your entity's name. Route all creative income through it.
- Why: Co-mingling funds is the #1 way creatives lose liability protection and overpay taxes. Clean separation = real business.
- How: Mercury, Relay, or Novo for business checking. Any major issuer for business credit.
- Timeline: 1 week after Action 1
- Done: All new payments deposit to business account. All business expenses go on business card.
- Providers: `[{name: "Mercury", url: "...", type: "platform"}, {name: "Relay", url: "...", type: "platform"}]`

**Action 3 — Positioning: Get proper agreements in place.**
- What: Adopt or create a standard agreement for your creative work — whether that's client contracts, gallery agreements, licensing terms, collaboration agreements, or commission contracts. At minimum: scope, compensation, timeline, IP ownership, and termination terms.
- Why: Agreements aren't just protection — they're positioning. And the IP clause is critical: understanding what you own vs. what you give away is the foundation of everything that follows.
- How: In Sequence library includes agreement templates by discipline. For custom needs, consult with an attorney.
- Timeline: 2-3 weeks
- Done: You've used a proper agreement on your next engagement.
- AI assist: `{prompt_template: "Help me draft a [discipline] agreement for [situation] that protects my IP rights", context_keys: ["discipline", "creative_mode", "ip_ownership_answer"]}`

---

#### ARCHETYPE 02: "The Established Practitioner Ready to Transition"
**Stage:** 1 (high-end) to 2 (early)  
**Modes:** `service`, `hybrid`  
**Key signal:** Good income ($150K-$300K), infrastructure exists, but all income from execution/fees

**Action 1 — Foundation: Identify your judgment-ready relationship.**
- What: Review your current clients or collaborators. Find the ONE who most often asks for your perspective on direction, not just your production. This is the relationship where your judgment is already valued — just not priced.
- Why: You're already delivering Stage 2 value for Stage 1 compensation. This isn't about creating something new — it's about recognizing and restructuring what exists.
- How: Filter: who would engage you even if someone else handled production? That's the one.
- Timeline: 1 week to identify, 2 weeks to schedule a conversation
- Done: You've identified the relationship and scheduled a meeting to discuss restructuring.

**Action 2 — Positioning: Draft a restructured engagement proposal.**
- What: Create a proposal for a strategic/advisory engagement with that relationship. Scope: regular strategic guidance, creative direction, brand or product oversight. Pricing: value-based, not hourly.
- Why: The first advisory engagement changes your trajectory. It proves a market exists for your judgment separate from your hands.
- How: *The In Sequence AI assistant can help you draft this.* It will use your assessment data, discipline context, and the relevant deal structure templates (Structure #4) to generate a starting point you can customize.
- Timeline: 2-3 weeks to draft, 3-4 weeks to present
- Done: You've presented the proposal. (The act of proposing matters more than the initial outcome.)
- AI assist: `{prompt_template: "Help me draft an advisory/strategic engagement proposal for [describe relationship and context]", context_keys: ["discipline", "income_range", "what_they_pay_for", "demand_level"]}`

**Action 3 — Momentum: Audit your unmonetized IP and judgment.**
- What: Make a simple inventory of (a) anything you've created that you own or could own, and (b) strategic judgment you've given away for free inside execution projects. This isn't about immediately monetizing — it's about seeing what you have.
- Why: Most creatives at this stage are sitting on unrecognized assets — frameworks, IP, relationships with equity potential. You can't restructure what you can't see.
- How: Spreadsheet: What I Created | Who Owns It | Could I Retain/License It | Strategic Advice I Gave Free.
- Timeline: 2-3 weeks (doesn't need to be exhaustive — 80% is enough)
- Done: You have a written inventory.

---

#### ARCHETYPE 03: "The Maker Without Structure"
**Stage:** Varies (often Stage 1 income, Stage 2-3 cultural influence)  
**Modes:** `maker`, `performer`  
**Key flag:** `talent_without_structure` — strong creative reputation, minimal business infrastructure

**Action 1 — Foundation: Get one strategic conversation.**
- What: Before forming entities or restructuring anything, talk to ONE person who can see your full situation — a business manager, creative-industry attorney, or strategic advisor. Not an agent (who takes a percentage) but someone who helps you BUILD infrastructure.
- Why: The pure-creator archetype often doesn't want to learn business. That's fine. But you need someone who translates between creative vision and structural reality. The cost of doing nothing is real.
- How: In Sequence offers a free 30-minute advisory call for exactly this. We help identify whether you need a business manager, attorney, accountant, or some combination — and provide referrals.
- Timeline: Book within 1 week
- Done: You've had the conversation and have a clear next step.

**Action 2 — Foundation: Audit who owns what.**
- What: Create a simple inventory of your work from the last 3-5 years. For each piece: who owns the rights? Is there a contract? Is there revenue you're not capturing? Are there assets being used without compensation?
- Why: Most makers have significant IP assets they've given away through default. This audit often reveals recoverable rights and patterns that need to stop.
- How: Simple list: Work | Year | Who Owns It | Written Agreement? | Revenue? | Am I Getting Paid?
- Timeline: 2-3 weeks
- Done: Written inventory exists.
- AI assist: `{prompt_template: "Help me think through my IP ownership situation as a [discipline] — here's what I know about my catalog and deals", context_keys: ["discipline", "ip_ownership_answer", "industry_specific_answers"]}`

**Action 3 — Momentum: Protect the next deal.**
- What: For your NEXT project, commission, collaboration, or release — pause before committing and ensure written terms exist that protect your rights. If the default is work-for-hire or full rights transfer, negotiate for at minimum: licensing (not assignment), credit, and portfolio/promotional rights.
- Why: You can't fix past deals, but you can stop the pattern. One well-structured agreement creates a template for everything after.
- How: In Sequence library includes discipline-specific agreement frameworks. For music: Structure #25-26 (royalties). For film: Structure #25 (profit participation). For art: Structure #27-28 (licensing). For publishing: Structure #29-30 (rights reversion, subsidiary rights).
- Timeline: Apply to your literally next engagement
- Done: Signed agreement with terms that protect your interests before work begins.

---

#### ARCHETYPE 04: "The Platform Builder"
**Stage:** 2-3  
**Modes:** `builder`, `hybrid`, `service`  
**Key signal:** Successful core business, wants to build holding company / multi-venture structure

**Action 1 — Foundation: Design your entity architecture.**
- What: Map the entity structure that supports your vision. Typically: a parent LLC (holding company) owning subsidiary LLCs for distinct business lines. Identify which entities exist and which need to be created.
- Why: Running multiple ventures through one entity is a liability, tax, and operational problem. The holding company structure creates clean separation, optimization, and the ability to sell, partner, or attract investment into specific entities.
- How: Initial sketch on paper, then validate with a creative-industry attorney. This is NOT DIY. In Sequence provides attorney referrals who understand this architecture.
- Timeline: Entity map in 2 weeks. Attorney meeting within 4 weeks.
- Done: Documented entity structure diagram and scheduled attorney consultation.

**Action 2 — Foundation: Level up your financial team.**
- What: Engage a CPA who specializes in creative industries and multi-entity structures. If you have a generalist, assess whether they can handle the complexity you're building.
- Why: A generalist CPA costs $20K-$100K+ annually in missed strategies. Creative-industry specialists understand project-based income, IP valuation, equity compensation, and multi-entity optimization.
- How: In Sequence provides vetted referrals. Key question: "Do you work with other creatives who have holding company structures?"
- Timeline: First meeting within 3 weeks
- Done: Engaged or scheduled with a creative-industry CPA.

**Action 3 — Momentum: Prepare your first formal equity term sheet.**
- What: For your next collaboration where equity or ownership makes sense, create a proper term sheet BEFORE the conversation. Include: equity percentage, vesting, role definition, exit provisions, information rights, anti-dilution.
- Why: Moving from "let's figure it out" to "here are my proposed terms" transforms you from hopeful participant to serious partner.
- How: *The In Sequence AI assistant can draft this with you* using your context and the deal structure templates (Structures #17-21).
- Timeline: Identify opportunity within 2 weeks. Draft within 4 weeks.
- Done: Written term sheet ready for your next equity conversation.
- AI assist: `{prompt_template: "Help me draft an equity term sheet for [describe opportunity]. I want to propose [general idea of terms].", context_keys: ["discipline", "income_range", "equity_positions", "demand_level"]}`

---

#### ARCHETYPE 05: "The Creative with Untapped Catalog"
**Stage:** 1-3 (varies widely)  
**Modes:** `maker`, `performer`, `hybrid`  
**Key flags:** `ip_not_monetized` — owns work or catalog but isn't generating ongoing revenue from it

**Action 1 — Foundation: Catalog your catalog.**
- What: Create a comprehensive inventory of every piece of IP you own — music, art, writing, designs, photography, video, frameworks, tools. For each: current monetization status, licensing potential, and whether rights documentation exists.
- Why: You can't monetize what you can't see. Most creatives with catalogs are leaving money on the table because they've never systematically assessed what they have and what it could generate.
- How: Spreadsheet: Work Title | Medium | Year | Rights Status | Current Revenue | Licensing Potential (high/medium/low) | Notes.
- Timeline: 2-4 weeks (comprehensive, not perfect)
- Done: Complete catalog inventory exists as a document.

**Action 2 — Positioning: Identify your highest-value licensing opportunity.**
- What: From your inventory, identify the ONE piece or collection with the highest commercial licensing potential. Consider: Is there demand? Could this be licensed for merchandise, sync, print, digital use, education, or other applications?
- Why: One well-structured licensing deal can generate more recurring revenue than months of new production. And it creates a template for the rest of your catalog.
- How: In Sequence Structures #27 (Non-Exclusive Licensing), #28 (Exclusive Licensing), #31 (Territory/Media Rights Splitting).
- Timeline: 2 weeks after catalog is complete
- Done: You've identified the opportunity and can describe the licensing structure in one paragraph.
- AI assist: `{prompt_template: "Help me evaluate the licensing potential of [describe work/catalog] and draft an initial licensing proposal", context_keys: ["discipline", "ip_ownership_answer", "catalog_inventory"]}`

**Action 3 — Momentum: Make one licensing deal.**
- What: Approach one potential licensee with a concrete proposal. Could be a brand, publisher, platform, sync agent, or retailer. Specific terms, specific timeline, specific rights granted (not all rights — specific, limited rights).
- Why: One deal proves the model. It generates evidence that your catalog has commercial value, which makes every subsequent deal easier.
- How: Attorney review recommended for first licensing agreement. In Sequence provides referrals.
- Timeline: 4-6 weeks
- Done: Signed licensing agreement with defined terms and payment schedule.

---

#### ARCHETYPE 06: "The High-Earner Without Ownership"
**Stage:** 2 (high-end) to 3  
**Modes:** Any  
**Key flags:** `income_exceeds_structure`, `judgment_not_priced`, or `relationships_not_converted`

**Action 1 — Foundation: Fix the structural gap.**
- What: If sole prop or basic LLC earning $250K+, address entity structure and tax optimization immediately. Meet with a creative-industry CPA about S-Corp election, entity restructuring, and tax strategy.
- Why: At your income level, structural misalignment costs $15K-$50K+ annually in tax inefficiency alone — plus you lack the entity structure to hold equity if an opportunity arises.
- How: In Sequence referrals to creative-industry CPAs and attorneys.
- Timeline: Consultation within 2 weeks. Implementation within 6 weeks.
- Done: Tax-optimized entity structure in place.

**Action 2 — Positioning: Convert one relationship to ownership.**
- What: Identify your longest-standing, highest-trust professional relationship where you've contributed significant value. Propose restructuring the engagement to include equity, profit participation, or revenue share alongside (or instead of) fees.
- Why: You have relationships where you've generated enormous value and captured none of the ownership. One conversion changes how you think about every relationship that follows.
- How: In Sequence Structures #3 (Project Equity), #17 (Equity-for-Services), #24 (Revenue Share Partnership). *The AI assistant can help you draft the proposal and model the terms.*
- Timeline: Identify within 1 week. Draft proposal within 3 weeks. Conversation within 5 weeks.
- Done: You've had the ownership conversation with one key relationship.
- AI assist: `{prompt_template: "Help me draft an equity/ownership proposal for [relationship description]. Current engagement is [describe]. I want to propose [general direction].", context_keys: ["discipline", "income_range", "income_structure", "what_they_pay_for", "demand_level"]}`

**Action 3 — Momentum: Start tracking your value creation.**
- What: For the next 90 days, document the value you create in every significant engagement. Not just deliverables — business outcomes, revenue generated, opportunities created, decisions influenced.
- Why: Ownership conversations require evidence. When you can say "my direction on your brand contributed to X% revenue growth," you're not asking for equity — you're demonstrating why it's appropriate.
- How: Simple log: Engagement | What I Did | Business Impact (estimated) | Date.
- Timeline: Start immediately, review at 90 days
- Done: 90-day value creation log exists and can be referenced in future negotiations.

---

*Additional archetypes to build as V1 data reveals patterns. Start with these 6 — they cover the examples described and the most common profiles we expect.*

---

## 7. Roadmap Output Design

### Structure

The generated roadmap has 5 sections:

```typescript
type StrategicRoadmap = {
  position: {
    detected_stage: 1 | 2 | 3 | 4;
    stage_name: string;
    stage_description: string;          // 2-3 sentences, personalized
    transition_readiness: string;
    industry_context: string;           // how they compare to norms
    misalignments: Misalignment[];
  };
  misalignment_detail: {                // expanded view of top 1-3
    flag: string;
    what_its_costing: string;           // concrete, not abstract
    why_it_matters: string;
  }[];
  actions: Action[];                    // the three atomic actions
  vision: {
    twelve_month_target: string;
    three_year_horizon: string;
    transition_signals: string[];       // what to watch for
    structures_to_study: number[];      // IDs from the 35
    relevant_cases: string[];           // case study slugs
  };
  library: {
    recommended_structures: {id: number; title: string; why: string}[];
    recommended_cases: {slug: string; title: string; why: string}[];
    reading_path: string[];             // ordered sequence of library content
  };
};
```

### Free vs. Gated Split

| Section | Free (pre-membership) | Gated (members only) |
|---------|----------------------|---------------------|
| Position | ✅ Full stage detection + visual | ✅ |
| Misalignments | ✅ Top misalignment name + teaser | ✅ Full detail on all |
| Actions | ❌ "Join to see your 3 next steps" | ✅ Full action playbook |
| Vision | ❌ "Join for your personalized roadmap" | ✅ Full vision + milestones |
| Library | ❌ "35 structures, 37+ case studies" | ✅ Personalized recommendations |

### Generation Approach

**AI (Claude API) generates the roadmap:**
- System prompt: In Sequence voice + framework definitions + stage descriptions + deal structure summaries
- Context injected: Full assessment answers, detected stage, misalignment flags, archetype match, creative mode, discipline
- Archetype action playbooks provide the structural foundation — AI personalizes the language, examples, and connections to the user's specific situation
- AI does NOT invent new actions — it adapts the archetype actions with personalized context

**Key constraint:** The AI must NOT generate generic growth advice, content strategy recommendations, or service-provider clichés. It generates structural, infrastructural, and deal-oriented guidance grounded in the In Sequence framework.

### Quality Control

1. **First 50-100 plans:** Neil reviews before release. Admin queue shows: user profile, assessment answers, AI-generated plan, approve/edit/reject buttons.
2. **Post-calibration:** Auto-release. Weekly spot-check of 5-10 plans. "Request human review" button available to members.
3. **Feedback loop:** Track which plans members engage with, which actions they mark complete, and which generate AI assistant follow-up conversations. Use this data to refine archetypes.

---

## 8. Data Model

### Tables (Supabase / PostgreSQL)

Extends the existing PRD data model. New tables for assessment system:

```sql
-- Assessment responses (versioned, retakeable)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,           -- assessment version (question set may evolve)
  status TEXT NOT NULL DEFAULT 'in_progress',    -- in_progress | completed | abandoned
  
  -- Section 1: Identity
  discipline TEXT NOT NULL,
  sub_discipline TEXT,
  creative_mode TEXT NOT NULL,                   -- maker | service | hybrid | performer | builder | transition
  
  -- Section 2: Feeling + Energy (stored for AI advisor context)
  energy_ranking JSONB,                          -- ordered array of [making, shaping, building, sharing]
  drains TEXT[],                                 -- up to 2 selections
  dream_response TEXT,                           -- free text — the "no constraints" answer
  
  -- Section 3: Current Reality
  income_range TEXT,
  income_structure JSONB,                        -- {salary: 20, fees: 60, royalties: 10, ...}
  what_they_pay_for TEXT,                        -- the key stage signal answer
  equity_positions TEXT,
  demand_level TEXT,
  business_structure TEXT,
  
  -- Section 4: Adaptive Deep Dive (variable questions stored as JSONB)
  stage_questions JSONB,                         -- {question_id: answer, ...}
  industry_questions JSONB,                      -- {question_id: answer, ...}
  discernment_questions JSONB,                   -- {question_id: answer, ...}
  
  -- Section 5: Vision + Ambition
  three_year_goal TEXT,
  risk_tolerance TEXT,
  constraints TEXT[],                            -- up to 2 selections
  specific_question TEXT,                        -- optional free text
  
  -- Computed / Derived
  detected_stage INTEGER,                        -- 1, 2, 3, or 4
  stage_score NUMERIC(3,2),                      -- raw weighted score (e.g., 1.75)
  transition_readiness TEXT,                     -- low | moderate | high
  misalignment_flags TEXT[],                     -- array of flag keys
  archetype_primary TEXT,                        -- archetype ID
  archetype_secondary TEXT,                      -- optional secondary match
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategic plans (AI-generated from assessments)
CREATE TABLE strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  
  plan_content JSONB NOT NULL,                   -- full roadmap JSON (matches StrategicRoadmap type)
  plan_markdown TEXT,                            -- rendered markdown version for display
  
  status TEXT NOT NULL DEFAULT 'generating',     -- generating | draft | review | published
  reviewed_by UUID REFERENCES auth.users(id),   -- admin who reviewed (null if auto-released)
  review_notes TEXT,                             -- admin notes (internal only)
  
  -- PDF
  pdf_url TEXT,                                  -- Supabase Storage URL for downloadable PDF
  pdf_generated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ                       -- when member can see it
);

-- Question bank (for adaptive question selection)
CREATE TABLE assessment_questions (
  id TEXT PRIMARY KEY,                           -- e.g., "Q-S1-BIZ", "Q-IND-MUSIC-1"
  section TEXT NOT NULL,                         -- identity | feeling | reality | deep_dive | ambition
  pool TEXT,                                     -- stage_1 | stage_2 | stage_3 | industry_art | industry_film | etc.
  question_text TEXT NOT NULL,
  question_text_variants JSONB,                  -- {maker: "...", service: "...", performer: "..."} for mode-adapted text
  answer_type TEXT NOT NULL,                     -- single_select | multi_select | rank | slider | free_text | allocation
  options JSONB,                                 -- array of {value, label, mode_label?}
  option_variants JSONB,                         -- {maker: [...], service: [...]} for mode-adapted options
  scoring JSONB,                                 -- {option_value: {stage_1: X, stage_2: Y, ...}}
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action tracking (members can mark actions complete)
CREATE TABLE assessment_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  action_order INTEGER NOT NULL,                 -- 1, 2, or 3
  action_type TEXT NOT NULL,                     -- foundation | positioning | momentum
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | in_progress | completed | skipped
  completed_at TIMESTAMPTZ,
  notes TEXT,                                    -- user's notes on completion
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_actions ENABLE ROW LEVEL SECURITY;

-- Members see only their own data
CREATE POLICY "users_own_assessments" ON assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_plans" ON strategic_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_actions" ON assessment_actions
  FOR ALL USING (auth.uid() = user_id);

-- Admins see everything
CREATE POLICY "admin_all_assessments" ON assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_plans" ON strategic_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 9. UI/UX Specifications

### Assessment Wizard

- **Format:** Full-screen wizard. One question (or tight group of 2-3) per step.
- **Progress:** Progress bar at top showing sections, not individual questions. "Section 2 of 5."
- **Navigation:** Back/Next buttons. Can jump to any completed section via progress bar.
- **Auto-save:** Every answer saved on change. User can close browser and resume.
- **Mobile:** Fully responsive. Cards and ranking work via tap, not drag, on mobile.
- **Transitions:** Smooth fade between questions. No jarring page reloads.
- **Tone:** Warm, conversational. Section intros set context. Questions don't feel clinical.

### Section Intros

Each section gets a brief intro screen (1-2 sentences + section title) before questions begin:

1. **Creative Identity:** "Let's start with who you are and how your creative work reaches the world."
2. **Feeling + Energy:** "Before we get into the specifics, let's talk about what this feels like."
3. **Current Reality:** "Now let's map where things actually stand today."
4. **Deep Dive:** "Based on what you've shared, a few more questions to get specific." *(Section intro adapts based on detected stage + discipline)*
5. **Vision + Ambition:** "Last section. Let's talk about where you want to go."

### Roadmap Display

- **In-app view:** Styled page within the member dashboard. Sections as expandable/scrollable cards.
- **PDF export:** Downloadable styled PDF (same content, formatted for print/share).
- **Sharing:** Members can share a link to their roadmap with advisors or collaborators (generates a read-only link with expiration).
- **Action tracking:** Each of the 3 actions has a checkbox/status toggle (pending → in progress → complete). Completing actions surfaces in the dashboard.

### Dashboard Integration

- **If assessment not completed:** CTA card in dashboard body: "Map your position. Get your roadmap." + link in sidebar nav.
- **If assessment completed:** Dashboard shows: Current Stage badge, 3 actions with status, "Retake Assessment" (available after 90 days), link to full roadmap.
- **Retake comparison:** When retaking, show side-by-side: previous stage vs. current, previous actions vs. new actions, progression narrative.

### Free/Gated Boundary

- **Free users see:** Stage detection result (visual badge + 2-3 sentence description), top misalignment (name + 1 sentence teaser), and a conversion CTA: "Your full roadmap includes 3 personalized next steps, relevant deal structures from our library of 35, and case studies of creatives who made this exact transition. Join to see yours."
- **Conversion CTA design:** Should feel like a natural extension, not a paywall. The free output has real value. The gated output has significantly more.

---

## 10. AI Generation Prompt (System Prompt Template)

```
You are the In Sequence strategic advisor — an AI that helps creative 
professionals navigate the structural restructuring of the creative economy.

You are generating a personalized Strategic Roadmap for a member who just 
completed the In Sequence assessment.

VOICE: Grounded, specific, economical. No filler. Humble authority earned 
from practitioner experience. Systems thinking with storytelling. Never 
generic, never preachy, never "growth mindset" clichés.

FRAMEWORK: The In Sequence progression has 4 stages:
- Stage 1: Execution Excellence ($75K-$200K) — Structures #1, #2
- Stage 2: Judgment Positioning ($200K-$500K) — Structures #3, #4
- Stage 3: Ownership Accumulation ($500K-$2M+) — Structures #5, #9, #24
- Stage 4: Capital Formation ($2M+) — Structures #12, #14

KEY PRINCIPLES:
- Actions must be STRUCTURAL and INFRASTRUCTURAL — entity formation, 
  financial systems, legal protections, deal structures, professional 
  advisors. NOT content strategy, marketing tactics, or growth hacks.
- Any action that involves DRAFTING or WRITING something (proposals, 
  term sheets, agreements) should note that the In Sequence AI assistant 
  can help generate it.
- Adapt language to the user's creative mode. A painter is not a 
  "service provider." A musician doesn't have "clients." Use the right 
  vocabulary for their world.
- Misalignments are the most valuable insight. Lead with what's 
  structurally wrong before prescribing growth.
- The roadmap should feel like it was written by someone who understands 
  their specific creative discipline — not generic business advice 
  applied to creatives.

MEMBER ASSESSMENT DATA:
{assessment_json}

MATCHED ARCHETYPE:
{archetype_definition}

Generate the Strategic Roadmap following the StrategicRoadmap schema. 
Personalize the archetype's action playbook to this specific member's 
discipline, creative mode, income level, constraints, and ambition.
```

---

## 11. Build Sequence

### Prerequisites (from PRD Phase 1)
- Auth system operational
- Supabase database configured
- Member dashboard shell exists
- Stripe integration live

### Build Steps

| Order | Task | Details |
|-------|------|---------|
| 1 | Database setup | Create assessment tables (assessments, strategic_plans, assessment_questions, assessment_actions). Apply RLS policies. |
| 2 | Question bank seed | Populate `assessment_questions` table with all questions defined in this spec. Include scoring weights, mode variants, and pool assignments. |
| 3 | Assessment wizard UI | Multi-step wizard component. Section intros, question rendering by type (single select, multi select, rank, slider, allocation, free text), progress bar, auto-save, mobile responsive. |
| 4 | Adaptive question selection | Engine that selects Section 4 questions based on creative_mode, detected_stage, and discipline. Pulls from question bank. |
| 5 | Stage detection scoring | Implement weighted scoring algorithm. Compute detected_stage, transition_readiness, and misalignment_flags on assessment completion. |
| 6 | Archetype matching | Match completed assessment to archetype(s). Store primary and secondary. |
| 7 | Roadmap generation (AI) | Claude API integration. System prompt with assessment data + archetype definition. Generate StrategicRoadmap JSON. Store in strategic_plans. |
| 8 | Roadmap display UI | In-app roadmap view with sections, action tracking, and expandable detail. |
| 9 | Free/gated boundary | Implement free output (stage + teaser) and gated output (full roadmap) with conversion CTA. |
| 10 | Admin review queue | Admin page: list of pending plans, assessment data view, approve/edit/reject, publish. |
| 11 | PDF export | Generate styled PDF from roadmap content. Store in Supabase Storage. Download button in UI. |
| 12 | Dashboard integration | CTA card for incomplete assessment, stage badge + action status for completed, retake link after 90 days. |
| 13 | Retake flow | 90-day cooldown. Comparison view between assessments. Historical storage. |

---

## 12. Provider Recommendations (Data for Action Steps)

*Not affiliate integrations — just listed as recommended resources. Structure the data so affiliate tracking can be added later.*

```typescript
type Provider = {
  id: string;
  name: string;
  url: string;
  category: 'entity_formation' | 'banking' | 'accounting' | 'legal' | 'tools';
  description: string;
  affiliate_url?: string;              // null at launch, populated later
  affiliate_active: boolean;           // false at launch
};
```

| Category | Providers |
|----------|-----------|
| Entity Formation | LegalZoom, ZenBusiness, Tailor Brands |
| Business Banking | Mercury, Relay, Novo |
| Accounting Software | QuickBooks, Wave, Bench |
| Creative-Industry CPAs | *In Sequence referral network (manual, not automated at launch)* |
| Creative-Industry Attorneys | *In Sequence referral network (manual)* |
| Contract Templates | In Sequence library (internal) |

---

## 13. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Assessment completion rate | >70% of those who start | completions / starts |
| Time to complete | 8-12 minutes median | timestamp delta |
| Free → member conversion | >15% of free assessment takers | conversion within 7 days |
| Action completion rate | >40% complete at least 1 action within 90 days | action status tracking |
| Retake rate | >25% retake within 6 months | retake records |
| AI assistant follow-through | >30% of members with roadmaps engage AI on action items | conversation logs |

---

*End of build specification. This document provides everything needed for Claude Code to build the Phase 2 assessment and roadmap system.*
