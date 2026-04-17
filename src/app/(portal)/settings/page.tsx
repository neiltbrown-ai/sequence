import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import SettingsTabs from "@/components/portal/settings-tabs";
import type { CreativeIdentitySnapshot } from "@/types/creative-identity";

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

  // Load Creative Identity snapshot server-side so the tab renders correctly on first paint
  const admin = createAdminClient();
  const { data: assessment } = await admin
    .from("assessments")
    .select(
      "id, status, current_section, current_question, detected_stage, archetype_primary, creative_mode, discipline, sub_discipline, misalignment_flags, completed_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const creativeIdentity: CreativeIdentitySnapshot = assessment
    ? {
        id: assessment.id,
        status: assessment.status as CreativeIdentitySnapshot["status"],
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
