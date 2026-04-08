import type { AssessmentQuestion } from '@/types/assessment';

// ── Section 1: Creative Identity ──────────────────────────────────

export const DISCIPLINE_GROUPS: AssessmentQuestion = {
  id: 'Q1',
  section: 'identity',
  questionText: "What's your primary creative discipline?",
  answerType: 'single_select',
  options: [
    { value: 'visual_arts', label: 'Visual Arts', description: 'Painting, Sculpture, Illustration, Mixed Media, Digital Art, Photography' },
    { value: 'design', label: 'Design', description: 'Brand / Identity, Product / UX, Graphic, Motion, Environmental, Web / Digital' },
    { value: 'film_video', label: 'Film & Video', description: 'Directing, Screenwriting, Cinematography, Editing, Producing, Animation' },
    { value: 'music_audio', label: 'Music & Audio', description: 'Artist, Songwriter, Producer, Composer, Sound Design, DJ / Electronic' },
    { value: 'writing', label: 'Writing', description: 'Fiction, Nonfiction, Screenwriting, Copywriting, Content / Editorial' },
    { value: 'performing_arts', label: 'Performing Arts', description: 'Acting, Dance, Theater, Comedy / Spoken Word' },
    { value: 'architecture_interiors', label: 'Architecture & Interiors', description: 'Residential, Commercial, Landscape, Interior Design' },
    { value: 'fashion_apparel', label: 'Fashion & Apparel', description: 'Design, Styling, Creative Direction, Manufacturing' },
    { value: 'advertising_marketing', label: 'Advertising & Marketing', description: 'Creative Direction, Strategy, Media / Content, Brand Consulting' },
    { value: 'technology_creative_tech', label: 'Technology & Creative Tech', description: 'Creative Coding, Game Design, XR / Immersive, AI-Augmented Creative' },
  ],
  displayOrder: 1,
};

export const SUB_DISCIPLINES: Record<string, AssessmentQuestion> = {
  visual_arts: {
    id: 'Q1-sub-visual_arts',
    section: 'identity',
    questionText: 'Which area of visual arts?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'painting', label: 'Painting' },
      { value: 'sculpture', label: 'Sculpture' },
      { value: 'illustration', label: 'Illustration' },
      { value: 'mixed_media', label: 'Mixed Media' },
      { value: 'digital_art', label: 'Digital Art' },
      { value: 'photography_fine_art', label: 'Photography (Fine Art)' },
    ],
    displayOrder: 2,
  },
  design: {
    id: 'Q1-sub-design',
    section: 'identity',
    questionText: 'Which area of design?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'brand_identity', label: 'Brand / Identity' },
      { value: 'product_ux', label: 'Product / UX' },
      { value: 'graphic', label: 'Graphic' },
      { value: 'motion', label: 'Motion' },
      { value: 'environmental_spatial', label: 'Environmental / Spatial' },
      { value: 'web_digital', label: 'Web / Digital' },
    ],
    displayOrder: 2,
  },
  film_video: {
    id: 'Q1-sub-film_video',
    section: 'identity',
    questionText: 'Which area of film & video?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'directing', label: 'Directing' },
      { value: 'screenwriting', label: 'Screenwriting' },
      { value: 'cinematography', label: 'Cinematography' },
      { value: 'editing_post', label: 'Editing / Post' },
      { value: 'producing', label: 'Producing' },
      { value: 'animation', label: 'Animation' },
    ],
    displayOrder: 2,
  },
  music_audio: {
    id: 'Q1-sub-music_audio',
    section: 'identity',
    questionText: 'Which area of music & audio?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'artist_performer', label: 'Artist / Performer' },
      { value: 'songwriter', label: 'Songwriter' },
      { value: 'music_producer', label: 'Producer' },
      { value: 'composer_scoring', label: 'Composer / Scoring' },
      { value: 'sound_design', label: 'Sound Design' },
      { value: 'dj_electronic', label: 'DJ / Electronic' },
    ],
    displayOrder: 2,
  },
  writing: {
    id: 'Q1-sub-writing',
    section: 'identity',
    questionText: 'Which area of writing?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'fiction_literary', label: 'Fiction / Literary' },
      { value: 'nonfiction_journalism', label: 'Nonfiction / Journalism' },
      { value: 'screenwriting_writing', label: 'Screenwriting' },
      { value: 'copywriting', label: 'Copywriting' },
      { value: 'content_editorial', label: 'Content / Editorial' },
    ],
    displayOrder: 2,
  },
  performing_arts: {
    id: 'Q1-sub-performing_arts',
    section: 'identity',
    questionText: 'Which area of performing arts?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'acting', label: 'Acting' },
      { value: 'dance_choreography', label: 'Dance / Choreography' },
      { value: 'theater_directing_producing', label: 'Theater (Directing / Producing)' },
      { value: 'comedy_spoken_word', label: 'Comedy / Spoken Word' },
    ],
    displayOrder: 2,
  },
  architecture_interiors: {
    id: 'Q1-sub-architecture_interiors',
    section: 'identity',
    questionText: 'Which area?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'residential', label: 'Residential' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'landscape', label: 'Landscape' },
      { value: 'interior_design', label: 'Interior Design' },
    ],
    displayOrder: 2,
  },
  fashion_apparel: {
    id: 'Q1-sub-fashion_apparel',
    section: 'identity',
    questionText: 'Which area of fashion & apparel?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'fashion_design', label: 'Design' },
      { value: 'styling', label: 'Styling' },
      { value: 'fashion_creative_direction', label: 'Creative Direction' },
      { value: 'manufacturing_production', label: 'Manufacturing / Production' },
    ],
    displayOrder: 2,
  },
  advertising_marketing: {
    id: 'Q1-sub-advertising_marketing',
    section: 'identity',
    questionText: 'Which area of advertising & marketing?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'ad_creative_direction', label: 'Creative Direction' },
      { value: 'strategy', label: 'Strategy' },
      { value: 'media_content', label: 'Media / Content' },
      { value: 'brand_consulting', label: 'Brand Consulting' },
    ],
    displayOrder: 2,
  },
  technology_creative_tech: {
    id: 'Q1-sub-technology_creative_tech',
    section: 'identity',
    questionText: 'Which area of creative tech?',
    answerType: 'single_select',
    isSubQuestion: true,
    parentQuestionId: 'Q1',
    options: [
      { value: 'creative_coding', label: 'Creative Coding' },
      { value: 'game_design', label: 'Game Design' },
      { value: 'xr_immersive', label: 'XR / Immersive' },
      { value: 'ai_augmented_creative', label: 'AI-Augmented Creative' },
    ],
    displayOrder: 2,
  },
};

const Q2_CREATIVE_MODE: AssessmentQuestion = {
  id: 'Q2',
  section: 'identity',
  questionText: 'How does your creative work reach the world?',
  answerType: 'single_select',
  options: [
    { value: 'maker', label: 'I make things and sell/license them directly', description: 'Artist selling work, musician releasing music, author publishing books' },
    { value: 'service', label: 'I make things for clients or employers', description: 'Freelancer, agency, in-house creative' },
    { value: 'hybrid', label: 'I do both', description: 'Personal creative work + client/commercial work' },
    { value: 'performer', label: 'I perform, direct, or lead creative projects', description: 'Actor, director, choreographer, creative director' },
    { value: 'builder', label: "I'm building something", description: 'A studio, label, brand, or creative business' },
    { value: 'transition', label: "I'm between things or figuring it out" },
  ],
  displayOrder: 3,
};

// ── Section 2: Feeling + Energy ──────────────────────────────────

const Q3_ENERGY: AssessmentQuestion = {
  id: 'Q3',
  section: 'feeling',
  questionText: 'What kind of creative work gives you the most energy?',
  answerType: 'rank',
  options: [
    { value: 'making', label: 'Making', description: 'The craft itself, hands on the work' },
    { value: 'shaping', label: 'Shaping', description: 'Solving creative problems, directing outcomes' },
    { value: 'building', label: 'Building', description: 'Creating something bigger than a single project' },
    { value: 'sharing', label: 'Sharing', description: 'Teaching, mentoring, or connecting with an audience' },
  ],
  displayOrder: 4,
};

const Q4_DRAINS: AssessmentQuestion = {
  id: 'Q4',
  section: 'feeling',
  questionText: 'What drains you most about your current situation?',
  answerType: 'multi_select',
  maxSelections: 2,
  options: [
    { value: 'undervalued', label: 'My work is undervalued relative to the impact it creates' },
    { value: 'admin', label: "I spend too much time on things that aren't my creative work" },
    { value: 'no_control', label: "I don't have enough creative control or ownership over what I make" },
    { value: 'uncertain_future', label: "I'm not sure where the industry is going — or where I fit in it" },
    { value: 'overworked', label: "I'm working too much for too little return" },
    { value: 'stuck', label: "I feel stuck but don't know what the next move is" },
  ],
  displayOrder: 5,
};

const Q5_DREAM: AssessmentQuestion = {
  id: 'Q5',
  section: 'feeling',
  questionText: "Forget the practical for a moment. If money wasn't an issue, you could be anywhere, do anything, work with anyone — what would your creative life look like?",
  answerType: 'free_text',
  isOptional: true,
  placeholder: 'Describe the work, the lifestyle, the impact — whatever comes to mind.',
  displayOrder: 6,
};

// ── Section 3: Current Reality ──────────────────────────────────

const Q6_INCOME: AssessmentQuestion = {
  id: 'Q6',
  section: 'reality',
  questionText: "What's your approximate annual income from your creative work?",
  answerType: 'single_select',
  options: [
    { value: 'under_50k', label: 'Under $50K' },
    { value: '50k_75k', label: '$50K – $75K' },
    { value: '75k_100k', label: '$75K – $100K' },
    { value: '100k_150k', label: '$100K – $150K' },
    { value: '150k_200k', label: '$150K – $200K' },
    { value: '200k_300k', label: '$200K – $300K' },
    { value: '300k_500k', label: '$300K – $500K' },
    { value: '500k_1m', label: '$500K – $1M' },
    { value: '1m_plus', label: '$1M+' },
    { value: 'prefer_not', label: 'Prefer not to say' },
  ],
  scoring: {
    under_50k: { stage_1: 1.0 },
    '50k_75k': { stage_1: 1.0 },
    '75k_100k': { stage_1: 1.5 },
    '100k_150k': { stage_2: 2.0 },
    '150k_200k': { stage_2: 2.0 },
    '200k_300k': { stage_2: 2.5 },
    '300k_500k': { stage_3: 3.0 },
    '500k_1m': { stage_3: 3.5 },
    '1m_plus': { stage_4: 4.0 },
    prefer_not: { stage_2: 2.0 }, // neutral midpoint
  },
  displayOrder: 7,
};

const Q7_INCOME_STRUCTURE: AssessmentQuestion = {
  id: 'Q7',
  section: 'reality',
  questionText: 'How is that income structured?',
  answerType: 'allocation',
  options: [
    { value: 'salary', label: 'Salary / W-2 employment' },
    { value: 'fees_sales', label: 'Project fees / invoices' },
    { value: 'retainer_commission', label: 'Retainer / ongoing contracts' },
    { value: 'royalties', label: 'Royalties / licensing fees' },
    { value: 'equity', label: 'Equity / profit participation' },
    { value: 'products', label: 'Product revenue (courses, tools)' },
    { value: 'other', label: 'Other' },
  ],
  optionVariants: {
    maker: [
      { value: 'salary', label: 'Salary / employment' },
      { value: 'fees_sales', label: 'Sales of original work' },
      { value: 'retainer_commission', label: 'Commissions / contracted work' },
      { value: 'royalties', label: 'Royalties / licensing fees' },
      { value: 'equity', label: 'Equity / profit participation' },
      { value: 'products', label: 'Merch / products / publishing' },
      { value: 'other', label: 'Other' },
    ],
    performer: [
      { value: 'salary', label: 'Salary / employment' },
      { value: 'fees_sales', label: 'Performance fees / bookings' },
      { value: 'retainer_commission', label: 'Commissions / contracted work' },
      { value: 'royalties', label: 'Royalties / residuals' },
      { value: 'equity', label: 'Equity / profit participation' },
      { value: 'products', label: 'Merch / products / publishing' },
      { value: 'other', label: 'Other' },
    ],
  },
  displayOrder: 8,
};

const Q8_WHAT_THEY_PAY_FOR: AssessmentQuestion = {
  id: 'Q8',
  section: 'reality',
  questionText: 'When people engage you or buy your work, what are they really paying for?',
  answerType: 'single_select',
  optionVariants: {
    service: [
      { value: 'execution', label: '"Can you make this?"', description: 'They have a brief or spec, I execute it' },
      { value: 'elevation', label: '"Can you make this better?"', description: 'They have something, I elevate it' },
      { value: 'solution', label: '"What should we make?"', description: 'They have a problem, I define the creative solution' },
      { value: 'direction', label: '"Where should we go?"', description: 'They have a business or brand, I set the creative direction' },
      { value: 'partnership', label: '"Will you build this with us?"', description: 'They want me as a partner, not a vendor' },
    ],
    hybrid: [
      { value: 'execution', label: '"Can you make this?"', description: 'They have a brief or spec, I execute it' },
      { value: 'elevation', label: '"Can you make this better?"', description: 'They have something, I elevate it' },
      { value: 'solution', label: '"What should we make?"', description: 'They have a problem, I define the creative solution' },
      { value: 'direction', label: '"Where should we go?"', description: 'They have a business or brand, I set the creative direction' },
      { value: 'partnership', label: '"Will you build this with us?"', description: 'They want me as a partner, not a vendor' },
    ],
    maker: [
      { value: 'execution', label: 'Buy my work after it\'s made', description: 'I create, then sell or show' },
      { value: 'elevation', label: 'Commission me to make specific work', description: 'People commission me for specific pieces' },
      { value: 'solution', label: 'Seek me out for my perspective', description: 'My point of view is the product' },
      { value: 'direction', label: 'Want to collaborate', description: 'My vision attracts partnerships and co-creation' },
      { value: 'partnership', label: 'Invest in what I\'m building', description: 'My body of work or brand has momentum' },
    ],
    performer: [
      { value: 'execution', label: 'Buy my work after it\'s made', description: 'I create, then sell or show' },
      { value: 'elevation', label: 'Commission me to make specific work', description: 'People commission me for specific pieces' },
      { value: 'solution', label: 'Seek me out for my perspective', description: 'My point of view is the product' },
      { value: 'direction', label: 'Want to collaborate', description: 'My vision attracts partnerships and co-creation' },
      { value: 'partnership', label: 'Invest in what I\'m building', description: 'My body of work or brand has momentum' },
    ],
    builder: [
      { value: 'execution', label: 'Still primarily executing for others', description: "I'm still primarily creating for others" },
      { value: 'elevation', label: 'Transitioning', description: 'Some client/execution work, some building my own thing' },
      { value: 'solution', label: 'Mostly building my own venture', description: "My venture is generating revenue" },
      { value: 'direction', label: 'Running a creative business', description: "Growing independent of my personal production" },
    ],
    transition: [
      { value: 'execution', label: '"Can you make this?"', description: 'They have a brief or spec, I execute it' },
      { value: 'elevation', label: '"Can you make this better?"', description: 'They have something, I elevate it' },
      { value: 'solution', label: '"What should we make?"', description: 'They have a problem, I define the creative solution' },
      { value: 'direction', label: '"Where should we go?"', description: 'They have a business or brand, I set the creative direction' },
      { value: 'partnership', label: '"Will you build this with us?"', description: 'They want me as a partner, not a vendor' },
    ],
  },
  scoring: {
    execution: { stage_1: 1.0 },
    elevation: { stage_1: 1.5 },
    solution: { stage_2: 2.5 },
    direction: { stage_3: 3.0 },
    partnership: { stage_3: 3.5 },
  },
  displayOrder: 9,
};

const Q9_EQUITY: AssessmentQuestion = {
  id: 'Q9',
  section: 'reality',
  questionText: 'Do you own equity, profit participation, royalty rights, or IP rights in anything beyond your own direct work?',
  answerType: 'single_select',
  options: [
    { value: 'none', label: 'No — never had an ownership or rights deal' },
    { value: 'offered', label: "I've been offered one but it didn't happen" },
    { value: 'one', label: 'Yes — 1 position (even if small)' },
    { value: 'few', label: 'Yes — 2-3 positions' },
    { value: 'portfolio', label: 'Yes — 4+ positions or a structured portfolio' },
  ],
  scoring: {
    none: { stage_1: 1.0 },
    offered: { stage_1: 1.5 },
    one: { stage_2: 2.0 },
    few: { stage_3: 3.0 },
    portfolio: { stage_4: 4.0 },
  },
  displayOrder: 10,
};

const Q10_DEMAND: AssessmentQuestion = {
  id: 'Q10',
  section: 'reality',
  questionText: 'How much demand is there for your creative work right now?',
  answerType: 'single_select',
  optionVariants: {
    service: [
      { value: 'seeking', label: "I'm actively looking for work / clients" },
      { value: 'some', label: 'I have some work but need more' },
      { value: 'steady', label: 'I have steady work from repeat relationships' },
      { value: 'overflow', label: "I have more inbound than I can handle — I'm regularly saying no" },
    ],
    hybrid: [
      { value: 'seeking', label: "I'm actively looking for work / clients" },
      { value: 'some', label: 'I have some work but need more' },
      { value: 'steady', label: 'I have steady work from repeat relationships' },
      { value: 'overflow', label: "I have more inbound than I can handle — I'm regularly saying no" },
    ],
    maker: [
      { value: 'seeking', label: "I'm working to build an audience / buyers / representation" },
      { value: 'some', label: 'I have some traction but it\'s inconsistent' },
      { value: 'steady', label: 'I have a consistent following, collector base, or booking calendar' },
      { value: 'overflow', label: 'Demand exceeds my output — I have waitlists, sell out, or turn down opportunities' },
    ],
    performer: [
      { value: 'seeking', label: "I'm working to build an audience / buyers / representation" },
      { value: 'some', label: 'I have some traction but it\'s inconsistent' },
      { value: 'steady', label: 'I have a consistent following, collector base, or booking calendar' },
      { value: 'overflow', label: 'Demand exceeds my output — I have waitlists, sell out, or turn down opportunities' },
    ],
    builder: [
      { value: 'seeking', label: "I'm actively building demand for what I'm creating" },
      { value: 'some', label: 'I have some traction but need more' },
      { value: 'steady', label: 'I have steady demand and repeat customers/clients' },
      { value: 'overflow', label: 'Demand exceeds capacity — I need to scale' },
    ],
    transition: [
      { value: 'seeking', label: "I'm actively looking for work / opportunities" },
      { value: 'some', label: 'I have some work but need more' },
      { value: 'steady', label: 'I have steady work from repeat relationships' },
      { value: 'overflow', label: "I have more inbound than I can handle" },
    ],
  },
  scoring: {
    seeking: { stage_1: 1.0 },
    some: { stage_1: 1.5 },
    steady: { stage_2: 2.5 },
    overflow: { stage_3: 3.0 },
  },
  displayOrder: 11,
};

const Q11_STRUCTURE: AssessmentQuestion = {
  id: 'Q11',
  section: 'reality',
  questionText: 'What is your current business structure?',
  answerType: 'single_select',
  options: [
    { value: 'none', label: 'No formal structure (sole proprietor by default)' },
    { value: 'sole_prop', label: 'Sole proprietorship (registered)' },
    { value: 'llc', label: 'Single-member LLC' },
    { value: 'llc_scorp', label: 'LLC taxed as S-Corp' },
    { value: 'multi_entity', label: 'Multiple entities (LLC + Corp, holding company, etc.)' },
    { value: 'corp', label: 'Corporation (C-Corp or S-Corp)' },
    { value: 'w2', label: 'I work through an employer (W-2) with no separate entity' },
    { value: 'unknown', label: "I don't know" },
  ],
  scoring: {
    none: { stage_1: 1.0 },
    sole_prop: { stage_1: 1.0 },
    llc: { stage_1: 1.5 },
    llc_scorp: { stage_2: 2.5 },
    multi_entity: { stage_3: 3.5 },
    corp: { stage_3: 3.0 },
    w2: { stage_1: 1.0 },
    unknown: { stage_1: 1.0 },
  },
  displayOrder: 12,
};

// ── Section 4: Adaptive Deep Dive — Stage Pools ──────────────────

// Pool: Stage 1 (Execution Excellence)
const Q_S1_BIZ: AssessmentQuestion = {
  id: 'Q-S1-BIZ',
  section: 'deep_dive',
  pool: 'stage_1',
  questionText: 'Do you have a separate business bank account?',
  answerType: 'single_select',
  options: [
    { value: 'yes_card', label: 'Yes — with a business credit card' },
    { value: 'yes_nocard', label: 'Yes — but no business credit card' },
    { value: 'no', label: 'No — I use personal accounts for everything' },
    { value: 'na', label: 'Not applicable (employed W-2 only)' },
  ],
  displayOrder: 1,
};

const Q_S1_FIN: AssessmentQuestion = {
  id: 'Q-S1-FIN',
  section: 'deep_dive',
  pool: 'stage_1',
  questionText: 'How do you handle your finances?',
  answerType: 'single_select',
  options: [
    { value: 'no_separation', label: "I don't really separate business from personal finances" },
    { value: 'basic', label: 'I use basic tools (spreadsheet, app) but manage it myself' },
    { value: 'software', label: 'I have accounting software and manage it myself' },
    { value: 'bookkeeper', label: 'I have a bookkeeper or accountant' },
    { value: 'full', label: 'I have a bookkeeper AND accountant/CPA' },
  ],
  displayOrder: 2,
};

const Q_S1_CONTRACT: AssessmentQuestion = {
  id: 'Q-S1-CONTRACT',
  section: 'deep_dive',
  pool: 'stage_1',
  questionText: 'How are the terms of your work typically documented?',
  answerType: 'single_select',
  optionVariants: {
    service: [
      { value: 'own_contracts', label: 'I use my own contracts for every engagement' },
      { value: 'client_terms', label: "I usually sign the client's terms" },
      { value: 'sometimes', label: 'Sometimes documented, sometimes informal' },
      { value: 'informal', label: 'Most work is informal — no contracts' },
    ],
    hybrid: [
      { value: 'own_contracts', label: 'I use my own contracts for every engagement' },
      { value: 'client_terms', label: "I usually sign the client's terms" },
      { value: 'sometimes', label: 'Sometimes documented, sometimes informal' },
      { value: 'informal', label: 'Most work is informal — no contracts' },
    ],
    maker: [
      { value: 'own_contracts', label: 'I have standard agreements for sales, commissions, or licensing' },
      { value: 'client_terms', label: 'Galleries, labels, or partners set the terms and I sign' },
      { value: 'sometimes', label: 'Some deals are documented, some are handshakes' },
      { value: 'informal', label: 'Most of my work has no formal agreements' },
    ],
    performer: [
      { value: 'own_contracts', label: 'I have standard agreements for sales, commissions, or licensing' },
      { value: 'client_terms', label: 'Galleries, labels, or partners set the terms and I sign' },
      { value: 'sometimes', label: 'Some deals are documented, some are handshakes' },
      { value: 'informal', label: 'Most of my work has no formal agreements' },
    ],
    builder: [
      { value: 'own_contracts', label: 'I use my own contracts for every engagement' },
      { value: 'client_terms', label: "Partners or clients set the terms" },
      { value: 'sometimes', label: 'Sometimes documented, sometimes informal' },
      { value: 'informal', label: 'Most work is informal — no contracts' },
    ],
    transition: [
      { value: 'own_contracts', label: 'I use my own contracts for every engagement' },
      { value: 'client_terms', label: "I usually sign the other party's terms" },
      { value: 'sometimes', label: 'Sometimes documented, sometimes informal' },
      { value: 'informal', label: 'Most work is informal — no contracts' },
    ],
  },
  displayOrder: 3,
};

const Q_S1_IP: AssessmentQuestion = {
  id: 'Q-S1-IP',
  section: 'deep_dive',
  pool: 'stage_1',
  questionText: 'Who typically owns what you create?',
  answerType: 'single_select',
  optionVariants: {
    service: [
      { value: 'client_owns', label: 'The client owns everything (work-for-hire)' },
      { value: 'mixed', label: 'Mixed — some work-for-hire, some I retain rights' },
      { value: 'i_retain', label: 'I retain IP and license usage to clients' },
      { value: 'never_thought', label: "I've never thought about this" },
    ],
    hybrid: [
      { value: 'client_owns', label: 'The client owns everything (work-for-hire)' },
      { value: 'mixed', label: 'Mixed — some work-for-hire, some I retain rights' },
      { value: 'i_retain', label: 'I retain IP and license usage to clients' },
      { value: 'never_thought', label: "I've never thought about this" },
    ],
    maker: [
      { value: 'i_own', label: 'I own everything I make' },
      { value: 'mixed', label: "I own most, but have given up rights on some deals" },
      { value: 'others_own', label: 'Labels, galleries, or publishers own some of my catalog' },
      { value: 'never_thought', label: "I'm not sure who owns what — it's never been clear" },
    ],
    performer: [
      { value: 'i_own', label: 'I own everything I create' },
      { value: 'mixed', label: "I own most, but have given up rights on some deals" },
      { value: 'others_own', label: 'Labels, studios, or producers own some of my work' },
      { value: 'never_thought', label: "I'm not sure who owns what — it's never been clear" },
    ],
    builder: [
      { value: 'i_own', label: 'My company owns the IP we create' },
      { value: 'mixed', label: 'Mixed — some we own, some is work-for-hire' },
      { value: 'others_own', label: "Partners or investors own significant IP" },
      { value: 'never_thought', label: "IP ownership hasn't been clearly defined" },
    ],
    transition: [
      { value: 'client_owns', label: 'Others own most of what I create' },
      { value: 'mixed', label: 'Mixed — some I own, some I don\'t' },
      { value: 'i_retain', label: 'I retain most of what I create' },
      { value: 'never_thought', label: "I've never thought about this" },
    ],
  },
  displayOrder: 4,
};

// Pool: Stage 2 (Judgment Positioning)
const Q_S2_VALUE: AssessmentQuestion = {
  id: 'Q-S2-VALUE',
  section: 'deep_dive',
  pool: 'stage_2',
  questionText: 'Have you ever priced your work based on the value or outcome it creates — rather than time, materials, or standard rates?',
  answerType: 'single_select',
  options: [
    { value: 'no', label: 'No — I charge standard rates for my discipline' },
    { value: 'experimented', label: "I've experimented but don't do it consistently" },
    { value: 'some', label: 'I do this regularly with some clients / buyers / partners' },
    { value: 'most', label: 'This is how I price most of my work' },
  ],
  displayOrder: 1,
};

const Q_S2_LEVERAGE: AssessmentQuestion = {
  id: 'Q-S2-LEVERAGE',
  section: 'deep_dive',
  pool: 'stage_2',
  questionText: 'Do you have people who can execute or produce work under your direction?',
  answerType: 'single_select',
  options: [
    { value: 'none', label: 'No — I do everything myself' },
    { value: 'occasionally', label: 'Occasionally — I bring in collaborators for specific things' },
    { value: 'small_team', label: 'Yes — I have 1-3 reliable people I direct regularly' },
    { value: 'team', label: 'Yes — I have a team or network that handles most production' },
  ],
  displayOrder: 2,
};

const Q_S2_FRAMEWORKS: AssessmentQuestion = {
  id: 'Q-S2-FRAMEWORKS',
  section: 'deep_dive',
  pool: 'stage_2',
  questionText: 'Do you have documented approaches, methods, or frameworks that are uniquely yours?',
  answerType: 'single_select',
  options: [
    { value: 'intuitive', label: 'No — I work intuitively' },
    { value: 'informal', label: 'I have informal approaches but nothing documented' },
    { value: 'documented', label: 'I have documented processes I use internally' },
    { value: 'shared', label: "I've shared my methods publicly (writing, talks, workshops, teaching)" },
    { value: 'recognized', label: 'My methodology or point of view is a recognized part of my reputation' },
  ],
  displayOrder: 3,
};

const Q_S2_ADVISORY: AssessmentQuestion = {
  id: 'Q-S2-ADVISORY',
  section: 'deep_dive',
  pool: 'stage_2',
  questionText: 'Have you ever been paid specifically for your creative judgment — separate from making or producing anything?',
  answerType: 'single_select',
  optionVariants: {
    service: [
      { value: 'no', label: "No — I wouldn't know how to position that" },
      { value: 'thought_about', label: "I've thought about it but haven't tried" },
      { value: 'yes_some', label: 'Yes — I have at least one advisory/consulting engagement' },
      { value: 'yes_significant', label: 'Strategic/advisory work is a significant part of my income' },
    ],
    hybrid: [
      { value: 'no', label: "No — I wouldn't know how to position that" },
      { value: 'thought_about', label: "I've thought about it but haven't tried" },
      { value: 'yes_some', label: 'Yes — I have at least one advisory/consulting engagement' },
      { value: 'yes_significant', label: 'Strategic/advisory work is a significant part of my income' },
    ],
    maker: [
      { value: 'no', label: 'No — my income comes from the work itself' },
      { value: 'thought_about', label: "I've been asked for opinions/direction but never charged for it" },
      { value: 'yes_some', label: "Yes — I've been paid for creative direction, consulting, curation, or judging" },
      { value: 'yes_significant', label: 'Advisory, direction, or curation is a meaningful income stream' },
    ],
    performer: [
      { value: 'no', label: 'No — my income comes from the work itself' },
      { value: 'thought_about', label: "I've been asked for opinions/direction but never charged for it" },
      { value: 'yes_some', label: "Yes — I've been paid for creative direction, consulting, curation, or judging" },
      { value: 'yes_significant', label: 'Advisory, direction, or curation is a meaningful income stream' },
    ],
    builder: [
      { value: 'no', label: 'No — my income comes from the business itself' },
      { value: 'thought_about', label: "I've been asked for opinions/direction but never charged for it" },
      { value: 'yes_some', label: 'Yes — I have advisory/consulting engagements' },
      { value: 'yes_significant', label: 'Strategic advisory is a significant income stream' },
    ],
    transition: [
      { value: 'no', label: "No — I wouldn't know how to position that" },
      { value: 'thought_about', label: "I've thought about it but haven't tried" },
      { value: 'yes_some', label: 'Yes — at least once' },
      { value: 'yes_significant', label: 'Yes — it\'s becoming a meaningful part of my work' },
    ],
  },
  displayOrder: 4,
};

// Pool: Stage 3 (Ownership Accumulation)
const Q_S3_STREAMS: AssessmentQuestion = {
  id: 'Q-S3-STREAMS',
  section: 'deep_dive',
  pool: 'stage_3',
  questionText: 'How many distinct types of income do you currently have?',
  answerType: 'single_select',
  options: [
    { value: 'one', label: '1 (all from one source)' },
    { value: 'two', label: '2 (e.g., client work + one product, or sales + licensing)' },
    { value: 'three_four', label: '3-4 (diversified across categories)' },
    { value: 'five_plus', label: '5+ (highly diversified)' },
  ],
  displayOrder: 1,
};

const Q_S3_NONEXEC: AssessmentQuestion = {
  id: 'Q-S3-NONEXEC',
  section: 'deep_dive',
  pool: 'stage_3',
  questionText: "What percentage of your income comes from sources that don't require you to actively produce or perform?",
  answerType: 'single_select',
  options: [
    { value: 'under_10', label: 'Less than 10%' },
    { value: '10_25', label: '10-25%' },
    { value: '25_50', label: '25-50%' },
    { value: 'over_50', label: 'More than 50%' },
  ],
  displayOrder: 2,
};

const Q_S3_ADVISORS: AssessmentQuestion = {
  id: 'Q-S3-ADVISORS',
  section: 'deep_dive',
  pool: 'stage_3',
  questionText: 'Do you have professional advisors who understand creative industries?',
  answerType: 'single_select',
  options: [
    { value: 'none', label: 'No professional advisors' },
    { value: 'general', label: 'General accountant/lawyer (not creative-industry specific)' },
    { value: 'one_specific', label: 'Industry-specific accountant OR lawyer' },
    { value: 'both_specific', label: 'Industry-specific accountant AND lawyer' },
    { value: 'full_team', label: 'Full advisory team (accountant, lawyer, financial advisor — all with creative-industry experience)' },
  ],
  displayOrder: 3,
};

const Q_S3_STRUCTURE: AssessmentQuestion = {
  id: 'Q-S3-STRUCTURE',
  section: 'deep_dive',
  pool: 'stage_3',
  questionText: 'How are your various income streams and business activities currently organized?',
  answerType: 'single_select',
  options: [
    { value: 'one_entity', label: 'Everything runs through one entity or my personal name' },
    { value: 'complicated', label: 'I have one entity but it\'s getting complicated' },
    { value: 'multiple_unorganized', label: "I have multiple entities but they're not strategically organized" },
    { value: 'holding', label: 'I have a holding company or parent entity organizing everything' },
    { value: 'need_help', label: 'I need help figuring out what structure makes sense' },
  ],
  displayOrder: 4,
};

// ── Section 4: Industry-Specific Pools ──────────────────────────

// Visual Arts
const Q_IND_ART_1: AssessmentQuestion = {
  id: 'Q-IND-ART-1',
  section: 'deep_dive',
  pool: 'industry_art',
  questionText: 'How do you currently sell or monetize your work?',
  answerType: 'single_select',
  options: [
    { value: 'direct', label: 'Direct sales (studio, shows, online)' },
    { value: 'gallery', label: 'Through a gallery (exclusive or non-exclusive representation)' },
    { value: 'commissions', label: 'Commissions' },
    { value: 'licensing', label: 'Licensing / reproduction rights' },
    { value: 'mix', label: 'Mix of the above' },
    { value: 'not_figured_out', label: "I haven't figured out monetization yet" },
  ],
  displayOrder: 1,
};

const Q_IND_ART_2: AssessmentQuestion = {
  id: 'Q-IND-ART-2',
  section: 'deep_dive',
  pool: 'industry_art',
  questionText: 'What happens to your work after it\'s sold?',
  answerType: 'single_select',
  options: [
    { value: 'buyer_owns', label: 'The buyer owns it completely — I have no ongoing rights or participation' },
    { value: 'retain_rights', label: 'I retain reproduction/licensing rights' },
    { value: 'resale_royalty', label: 'I have resale royalty agreements (or I\'m in a jurisdiction with artist resale rights)' },
    { value: 'never_thought', label: "I've never thought about what rights I retain after sale" },
  ],
  displayOrder: 2,
};

// Film & Video
const Q_IND_FILM_1: AssessmentQuestion = {
  id: 'Q-IND-FILM-1',
  section: 'deep_dive',
  pool: 'industry_film',
  questionText: "What's your typical compensation structure?",
  answerType: 'single_select',
  options: [
    { value: 'day_rate', label: 'Day rate or flat fee (work-for-hire)' },
    { value: 'fee_deferred', label: 'Fee + deferred compensation or backend points' },
    { value: 'fee_profit', label: 'Fee + profit participation' },
    { value: 'producer', label: 'Producer/partner role with meaningful equity or ownership' },
    { value: 'own_projects', label: 'I primarily work on my own projects' },
  ],
  displayOrder: 1,
};

const Q_IND_FILM_2: AssessmentQuestion = {
  id: 'Q-IND-FILM-2',
  section: 'deep_dive',
  pool: 'industry_film',
  questionText: 'Do you own any completed projects or IP?',
  answerType: 'single_select',
  options: [
    { value: 'none', label: 'No — everything I\'ve worked on is owned by others' },
    { value: 'personal', label: 'I have personal projects (shorts, docs, etc.) but nothing commercially released' },
    { value: 'one_two', label: 'I own 1-2 completed commercial projects' },
    { value: 'catalog', label: 'I own a growing catalog of content' },
    { value: 'company', label: "I'm building a production company or label" },
  ],
  displayOrder: 2,
};

// Music & Audio
const Q_IND_MUSIC_1: AssessmentQuestion = {
  id: 'Q-IND-MUSIC-1',
  section: 'deep_dive',
  pool: 'industry_music',
  questionText: "What's your current ownership situation with masters and publishing?",
  answerType: 'single_select',
  options: [
    { value: 'no_ownership', label: "I don't own my masters and publishing is assigned to a label/publisher" },
    { value: 'some_masters', label: 'I own some masters but publishing is mostly with a label/publisher' },
    { value: 'own_both', label: 'I own both masters and publishing for most of my work' },
    { value: 'catalog_revenue', label: 'I have a catalog generating ongoing royalty income' },
    { value: 'na', label: 'Not applicable to my role (engineer, sound designer, etc.)' },
  ],
  displayOrder: 1,
};

const Q_IND_MUSIC_2: AssessmentQuestion = {
  id: 'Q-IND-MUSIC-2',
  section: 'deep_dive',
  pool: 'industry_music',
  questionText: 'How diversified is your music income?',
  answerType: 'single_select',
  options: [
    { value: 'one', label: 'Primarily one source (streaming OR live OR sync OR session work)' },
    { value: 'two', label: 'Two sources' },
    { value: 'three_plus', label: 'Three or more sources (streaming + live + sync + licensing + merch + brand deals, etc.)' },
    { value: 'plus_equity', label: 'I have multiple income streams plus equity in music-related ventures' },
  ],
  displayOrder: 2,
};

// Writing
const Q_IND_WRITING_1: AssessmentQuestion = {
  id: 'Q-IND-WRITING-1',
  section: 'deep_dive',
  pool: 'industry_writing',
  questionText: 'How is your writing typically compensated?',
  answerType: 'single_select',
  options: [
    { value: 'per_piece', label: 'Per-word, per-piece, or flat project fees' },
    { value: 'salary', label: 'Salary / staff position' },
    { value: 'advance_royalties', label: 'Advance + royalties (book deals)' },
    { value: 'revenue_share', label: 'Revenue share, licensing, or equity in publications/platforms' },
    { value: 'mix', label: 'Mix of fee + ongoing participation' },
  ],
  displayOrder: 1,
};

const Q_IND_WRITING_2: AssessmentQuestion = {
  id: 'Q-IND-WRITING-2',
  section: 'deep_dive',
  pool: 'industry_writing',
  questionText: "What do you own from what you've written?",
  answerType: 'single_select',
  options: [
    { value: 'wfh', label: 'Most of my work is owned by employers or clients (work-for-hire)' },
    { value: 'some', label: 'I own some of my published work but not all' },
    { value: 'most', label: 'I own most of my published work and have ongoing royalty streams' },
    { value: 'body_of_ip', label: 'I have a body of IP (books, scripts, etc.) that generates recurring income' },
  ],
  displayOrder: 2,
};

// Performing Arts
const Q_IND_PERF_1: AssessmentQuestion = {
  id: 'Q-IND-PERF-1',
  section: 'deep_dive',
  pool: 'industry_performing',
  questionText: 'How is your performance work typically structured?',
  answerType: 'single_select',
  options: [
    { value: 'per_gig', label: 'Per-gig fees or day rates' },
    { value: 'union', label: 'Union scale / standard contracts (SAG-AFTRA, Equity, etc.)' },
    { value: 'fee_residuals', label: 'Fee + residuals or backend participation' },
    { value: 'produce_own', label: 'I produce my own work and control the economics' },
    { value: 'building', label: "I'm building a production entity or platform" },
  ],
  displayOrder: 1,
};

const Q_IND_PERF_2: AssessmentQuestion = {
  id: 'Q-IND-PERF-2',
  section: 'deep_dive',
  pool: 'industry_performing',
  questionText: 'Beyond performing, do you create or own any IP?',
  answerType: 'single_select',
  options: [
    { value: 'no', label: "No — I'm primarily a performer/interpreter" },
    { value: 'created_no_own', label: "I've created original material but don't own it formally" },
    { value: 'own_material', label: 'I own original material (scripts, shows, choreography, specials)' },
    { value: 'growing_ip', label: 'I have a growing body of owned IP that I control and monetize' },
  ],
  displayOrder: 2,
};

// Design
const Q_IND_DESIGN_1: AssessmentQuestion = {
  id: 'Q-IND-DESIGN-1',
  section: 'deep_dive',
  pool: 'industry_design',
  questionText: 'Who typically owns the creative work you produce?',
  answerType: 'single_select',
  options: [
    { value: 'client_wfh', label: 'The client owns everything (work-for-hire standard)' },
    { value: 'mixed', label: 'Mixed — some work-for-hire, some where I retain rights' },
    { value: 'i_retain', label: 'I retain IP and license usage to clients' },
    { value: 'never_thought', label: "I've never really thought about this" },
  ],
  displayOrder: 1,
};

const Q_IND_DESIGN_2: AssessmentQuestion = {
  id: 'Q-IND-DESIGN-2',
  section: 'deep_dive',
  pool: 'industry_design',
  questionText: 'Have you ever shared in the commercial outcome of something you designed?',
  answerType: 'single_select',
  options: [
    { value: 'no', label: "No — I get paid a fee and that's it" },
    { value: 'offered_declined', label: "I've been offered revenue share or equity but didn't take it" },
    { value: 'once_twice', label: 'Yes — once or twice' },
    { value: 'regular', label: "Yes — multiple times, it's becoming part of my practice" },
  ],
  displayOrder: 2,
};

// Architecture & Interiors
const Q_IND_ARCH_1: AssessmentQuestion = {
  id: 'Q-IND-ARCH-1',
  section: 'deep_dive',
  pool: 'industry_architecture',
  questionText: 'How is your practice structured financially?',
  answerType: 'single_select',
  options: [
    { value: 'hourly_fee', label: 'Hourly or fixed-fee projects' },
    { value: 'percentage', label: 'Percentage of construction/project cost' },
    { value: 'fee_royalty', label: 'Fee + ongoing royalties or licensing (e.g., for designs, furniture, products)' },
    { value: 'equity', label: 'Development equity or profit participation in projects' },
    { value: 'employed', label: 'Employed at a firm (salary)' },
  ],
  displayOrder: 1,
};

const Q_IND_ARCH_2: AssessmentQuestion = {
  id: 'Q-IND-ARCH-2',
  section: 'deep_dive',
  pool: 'industry_architecture',
  questionText: 'Do you own any IP from your design work?',
  answerType: 'single_select',
  options: [
    { value: 'no', label: 'No — designs belong to clients once delivered' },
    { value: 'some', label: 'I retain some design rights but rarely monetize them' },
    { value: 'products', label: 'Yes — I have product designs, furniture, or systems I license' },
    { value: 'brand', label: 'Yes — my design approach itself is a licensable brand/methodology' },
  ],
  displayOrder: 2,
};

// Fashion & Apparel
const Q_IND_FASHION_1: AssessmentQuestion = {
  id: 'Q-IND-FASHION-1',
  section: 'deep_dive',
  pool: 'industry_fashion',
  questionText: 'How does your creative work generate income?',
  answerType: 'single_select',
  options: [
    { value: 'freelance', label: 'Freelance fees for client projects' },
    { value: 'salary', label: 'Salary at a brand or house' },
    { value: 'own_label', label: 'Revenue from my own label or brand' },
    { value: 'licensing', label: 'Licensing my designs to other brands or manufacturers' },
    { value: 'mix', label: 'Mix of personal brand + client/freelance work' },
  ],
  displayOrder: 1,
};

const Q_IND_FASHION_2: AssessmentQuestion = {
  id: 'Q-IND-FASHION-2',
  section: 'deep_dive',
  pool: 'industry_fashion',
  questionText: 'What do you own from your fashion work?',
  answerType: 'single_select',
  options: [
    { value: 'nothing', label: 'Designs belong to employers/clients' },
    { value: 'personal', label: 'I own my personal collection/portfolio work' },
    { value: 'brand', label: 'I own a brand with growing market presence' },
    { value: 'ip_licensing', label: 'I have designs, patterns, or a brand generating licensing revenue' },
  ],
  displayOrder: 2,
};

// Advertising & Marketing
const Q_IND_AD_1: AssessmentQuestion = {
  id: 'Q-IND-AD-1',
  section: 'deep_dive',
  pool: 'industry_advertising',
  questionText: 'How are you compensated for your creative/strategic work?',
  answerType: 'single_select',
  options: [
    { value: 'salary', label: 'Salary / retainer at an agency or brand' },
    { value: 'project_fees', label: 'Project-based fees (freelance/consulting)' },
    { value: 'fee_performance', label: 'Fee + performance bonus or media commission' },
    { value: 'equity_revenue', label: 'Equity or revenue share in client businesses' },
    { value: 'own_agency', label: 'I run my own agency/consultancy' },
  ],
  displayOrder: 1,
};

const Q_IND_AD_2: AssessmentQuestion = {
  id: 'Q-IND-AD-2',
  section: 'deep_dive',
  pool: 'industry_advertising',
  questionText: 'Do you own any strategic or creative IP from your work?',
  answerType: 'single_select',
  options: [
    { value: 'no', label: 'No — all work belongs to clients or employers' },
    { value: 'frameworks', label: 'I have proprietary frameworks or methodologies I use with clients' },
    { value: 'products', label: 'I\'ve productized my expertise (courses, tools, templates)' },
    { value: 'brand_equity', label: 'My personal brand/reputation generates significant independent revenue' },
  ],
  displayOrder: 2,
};

// Technology & Creative Tech
const Q_IND_TECH_1: AssessmentQuestion = {
  id: 'Q-IND-TECH-1',
  section: 'deep_dive',
  pool: 'industry_technology',
  questionText: 'How does your creative technology work generate income?',
  answerType: 'single_select',
  options: [
    { value: 'freelance', label: 'Freelance/contract work for clients' },
    { value: 'salary', label: 'Salary at a company or studio' },
    { value: 'products', label: 'Products I\'ve built (tools, games, apps)' },
    { value: 'licensing', label: 'Licensing technology or creative assets' },
    { value: 'mix', label: 'Mix of client work + own products' },
  ],
  displayOrder: 1,
};

const Q_IND_TECH_2: AssessmentQuestion = {
  id: 'Q-IND-TECH-2',
  section: 'deep_dive',
  pool: 'industry_technology',
  questionText: 'What IP do you own from your creative tech work?',
  answerType: 'single_select',
  options: [
    { value: 'nothing', label: 'Everything belongs to employers/clients' },
    { value: 'side_projects', label: 'I have side projects but nothing generating revenue' },
    { value: 'products', label: 'I own tools, games, or creative assets generating revenue' },
    { value: 'platform', label: 'I\'m building a platform or company with significant IP' },
  ],
  displayOrder: 2,
};

// ── Section 4: Discernment Probe (All users) ──────────────────────

const Q_DISC_1: AssessmentQuestion = {
  id: 'Q-DISC-1',
  section: 'deep_dive',
  pool: 'discernment',
  questionText: 'In your field, how would you describe your ability to see where things are going?',
  answerType: 'single_select',
  options: [
    { value: 'reactive', label: 'I mostly respond to what the market wants right now' },
    { value: 'near_term', label: 'I can anticipate shifts 6-12 months ahead' },
    { value: 'ahead', label: "I consistently see things 1-2 years before they're mainstream" },
    { value: 'defines', label: 'I often define new directions that others eventually follow' },
  ],
  scoring: {
    reactive: { stage_1: 1.0 },
    near_term: { stage_2: 2.0 },
    ahead: { stage_3: 3.0 },
    defines: { stage_4: 4.0 },
  },
  displayOrder: 1,
};

const Q_DISC_2: AssessmentQuestion = {
  id: 'Q-DISC-2',
  section: 'deep_dive',
  pool: 'discernment',
  questionText: 'How would you describe your creative point of view?',
  answerType: 'single_select',
  options: [
    { value: 'skilled', label: "I'm skilled at executing within established approaches" },
    { value: 'recognizable', label: 'I have a recognizable voice or style that people seek out' },
    { value: 'perspective', label: 'I have a perspective on where my field should go — and I share it' },
    { value: 'influential', label: 'My point of view has shaped how others in my field think or work' },
  ],
  scoring: {
    skilled: { stage_1: 1.0 },
    recognizable: { stage_2: 2.0 },
    perspective: { stage_3: 3.0 },
    influential: { stage_4: 4.0 },
  },
  displayOrder: 2,
};

// ── Section 5: Vision + Ambition ──────────────────────────────────

const Q_AMB_1: AssessmentQuestion = {
  id: 'Q-AMB-1',
  section: 'ambition',
  questionText: 'Where do you want to be in 3 years?',
  answerType: 'single_select',
  options: [
    { value: 'earn_more', label: "Earning significantly more doing work I'm already good at" },
    { value: 'less_execution', label: 'Doing less production/execution and more direction, strategy, or advisory' },
    { value: 'ownership', label: 'Building ownership — equity, IP, revenue streams beyond trading time' },
    { value: 'multi_venture', label: 'Running multiple ventures or a creative holding company' },
    { value: 'freedom', label: 'More creative freedom and autonomy, regardless of income' },
    { value: 'stability', label: 'Honestly, I just want to feel less squeezed and more in control' },
  ],
  displayOrder: 13,
};

const Q_AMB_2: AssessmentQuestion = {
  id: 'Q-AMB-2',
  section: 'ambition',
  questionText: "What's your relationship with risk right now?",
  answerType: 'single_select',
  options: [
    { value: 'conservative', label: 'Conservative — I need predictable income. Changes must be low-risk.' },
    { value: 'moderate', label: 'Moderate — I can handle uncertainty if the path is clear.' },
    { value: 'aggressive', label: "Aggressive — I'm willing to take short-term hits for long-term positioning." },
    { value: 'desperate', label: "I'm already uncomfortable enough that change feels necessary." },
  ],
  displayOrder: 14,
};

const Q_AMB_3: AssessmentQuestion = {
  id: 'Q-AMB-3',
  section: 'ambition',
  questionText: "What's the biggest thing holding you back right now?",
  answerType: 'multi_select',
  maxSelections: 2,
  options: [
    { value: 'financial_pressure', label: "Financial pressure — I can't afford to earn less, even temporarily" },
    { value: 'time', label: "Time — I'm maxed out with no margin" },
    { value: 'knowledge', label: "Knowledge — I don't know what structures or options exist for someone like me" },
    { value: 'confidence', label: "Confidence — I sense what to do but can't pull the trigger" },
    { value: 'network', label: "Network — I don't have the right relationships, representation, or advisors" },
    { value: 'infrastructure', label: "Infrastructure — I need business, legal, or financial setup I don't have" },
    { value: 'clarity', label: "Clarity — I don't have a clear picture of where I'm going" },
  ],
  displayOrder: 15,
};

const Q_AMB_4: AssessmentQuestion = {
  id: 'Q-AMB-4',
  section: 'ambition',
  questionText: "Anything specific you're trying to figure out right now?",
  answerType: 'free_text',
  isOptional: true,
  placeholder: 'e.g., How do I keep ownership of my masters? Should I form an LLC? How do I propose equity to a collaborator? How do I transition from freelancing to running a studio?',
  displayOrder: 16,
};

// ── Organized exports ──────────────────────────────────────────────

/** Fixed questions for Sections 1-3 and 5 (in order) */
export const SECTION_1_QUESTIONS: AssessmentQuestion[] = [DISCIPLINE_GROUPS, Q2_CREATIVE_MODE];
export const SECTION_2_QUESTIONS: AssessmentQuestion[] = [Q3_ENERGY, Q4_DRAINS, Q5_DREAM];
export const SECTION_3_QUESTIONS: AssessmentQuestion[] = [Q6_INCOME, Q7_INCOME_STRUCTURE, Q8_WHAT_THEY_PAY_FOR, Q9_EQUITY, Q10_DEMAND, Q11_STRUCTURE];
export const SECTION_5_QUESTIONS: AssessmentQuestion[] = [Q_AMB_1, Q_AMB_2, Q_AMB_3, Q_AMB_4];

/** Stage-adaptive question pools for Section 4 */
export const STAGE_1_POOL: AssessmentQuestion[] = [Q_S1_BIZ, Q_S1_FIN, Q_S1_CONTRACT, Q_S1_IP];
export const STAGE_2_POOL: AssessmentQuestion[] = [Q_S2_VALUE, Q_S2_LEVERAGE, Q_S2_FRAMEWORKS, Q_S2_ADVISORY];
// Q_S3_STREAMS removed — income diversity already captured by Q7 (income_structure allocation)
export const STAGE_3_POOL: AssessmentQuestion[] = [Q_S3_NONEXEC, Q_S3_ADVISORS, Q_S3_STRUCTURE];

/** Industry-specific question pools */
export const INDUSTRY_POOLS: Record<string, AssessmentQuestion[]> = {
  industry_art: [Q_IND_ART_1, Q_IND_ART_2],
  industry_design: [Q_IND_DESIGN_1, Q_IND_DESIGN_2],
  industry_film: [Q_IND_FILM_1, Q_IND_FILM_2],
  industry_music: [Q_IND_MUSIC_1, Q_IND_MUSIC_2],
  industry_writing: [Q_IND_WRITING_1, Q_IND_WRITING_2],
  industry_performing: [Q_IND_PERF_1, Q_IND_PERF_2],
  industry_architecture: [Q_IND_ARCH_1, Q_IND_ARCH_2],
  industry_fashion: [Q_IND_FASHION_1, Q_IND_FASHION_2],
  industry_advertising: [Q_IND_AD_1, Q_IND_AD_2],
  industry_technology: [Q_IND_TECH_1, Q_IND_TECH_2],
};

/** Discernment questions (all users) */
export const DISCERNMENT_POOL: AssessmentQuestion[] = [Q_DISC_1, Q_DISC_2];

/** All questions flat (for lookup) */
export const ALL_QUESTIONS: AssessmentQuestion[] = [
  ...SECTION_1_QUESTIONS,
  ...SECTION_2_QUESTIONS,
  ...SECTION_3_QUESTIONS,
  ...STAGE_1_POOL,
  ...STAGE_2_POOL,
  ...STAGE_3_POOL,
  ...Object.values(INDUSTRY_POOLS).flat(),
  ...DISCERNMENT_POOL,
  ...SECTION_5_QUESTIONS,
];

/** Section metadata */
export const SECTION_META = [
  {
    number: 1 as const,
    title: 'Creative Identity',
    intro: "Let's start with who you are and how your creative work reaches the world.",
    estimatedTime: '~1 min',
  },
  {
    number: 2 as const,
    title: 'Feeling + Energy',
    intro: "Before we get into the specifics, let's talk about what this feels like.",
    estimatedTime: '~2 min',
  },
  {
    number: 3 as const,
    title: 'Current Reality',
    intro: "Now let's map where things actually stand today.",
    estimatedTime: '~3 min',
  },
  {
    number: 4 as const,
    title: 'Deep Dive',
    intro: "Based on what you've shared, a few more questions to get specific.",
    estimatedTime: '~4 min',
  },
  {
    number: 5 as const,
    title: 'Vision + Ambition',
    intro: "Last section. Let's talk about where you want to go.",
    estimatedTime: '~2 min',
  },
];
