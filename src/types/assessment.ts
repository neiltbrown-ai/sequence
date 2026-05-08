// ── Assessment Types ──────────────────────────────────────────────

export type CreativeMode = 'maker' | 'service' | 'hybrid' | 'performer' | 'builder' | 'transition';
export type StageNumber = 1 | 2 | 3 | 4;
export type TransitionReadiness = 'low' | 'moderate' | 'high';

export type AssessmentStatus = 'in_progress' | 'completed' | 'abandoned';
export type PlanStatus = 'generating' | 'draft' | 'review' | 'published' | 'rejected';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type ActionType = 'foundation' | 'positioning' | 'momentum';

export type AnswerType = 'single_select' | 'multi_select' | 'rank' | 'slider' | 'free_text' | 'allocation';

export type QuestionSection = 'identity' | 'feeling' | 'reality' | 'deep_dive' | 'ambition';
export type QuestionPool =
  | 'stage_1' | 'stage_2' | 'stage_3'
  // Industry pool keys mirror the canonical Q1 industry slugs (see
  // src/lib/case-studies/taxonomy.ts) prefixed with `industry_`.
  | 'industry_visual_art' | 'industry_design' | 'industry_photography'
  | 'industry_comics' | 'industry_architecture' | 'industry_fashion'
  | 'industry_film_tv' | 'industry_music' | 'industry_theater' | 'industry_comedy'
  | 'industry_writing' | 'industry_media'
  | 'industry_advertising' | 'industry_hospitality'
  | 'industry_technology' | 'industry_gaming'
  | 'discernment';

export type MisalignmentFlag =
  | 'income_exceeds_structure'
  | 'judgment_not_priced'
  | 'relationships_not_converted'
  | 'ip_not_monetized'
  | 'demand_exceeds_capacity'
  | 'talent_without_structure';

// ── Question Schema ──────────────────────────────────────────────

export type QuestionOption = {
  value: string;
  label: string;
  description?: string;
  icon?: string;
};

export type AssessmentQuestion = {
  id: string;
  section: QuestionSection;
  pool?: QuestionPool;
  questionText: string;
  questionTextVariants?: Partial<Record<CreativeMode, string>>;
  answerType: AnswerType;
  options?: QuestionOption[];
  optionVariants?: Partial<Record<CreativeMode, QuestionOption[]>>;
  scoring?: Record<string, Partial<Record<`stage_${StageNumber}`, number>>>;
  maxSelections?: number;        // for multi_select
  isOptional?: boolean;          // skip allowed
  placeholder?: string;          // for free_text
  displayOrder: number;
  isSubQuestion?: boolean;       // Q1 sub-discipline select
  parentQuestionId?: string;     // links sub-discipline to parent group
};

// ── Discipline Groups ──────────────────────────────────────────────
//
// `DisciplineGroup` slugs are the assessment Q1 industry vocabulary —
// kept in sync with the canonical 16-industry list at
// src/lib/case-studies/taxonomy.ts (Phase 3 of the case-study taxonomy
// rollout, May 2026). The naming carries some legacy: the column is
// `assessments.discipline` (singular) and the type here is named
// `DisciplineGroup`, but the values are industry slugs.

export type DisciplineGroup =
  // Visual / craft
  | 'visual_art' | 'design' | 'photography' | 'comics' | 'architecture' | 'fashion'
  // Time-based / performing
  | 'film_tv' | 'music' | 'theater' | 'comedy'
  // Word / editorial
  | 'writing' | 'media'
  // Commercial / experiential
  | 'advertising' | 'hospitality'
  // Tech
  | 'technology' | 'gaming';

export const DISCIPLINE_GROUP_MAP: Record<DisciplineGroup, QuestionPool> = {
  visual_art: 'industry_visual_art',
  design: 'industry_design',
  photography: 'industry_photography',
  comics: 'industry_comics',
  architecture: 'industry_architecture',
  fashion: 'industry_fashion',
  film_tv: 'industry_film_tv',
  music: 'industry_music',
  theater: 'industry_theater',
  comedy: 'industry_comedy',
  writing: 'industry_writing',
  media: 'industry_media',
  advertising: 'industry_advertising',
  hospitality: 'industry_hospitality',
  technology: 'industry_technology',
  gaming: 'industry_gaming',
};

// Maps a sub-discipline value (Q1-sub) to its parent industry group.
// Keys are sub-discipline slugs from src/lib/assessment/questions.ts
// (SUB_DISCIPLINES). Used by question-selection.ts to route sub-slug
// answers back to their industry pool.
export const DISCIPLINE_TO_GROUP: Record<string, DisciplineGroup> = {
  // Visual Art
  painting: 'visual_art',
  sculpture: 'visual_art',
  conceptual_art: 'visual_art',
  printmaking: 'visual_art',
  mixed_media: 'visual_art',
  digital_art: 'visual_art',
  // Design
  brand_identity: 'design',
  product_ux: 'design',
  graphic: 'design',
  motion: 'design',
  environmental_spatial: 'design',
  web_digital: 'design',
  // Photography
  editorial_photo: 'photography',
  commercial_photo: 'photography',
  fine_art_photo: 'photography',
  documentary_photo: 'photography',
  portrait_photo: 'photography',
  fashion_photo: 'photography',
  // Comics & Illustration
  comic_book: 'comics',
  graphic_novel: 'comics',
  editorial_illustration: 'comics',
  commercial_illustration: 'comics',
  cartooning: 'comics',
  // Architecture
  residential: 'architecture',
  commercial: 'architecture',
  landscape: 'architecture',
  interior_design: 'architecture',
  // Fashion
  fashion_design: 'fashion',
  styling: 'fashion',
  fashion_creative_direction: 'fashion',
  manufacturing_production: 'fashion',
  // Film & TV
  directing: 'film_tv',
  screenwriting: 'film_tv',
  cinematography: 'film_tv',
  editing_post: 'film_tv',
  producing: 'film_tv',
  animation: 'film_tv',
  // Music
  artist_performer: 'music',
  songwriter: 'music',
  music_producer: 'music',
  composer_scoring: 'music',
  sound_design: 'music',
  dj_electronic: 'music',
  // Theater & Performing Arts
  acting: 'theater',
  dance_choreography: 'theater',
  theater_directing_producing: 'theater',
  performance_art: 'theater',
  // Comedy
  standup: 'comedy',
  sketch: 'comedy',
  comedy_writing: 'comedy',
  comedy_podcast: 'comedy',
  late_night: 'comedy',
  // Writing & Publishing
  fiction_literary: 'writing',
  nonfiction_journalism: 'writing',
  screenwriting_writing: 'writing',
  copywriting: 'writing',
  content_editorial: 'writing',
  // Media & Editorial
  podcast_media: 'media',
  publication: 'media',
  newsletter_media: 'media',
  video_creator: 'media',
  content_business: 'media',
  // Advertising
  ad_creative_direction: 'advertising',
  strategy: 'advertising',
  media_content: 'advertising',
  brand_consulting: 'advertising',
  // Hospitality
  restaurants: 'hospitality',
  bars: 'hospitality',
  hotels: 'hospitality',
  fb_brand: 'hospitality',
  experiential_venue: 'hospitality',
  // Technology
  creative_coding: 'technology',
  software_product: 'technology',
  xr_immersive: 'technology',
  ai_augmented_creative: 'technology',
  // Gaming
  game_design: 'gaming',
  game_dev: 'gaming',
  game_publishing: 'gaming',
  esports: 'gaming',
  interactive_narrative: 'gaming',
};

// ── Assessment Data (stored in Supabase) ──────────────────────────

export type Assessment = {
  id: string;
  user_id: string;
  version: number;
  status: AssessmentStatus;
  // Section 1
  discipline: string | null;
  sub_discipline: string | null;
  creative_mode: CreativeMode | null;
  // Section 2
  energy_ranking: string[] | null;
  drains: string[] | null;
  dream_response: string | null;
  // Section 3
  income_range: string | null;
  income_structure: Record<string, number> | null;
  what_they_pay_for: string | null;
  equity_positions: string | null;
  demand_level: string | null;
  business_structure: string | null;
  // Section 4
  stage_questions: Record<string, string> | null;
  industry_questions: Record<string, string> | null;
  discernment_questions: Record<string, string> | null;
  // Section 5
  three_year_goal: string | null;
  risk_tolerance: string | null;
  constraints: string[] | null;
  specific_question: string | null;
  // Computed
  detected_stage: StageNumber | null;
  stage_score: number | null;
  transition_readiness: TransitionReadiness | null;
  misalignment_flags: MisalignmentFlag[];
  archetype_primary: string | null;
  archetype_secondary: string | null;
  // Progress
  current_section: number;
  current_question: number;
  // Timestamps
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

// ── Archetype Schema ──────────────────────────────────────────────

export type ActionProvider = {
  name: string;
  url: string;
  type: 'platform' | 'service' | 'resource';
  note?: string;
};

export type AIAssistHook = {
  prompt_template?: string;
  context_keys?: string[];
  type?: 'draft' | 'review' | 'generate';
  description?: string;
};

export type ArchetypeAction = {
  order: 1 | 2 | 3;
  type: ActionType;
  title: string;
  what: string;
  why: string;
  how: string;
  timeline: string;
  done_signal: string;
  ai_assist?: AIAssistHook;
  providers?: ActionProvider[];
};

export type Archetype = {
  id: string;
  name: string;
  description: string;
  stage_range: [number, number];
  creative_modes: CreativeMode[];
  required_flags: MisalignmentFlag[];
  excluded_flags: MisalignmentFlag[];
  actions: [ArchetypeAction, ArchetypeAction, ArchetypeAction];
  structures: number[];
  case_studies: string[];
};

// ── Roadmap Output Schema ──────────────────────────────────────────

export type Misalignment = {
  flag: MisalignmentFlag;
  what_its_costing: string;
  why_it_matters: string;
};

export type RoadmapAction = {
  order: 1 | 2 | 3;
  type: ActionType;
  title: string;
  what: string;
  why: string;
  how: string;
  timeline: string;
  done_signal: string;
  ai_assist?: AIAssistHook;
  providers?: ActionProvider[];
};

export type StrategicRoadmap = {
  position: {
    detected_stage: StageNumber;
    stage_name: string;
    stage_description: string;
    transition_readiness: string;
    industry_context: string;
    misalignments: Misalignment[];
  };
  misalignment_detail: Misalignment[];
  actions: [RoadmapAction, RoadmapAction, RoadmapAction];
  vision: {
    twelve_month_target: string;
    three_year_horizon: string;
    transition_signals: string[];
    structures_to_study: number[];
    relevant_cases: string[];
  };
  library: {
    recommended_structures: { id: number; title: string; why: string }[];
    recommended_cases: { slug: string; title: string; why: string }[];
    reading_path: string[];
  };
  entity_structure?: {
    parent: string;
    children: { name: string; purpose: string }[];
    note?: string;
  };
  value_flywheel?: {
    nodes: { label: string; subtitle?: string; structure_id?: number }[];
    edges: { from: number; to: number }[];
    center_label: string;
    center_subtitle?: string;
  };
};

// ── Strategic Plan (stored in Supabase) ──────────────────────────

export type PlanSource = "assessment" | "portfolio" | "combined";

export type StrategicPlan = {
  id: string;
  user_id: string;
  assessment_id: string | null;
  /**
   * Which input(s) drove this plan. Added in migration 00015.
   *   - "assessment" — Creative Identity only
   *   - "portfolio"  — Portfolio analysis only
   *   - "combined"   — Both CI and Portfolio fed the generator
   */
  source: PlanSource;
  portfolio_analysis_id: string | null;
  plan_content: StrategicRoadmap;
  plan_markdown: string | null;
  status: PlanStatus;
  reviewed_by: string | null;
  review_notes: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  created_at: string;
  published_at: string | null;
};

// ── Assessment Action Tracking ──────────────────────────────────

export type AssessmentAction = {
  id: string;
  user_id: string;
  plan_id: string;
  action_order: 1 | 2 | 3;
  action_type: ActionType;
  status: ActionStatus;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
};

// ── Provider Recommendations ──────────────────────────────────────

export type Provider = {
  id: string;
  name: string;
  url: string;
  category: 'entity_formation' | 'banking' | 'accounting' | 'legal' | 'tools';
  description: string;
  affiliate_url?: string;
  affiliate_active: boolean;
};

// ── Wizard State ──────────────────────────────────────────────────

export type WizardSection = 1 | 2 | 3 | 4 | 5;

export type AssessmentAnswers = {
  // Section 1
  discipline?: string;
  sub_discipline?: string;
  creative_mode?: CreativeMode;
  // Section 2
  energy_ranking?: string[];
  drains?: string[];
  dream_response?: string;
  // Section 3
  income_range?: string;
  income_structure?: Record<string, number>;
  what_they_pay_for?: string;
  equity_positions?: string;
  demand_level?: string;
  business_structure?: string;
  // Section 4 (dynamic)
  stage_questions?: Record<string, string>;
  industry_questions?: Record<string, string>;
  discernment_questions?: Record<string, string>;
  // Section 5
  three_year_goal?: string;
  risk_tolerance?: string;
  constraints?: string[];
  specific_question?: string;
};

export type WizardState = {
  assessmentId: string | null;
  currentSection: WizardSection;
  currentQuestionIndex: number;
  answers: AssessmentAnswers;
  detectedStage: StageNumber | null;
  stageScore: number | null;
  transitionReadiness: TransitionReadiness | null;
  misalignmentFlags: MisalignmentFlag[];
  adaptiveQuestions: AssessmentQuestion[];
  saving: boolean;
  lastSaved: string | null;
  error: string | null;
  completed: boolean;
};

export type WizardAction =
  | { type: 'SET_ASSESSMENT_ID'; id: string }
  | { type: 'SET_ANSWER'; key: string; value: unknown }
  | { type: 'SET_SECTION_4_ANSWER'; pool: 'stage_questions' | 'industry_questions' | 'discernment_questions'; questionId: string; value: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'SET_SECTION'; section: WizardSection }
  | { type: 'SET_STAGE_RESULTS'; detectedStage: StageNumber; stageScore: number; transitionReadiness: TransitionReadiness; misalignmentFlags: MisalignmentFlag[] }
  | { type: 'SET_ADAPTIVE_QUESTIONS'; questions: AssessmentQuestion[] }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_LAST_SAVED'; timestamp: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_COMPLETED' }
  | { type: 'HYDRATE'; state: Partial<WizardState> };
