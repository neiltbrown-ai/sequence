import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The single source of truth for "which assessment row is this member's current one."
 *
 * Why this exists: different surfaces used to disagree. `buildMemberContext()` (the AI
 * advisor) ordered by `created_at` while Settings / Inventory ordered by `completed_at`.
 * When those timestamps disagree — e.g. a backdated `completed_at`, or a newer in-progress
 * row created by "Refine" — the advisor could ground itself in a different persona than the
 * one shown on Settings and the Roadmap. Routing every read through this helper means the
 * surfaces can no longer drift apart.
 *
 * Selection rule: the most recent COMPLETED assessment (by `completed_at`, then `created_at`
 * as a tiebreak), falling back to the latest row of any status if the member has never
 * completed one. A completed result always wins over a newer in-progress row.
 *
 * Server-only: pass an admin (service-role) client — this bypasses RLS like its callers.
 */
// Return type is `any`: the admin client is untyped, and selecting a dynamic (non-literal)
// column string makes Supabase's types fall back to GenericStringError. Callers read many
// assessment fields and assign them into typed shapes — `any` reproduces exactly the
// effective typing the inline `.select("*")` queries had before this helper existed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCurrentAssessment(
  admin: SupabaseClient,
  userId: string,
  columns = "*"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const [{ data: completed }, { data: anyLatest }] = await Promise.all([
    admin
      .from("assessments")
      .select(columns)
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("assessments")
      .select(columns)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return completed ?? anyLatest ?? null;
}
