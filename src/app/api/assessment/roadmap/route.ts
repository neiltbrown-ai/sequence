import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId");
  const assessmentId = searchParams.get("assessmentId");

  let query = supabase
    .from("strategic_plans")
    .select("*")
    .eq("user_id", user.id);

  if (planId) {
    query = query.eq("id", planId);
  } else if (assessmentId) {
    query = query.eq("assessment_id", assessmentId);
  } else {
    // Get most recent plan
    query = query.order("created_at", { ascending: false }).limit(1);
  }

  const { data: plan, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Also fetch action tracking data
  const { data: actions } = await supabase
    .from("assessment_actions")
    .select("*")
    .eq("plan_id", plan.id)
    .order("action_order", { ascending: true });

  return NextResponse.json({
    plan,
    actions: actions || [],
  });
}
