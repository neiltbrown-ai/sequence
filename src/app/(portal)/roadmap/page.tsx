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

  // Find the user's most recent completed assessment
  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, detected_stage, misalignment_flags, archetype_primary, status")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assessment) {
    redirect("/assessment");
  }

  // Check subscription status for gating
  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const isMember = !!subscription;

  // Non-members see free preview
  if (!isMember) {
    const flags = (assessment.misalignment_flags || []) as MisalignmentFlag[];
    return (
      <FreePreview
        stage={assessment.detected_stage as StageNumber}
        topMisalignment={flags[0] || null}
      />
    );
  }

  // Find the plan for this assessment
  const { data: plan } = await supabase
    .from("strategic_plans")
    .select("*")
    .eq("assessment_id", assessment.id)
    .maybeSingle();

  if (!plan) {
    redirect("/assessment");
  }

  // Load action tracking
  const { data: actions } = await supabase
    .from("assessment_actions")
    .select("*")
    .eq("plan_id", plan.id)
    .order("action_order", { ascending: true });

  // Show generating/pending state
  if (plan.status === "generating") {
    return <RoadmapGenerating planId={plan.id} />;
  }

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

  // Published — render full roadmap
  return (
    <RoadmapDisplay
      plan={plan}
      actions={actions || []}
      userId={user.id}
    />
  );
}
