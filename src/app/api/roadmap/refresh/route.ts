import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStrategicPlan } from "@/lib/roadmap/generate-plan";

// Claude generation 30-60s; give it runway.
export const maxDuration = 60;

/**
 * POST /api/roadmap/refresh
 *
 * Regenerates the user's strategic plan using all currently-available
 * inputs — latest completed Creative Identity, latest completed Portfolio
 * analysis, and last 90 days of deal evaluations.
 *
 * Called from:
 *   - Evaluator verdict view ("Refresh roadmap with this deal's signal")
 *   - Future: manual regen buttons elsewhere in portal
 *
 * Request body (all optional):
 *   {
 *     triggerReason?: "deal_evaluation" | "manual" | "portfolio_update"
 *     dealEvaluationId?: string   // for telemetry / audit later
 *   }
 *
 * Returns: { planId: string, source: "assessment" | "portfolio" | "combined" }
 *
 * The long-running Claude call runs via after() so the serverless function
 * stays alive until the plan reaches published status.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // triggerReason is read but not yet persisted; reserved for future
  // audit / telemetry.
  try {
    await request.json().catch(() => ({}));
  } catch {
    // body is optional
  }

  const admin = createAdminClient();

  // Pick up all available inputs for this user
  const [latestAssessment, latestAnalysis] = await Promise.all([
    admin
      .from("assessments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("asset_inventory_analyses")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const assessmentId = latestAssessment.data?.id ?? null;
  const portfolioAnalysisId = latestAnalysis.data?.id ?? null;

  if (!assessmentId && !portfolioAnalysisId) {
    return NextResponse.json(
      {
        error:
          "No inputs available — complete your Creative Identity or run a Portfolio analysis first.",
      },
      { status: 400 }
    );
  }

  try {
    const { planId, source, runGeneration } = await createStrategicPlan({
      userId: user.id,
      assessmentId,
      portfolioAnalysisId,
    });
    after(runGeneration);
    return NextResponse.json({ planId, source });
  } catch (err) {
    console.error("Roadmap refresh failed to create plan row:", err);
    return NextResponse.json(
      { error: "Failed to start roadmap refresh" },
      { status: 500 }
    );
  }
}
