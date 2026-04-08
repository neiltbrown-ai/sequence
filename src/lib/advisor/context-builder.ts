import { createAdminClient } from "@/lib/supabase/admin";
import type {
  MemberContext,
  AssessmentContext,
  RoadmapContext,
  ActionContext,
} from "@/types/advisor";

/**
 * Build the full member context for the AI advisor system prompt.
 * Uses the admin client to bypass RLS (called from API routes only).
 */
export async function buildMemberContext(
  userId: string
): Promise<MemberContext> {
  const admin = createAdminClient();

  // Load profile, latest assessment, latest plan, and actions in parallel
  const [profileResult, assessmentResult, subscriptionResult, partialResult] =
    await Promise.all([
      admin
        .from("profiles")
        .select(
          "id, full_name, email, role, status, created_at, disciplines, creative_mode, detected_stage"
        )
        .eq("id", userId)
        .single(),
      admin
        .from("assessments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("subscriptions")
        .select("status, plan")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("partial_assessments")
        .select("*")
        .eq("user_id", userId)
        .is("consumed_by_assessment_id", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const profile = profileResult.data;
  const assessment = assessmentResult.data;
  const subscription = subscriptionResult.data;
  const partial = partialResult.data;

  // Load plan and actions if assessment exists and is completed
  let roadmap: RoadmapContext | null = null;
  let actions: ActionContext[] = [];

  if (assessment?.status === "completed") {
    const [planResult, actionsResult] = await Promise.all([
      admin
        .from("strategic_plans")
        .select("id, status, plan_content, published_at")
        .eq("assessment_id", assessment.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("assessment_actions")
        .select("id, action_order, action_type, status, completed_at, notes")
        .eq("user_id", userId)
        .order("action_order", { ascending: true }),
    ]);

    if (planResult.data) {
      roadmap = {
        id: planResult.data.id,
        status: planResult.data.status,
        plan_content: planResult.data.plan_content,
        published_at: planResult.data.published_at,
      };
    }

    actions = (actionsResult.data || []).map((a) => ({
      id: a.id,
      action_order: a.action_order,
      action_type: a.action_type,
      status: a.status,
      completed_at: a.completed_at,
      notes: a.notes,
    }));
  }

  // Build assessment context
  let assessmentContext: AssessmentContext | null = null;
  if (assessment) {
    assessmentContext = {
      id: assessment.id,
      status: assessment.status,
      detected_stage: assessment.detected_stage,
      stage_score: assessment.stage_score,
      transition_readiness: assessment.transition_readiness,
      misalignment_flags: assessment.misalignment_flags || [],
      archetype_primary: assessment.archetype_primary,
      archetype_secondary: assessment.archetype_secondary,
      creative_mode: assessment.creative_mode,
      discipline: assessment.discipline,
      income_range: assessment.income_range,
      income_structure: assessment.income_structure,
      what_they_pay_for: assessment.what_they_pay_for,
      equity_positions: assessment.equity_positions,
      demand_level: assessment.demand_level,
      business_structure: assessment.business_structure,
      completed_at: assessment.completed_at,
    };
  }

  return {
    profile: {
      id: profile?.id || userId,
      name: profile?.full_name || null,
      email: profile?.email || "",
      role: profile?.role || "member",
      status: profile?.status || "active",
      created_at: profile?.created_at || "",
      disciplines: profile?.disciplines || null,
      creative_mode: profile?.creative_mode || null,
      detected_stage: profile?.detected_stage || null,
    },
    assessment: assessmentContext,
    roadmap,
    actions,
    partialAssessment: partial
      ? {
          discipline: partial.discipline,
          creative_mode: partial.creative_mode,
          income_range: partial.income_range,
          business_structure: partial.business_structure,
          additional_data: partial.additional_data,
        }
      : null,
    subscription: subscription
      ? { status: subscription.status, plan: subscription.plan }
      : null,
  };
}

/**
 * Load the most recent conversation for a user (for resume).
 */
export async function loadLatestConversation(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}
