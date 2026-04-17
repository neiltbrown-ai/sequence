import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import SettingsTabs from "@/components/portal/settings-tabs";
import type { CreativeIdentitySnapshot } from "@/types/creative-identity";

// Always fetch fresh — the Creative Identity snapshot depends on the
// most recent assessment state, which changes right after the wizard
// submits. Never serve cached.
export const dynamic = "force-dynamic";

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const activeTab: "profile" | "creative-identity" =
    params.tab === "creative-identity" ? "creative-identity" : "profile";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load Creative Identity snapshot server-side so the tab renders correctly on first paint.
  //
  // Prefer the most recent COMPLETED assessment over any newer in-progress row.
  // Why: if the member has completed CI once and later clicked "Refine" (which
  // navigates to /assessment and lets autosave create a fresh in-progress row),
  // a simple `order by created_at desc limit 1` query returns the in-progress
  // row and the tab shows an empty/resume state — hiding the completed
  // profile from view. Completed state wins; in-progress is the fallback.
  const admin = createAdminClient();
  const columns =
    "id, status, current_section, current_question, detected_stage, archetype_primary, creative_mode, discipline, sub_discipline, misalignment_flags, completed_at, updated_at";

  const [{ data: completed }, { data: anyLatest }] = await Promise.all([
    admin
      .from("assessments")
      .select(columns)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("assessments")
      .select(columns)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const assessment = completed ?? anyLatest;

  // Trust `completed_at` as the definitive completion signal — more robust
  // than the status string (which could be out of sync in edge cases or
  // legacy data). If a completed_at exists OR status is literally
  // "completed", the panel should show the full portrait view.
  const hasCompletedAt = !!(assessment && assessment.completed_at);
  const resolvedStatus: CreativeIdentitySnapshot["status"] =
    hasCompletedAt
      ? "completed"
      : assessment
        ? (assessment.status as CreativeIdentitySnapshot["status"])
        : "empty";

  const creativeIdentity: CreativeIdentitySnapshot = assessment
    ? {
        id: assessment.id,
        status: resolvedStatus,
        currentSection: assessment.current_section ?? 1,
        currentQuestion: assessment.current_question ?? 0,
        detectedStage: assessment.detected_stage ?? null,
        archetypePrimary: assessment.archetype_primary ?? null,
        creativeMode: assessment.creative_mode ?? null,
        discipline: assessment.discipline ?? null,
        subDiscipline: assessment.sub_discipline ?? null,
        misalignmentFlags: assessment.misalignment_flags ?? [],
        completedAt: assessment.completed_at ?? null,
        updatedAt: assessment.updated_at ?? null,
      }
    : {
        id: null,
        status: "empty",
        currentSection: 0,
        currentQuestion: 0,
        detectedStage: null,
        archetypePrimary: null,
        creativeMode: null,
        discipline: null,
        subDiscipline: null,
        misalignmentFlags: [],
        completedAt: null,
        updatedAt: null,
      };

  return <SettingsTabs activeTab={activeTab} creativeIdentity={creativeIdentity} />;
}
