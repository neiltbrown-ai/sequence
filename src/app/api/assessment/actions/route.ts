import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_TYPES = ["foundation", "positioning", "momentum"];

/**
 * PATCH /api/assessment/actions
 *
 * Mark an action (identified by its position: order + type) complete /
 * in-progress / pending on the user's CURRENT plan. Scoped by the
 * latest strategic_plan, so regenerating the plan resets completion state
 * — which is the intended behavior, since each regen produces new action
 * content and the old completions are archived with the old plan.
 *
 * Request body:
 *   { actionOrder: 1|2|3, actionType: "foundation"|"positioning"|"momentum",
 *     status: "pending"|"in_progress"|"completed" }
 */
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

  // Resolve the user's current (latest) plan — action tracking is always
  // scoped to the active plan.
  const { data: plan } = await admin
    .from("strategic_plans")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json(
      { error: "No strategic plan found" },
      { status: 404 }
    );
  }

  // Look up an existing row for THIS plan + this slot
  const { data: existing } = await admin
    .from("assessment_actions")
    .select("id")
    .eq("user_id", user.id)
    .eq("plan_id", plan.id)
    .eq("action_order", actionOrder)
    .maybeSingle();

  if (existing) {
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
    const type = VALID_TYPES.includes(actionType) ? actionType : "foundation";

    const { error: insertErr } = await admin
      .from("assessment_actions")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
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
