import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import RoadmapDisplay from "@/components/assessment/roadmap-display";
import RoadmapGenerating from "@/components/assessment/roadmap-generating";
import FreePreview from "@/components/assessment/free-preview";
import type { StageNumber, MisalignmentFlag } from "@/types/assessment";

export default async function RoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // In the new consolidated model, a plan may be generated from:
  //  - Creative Identity alone
  //  - Portfolio alone
  //  - Both (combined)
  // Always surface the user's MOST RECENT plan — that's the source of truth
  // regardless of which input drove it. Don't filter by assessment_id;
  // Batch B introduced portfolio-only plans and regenerations that create
  // new rows.
  const admin = createAdminClient();
  const { data: plan } = await admin
    .from("strategic_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // No plan at all → the user hasn't completed either required input.
  // Send them to Creative Identity as the lowest-friction first step.
  if (!plan) {
    // Check if they have a completed assessment without a plan — shouldn't
    // happen in practice but handle gracefully with a targeted redirect.
    const { data: assessment } = await supabase
      .from("assessments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .limit(1)
      .maybeSingle();

    if (assessment) {
      // Edge case: completed CI but plan generation never kicked off or was
      // rolled back. Send to Creative Identity which will no-op and loop
      // completion logic to re-trigger generation.
      redirect("/assessment");
    }

    // No CI, no plan → start with Creative Identity
    redirect("/assessment");
  }

  // Subscription gating uses the linked assessment (if any) for FreePreview
  // content. Portfolio-only plans skip the free preview since there's no
  // stage/misalignment pair to tease with.
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const isMember = !!subscription;

  if (!isMember && plan.assessment_id) {
    // Non-members with a CI-linked plan see the limited preview
    const { data: assessment } = await admin
      .from("assessments")
      .select("detected_stage, misalignment_flags")
      .eq("id", plan.assessment_id)
      .maybeSingle();

    if (assessment) {
      const flags = (assessment.misalignment_flags || []) as MisalignmentFlag[];
      return (
        <FreePreview
          stage={assessment.detected_stage as StageNumber}
          topMisalignment={flags[0] || null}
        />
      );
    }
  }

  // Load action tracking. Note: actions are functionally per-user per-order
  // — the update API at /api/assessment/actions dedups on (user_id,
  // action_order) without considering plan_id, so a completed action #1
  // stays completed across regenerations even though its plan_id column
  // still points to the first plan that created it. Query by user_id so
  // progress carries forward after Portfolio-driven regenerations.
  const { data: actions } = await admin
    .from("assessment_actions")
    .select("*")
    .eq("user_id", user.id)
    .order("action_order", { ascending: true });

  // Generating → show progress screen
  if (plan.status === "generating") {
    return <RoadmapGenerating planId={plan.id} />;
  }

  // Pending review or draft → holding screen
  if (plan.status === "review" || plan.status === "draft") {
    return (
      <div className="rdmp-pending">
        <div className="rdmp-pending-icon">&#9998;</div>
        <h2>Your roadmap is being reviewed</h2>
        <p>
          We&apos;re reviewing your personalized strategic roadmap to ensure the
          recommendations are tailored to your situation. You&apos;ll receive a
          notification when it&apos;s ready.
        </p>
        <a href="/dashboard" className="rdmp-pending-btn">
          Return to Dashboard
        </a>
      </div>
    );
  }

  // Published → render
  return (
    <RoadmapDisplay plan={plan} actions={actions || []} userId={user.id} />
  );
}
