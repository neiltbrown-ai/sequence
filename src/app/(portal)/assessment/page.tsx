import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssessmentWizard from "@/components/assessment/assessment-wizard";
import type { Assessment } from "@/types/assessment";

export default async function AssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check for existing in-progress assessment
  const { data: existing } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AssessmentWizard
      userId={user.id}
      existingAssessment={existing as Assessment | null}
    />
  );
}
