import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EvaluatorFlow } from '@/components/evaluator/evaluator-flow';
import type { EvalAssessmentContext, DealEvaluation, CompletedEvalSummary } from '@/types/evaluator';

async function loadAssessmentContext(
  userId: string,
): Promise<EvalAssessmentContext | null> {
  const supabase = await createClient();

  // Load latest completed assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assessment) {
    return { hasAssessment: false, assessmentId: null, detected_stage: null, stage_score: null, creative_mode: null, discipline: null, income_range: null, income_structure: null, equity_positions: null, demand_level: null, business_structure: null, risk_tolerance: null, misalignment_flags: null, archetype_primary: null, roadmap_actions: null, recommended_structures: null };
  }

  // Load roadmap actions if plan exists
  let roadmapActions = null;
  let recommendedStructures = null;
  const { data: plan } = await supabase
    .from('strategic_plans')
    .select('*')
    .eq('assessment_id', assessment.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (plan?.plan_content) {
    const content = plan.plan_content as Record<string, unknown>;
    if (content.actions && Array.isArray(content.actions)) {
      roadmapActions = content.actions.map((a: Record<string, unknown>) => ({
        order: a.order as number,
        type: a.type as string,
        title: a.title as string,
        status: (a.status as string) ?? 'pending',
      }));
    }
    if (content.recommended_structures && Array.isArray(content.recommended_structures)) {
      recommendedStructures = content.recommended_structures as number[];
    }
  }

  return {
    hasAssessment: true,
    assessmentId: assessment.id,
    detected_stage: assessment.detected_stage,
    stage_score: assessment.stage_score,
    creative_mode: assessment.creative_mode,
    discipline: assessment.discipline,
    income_range: assessment.income_range,
    income_structure: assessment.income_structure,
    equity_positions: assessment.equity_positions,
    demand_level: assessment.demand_level,
    business_structure: assessment.business_structure,
    risk_tolerance: assessment.risk_tolerance,
    misalignment_flags: assessment.misalignment_flags,
    archetype_primary: assessment.archetype_primary,
    roadmap_actions: roadmapActions,
    recommended_structures: recommendedStructures,
  };
}

export default async function EvaluatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Load assessment context, in-progress evaluation, and completed evaluations
  const [assessmentContext, existingResult, completedResult] = await Promise.all([
    loadAssessmentContext(user.id),
    supabase
      .from('deal_evaluations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('deal_evaluations')
      .select('id, deal_name, deal_type, overall_score, overall_signal, completed_at, scores')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false }),
  ]);

  return (
    <EvaluatorFlow
      userId={user.id}
      assessmentContext={assessmentContext}
      existingEvaluation={existingResult.data as DealEvaluation | null}
      completedEvaluations={(completedResult.data as CompletedEvalSummary[]) ?? []}
    />
  );
}
