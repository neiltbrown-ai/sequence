// ── Deal Evaluator Question Bank ────────────────────────────────────
// All questions organized by dimension. Each question defines its own
// scoring logic, assessment behavior, deal-type applicability, and
// creative-mode language variants.
//
// Stage-specific career positioning questions (C7-C12) use dealTypes: 'all'
// and are filtered by stage in getEvalQuestions().
//
// V1 scope: universal + equity-specific + service-specific questions.
// Licensing, partnership, and revenue-specific questions are defined but
// tagged for V2 (dealTypes narrowed to their type only).

import type {
  EvalQuestion,
  DealType,
  DimensionKey,
  EvalAssessmentContext,
} from '@/types/evaluator';

// ── Scoring Logic Markers ──────────────────────────────────────────
// For non-select inputs, the scoring engine computes scores dynamically.
// These markers tell the scoring engine how to handle the value:
//   _ratio  — currency scored as ratio with relatedQuestionId
//   _range  — number/percentage scored by range brackets
//   _text   — free text, not directly scored
//   _count  — multi-select, scored by selection count
//   _auto   — auto-calculated from other answers

// ── Dimension 1: Financial Readiness ───────────────────────────────

const FINANCIAL_QUESTIONS: EvalQuestion[] = [
  // ─ Universal ─
  {
    id: 'F1',
    dimension: 'financial',
    questionText: "What's the total cash compensation in this deal?",
    questionTextVariants: {
      maker: "What's the total cash payment for this work?",
      performer: "What's the total compensation for this role or project?",
    },
    answerType: 'currency',
    dealTypes: 'all',
    scoringWeight: 0.25,
    scoringLogic: { _ratio: 0 },
    assessmentBehavior: { type: 'always_ask' },
    relatedQuestionId: 'F2',
    placeholder: '$0',
    displayOrder: 1,
  },
  {
    id: 'F2',
    dimension: 'financial',
    questionText: "What would your normal market rate be for this scope of work?",
    questionTextVariants: {
      maker: "What's the market value of work like this?",
      performer: "What's standard compensation for this type of role or project?",
      builder: "What are comparable deal terms for this scope?",
    },
    answerType: 'currency',
    dealTypes: 'all',
    scoringWeight: 0.25,
    scoringLogic: { _ratio: 0 },
    assessmentBehavior: { type: 'always_ask' },
    relatedQuestionId: 'F1',
    placeholder: '$0',
    displayOrder: 2,
  },
  {
    id: 'F3',
    dimension: 'financial',
    questionText: 'Do you have savings or other income to cover your expenses if this deal pays less than your normal rate?',
    answerType: 'single_select',
    options: [
      { value: 'comfortable', label: 'Comfortably' },
      { value: 'tight', label: 'Tight but manageable' },
      { value: 'hardship', label: 'Would create hardship' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { comfortable: 10, tight: 5, hardship: 1 },
    redFlagTrigger: {
      condition: 'hardship',
      message: 'This deal puts your financial stability at risk.',
    },
    assessmentBehavior: { type: 'skip_if_assessment', assessmentField: 'income_range' },
    displayOrder: 3,
  },
  {
    id: 'F4',
    dimension: 'financial',
    questionText: 'How many months of living expenses do you have in savings?',
    answerType: 'number',
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { _range: 0 },
    placeholder: '0',
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 4,
  },
  {
    id: 'F5',
    dimension: 'financial',
    questionText: 'What percentage of your total income would this deal represent?',
    answerType: 'percentage',
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { _range: 0 },
    assessmentBehavior: { type: 'prefill_if_assessment', assessmentField: 'income_range' },
    displayOrder: 5,
  },

  // ─ Equity-specific ─
  {
    id: 'F6',
    dimension: 'financial',
    questionText: 'What equity percentage are you being offered?',
    answerType: 'percentage',
    dealTypes: ['equity'],
    scoringWeight: 0.15,
    scoringLogic: { _range: 0 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 6,
  },
  {
    id: 'F7',
    dimension: 'financial',
    questionText: 'At what valuation is the equity being calculated?',
    answerType: 'currency',
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { _auto: 0 },
    assessmentBehavior: { type: 'always_ask' },
    placeholder: '$0',
    displayOrder: 7,
  },
  {
    id: 'F8',
    dimension: 'financial',
    questionText: "Is the valuation based on a 409A valuation, last funding round, or the company's own estimate?",
    answerType: 'single_select',
    options: [
      { value: '409a', label: '409A valuation' },
      { value: 'funding_round', label: 'Last funding round' },
      { value: 'company_estimate', label: "Company's own estimate" },
      { value: 'dont_know', label: "I don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { '409a': 10, funding_round: 8, company_estimate: 4, dont_know: 2 },
    redFlagTrigger: {
      condition: 'dont_know',
      message: "You should understand how equity is valued before accepting. Ask for the basis of the valuation.",
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 8,
  },
  {
    id: 'F10',
    dimension: 'financial',
    questionText: 'Can you afford to wait 3–7 years for this equity to become liquid?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'probably', label: 'Probably' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, probably: 5, no: 1 },
    redFlagTrigger: {
      condition: 'no',
      message: "Equity deals require patience. If you can't wait for liquidity, this may not be the right structure.",
    },
    assessmentBehavior: { type: 'prefill_if_assessment', assessmentField: 'risk_tolerance' },
    displayOrder: 10,
  },

  // ─ Revenue/Profit Share (V2 — included for completeness) ─
  {
    id: 'F11',
    dimension: 'financial',
    questionText: 'Is there a guaranteed minimum payment regardless of performance?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: ['revenue_share'],
    scoringWeight: 0.15,
    scoringLogic: { yes: 10, no: 4 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 11,
  },
  {
    id: 'F12',
    dimension: 'financial',
    questionText: 'How is revenue or profit defined in the agreement?',
    answerType: 'single_select',
    options: [
      { value: 'gross', label: 'Gross revenue' },
      { value: 'adjusted_gross', label: 'Adjusted gross' },
      { value: 'net_profit', label: 'Net profit' },
      { value: 'not_specified', label: 'Not specified' },
    ],
    dealTypes: ['revenue_share'],
    scoringWeight: 0.15,
    scoringLogic: { gross: 10, adjusted_gross: 7, net_profit: 4, not_specified: 1 },
    redFlagTrigger: {
      condition: 'not_specified',
      message: "The definition of revenue or profit must be explicit. Without it, your share can be reduced to zero.",
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 12,
  },
];

// ── Dimension 2: Career Positioning ────────────────────────────────

const CAREER_QUESTIONS: EvalQuestion[] = [
  // ─ Universal ─
  {
    id: 'C1',
    dimension: 'career',
    questionText: 'Which stage best describes your current position?',
    answerType: 'single_select',
    options: [
      { value: '1', label: 'Execution', description: 'Building skills and reputation ($75–200K)' },
      { value: '2', label: 'Judgment', description: 'Selling strategic value ($200–500K)' },
      { value: '3', label: 'Ownership', description: 'Accumulating assets ($500K–2M+)' },
      { value: '4', label: 'Capital', description: 'Deploying capital ($2M+)' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { '1': 5, '2': 6, '3': 7, '4': 8 },
    assessmentBehavior: { type: 'skip_if_assessment', assessmentField: 'detected_stage' },
    displayOrder: 1,
  },
  {
    id: 'C2',
    dimension: 'career',
    questionText: 'Does this deal move you toward or away from the next stage?',
    answerType: 'single_select',
    options: [
      { value: 'toward', label: 'Clearly toward' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'away', label: 'Clearly away' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { toward: 10, neutral: 6, not_sure: 4, away: 1 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 2,
  },
  {
    id: 'C3',
    dimension: 'career',
    questionText: 'Will this deal be visible in your portfolio or on your resume?',
    questionTextVariants: {
      maker: 'Will this deal be visible in your body of work?',
      performer: 'Will this deal add to your credits or public profile?',
    },
    answerType: 'single_select',
    options: [
      { value: 'prominent', label: 'Yes, prominently' },
      { value: 'somewhat', label: 'Somewhat' },
      { value: 'hidden', label: "No, it's under NDA or white-label" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { prominent: 10, somewhat: 6, hidden: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 3,
  },
  {
    id: 'C4',
    dimension: 'career',
    questionText: "Does this deal give you new access — to networks, markets, skills, or audiences you don't currently have?",
    questionTextVariants: {
      maker: 'Does this deal give you new access to audiences, collectors, or markets?',
      performer: 'Does this deal give you new access to audiences, roles, or platforms?',
    },
    answerType: 'single_select',
    options: [
      { value: 'significant', label: 'Yes, significant' },
      { value: 'some', label: 'Some' },
      { value: 'none', label: 'No' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { significant: 10, some: 6, none: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 4,
  },
  {
    id: 'C5',
    dimension: 'career',
    questionText: 'If this deal succeeds, does it make future deals easier to negotiate?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'lock_in', label: 'No, it might lock me in' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { yes: 10, neutral: 5, lock_in: 2 },
    redFlagTrigger: {
      condition: 'lock_in',
      message: 'Deals that limit future options require careful evaluation of the trade-off.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 5,
  },
  {
    id: 'C6',
    dimension: 'career',
    questionText: 'Does this deal require you to do work below your current capability?',
    answerType: 'single_select',
    options: [
      { value: 'mostly_below', label: 'Yes, mostly' },
      { value: 'some', label: 'Some' },
      { value: 'stretches', label: 'No, it stretches me' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { mostly_below: 3, some: 6, stretches: 10 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 6,
  },

  // ─ Stage 1 specific (filtered by stage in getEvalQuestions) ─
  {
    id: 'C7',
    dimension: 'career',
    questionText: 'Does this deal position you as a specialist or a generalist?',
    answerType: 'single_select',
    options: [
      { value: 'specialist', label: 'Specialist' },
      { value: 'generalist', label: 'Generalist' },
      { value: 'neither', label: 'Neither' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { specialist: 10, generalist: 5, neither: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 7,
  },
  {
    id: 'C8',
    dimension: 'career',
    questionText: 'Will the other party see you as a strategic partner or a vendor?',
    questionTextVariants: {
      maker: 'Will they see you as a creative they want to collect or represent — or one of many artists on their roster?',
    },
    answerType: 'single_select',
    options: [
      { value: 'strategic', label: 'Strategic partner' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'unclear', label: 'Not clear' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { strategic: 10, vendor: 4, unclear: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 8,
  },

  // ─ Stage 2 specific ─
  {
    id: 'C9',
    dimension: 'career',
    questionText: 'Are you being asked for your judgment ("what should we do?") or your execution ("can you do this?")?',
    answerType: 'single_select',
    options: [
      { value: 'judgment', label: 'Judgment' },
      { value: 'execution', label: 'Execution' },
      { value: 'both', label: 'Both' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { judgment: 10, both: 7, execution: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 9,
  },
  {
    id: 'C10',
    dimension: 'career',
    questionText: 'Does this deal include any ownership, equity, or participation component?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'could_propose', label: 'No, but I could propose it' },
      { value: 'no', label: "No, and it's not appropriate" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, could_propose: 6, no: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 10,
  },

  // ─ Stage 3+ specific ─
  {
    id: 'C11',
    dimension: 'career',
    questionText: 'Does this deal add a new asset to your portfolio (equity position, IP, revenue stream)?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, no: 4 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 11,
  },
  {
    id: 'C12',
    dimension: 'career',
    questionText: 'Does this deal create leverage for other deals in your portfolio?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, neutral: 5, no: 2 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 12,
  },
];

// ── Dimension 3: Partner Quality ───────────────────────────────────

const PARTNER_QUESTIONS: EvalQuestion[] = [
  // ─ Universal ─
  {
    id: 'P1',
    dimension: 'partner',
    questionText: 'How long have you worked with this person or company?',
    answerType: 'single_select',
    options: [
      { value: 'first_time', label: 'First time' },
      { value: 'under_1y', label: 'Under 1 year' },
      { value: '1_3y', label: '1–3 years' },
      { value: '3y_plus', label: '3+ years' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { first_time: 3, under_1y: 5, '1_3y': 8, '3y_plus': 10 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 1,
  },
  {
    id: 'P2',
    dimension: 'partner',
    questionText: 'Do they have a track record of successful projects or businesses?',
    questionTextVariants: {
      maker: 'Does the buyer, gallery, or label have a track record of success?',
      performer: 'Does the production, venue, or label have a track record of success?',
    },
    answerType: 'single_select',
    options: [
      { value: 'strong', label: 'Strong track record' },
      { value: 'some', label: 'Some successes' },
      { value: 'unproven', label: 'Unproven' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { strong: 10, some: 7, unproven: 3, dont_know: 2 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 2,
  },
  {
    id: 'P3',
    dimension: 'partner',
    questionText: 'Have they treated other creative partners fairly?',
    answerType: 'single_select',
    options: [
      { value: 'verified', label: "Yes, I've verified" },
      { value: 'believe_so', label: 'I believe so' },
      { value: 'dont_know', label: "Don't know" },
      { value: 'concerns', label: "I've heard concerns" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { verified: 10, believe_so: 7, dont_know: 4, concerns: 1 },
    redFlagTrigger: {
      condition: 'concerns',
      message: 'Past behavior predicts future behavior. Investigate before proceeding.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 3,
  },
  {
    id: 'P4',
    dimension: 'partner',
    questionText: 'Are they financially stable?',
    answerType: 'single_select',
    options: [
      { value: 'well_funded', label: 'Yes, well-funded or profitable' },
      { value: 'adequate', label: 'Adequate' },
      { value: 'tight', label: 'Tight' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { well_funded: 10, adequate: 7, tight: 3, dont_know: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 4,
  },
  {
    id: 'P5',
    dimension: 'partner',
    questionText: 'How transparent have they been about terms, financials, and expectations?',
    answerType: 'single_select',
    options: [
      { value: 'very', label: 'Very transparent' },
      { value: 'reasonably', label: 'Reasonably' },
      { value: 'evasive', label: 'Somewhat evasive' },
      { value: 'opaque', label: 'Actively opaque' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { very: 10, reasonably: 7, evasive: 3, opaque: 1 },
    redFlagTrigger: {
      condition: 'opaque',
      message: 'A partner who hides information before the deal will not improve after.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 5,
  },
  {
    id: 'P6',
    dimension: 'partner',
    questionText: 'Do they have a history of scope creep, delayed payments, or changing terms mid-project?',
    answerType: 'single_select',
    options: [
      { value: 'no', label: 'No' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'yes', label: 'Yes' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { no: 10, occasionally: 5, yes: 1, dont_know: 4 },
    redFlagTrigger: {
      condition: 'yes',
      message: 'A pattern of scope creep and payment issues is a serious warning sign.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 6,
  },
  {
    id: 'P7',
    dimension: 'partner',
    questionText: 'Is there a clear decision-maker, or will your work be subject to committee approval?',
    answerType: 'single_select',
    options: [
      { value: 'clear', label: 'Clear decision-maker' },
      { value: 'small_group', label: 'Small group' },
      { value: 'committee', label: 'Large committee' },
      { value: 'unclear', label: 'Unclear' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.10,
    scoringLogic: { clear: 10, small_group: 7, committee: 4, unclear: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 7,
  },

  // ─ Equity-specific ─
  {
    id: 'P8',
    dimension: 'partner',
    questionText: 'Does the founding team have prior startup experience?',
    answerType: 'single_select',
    options: [
      { value: 'exits', label: 'Yes, with exits' },
      { value: 'experience', label: 'Yes, without exits' },
      { value: 'first_time', label: 'First-time founders' },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { exits: 10, experience: 7, first_time: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 8,
  },
  {
    id: 'P9',
    dimension: 'partner',
    questionText: 'Is the company funded, and how much runway do they have?',
    answerType: 'single_select',
    options: [
      { value: '18_plus', label: '18+ months' },
      { value: '12_18', label: '12–18 months' },
      { value: 'under_12', label: 'Under 12 months' },
      { value: 'not_funded', label: 'Not funded' },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.15,
    scoringLogic: { '18_plus': 10, '12_18': 7, under_12: 4, not_funded: 1 },
    redFlagTrigger: {
      condition: 'not_funded',
      message: "Unfunded equity is high risk. Your contribution may never reach a liquidity event.",
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 9,
  },
  {
    id: 'P10',
    dimension: 'partner',
    questionText: 'Has the company achieved product-market fit?',
    answerType: 'single_select',
    options: [
      { value: 'clear_pmf', label: 'Clear PMF' },
      { value: 'early_signals', label: 'Early signals' },
      { value: 'not_yet', label: 'Not yet' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { clear_pmf: 10, early_signals: 6, not_yet: 3, dont_know: 2 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 10,
  },
  {
    id: 'P11',
    dimension: 'partner',
    questionText: "What's the total addressable market (TAM)?",
    answerType: 'single_select',
    options: [
      { value: 'billion_plus', label: '$1B+' },
      { value: '100m_1b', label: '$100M–$1B' },
      { value: 'under_100m', label: 'Under $100M' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { billion_plus: 10, '100m_1b': 7, under_100m: 4, dont_know: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 11,
  },

  // ─ Licensing-specific (V2) ─
  {
    id: 'P12',
    dimension: 'partner',
    questionText: 'Does the licensee have distribution capabilities to actually exploit the license?',
    answerType: 'single_select',
    options: [
      { value: 'strong', label: 'Strong distribution' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'weak', label: 'Weak' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['licensing'],
    scoringWeight: 0.10,
    scoringLogic: { strong: 10, moderate: 6, weak: 2, dont_know: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 12,
  },
  {
    id: 'P13',
    dimension: 'partner',
    questionText: 'Has the licensee honored past licensing agreements with other creators?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'dont_know', label: "Don't know" },
      { value: 'no', label: 'No' },
    ],
    dealTypes: ['licensing'],
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, dont_know: 4, no: 1 },
    redFlagTrigger: {
      condition: 'no',
      message: 'A licensee who breaks agreements with other creators will likely do the same with you.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 13,
  },
];

// ── Dimension 4: Deal Structure Quality ────────────────────────────

const STRUCTURE_QUESTIONS: EvalQuestion[] = [
  // ─ Universal ─
  {
    id: 'D1',
    dimension: 'structure',
    questionText: 'Where does this deal fall on the value capture hierarchy?',
    answerType: 'single_select',
    options: [
      { value: 'work_for_hire', label: 'Work-for-hire' },
      { value: 'assignment', label: 'Assignment' },
      { value: 'non_exclusive_license', label: 'Non-exclusive license' },
      { value: 'revenue_participation', label: 'Revenue participation' },
      { value: 'equity_ownership', label: 'Equity ownership' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: {
      work_for_hire: 3,
      assignment: 4,
      non_exclusive_license: 6,
      revenue_participation: 8,
      equity_ownership: 10,
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 1,
  },
  {
    id: 'D2',
    dimension: 'structure',
    questionText: 'Does the agreement clearly define scope of work, deliverables, and timeline?',
    questionTextVariants: {
      maker: 'Does the agreement clearly define the work, specifications, and timeline?',
      performer: 'Does the agreement clearly define your role, obligations, and schedule?',
    },
    answerType: 'single_select',
    options: [
      { value: 'very_clear', label: 'Yes, very clearly' },
      { value: 'mostly', label: 'Mostly' },
      { value: 'vague', label: 'Vaguely' },
      { value: 'no_agreement', label: 'No written agreement' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { very_clear: 10, mostly: 7, vague: 3, no_agreement: 0 },
    redFlagTrigger: {
      condition: 'no_agreement',
      message: 'Never proceed without a written agreement.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 2,
  },
  {
    id: 'D3',
    dimension: 'structure',
    questionText: 'Does the agreement specify what happens if either party wants to end the relationship?',
    answerType: 'single_select',
    options: [
      { value: 'clear', label: 'Yes, with clear terms' },
      { value: 'partial', label: 'Partially' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { clear: 10, partial: 5, no: 1 },
    redFlagTrigger: {
      condition: 'no',
      message: 'Every agreement needs an exit clause. Without one, you may be locked in.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 3,
  },
  {
    id: 'D4',
    dimension: 'structure',
    questionText: 'Do you retain any rights to the work you create?',
    answerType: 'single_select',
    options: [
      { value: 'full_ownership', label: 'Full ownership, licensing use' },
      { value: 'partial', label: 'Partial rights' },
      { value: 'work_for_hire', label: "No, it's work-for-hire" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { full_ownership: 10, partial: 6, work_for_hire: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 4,
  },
  {
    id: 'D5',
    dimension: 'structure',
    questionText: 'Is there a non-compete or exclusivity clause?',
    answerType: 'single_select',
    options: [
      { value: 'no', label: 'No' },
      { value: 'narrow', label: 'Yes, narrow and reasonable' },
      { value: 'broad', label: 'Yes, broad' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { no: 10, narrow: 7, broad: 2, dont_know: 4 },
    redFlagTrigger: {
      condition: 'broad',
      message: 'A broad non-compete can prevent you from working in your field. Negotiate narrower terms.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 5,
  },
  {
    id: 'D6',
    dimension: 'structure',
    questionText: 'Does the agreement include audit rights or financial transparency provisions?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'na', label: 'Not applicable' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.15,
    scoringLogic: { yes: 10, no: 3, na: 7 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 6,
  },

  // ─ Equity-specific ─
  {
    id: 'D7',
    dimension: 'structure',
    questionText: 'What type of equity?',
    answerType: 'single_select',
    options: [
      { value: 'common', label: 'Common stock' },
      { value: 'options', label: 'Stock options' },
      { value: 'restricted', label: 'Restricted stock' },
      { value: 'phantom', label: 'Phantom equity' },
      { value: 'profit_interest', label: 'Profit interest' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { common: 8, options: 7, restricted: 8, phantom: 5, profit_interest: 6, dont_know: 1 },
    redFlagTrigger: {
      condition: 'dont_know',
      message: 'You need to understand what type of equity you are receiving before accepting.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 7,
  },
  {
    id: 'D8',
    dimension: 'structure',
    questionText: "What's the vesting schedule?",
    answerType: 'free_text',
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { _text: 0 },
    assessmentBehavior: { type: 'always_ask' },
    placeholder: 'e.g. 4-year vest with 1-year cliff',
    displayOrder: 8,
  },
  {
    id: 'D9',
    dimension: 'structure',
    questionText: 'Is there acceleration on change of control (acquisition)?',
    answerType: 'single_select',
    options: [
      { value: 'single_trigger', label: 'Single-trigger (100% vests)' },
      { value: 'double_trigger', label: 'Double-trigger' },
      { value: 'no', label: 'No' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { single_trigger: 10, double_trigger: 7, no: 2, dont_know: 3 },
    redFlagTrigger: {
      condition: 'no',
      message: 'Without acceleration, you could lose unvested equity in an acquisition.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 9,
  },
  {
    id: 'D10',
    dimension: 'structure',
    questionText: 'Do you have pro-rata rights to participate in future funding rounds?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, no: 4, dont_know: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 10,
  },
  {
    id: 'D11',
    dimension: 'structure',
    questionText: 'Do you have information rights (quarterly financials, cap table access)?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.15,
    scoringLogic: { yes: 10, no: 1, dont_know: 2 },
    redFlagTrigger: {
      condition: 'no',
      message: "You're investing without visibility into company performance.",
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 11,
  },
  {
    id: 'D12',
    dimension: 'structure',
    questionText: 'Do you have anti-dilution protection?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'partial', label: 'Partial' },
      { value: 'no', label: 'No' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, partial: 6, no: 3, dont_know: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 12,
  },

  // ─ Revenue/Profit Share (V2) ─
  {
    id: 'D13',
    dimension: 'structure',
    questionText: 'Is your share calculated on gross revenue, adjusted gross, or net profit?',
    answerType: 'single_select',
    options: [
      { value: 'gross', label: 'Gross revenue' },
      { value: 'adjusted_gross', label: 'Adjusted gross' },
      { value: 'net_profit', label: 'Net profit' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['revenue_share'],
    scoringWeight: 0.15,
    scoringLogic: { gross: 10, adjusted_gross: 7, net_profit: 4, dont_know: 1 },
    redFlagTrigger: {
      condition: 'dont_know',
      message: 'You must understand how your share is calculated before signing.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 13,
  },
  {
    id: 'D14',
    dimension: 'structure',
    questionText: 'Are deductions capped?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes, with specific caps' },
      { value: 'no_caps', label: 'No caps' },
      { value: 'no_deductions', label: 'No deductions' },
    ],
    dealTypes: ['revenue_share'],
    scoringWeight: 0.15,
    scoringLogic: { yes: 10, no_caps: 2, no_deductions: 10 },
    redFlagTrigger: {
      condition: 'no_caps',
      message: 'Uncapped deductions can reduce your share to zero. This is the mechanism behind Hollywood accounting.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 14,
  },
  {
    id: 'D15',
    dimension: 'structure',
    questionText: 'Is there a minimum guaranteed payment floor?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: ['revenue_share'],
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, no: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 15,
  },
  {
    id: 'D16',
    dimension: 'structure',
    questionText: 'How are accounting disputes resolved?',
    answerType: 'single_select',
    options: [
      { value: 'audit', label: 'Independent audit' },
      { value: 'arbitration', label: 'Arbitration' },
      { value: 'litigation', label: 'Litigation' },
      { value: 'not_specified', label: 'Not specified' },
    ],
    dealTypes: ['revenue_share'],
    scoringWeight: 0.10,
    scoringLogic: { audit: 10, arbitration: 7, litigation: 5, not_specified: 1 },
    redFlagTrigger: {
      condition: 'not_specified',
      message: 'Without a dispute resolution mechanism, you have no recourse if accounting is questionable.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 16,
  },

  // ─ Licensing-specific (V2) ─
  {
    id: 'D17',
    dimension: 'structure',
    questionText: 'Is the license exclusive or non-exclusive?',
    answerType: 'single_select',
    options: [
      { value: 'exclusive', label: 'Exclusive' },
      { value: 'non_exclusive', label: 'Non-exclusive' },
    ],
    dealTypes: ['licensing'],
    scoringWeight: 0.15,
    scoringLogic: { exclusive: 5, non_exclusive: 8 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 17,
  },
  {
    id: 'D18',
    dimension: 'structure',
    questionText: "What's the license term?",
    answerType: 'single_select',
    options: [
      { value: 'fixed', label: 'Fixed term' },
      { value: 'perpetual', label: 'Perpetual' },
      { value: 'in_perpetuity', label: 'In perpetuity' },
    ],
    dealTypes: ['licensing'],
    scoringWeight: 0.10,
    scoringLogic: { fixed: 10, perpetual: 4, in_perpetuity: 2 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 18,
  },
  {
    id: 'D19',
    dimension: 'structure',
    questionText: 'Does the license include reversion rights (rights return to you if unused)?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'na', label: 'Not applicable' },
    ],
    dealTypes: ['licensing'],
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, no: 3, na: 7 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 19,
  },
  {
    id: 'D20',
    dimension: 'structure',
    questionText: 'Are territory and media rights clearly defined and limited?',
    answerType: 'single_select',
    options: [
      { value: 'specific', label: 'Yes, specific' },
      { value: 'broad', label: 'Broad but defined' },
      { value: 'unlimited', label: 'All media, worldwide, in perpetuity' },
    ],
    dealTypes: ['licensing'],
    scoringWeight: 0.10,
    scoringLogic: { specific: 10, broad: 5, unlimited: 1 },
    redFlagTrigger: {
      condition: 'unlimited',
      message: 'Permanent exclusive rights transfer should command premium pricing.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 20,
  },
  {
    id: 'D21',
    dimension: 'structure',
    questionText: 'Does the licensee have sublicensing rights?',
    answerType: 'single_select',
    options: [
      { value: 'no', label: 'No' },
      { value: 'restricted', label: 'Yes, with restrictions' },
      { value: 'unrestricted', label: 'Yes, unrestricted' },
    ],
    dealTypes: ['licensing'],
    scoringWeight: 0.10,
    scoringLogic: { no: 10, restricted: 6, unrestricted: 1 },
    redFlagTrigger: {
      condition: 'unrestricted',
      message: 'Unrestricted sublicensing means anyone could use your work without your knowledge or additional compensation.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 21,
  },

  // ─ Partnership/JV (V2) ─
  {
    id: 'D22',
    dimension: 'structure',
    questionText: 'Is there a written operating agreement?',
    answerType: 'single_select',
    options: [
      { value: 'detailed', label: 'Yes, detailed' },
      { value: 'basic', label: 'Yes, basic' },
      { value: 'verbal', label: 'Verbal only' },
      { value: 'not_yet', label: 'Not yet' },
    ],
    dealTypes: ['partnership'],
    scoringWeight: 0.15,
    scoringLogic: { detailed: 10, basic: 6, verbal: 1, not_yet: 3 },
    redFlagTrigger: {
      condition: 'verbal',
      message: 'A verbal-only partnership agreement is a lawsuit waiting to happen.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 22,
  },
  {
    id: 'D23',
    dimension: 'structure',
    questionText: 'How are decisions made?',
    answerType: 'single_select',
    options: [
      { value: 'equal', label: 'Equal vote' },
      { value: 'majority', label: 'Majority rules' },
      { value: 'one_controls', label: 'One party controls' },
      { value: 'not_defined', label: 'Not defined' },
    ],
    dealTypes: ['partnership'],
    scoringWeight: 0.10,
    scoringLogic: { equal: 8, majority: 7, one_controls: 4, not_defined: 1 },
    redFlagTrigger: {
      condition: 'not_defined',
      message: 'Undefined decision-making leads to deadlock and conflict.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 23,
  },
  {
    id: 'D24',
    dimension: 'structure',
    questionText: 'What happens if one partner wants out?',
    answerType: 'single_select',
    options: [
      { value: 'buyout', label: 'Buyout provision' },
      { value: 'dissolution', label: 'Dissolution terms' },
      { value: 'not_addressed', label: 'Not addressed' },
    ],
    dealTypes: ['partnership'],
    scoringWeight: 0.10,
    scoringLogic: { buyout: 10, dissolution: 7, not_addressed: 1 },
    redFlagTrigger: {
      condition: 'not_addressed',
      message: 'Every partnership needs a clear exit mechanism.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 24,
  },
  {
    id: 'D25',
    dimension: 'structure',
    questionText: 'How is IP ownership allocated for work created within the partnership?',
    answerType: 'single_select',
    options: [
      { value: 'defined', label: 'Clearly defined' },
      { value: 'partial', label: 'Partially defined' },
      { value: 'not_addressed', label: 'Not addressed' },
    ],
    dealTypes: ['partnership'],
    scoringWeight: 0.10,
    scoringLogic: { defined: 10, partial: 5, not_addressed: 1 },
    redFlagTrigger: {
      condition: 'not_addressed',
      message: 'IP created within a partnership must have clear ownership terms.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 25,
  },
];

// ── Dimension 5: Risk Profile ──────────────────────────────────────

const RISK_QUESTIONS: EvalQuestion[] = [
  // ─ Universal ─
  {
    id: 'R1',
    dimension: 'risk',
    questionText: "What's the worst realistic outcome of this deal?",
    answerType: 'free_text',
    dealTypes: 'all',
    scoringWeight: 0.05,
    scoringLogic: { _text: 0 },
    assessmentBehavior: { type: 'always_ask' },
    placeholder: 'Describe the downside scenario...',
    displayOrder: 1,
  },
  {
    id: 'R2',
    dimension: 'risk',
    questionText: 'If this deal fails completely, what do you lose?',
    answerType: 'multi_select',
    options: [
      { value: 'money', label: 'Money' },
      { value: 'time', label: 'Time' },
      { value: 'reputation', label: 'Reputation' },
      { value: 'opportunity_cost', label: 'Opportunity cost' },
      { value: 'rights', label: 'Rights to my work' },
      { value: 'relationships', label: 'Relationships' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { _count: 0 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 2,
  },
  {
    id: 'R3',
    dimension: 'risk',
    questionText: 'How diversified is your income?',
    answerType: 'single_select',
    options: [
      { value: 'diversified', label: 'This deal is one of 5+ income sources' },
      { value: 'moderate', label: 'One of 2–4 sources' },
      { value: 'primary', label: 'My primary income source' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.25,
    scoringLogic: { diversified: 10, moderate: 6, primary: 2 },
    assessmentBehavior: { type: 'skip_if_assessment', assessmentField: 'income_structure' },
    displayOrder: 3,
  },
  {
    id: 'R4',
    dimension: 'risk',
    questionText: 'Have you done a deal like this before?',
    answerType: 'single_select',
    options: [
      { value: 'multiple', label: 'Yes, multiple times' },
      { value: 'once_twice', label: 'Once or twice' },
      { value: 'never', label: 'Never' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.25,
    scoringLogic: { multiple: 10, once_twice: 6, never: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 4,
  },
  {
    id: 'R5',
    dimension: 'risk',
    questionText: 'Is there a way to limit your downside (caps, minimums, escape clauses)?',
    answerType: 'single_select',
    options: [
      { value: 'built_in', label: 'Yes, built into the deal' },
      { value: 'negotiate', label: 'I could negotiate for them' },
      { value: 'open_ended', label: 'No, the risk is open-ended' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.25,
    scoringLogic: { built_in: 10, negotiate: 6, open_ended: 2 },
    redFlagTrigger: {
      condition: 'open_ended',
      message: 'Open-ended risk exposure is dangerous. Negotiate caps or escape clauses.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 5,
  },

  // ─ Equity-specific ─
  {
    id: 'R6',
    dimension: 'risk',
    questionText: "What's your realistic exit timeline expectation?",
    answerType: 'single_select',
    options: [
      { value: '1_3y', label: '1–3 years' },
      { value: '3_5y', label: '3–5 years' },
      { value: '5_7y', label: '5–7 years' },
      { value: '7_plus', label: '7+ years' },
      { value: 'no_idea', label: 'No idea' },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { '1_3y': 7, '3_5y': 8, '5_7y': 6, '7_plus': 4, no_idea: 2 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 6,
  },
  {
    id: 'R7',
    dimension: 'risk',
    questionText: 'How many other equity positions do you currently hold?',
    answerType: 'single_select',
    options: [
      { value: 'none', label: 'None' },
      { value: '1_3', label: '1–3' },
      { value: '4_7', label: '4–7' },
      { value: '8_plus', label: '8+' },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { none: 3, '1_3': 6, '4_7': 8, '8_plus': 9 },
    assessmentBehavior: { type: 'skip_if_assessment', assessmentField: 'equity_positions' },
    displayOrder: 7,
  },
  {
    id: 'R8',
    dimension: 'risk',
    questionText: "What's the company's burn rate relative to runway?",
    answerType: 'single_select',
    options: [
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'aggressive', label: 'Aggressive' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { comfortable: 10, moderate: 6, aggressive: 3, dont_know: 4 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 8,
  },
];

// ── Dimension 6: Legal & Tax Readiness ─────────────────────────────

const LEGAL_QUESTIONS: EvalQuestion[] = [
  // ─ Universal ─
  {
    id: 'L1',
    dimension: 'legal',
    questionText: 'Do you have a lawyer who has reviewed (or will review) this agreement?',
    answerType: 'single_select',
    options: [
      { value: 'ip_attorney', label: 'Yes, entertainment or IP attorney' },
      { value: 'general', label: 'Yes, general counsel' },
      { value: 'plan_to', label: 'No, but I plan to' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.30,
    scoringLogic: { ip_attorney: 10, general: 7, plan_to: 5, no: 1 },
    assessmentBehavior: { type: 'prefill_if_assessment', assessmentField: 'business_structure' },
    displayOrder: 1,
  },
  {
    id: 'L2',
    dimension: 'legal',
    questionText: 'Do you understand the tax implications of this deal structure?',
    answerType: 'single_select',
    options: [
      { value: 'confirmed', label: 'Yes, confirmed with accountant' },
      { value: 'think_so', label: 'I think so' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.25,
    scoringLogic: { confirmed: 10, think_so: 5, no: 1 },
    assessmentBehavior: { type: 'prefill_if_assessment', assessmentField: 'business_structure' },
    displayOrder: 2,
  },
  {
    id: 'L3',
    dimension: 'legal',
    questionText: 'Is the agreement in writing?',
    answerType: 'single_select',
    options: [
      { value: 'formal', label: 'Yes, formal contract' },
      { value: 'email', label: 'Yes, email or letter agreement' },
      { value: 'verbal', label: 'Verbal only' },
    ],
    dealTypes: 'all',
    scoringWeight: 0.25,
    scoringLogic: { formal: 10, email: 6, verbal: 1 },
    redFlagTrigger: {
      condition: 'verbal',
      message: 'Verbal agreements are difficult to enforce. Get it in writing.',
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 3,
  },
  {
    id: 'L4',
    dimension: 'legal',
    questionText: 'Are there jurisdiction or governing law provisions?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: 'all',
    scoringWeight: 0.20,
    scoringLogic: { yes: 10, no: 4, dont_know: 3 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 4,
  },

  // ─ Equity-specific ─
  {
    id: 'L5',
    dimension: 'legal',
    questionText: 'Have you discussed 83(b) election with a tax advisor?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'na', label: 'Not applicable' },
      { value: 'whats_that', label: "What's an 83(b)?" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.15,
    scoringLogic: { yes: 10, no: 4, na: 7, whats_that: 1 },
    redFlagTrigger: {
      condition: 'whats_that',
      message: "If you're receiving restricted stock, the 83(b) election can save significant taxes. Consult a tax advisor before signing.",
    },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 5,
  },
  {
    id: 'L6',
    dimension: 'legal',
    questionText: 'Do you understand the difference between stock options and restricted stock for tax purposes?',
    answerType: 'single_select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'somewhat', label: 'Somewhat' },
      { value: 'no', label: 'No' },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.10,
    scoringLogic: { yes: 10, somewhat: 5, no: 2 },
    assessmentBehavior: { type: 'always_ask' },
    displayOrder: 6,
  },
  {
    id: 'L7',
    dimension: 'legal',
    questionText: 'Is your entity structure appropriate for this deal?',
    answerType: 'single_select',
    options: [
      { value: 'llc', label: 'LLC' },
      { value: 'c_corp', label: 'C-Corp' },
      { value: 's_corp', label: 'S-Corp' },
      { value: 'sole_prop', label: 'Sole proprietor' },
      { value: 'dont_know', label: "Don't know" },
    ],
    dealTypes: ['equity'],
    scoringWeight: 0.15,
    scoringLogic: { llc: 8, c_corp: 9, s_corp: 7, sole_prop: 3, dont_know: 2 },
    assessmentBehavior: { type: 'prefill_if_assessment', assessmentField: 'business_structure' },
    displayOrder: 7,
  },
];

// ── All Questions ──────────────────────────────────────────────────

export const ALL_EVAL_QUESTIONS: EvalQuestion[] = [
  ...FINANCIAL_QUESTIONS,
  ...CAREER_QUESTIONS,
  ...PARTNER_QUESTIONS,
  ...STRUCTURE_QUESTIONS,
  ...RISK_QUESTIONS,
  ...LEGAL_QUESTIONS,
];

// ── Dimension labels and descriptions ──────────────────────────────

export const DIMENSION_META: Record<DimensionKey, { label: string; description: string }> = {
  financial: {
    label: 'Financial Readiness',
    description: 'Can you afford the economic terms of this deal?',
  },
  career: {
    label: 'Career Positioning',
    description: 'Does this deal move you forward or sideways?',
  },
  partner: {
    label: 'Partner Quality',
    description: 'Is the other party trustworthy and capable?',
  },
  structure: {
    label: 'Deal Structure Quality',
    description: 'Are the terms fair and well-constructed?',
  },
  risk: {
    label: 'Risk Profile',
    description: 'What could go wrong, and can you absorb it?',
  },
  legal: {
    label: 'Legal & Tax Readiness',
    description: 'Are you prepared for the complexity?',
  },
};

export const DIMENSIONS_ORDER: DimensionKey[] = [
  'financial',
  'career',
  'partner',
  'structure',
  'risk',
  'legal',
];

// ── Stage-specific question IDs ────────────────────────────────────
// Career positioning questions that only appear for specific stages.

const STAGE_1_QUESTIONS = new Set(['C7', 'C8']);
const STAGE_2_QUESTIONS = new Set(['C9', 'C10']);
const STAGE_3_PLUS_QUESTIONS = new Set(['C11', 'C12']);

function isStageQuestion(id: string): boolean {
  return STAGE_1_QUESTIONS.has(id) || STAGE_2_QUESTIONS.has(id) || STAGE_3_PLUS_QUESTIONS.has(id);
}

function stageMatchesQuestion(stage: number, questionId: string): boolean {
  if (STAGE_1_QUESTIONS.has(questionId)) return stage === 1;
  if (STAGE_2_QUESTIONS.has(questionId)) return stage === 2;
  if (STAGE_3_PLUS_QUESTIONS.has(questionId)) return stage >= 3;
  return true;
}

// ── Helper: Get filtered questions ─────────────────────────────────

export function getEvalQuestions(
  dimension: DimensionKey,
  dealType: DealType,
  stage: number | null,
  assessmentContext: EvalAssessmentContext | null,
): EvalQuestion[] {
  const effectiveStage = stage ?? assessmentContext?.detected_stage ?? null;

  return ALL_EVAL_QUESTIONS
    .filter((q) => q.dimension === dimension)
    .filter((q) => {
      // Deal type filter
      if (q.dealTypes === 'all') return true;
      return q.dealTypes.includes(dealType);
    })
    .filter((q) => {
      // Stage filter for career positioning questions
      if (!isStageQuestion(q.id)) return true;
      if (effectiveStage === null) return false; // hide stage questions if no stage known
      return stageMatchesQuestion(effectiveStage, q.id);
    })
    .filter((q) => {
      // Assessment skip filter
      if (!assessmentContext?.hasAssessment) return true;
      if (q.assessmentBehavior.type === 'skip_if_assessment') return false;
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

// ── Helper: Get all questions for a full evaluation ────────────────

export function getAllEvalQuestions(
  dealType: DealType,
  stage: number | null,
  assessmentContext: EvalAssessmentContext | null,
): Record<DimensionKey, EvalQuestion[]> {
  return {
    financial: getEvalQuestions('financial', dealType, stage, assessmentContext),
    career: getEvalQuestions('career', dealType, stage, assessmentContext),
    partner: getEvalQuestions('partner', dealType, stage, assessmentContext),
    structure: getEvalQuestions('structure', dealType, stage, assessmentContext),
    risk: getEvalQuestions('risk', dealType, stage, assessmentContext),
    legal: getEvalQuestions('legal', dealType, stage, assessmentContext),
  };
}

// ── Deal Type Labels ───────────────────────────────────────────────

export const DEAL_TYPE_OPTIONS: { value: DealType; label: string; description: string }[] = [
  { value: 'service', label: 'Service Agreement', description: 'Someone wants to hire me for a project or ongoing work' },
  { value: 'equity', label: 'Equity Deal', description: "I'm being offered ownership stake in a company" },
  { value: 'licensing', label: 'Licensing Deal', description: 'Someone wants to use my work, or I want to license something' },
  { value: 'partnership', label: 'Partnership / JV', description: "We're building something together with shared ownership" },
  { value: 'revenue_share', label: 'Revenue or Profit Share', description: 'My pay is tied to how well something performs' },
  { value: 'advisory', label: 'Advisory Role', description: 'They want my strategic guidance, not my execution' },
];

export const DEAL_TYPE_VARIANTS: Partial<Record<string, Partial<Record<DealType, string>>>> = {
  maker: {
    service: 'Someone wants to buy, commission, or license my work',
    licensing: 'A gallery, brand, or publisher wants ongoing rights to use my work',
  },
  performer: {
    service: 'A production, venue, or label wants me for a project or role',
    licensing: 'Someone wants to use my performance, likeness, or catalog',
  },
};

// ── Creative Mode Question (for non-assessment users) ──────────────

export const CREATIVE_MODE_QUESTION = {
  id: 'CM1',
  questionText: 'How does your creative work reach the world?',
  options: [
    { value: 'maker', label: 'I make things and sell or license them directly' },
    { value: 'service', label: 'I make things for clients or employers' },
    { value: 'hybrid', label: 'I do both — personal creative work + client/commercial work' },
    { value: 'performer', label: 'I perform, direct, or lead creative projects' },
    { value: 'builder', label: "I'm building something — a studio, label, brand, or creative business" },
    { value: 'transition', label: "I'm between things or figuring it out" },
  ],
};
