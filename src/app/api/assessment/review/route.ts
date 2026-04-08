import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — Load plan detail for admin review
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const admin = createAdminClient();
  const { data: userRecord } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userRecord || userRecord.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  // Fetch plan with assessment and user data
  const { data: plan, error: planError } = await admin
    .from("strategic_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (planError || !plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Fetch assessment
  const { data: assessment } = await admin
    .from("assessments")
    .select("*")
    .eq("id", plan.assessment_id)
    .single();

  // Fetch user info from profiles table
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", plan.user_id)
    .single();

  return NextResponse.json({
    id: plan.id,
    status: plan.status,
    plan_content: plan.plan_content,
    review_notes: plan.review_notes,
    created_at: plan.created_at,
    published_at: plan.published_at,
    assessment: assessment
      ? {
          discipline: assessment.discipline,
          sub_discipline: assessment.sub_discipline,
          creative_mode: assessment.creative_mode,
          detected_stage: assessment.detected_stage,
          stage_score: assessment.stage_score,
          transition_readiness: assessment.transition_readiness,
          misalignment_flags: assessment.misalignment_flags,
          archetype_primary: assessment.archetype_primary,
          archetype_secondary: assessment.archetype_secondary,
          income_range: assessment.income_range,
          income_structure: assessment.income_structure,
          what_they_pay_for: assessment.what_they_pay_for,
          equity_positions: assessment.equity_positions,
          demand_level: assessment.demand_level,
          business_structure: assessment.business_structure,
          dream_response: assessment.dream_response,
          three_year_goal: assessment.three_year_goal,
          risk_tolerance: assessment.risk_tolerance,
          constraints: assessment.constraints,
          specific_question: assessment.specific_question,
        }
      : null,
    user: {
      email: profile?.email || "Unknown",
      full_name: profile?.full_name || profile?.email || "Unknown",
    },
  });
}

// POST — Approve or reject a plan
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const admin = createAdminClient();
  const { data: userRecord } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userRecord || userRecord.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { planId, action, reviewNotes } = body;

  if (!planId || !action || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    reviewed_by: user.id,
    review_notes: reviewNotes || null,
  };

  if (action === "approve") {
    updates.status = "published";
    updates.published_at = new Date().toISOString();
  } else {
    updates.status = "rejected";
  }

  const { error: updateError } = await admin
    .from("strategic_plans")
    .update(updates)
    .eq("id", planId);

  if (updateError) {
    console.error("Review action failed:", updateError);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, status: updates.status });
}
