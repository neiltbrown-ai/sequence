import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { id } = await params;

  const [
    profileRes,
    subscriptionRes,
    assessmentRes,
    emailsRes,
    notesRes,
    bookmarksRes,
    conversationCountRes,
    dealEvalsRes,
    dealVerdictsRes,
    inventoryItemsRes,
    inventoryAnalysesRes,
  ] = await Promise.all([
    // Profile
    admin.from("profiles").select("*").eq("id", id).single(),

    // Subscription
    admin.from("subscriptions").select("*").eq("user_id", id).maybeSingle(),

    // Latest assessment (full data)
    admin
      .from("assessments")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Email log
    admin
      .from("email_log")
      .select("*")
      .eq("user_id", id)
      .order("sent_at", { ascending: false })
      .limit(20),

    // Admin notes (join with profiles for admin name)
    admin
      .from("admin_notes")
      .select("*, admin:profiles!admin_notes_admin_id_fkey(full_name)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),

    // Bookmarks
    admin
      .from("bookmarks")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),

    // Conversations with message counts
    admin
      .from("ai_conversations")
      .select("id, message_count")
      .eq("user_id", id),

    // Deal evaluations (full data)
    admin
      .from("deal_evaluations")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),

    // Deal verdicts
    admin
      .from("deal_verdicts")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),

    // Asset inventory items
    admin
      .from("asset_inventory_items")
      .select("*")
      .eq("user_id", id)
      .order("sort_order", { ascending: true }),

    // Asset inventory analyses
    admin
      .from("asset_inventory_analyses")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileRes.error) {
    return NextResponse.json(
      { error: "Member not found" },
      { status: 404 }
    );
  }

  // Fetch strategic plan(s) for this user
  const strategicPlansRes = await admin
    .from("strategic_plans")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  // Calculate AI cost estimate
  const conversations = conversationCountRes.data ?? [];
  const totalMessages = conversations.reduce(
    (sum: number, c: { message_count?: number }) =>
      sum + (typeof c.message_count === "number" ? c.message_count : 0),
    0
  );
  const verdictCount = (dealVerdictsRes.data ?? []).length;
  const planCount = (strategicPlansRes.data ?? []).length;
  const analysisCount = (inventoryAnalysesRes.data ?? []).length;

  // Cost per unit (Claude Sonnet: $3/1M input, $15/1M output)
  const COST_PER_MESSAGE = 0.014;     // ~2500 input + ~400 output tokens
  const COST_PER_ROADMAP = 0.057;     // ~4000 input + ~3000 output tokens
  const COST_PER_VERDICT = 0.053;     // ~5000 input + ~2500 output tokens
  const COST_PER_ANALYSIS = 0.039;    // ~3000 input + ~2000 output tokens

  const estimatedCost =
    totalMessages * COST_PER_MESSAGE +
    planCount * COST_PER_ROADMAP +
    verdictCount * COST_PER_VERDICT +
    analysisCount * COST_PER_ANALYSIS;

  return NextResponse.json({
    profile: profileRes.data,
    subscription: subscriptionRes.data,
    assessment: assessmentRes.data,
    strategicPlans: strategicPlansRes.data ?? [],
    dealEvaluations: dealEvalsRes.data ?? [],
    dealVerdicts: dealVerdictsRes.data ?? [],
    inventoryItems: inventoryItemsRes.data ?? [],
    inventoryAnalyses: inventoryAnalysesRes.data ?? [],
    emails: emailsRes.data ?? [],
    notes: notesRes.data ?? [],
    bookmarks: bookmarksRes.data ?? [],
    stats: {
      conversationCount: conversations.length,
      totalMessages,
      dealEvalCount: (dealEvalsRes.data ?? []).length,
      verdictCount,
      planCount,
      analysisCount,
      inventoryItemCount: (inventoryItemsRes.data ?? []).length,
      estimatedCost,
    },
  });
}
