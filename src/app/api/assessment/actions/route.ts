import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_TYPES = ["foundation", "positioning", "momentum"];

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { actionOrder, actionType, status } = await request.json();

  if (
    typeof actionOrder !== "number" ||
    !["pending", "in_progress", "completed"].includes(status)
  ) {
    return NextResponse.json(
      { error: "Invalid actionOrder or status" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Check if row exists for this user + order
  const { data: existing } = await admin
    .from("assessment_actions")
    .select("id")
    .eq("user_id", user.id)
    .eq("action_order", actionOrder)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { error: updateErr } = await admin
      .from("assessment_actions")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", existing.id);

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update action" },
        { status: 500 }
      );
    }
  } else {
    // Need plan_id and action_type for insert
    const { data: plan } = await admin
      .from("strategic_plans")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const type = VALID_TYPES.includes(actionType) ? actionType : "foundation";

    const { error: insertErr } = await admin
      .from("assessment_actions")
      .insert({
        user_id: user.id,
        plan_id: plan?.id || null,
        action_order: actionOrder,
        action_type: type,
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      });

    if (insertErr) {
      return NextResponse.json(
        { error: "Failed to create action" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
