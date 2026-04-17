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
  | 'industry_art' | 'industry_design' | 'industry_film' | 'industry_music'
  | 'industry_writing' | 'industry_performing' | 'industry_architecture'
  | 'industry_fashion' | 'industry_advertising' | 'industry_technology'
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

export type DisciplineGroup =
  | 'visual_arts' | 'design' | 'film_video' | 'music_audio'
  | 'writing' | 'performing_arts' | 'architecture_interiors'
  | 'fashion_apparel' | 'advertising_marketing' | 'technology_creative_tech';

export const DISCIPLINE_GROUP_MAP: Record<DisciplineGroup, QuestionPool> = {
  visual_arts: 'industry_art',
  design: 'industry_design',
  film_video: 'industry_film',
  music_audio: 'industry_music',
  writing: 'industry_writing',
  performing_arts: 'industry_performing',
  architecture_interiors: 'industry_architecture',
  fashion_apparel: 'industry_fashion',
  advertising_marketing: 'industry_advertising',
  technology_creative_tech: 'industry_technology',
};

// Maps a discipline value to its group
export const DISCIPLINE_TO_GROUP: Record<string, DisciplineGroup> = {
  // Visual Arts
  painting: 'visual_arts',
  sculpture: 'visual_arts',
  illustration: 'visual_arts',
  mixed_media: 'visual_arts',
  digital_art: 'visual_arts',
  photography_fine_art: 'visual_arts',
  // Design
  brand_identity: 'design',
  product_ux: 'design',
  graphic: 'design',
  motion: 'design',
  environmental_spatial: 'design',
  web_digital: 'design',
  // Film & Video
  directing: 'film_video',
  screenwriting: 'film_video',
  cinematography: 'film_video',
  editing_post: 'film_video',
  producing: 'film_video',
  animation: 'film_video',
  // Music & Audio
  artist_performer: 'music_audio',
  songwriter: 'music_audio',
  music_producer: 'music_audio',
  composer_scoring: 'music_audio',
  sound_design: 'music_audio',
  dj_electronic: 'music_audio',
  // Writing
  fiction_literary: 'writing',
  nonfiction_journalism: 'writing',
  screenwriting_writing: 'writing',
  copywriting: 'writing',
  content_editorial: 'writing',
  // Performing Arts
  acting: 'performing_arts',
  dance_choreography: 'performing_arts',
  theater_directing_producing: 'performing_arts',
  comedy_spoken_word: 'performing_arts',
  // Architecture & Interiors
  residential: 'architecture_interiors',
  commercial: 'architecture_interiors',
  landscape: 'architecture_interiors',
  interior_design: 'architecture_interiors',
  // Fashion & Apparel
  fashion_design: 'fashion_apparel',
  styling: 'fashion_apparel',
  fashion_creative_direction: 'fashion_apparel',
  manufacturing_production: 'fashion_apparel',
  // Advertising & Marketing
  ad_creative_direction: 'advertising_marketing',
  strategy: 'advertising_marketing',
  media_content: 'advertising_marketing',
  brand_consulting: 'advertising_marketing',
  // Technology & Creative Tech
  creative_coding: 'technology_creative_tech',
  game_design: 'technology_creative_tech',
  xr_immersive: 'technology_creative_tech',
  ai_augmented_creative: 'technology_creative_tech',
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
