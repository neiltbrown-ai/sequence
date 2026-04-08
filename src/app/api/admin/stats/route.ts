import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const monthlyPriceId = process.env.STRIPE_PRICE_FULL_ACCESS_MONTHLY;

  const [
    totalMembersRes,
    wauRes,
    prevWauRes,
    activeSubsRes,
    churnRes,
    newMembersRes,
  ] = await Promise.all([
    // Total active members
    admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "trialing", "past_due"]),

    // Weekly active users
    admin.rpc("get_active_users", { days: 7 }),

    // Previous 14-day active users (to derive previous week)
    admin.rpc("get_active_users", { days: 14 }),

    // All active subscriptions for MRR calc
    admin
      .from("subscriptions")
      .select("plan, stripe_price_id")
      .in("status", ["active", "trialing"]),

    // Churn in last 30 days
    admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "canceled")
      .gte("updated_at", thirtyDaysAgo),

    // New members in last 30 days
    admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo)
      .in("status", ["active", "trialing"]),
  ]);

  const totalMembers = totalMembersRes.count ?? 0;
  const wau = (wauRes.data as number) ?? 0;
  const prevWau = ((prevWauRes.data as number) ?? 0) - wau;
  const churnCount = churnRes.count ?? 0;
  const newMembers30d = newMembersRes.count ?? 0;

  // Calculate MRR
  let mrr = 0;
  if (activeSubsRes.data) {
    for (const sub of activeSubsRes.data) {
      switch (sub.plan) {
        case "library":
          mrr += 49 / 12;
          break;
        case "full_access":
          if (sub.stripe_price_id === monthlyPriceId) {
            mrr += 79;
          } else {
            mrr += 790 / 12;
          }
          break;
        case "annual":
          mrr += 89 / 12;
          break;
        case "student":
          mrr += 0;
          break;
        default:
          break;
      }
    }
  }

  return NextResponse.json({
    totalMembers,
    wau,
    prevWau,
    mrr: Math.round(mrr * 100) / 100,
    churnCount,
    newMembers30d,
  });
}
