import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/debug/creative-identity
 *
 * Diagnostic endpoint — returns the authenticated user's ID and any
 * assessment rows they own. Use while troubleshooting "I completed CI
 * but the tab shows empty" issues.
 *
 * Returns only the user's own data (scoped by auth), safe to expose.
 * Remove once the underlying issue is resolved.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("assessments")
    .select(
      "id, user_id, status, current_section, detected_stage, archetype_primary, completed_at, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    authenticated_user: {
      id: user.id,
      email: user.email,
    },
    assessments_for_this_user: rows,
    error: error?.message ?? null,
    assessment_count: rows?.length ?? 0,
    has_any_completed: rows?.some((r) => r.status === "completed" || r.completed_at) ?? false,
  });
}
