// ── AI Advisor Types ──────────────────────────────────────────────

export type AdvisorMode =
  | 'assessment'
  | 'evaluator'
  | 'negotiation'
  | 'library'
  | 'action_coaching'
  | 'explore';

export type InitialPath = 'deal' | 'map' | 'explore';

// ── Conversation Types ──────────────────────────────────────────────

export type ConversationMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  tool_calls?: ToolCallRecord[];
  mode: AdvisorMode;
  timestamp: string;
};

export type ToolCallRecord = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
};

export type AiConversation = {
  id: string;
  user_id: string;
  title: string | null;
  started_at: string;
  last_message_at: string | null;
  current_mode: AdvisorMode;
  modes_used: AdvisorMode[];
  initial_path: InitialPath | null;
  assessment_id: string | null;
  action_id: string | null;
  messages: ConversationMessage[];
  context_snapshot: ConversationContextSnapshot | null;
  message_count: number;
  is_archived: boolean;
  created_at: string;
};

export type ConversationContextSnapshot = {
  mode: AdvisorMode;
  assessmentId?: string;
  answersCollected?: Record<string, unknown>;
  currentSection?: number;
  currentQuestionIndex?: number;
  detectedStage?: number;
  stageScore?: number;
  misalignmentFlags?: string[];
  evaluationId?: string;
  actionId?: string;
};

// ── Partial Assessment ──────────────────────────────────────────────

export type PartialAssessment = {
  id: string;
  user_id: string;
  conversation_id: string | null;
  discipline: string | null;
  sub_discipline: string | null;
  creative_mode: string | null;
  income_range: string | null;
  business_structure: string | null;
  additional_data: Record<string, unknown>;
  consumed_by_assessment_id: string | null;
  created_at: string;
};

// ── Member Context (built for system prompt) ──────────────────────────

export type MemberContext = {
  profile: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
    created_at: string;
    disciplines: string[] | null;
    creative_mode: string | null;
    detected_stage: number | null;
  };
  assessment: AssessmentContext | null;
  roadmap: RoadmapContext | null;
  actions: ActionContext[];
  partialAssessment: Partial<PartialAssessment> | null;
  subscription: { status: string; plan: string } | null;
};

export type AssessmentContext = {
  id: string;
  status: string;
  detected_stage: number | null;
  stage_score: number | null;
  transition_readiness: string | null;
  misalignment_flags: string[];
  archetype_primary: string | null;
  archetype_secondary: string | null;
  creative_mode: string | null;
  discipline: string | null;
  income_range: string | null;
  income_structure: Record<string, number> | null;
  what_they_pay_for: string | null;
  equity_positions: string | null;
  demand_level: string | null;
  business_structure: string | null;
  completed_at: string | null;
};

export type RoadmapContext = {
  id: string;
  status: string;
  plan_content: Record<string, unknown>;
  published_at: string | null;
};

export type ActionContext = {
  id: string;
  action_order: number;
  action_type: string;
  status: string;
  completed_at: string | null;
  notes: string | null;
};

// ── Tool Types ──────────────────────────────────────────────────────

export type StructuredComponentType =
  | 'option_cards'
  | 'multi_select'
  | 'ranking'
  | 'allocation_sliders'
  | 'slider'
  | 'currency_input'
  | 'free_text'
  | 'action_cards'
  | 'roadmap_summary'
  | 'progress_update';

// ── Conversation Summary (for history list) ─────────────────────────

export type ConversationSummary = {
  id: string;
  title: string | null;
  started_at: string;
  last_message_at: string | null;
  current_mode: AdvisorMode;
  initial_path: InitialPath | null;
  message_count: number;
  is_archived: boolean;
};

// ── Advisor Page Props ──────────────────────────────────────────────

export type AdvisorPageState = 'state_1' | 'state_2';

export type AdvisorPageProps = {
  pageState?: AdvisorPageState;
  memberContext: MemberContext;
  existingConversationId?: string;
  initialMessages?: unknown[];
  conversations?: ConversationSummary[];
  showRoadmap?: boolean;
};
