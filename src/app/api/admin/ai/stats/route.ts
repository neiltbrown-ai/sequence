import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch cost settings from admin_settings table, fall back to hardcoded defaults
  const DEFAULTS: Record<string, number> = {
    ai_cost_per_message: 0.033,
    ai_cost_per_roadmap: 0.12,
    ai_cost_per_verdict: 0.11,
    ai_cost_per_analysis: 0.09,
    ai_regen_multiplier: 1.2,
  };

  const { data: costSettings } = await admin
    .from("admin_settings")
    .select("key, value")
    .in("key", Object.keys(DEFAULTS));

  const settingsMap: Record<string, number> = { ...DEFAULTS };
  if (costSettings) {
    for (const row of costSettings) {
      const parsed = parseFloat(typeof row.value === "string" ? row.value : String(row.value));
      if (!isNaN(parsed)) settingsMap[row.key] = parsed;
    }
  }

  const COST_PER_MESSAGE = settingsMap.ai_cost_per_message;
  const COST_PER_ROADMAP = settingsMap.ai_cost_per_roadmap;
  const COST_PER_VERDICT = settingsMap.ai_cost_per_verdict;
  const COST_PER_ANALYSIS = settingsMap.ai_cost_per_analysis;

  // message_count includes BOTH user and assistant messages, but only assistant
  // messages trigger API calls. Divide by 2 to approximate actual API calls.
  const apiCallsFromMessages = (messageCount: number) => Math.ceil(messageCount / 2);

  // Roadmap regenerations (/api/assessment/regenerate and /api/assessment/regenerate-all)
  // make additional Claude API calls that aren't tracked in ai_conversations.
  // Apply multiplier to roadmap costs to account for regeneration overhead.
  const ROADMAP_REGENERATION_MULTIPLIER = settingsMap.ai_regen_multiplier;

  const [
    totalConvRes,
    activeConvRes,
    allConvRes,
    strategicPlanRes,
    dealVerdictRes,
    inventoryRes,
  ] = await Promise.all([
    admin
      .from("ai_conversations")
      .select("*", { count: "exact", head: true }),

    admin
      .from("ai_conversations")
      .select("*", { count: "exact", head: true })
      .gte("last_message_at", sevenDaysAgo),

    admin
      .from("ai_conversations")
      .select(
        "id, user_id, current_mode, modes_used, initial_path, message_count, last_message_at, created_at"
      )
      .order("last_message_at", { ascending: false })
      .limit(500),

    admin
      .from("strategic_plans")
      .select("*", { count: "exact", head: true }),

    admin
      .from("deal_verdicts")
      .select("*", { count: "exact", head: true }),

    admin
      .from("asset_inventory_analyses")
      .select("*", { count: "exact", head: true }),
  ]);

  const totalConversations = totalConvRes.count ?? 0;
  const activeConversations7d = activeConvRes.count ?? 0;
  const conversations = (allConvRes.data ?? []) as Array<Record<string, unknown>>;


  // Get total message count via RPC (counts from jsonb arrays — always accurate)
  const { data: rpcTotal } = await admin.rpc("get_total_message_count");
  const totalMessages = typeof rpcTotal === "number" ? rpcTotal : 0;

  // Calculate messages in last 30 days from message_count column
  let messages30d = 0;
  for (const c of conversations) {
    const mc = typeof c.message_count === "number" ? c.message_count : 0;
    if (
      c.last_message_at &&
      new Date(c.last_message_at as string).getTime() >= new Date(thirtyDaysAgo).getTime()
    ) {
      messages30d += mc;
    }
  }

  // Get per-mode generation counts (all-time + 30d for projection)
  const [allPlansRes, allVerdictsRes, allAnalysesRes, plans30dRes, verdicts30dRes, analyses30dRes] = await Promise.all([
    admin.from("strategic_plans").select("user_id, created_at"),
    admin.from("deal_verdicts").select("user_id, created_at"),
    admin.from("asset_inventory_analyses").select("user_id, created_at"),
    admin.from("strategic_plans").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    admin.from("deal_verdicts").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    admin.from("asset_inventory_analyses").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
  ]);

  // Map conversations to users for mode→generation attribution
  const userModeMap: Record<string, Set<string>> = {};
  for (const conv of (allConvRes.data ?? []) as Array<Record<string, unknown>>) {
    const uid = conv.user_id as string;
    const rawModes =
      (conv.modes_used as string[] | null)?.length
        ? (conv.modes_used as string[])
        : conv.current_mode
          ? [conv.current_mode as string]
          : conv.initial_path
            ? [conv.initial_path as string]
            : ["general"];
    if (!userModeMap[uid]) userModeMap[uid] = new Set();
    for (const m of rawModes.filter(Boolean)) userModeMap[uid].add(m);
  }

  // Usage by mode
  const modeStats: Record<
    string,
    { conversations: number; messages: number; lastUsed: string | null; plans: number; verdicts: number; analyses: number }
  > = {};

  for (const conv of conversations) {
    const rawModes =
      (conv.modes_used as string[] | null)?.length
        ? (conv.modes_used as string[])
        : conv.current_mode
          ? [conv.current_mode as string]
          : conv.initial_path
            ? [conv.initial_path as string]
            : ["general"];
    const modes = rawModes.filter(Boolean);
    const mc = typeof conv.message_count === "number" ? conv.message_count : 0;
    for (const mode of modes) {
      if (!modeStats[mode]) {
        modeStats[mode] = { conversations: 0, messages: 0, lastUsed: null, plans: 0, verdicts: 0, analyses: 0 };
      }
      modeStats[mode].conversations += 1;
      modeStats[mode].messages += mc;
      if (
        !modeStats[mode].lastUsed ||
        (conv.last_message_at &&
          new Date(conv.last_message_at as string) >
            new Date(modeStats[mode].lastUsed!))
      ) {
        modeStats[mode].lastUsed = conv.last_message_at as string;
      }
    }
  }

  // Attribute generations to modes:
  // - strategic_plans → "map" mode (assessment flow produces roadmaps)
  // - deal_verdicts → "evaluate" mode
  // - asset_inventory_analyses → "general" mode (inventory is standalone)
  const modeGenMap: Record<string, { plans: number; verdicts: number; analyses: number }> = {
    map: { plans: (allPlansRes.data ?? []).length, verdicts: 0, analyses: 0 },
    evaluate: { plans: 0, verdicts: (allVerdictsRes.data ?? []).length, analyses: 0 },
    general: { plans: 0, verdicts: 0, analyses: (allAnalysesRes.data ?? []).length },
  };

  // Merge generation counts into mode stats
  for (const [mode, gens] of Object.entries(modeGenMap)) {
    if (!modeStats[mode]) {
      modeStats[mode] = { conversations: 0, messages: 0, lastUsed: null, plans: 0, verdicts: 0, analyses: 0 };
    }
    modeStats[mode].plans += gens.plans;
    modeStats[mode].verdicts += gens.verdicts;
    modeStats[mode].analyses += gens.analyses;
  }

  const byMode = Object.entries(modeStats)
    .map(([mode, s]) => ({
      mode,
      ...s,
      estimatedCost:
        apiCallsFromMessages(s.messages) * COST_PER_MESSAGE +
        s.plans * COST_PER_ROADMAP * ROADMAP_REGENERATION_MULTIPLIER +
        s.verdicts * COST_PER_VERDICT +
        s.analyses * COST_PER_ANALYSIS,
    }))
    .sort((a, b) => b.conversations - a.conversations);

  // Top users — aggregate by user_id, then fetch names
  const userStats: Record<
    string,
    {
      conversations: number;
      messages: number;
      lastActive: string | null;
    }
  > = {};

  for (const conv of conversations) {
    const uid = conv.user_id as string;
    const mc = typeof conv.message_count === "number" ? conv.message_count : 0;
    if (!userStats[uid]) {
      userStats[uid] = { conversations: 0, messages: 0, lastActive: null };
    }
    userStats[uid].conversations += 1;
    userStats[uid].messages += mc;
    if (
      !userStats[uid].lastActive ||
      (conv.last_message_at &&
        new Date(conv.last_message_at as string) >
          new Date(userStats[uid].lastActive!))
    ) {
      userStats[uid].lastActive = conv.last_message_at as string;
    }
  }

  // Fetch profile names for top users
  const sortedUserIds = Object.entries(userStats)
    .sort(([, a], [, b]) => b.messages - a.messages)
    .slice(0, 10)
    .map(([uid]) => uid);

  // Fetch profiles + per-user generation counts in parallel
  const [profilesResult, userPlansRes, userVerdictsRes, userAnalysesRes] = sortedUserIds.length > 0
    ? await Promise.all([
        admin.from("profiles").select("id, full_name").in("id", sortedUserIds),
        admin.from("strategic_plans").select("user_id").in("user_id", sortedUserIds),
        admin.from("deal_verdicts").select("user_id").in("user_id", sortedUserIds),
        admin.from("asset_inventory_analyses").select("user_id").in("user_id", sortedUserIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const nameMap: Record<string, string> = {};
  for (const p of (profilesResult as { data: Array<{ id: string; full_name: string | null }> | null }).data ?? []) {
    nameMap[p.id] = p.full_name || "Unknown";
  }

  // Count generations per user
  const userGenCounts: Record<string, { plans: number; verdicts: number; analyses: number }> = {};
  for (const uid of sortedUserIds) {
    userGenCounts[uid] = { plans: 0, verdicts: 0, analyses: 0 };
  }
  for (const row of (userPlansRes as { data: Array<{ user_id: string }> | null }).data ?? []) {
    if (userGenCounts[row.user_id]) userGenCounts[row.user_id].plans++;
  }
  for (const row of (userVerdictsRes as { data: Array<{ user_id: string }> | null }).data ?? []) {
    if (userGenCounts[row.user_id]) userGenCounts[row.user_id].verdicts++;
  }
  for (const row of (userAnalysesRes as { data: Array<{ user_id: string }> | null }).data ?? []) {
    if (userGenCounts[row.user_id]) userGenCounts[row.user_id].analyses++;
  }

  const topUsers = sortedUserIds.map((uid) => {
    const gen = userGenCounts[uid] || { plans: 0, verdicts: 0, analyses: 0 };
    const messageCost = apiCallsFromMessages(userStats[uid].messages) * COST_PER_MESSAGE;
    const genCost = gen.plans * COST_PER_ROADMAP * ROADMAP_REGENERATION_MULTIPLIER + gen.verdicts * COST_PER_VERDICT + gen.analyses * COST_PER_ANALYSIS;
    return {
      name: nameMap[uid] || "Unknown",
      ...userStats[uid],
      generations: gen,
      estimatedCost: messageCost + genCost,
    };
  });

  // ── Cost calculations ──
  const totalPlans = strategicPlanRes.count ?? 0;
  const totalVerdicts = dealVerdictRes.count ?? 0;
  const totalAnalyses = inventoryRes.count ?? 0;

  const totalCost =
    apiCallsFromMessages(totalMessages) * COST_PER_MESSAGE +
    totalPlans * COST_PER_ROADMAP * ROADMAP_REGENERATION_MULTIPLIER +
    totalVerdicts * COST_PER_VERDICT +
    totalAnalyses * COST_PER_ANALYSIS;

  // 90-day projection: extrapolate 30-day actuals × 3
  const plans30d = plans30dRes.count ?? 0;
  const verdicts30d = verdicts30dRes.count ?? 0;
  const analyses30d = analyses30dRes.count ?? 0;

  const cost30d =
    apiCallsFromMessages(messages30d) * COST_PER_MESSAGE +
    plans30d * COST_PER_ROADMAP * ROADMAP_REGENERATION_MULTIPLIER +
    verdicts30d * COST_PER_VERDICT +
    analyses30d * COST_PER_ANALYSIS;

  const projected90dCost = cost30d * 3;

  return NextResponse.json({
    totalConversations,
    activeConversations7d,
    totalMessages,
    messages30d,
    byMode,
    topUsers,
    generations: {
      strategicPlans: totalPlans,
      dealVerdicts: totalVerdicts,
      inventoryAnalyses: totalAnalyses,
    },
    costs: {
      totalAllTime: totalCost,
      last30d: cost30d,
      projected90d: projected90dCost,
      // Breakdown for transparency
      // perMessage rate is per API call (assistant message), not per raw message
      // perRoadmap includes 1.2x regeneration multiplier
      rates: {
        perMessage: COST_PER_MESSAGE,
        perRoadmap: COST_PER_ROADMAP * ROADMAP_REGENERATION_MULTIPLIER,
        perVerdict: COST_PER_VERDICT,
        perAnalysis: COST_PER_ANALYSIS,
      },
      last30dBreakdown: {
        messages: messages30d,
        plans: plans30d,
        verdicts: verdicts30d,
        analyses: analyses30d,
      },
    },
  });
}
