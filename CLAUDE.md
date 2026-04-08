# In Sequence — Project Context

Membership platform ($89/yr) teaching creative professionals how to structure deals. Built with Next.js 16, React 19, App Router, MDX via next-mdx-remote v6.

## Content Architecture

```
content/
├── structures/       35 deal structure MDX files (public + portal)
├── case-studies/     Case study MDX files (public teaser + portal full)
├── articles/         Article MDX files (public teaser + portal full)
├── reference/        Source material, style guides, component docs (not published)
└── data/             JSON data files
```

### Routes
- Public: `/case-studies/[slug]`, `/articles/[slug]`, `/structures`
- Portal (members): `/library/case-studies/[slug]`, `/library/articles/[slug]`, `/library/structures/[slug]`

## Content Writing Rules

### When writing or converting content to MDX:
1. Read `content/reference/case-study-components.md` for the full component toolkit and prop reference
2. Read `content/reference/voice-guide.md` for tone and voice (when available)
3. Reference existing published content in `content/case-studies/a24.mdx` as the gold standard for structure and formatting

### CRITICAL MDX Rules
- **ALL props must be strings.** Never use `prop={value}` syntax. Always use `prop="value"`.
  - WRONG: `num={13}`, `pct={100}`
  - RIGHT: `num="13"`, `pct="100"`
- **Arrays/objects must use JSON string props**: `headersJson='["Col1","Col2"]'`
- **Boolean props** (like `avg`, `inline`) are fine without values: `<CbChartRow avg />`
- Standard markdown (**bold**, *italic*) works inside component children
- Use `<p className="cb-card-text">` for paragraphs inside accordion cards

## Development

- Dev server: `npm run dev` (port 3000)
- Build: `npm run build` (must pass 91+ pages, zero errors)
- Auth is enabled; public routes work without login
- PATH must include: `/Users/neilbrown/.nvm/versions/node/v24.14.0/bin`
- Prototypes for reference: `/tmp/sap-link/`

## Publishing Workflow

When the user says "publish this case study" or pastes content:
1. Read the component reference in `content/reference/case-study-components.md`
2. Convert the content to MDX format using the appropriate components
3. Save to the correct directory (`content/case-studies/`, `content/articles/`, etc.)
4. Run `npm run build` to verify it compiles
5. Report success with the URL path



# Recommended Additions to CLAUDE.md
# Paste these sections into your existing CLAUDE.md

---

## AI Advisor + Assessment System

### Source of Truth Documents
Before building any advisor, assessment, or deal evaluator features, read these specs:
- `content/reference/seq-ai-advisor-experience-v1.md` — Unified conversational interface (the UX layer)
- `content/reference/seq-assessment-build-spec-v2.md` — Assessment question bank, scoring engine, archetype definitions, roadmap output schema
- `content/reference/deal-evaluator-spec-v2.md` — Deal evaluation dimensions, scoring weights, verdict structure
- `content/reference/deal-evaluator-assessment-integration.md` — How the evaluator uses assessment context

**These are the source of truth. Do not deviate from the data models, scoring logic, question flows, or archetype definitions in these documents without explicit approval.**

### Architecture Rules
- The AI advisor is a single page (`/advisor`) with two states: pre-assessment (chat-focused) and post-assessment (dashboard + embedded chat)
- The advisor uses conversation as the interface for structured data capture — same data model as the assessment wizard, different delivery method
- All assessment data writes to the `assessments` table schema defined in `seq-assessment-build-spec-v2.md`
- All deal evaluation data writes to the `deal_evaluations` table schema defined in `deal-evaluator-spec-v2.md`
- The chat supports structured UI components inline (option cards, sliders, ranking widgets) — not just free text

### Scoring Engine
- Stage detection uses weighted composite scoring across Q6-Q11. Weights are defined in `seq-assessment-build-spec-v2.md` Section 5. Do not change the weights.
- Misalignment flags are detected from specific answer combinations. The six flag patterns are defined in the assessment spec. Implement all six.
- Archetype matching uses the definitions in Section 6 of the assessment spec. Start with the six defined archetypes. Do not invent new archetypes.

### AI Integration
- All AI-generated content (roadmaps, deal verdicts, negotiation scripts) uses Anthropic Claude API
- System prompts are layered: base voice + member context + mode-specific instructions
- The AI must NOT generate generic growth advice, content strategy, or marketing tactics. Actions are structural: entity formation, deal structures, IP protection, professional advisors.
- First 50-100 AI-generated roadmaps go to admin review queue before member sees them

### Critical Constraints
- Structured UI components in chat: one question at a time, components collapse after interaction
- The three opening path cards ("I have a deal to evaluate" / "Map my position" / "I'm just exploring") appear only once, on first load, and never again in the conversation
- Creative mode (`maker` / `service` / `hybrid` / `performer` / `builder` / `transition`) adapts all question language throughout the entire experience
- The assessment wizard that already exists is preserved as a fallback, not replaced. Same data model, different UI.





