import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

const PAGE_SIZE = 50;

const COST_PER_MESSAGE = 0.014;
const COST_PER_PLAN = 0.057;
const COST_PER_VERDICT = 0.053;
const COST_PER_ANALYSIS = 0.039;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("profiles")
    .select(
      "id, full_name, email, detected_stage, disciplines, created_at, updated_at, subscriptions!inner(plan, status)",
      { count: "exact" }
    );

  // Search filter
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  // Plan/status filter
  switch (filter) {
    case "library":
      query = query.eq("subscriptions.plan", "library");
      break;
    case "full_access":
      query = query.eq("subscriptions.plan", "full_access");
      break;
    case "past_due":
      query = query.eq("subscriptions.status", "past_due");
      break;
    case "canceled":
      query = query.eq("subscriptions.status", "canceled");
      break;
    // "all" — no additional filter
  }

  // Sort — plan/status live on the subscriptions relation
  const asc = order === "asc";
  if (sort === "plan" || sort === "status") {
    query = query.order(sort, { ascending: asc, referencedTable: "subscriptions" });
  } else {
    query = query.order(sort, { ascending: asc });
  }

  // Paginate
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Admin members query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = (data ?? []).map((r) => r.id);

  // Fetch AI usage data for this page of members in parallel
  const [convosRes, plansRes, verdictsRes, analysesRes] = await Promise.all([
    admin
      .from("ai_conversations")
      .select("user_id, message_count")
      .in("user_id", userIds),
    admin
      .from("strategic_plans")
      .select("user_id")
      .eq("status", "published")
      .in("user_id", userIds),
    admin
      .from("deal_verdicts")
      .select("user_id")
      .in("user_id", userIds),
    admin
      .from("asset_inventory_analyses")
      .select("user_id")
      .eq("status", "completed")
      .in("user_id", userIds),
  ]);

  // Aggregate per user
  const costMap: Record<string, number> = {};
  for (const uid of userIds) costMap[uid] = 0;

  if (convosRes.data) {
    for (const c of convosRes.data) {
      costMap[c.user_id] = (costMap[c.user_id] || 0) + (c.message_count || 0) * COST_PER_MESSAGE;
    }
  }
  if (plansRes.data) {
    for (const p of plansRes.data) {
      costMap[p.user_id] = (costMap[p.user_id] || 0) + COST_PER_PLAN;
    }
  }
  if (verdictsRes.data) {
    for (const v of verdictsRes.data) {
      costMap[v.user_id] = (costMap[v.user_id] || 0) + COST_PER_VERDICT;
    }
  }
  if (analysesRes.data) {
    for (const a of analysesRes.data) {
      costMap[a.user_id] = (costMap[a.user_id] || 0) + COST_PER_ANALYSIS;
    }
  }

  const members = (data ?? []).map((row) => {
    const sub = Array.isArray(row.subscriptions)
      ? row.subscriptions[0]
      : row.subscriptions;
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      plan: sub?.plan ?? null,
      status: sub?.status ?? null,
      stage: row.detected_stage,
      disciplines: row.disciplines,
      signup: row.created_at,
      lastLogin: row.updated_at,
      aiCost: costMap[row.id] || 0,
    };
  });

  return NextResponse.json({ members, total: count ?? 0 });
}
