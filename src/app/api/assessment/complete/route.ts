import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeStageScore } from "@/lib/assessment/scoring";
import { matchArchetype } from "@/lib/assessment/archetype-matching";
import { getArchetypeById } from "@/lib/assessment/archetypes";
import { generateStrategicPlan } from "@/lib/roadmap/generate-plan";
import type { AssessmentAnswers, CreativeMode } from "@/types/assessment";

/**
 * Creative Identity completion endpoint.
 *
 * Responsibilities (what stays here):
 *   - Validate + merge client-supplied answers
 *   - Compute stage score + match archetype (pure logic, not AI)
 *   - Mark the assessment as completed
 *
 * Delegated to the shared generator:
 *   - Creating the strategic_plans row + kicking off Claude
 *
 * This keeps assessment-specific scoring logic here and lets the generator
 * handle plan creation uniformly whether triggered by Creative Identity,
 * Portfolio Analysis, or future deal-evaluation refresh CTAs.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { assessmentId, answers: clientAnswers } = body;

  if (!assessmentId) {
    return NextResponse.json(
      { error: "Missing assessmentId" },
      { status: 400 }
    );
  }

  // Load assessment
  const admin = createAdminClient();
  const { data: assessment, error: fetchErr } = await admin
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !assessment) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 }
    );
  }

  if (assessment.status === "completed") {
    // Check if plan already exists
    const { data: existingPlan } = await admin
      .from("strategic_plans")
      .select("id")
      .eq("assessment_id", assessmentId)
      .single();

    if (existingPlan) {
      return NextResponse.json({ planId: existingPlan.id });
    }
  }

  // Merge client + DB answers (client is source of truth for unsaved keystrokes)
  const src = clientAnswers || {};
  const answers: AssessmentAnswers = {
    discipline: src.discipline ?? assessment.discipline,
    sub_discipline: src.sub_discipline ?? assessment.sub_discipline,
    creative_mode: src.creative_mode ?? assessment.creative_mode,
    energy_ranking: src.energy_ranking ?? assessment.energy_ranking,
    drains: src.drains ?? assessment.drains,
    dream_response: src.dream_response ?? assessment.dream_response,
    income_range: src.income_range ?? assessment.income_range,
    income_structure: src.income_structure ?? assessment.income_structure,
    what_they_pay_for: src.what_they_pay_for ?? assessment.what_they_pay_for,
    equity_positions: src.equity_positions ?? assessment.equity_positions,
    demand_level: src.demand_level ?? assessment.demand_level,
    business_structure: src.business_structure ?? assessment.business_structure,
    stage_questions: src.stage_questions ?? assessment.stage_questions,
    industry_questions: src.industry_questions ?? assessment.industry_questions,
    discernment_questions:
      src.discernment_questions ?? assessment.discernment_questions,
    three_year_goal: src.three_year_goal ?? assessment.three_year_goal,
    risk_tolerance: src.risk_tolerance ?? assessment.risk_tolerance,
    constraints: src.constraints ?? assessment.constraints,
    specific_question: src.specific_question ?? assessment.specific_question,
  };

  // Flush client answers to DB
  if (clientAnswers) {
    await admin
      .from("assessments")
      .update({
        discipline: answers.discipline,
        sub_discipline: answers.sub_discipline,
        creative_mode: answers.creative_mode,
        energy_ranking: answers.energy_ranking,
        drains: answers.drains,
        dream_response: answers.dream_response,
        income_range: answers.income_range,
        income_structure: answers.income_structure,
        what_they_pay_for: answers.what_they_pay_for,
        equity_positions: answers.equity_positions,
        demand_level: answers.demand_level,
        business_structure: answers.business_structure,
        stage_questions: answers.stage_questions,
        industry_questions: answers.industry_questions,
        discernment_questions: answers.discernment_questions,
        three_year_goal: answers.three_year_goal,
        risk_tolerance: answers.risk_tolerance,
        constraints: answers.constraints,
        specific_question: answers.specific_question,
      })
      .eq("id", assessmentId);
  }

  // Compute stage + archetype (pure logic, not AI)
  const stageResult = computeStageScore(answers);
  const archetypeResult = matchArchetype(
    stageResult.detectedStage,
    stageResult.stageScore,
    (assessment.creative_mode as CreativeMode) || "hybrid",
    stageResult.misalignmentFlags
  );
  const primaryArchetype = archetypeResult.primary;
  const secondaryArchetype = archetypeResult.secondary
    ? getArchetypeById(archetypeResult.secondary.id)
    : null;

  // Update assessment with canonical server scores
  await admin
    .from("assessments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      detected_stage: stageResult.detectedStage,
      stage_score: stageResult.stageScore,
      transition_readiness: stageResult.transitionReadiness,
      misalignment_flags: stageResult.misalignmentFlags,
      archetype_primary: primaryArchetype.id,
      archetype_secondary: secondaryArchetype?.id || null,
    })
    .eq("id", assessmentId);

  // Delegate plan creation + generation to the shared lib.
  // Pass override context so the generator uses the freshly-merged answers
  // rather than re-reading stale DB state.
  try {
    const { planId } = await generateStrategicPlan({
      userId: user.id,
      assessmentId,
      overrideAssessmentContext: {
        discipline: answers.discipline,
        sub_discipline: answers.sub_discipline,
        creative_mode: answers.creative_mode,
        detected_stage: stageResult.detectedStage,
        stage_score: stageResult.stageScore,
        transition_readiness: stageResult.transitionReadiness,
        misalignment_flags: stageResult.misalignmentFlags,
        income_range: answers.income_range,
        income_structure: answers.income_structure,
        what_they_pay_for: answers.what_they_pay_for,
        equity_positions: answers.equity_positions,
        demand_level: answers.demand_level,
        business_structure: answers.business_structure,
        energy_ranking: answers.energy_ranking,
        drains: answers.drains,
        dream_response: answers.dream_response,
        three_year_goal: answers.three_year_goal,
        risk_tolerance: answers.risk_tolerance,
        constraints: answers.constraints,
        specific_question: answers.specific_question,
        stage_questions: answers.stage_questions,
        industry_questions: answers.industry_questions,
        discernment_questions: answers.discernment_questions,
      },
      overrideArchetypeContext: {
        primary: primaryArchetype,
        secondary: secondaryArchetype || undefined,
      },
    });
    return NextResponse.json({ planId });
  } catch (err) {
    console.error("Failed to kick off roadmap generation:", err);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
