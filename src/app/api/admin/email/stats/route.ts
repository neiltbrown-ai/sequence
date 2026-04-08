import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [totalRes, recent30Res, failed30Res, bouncedRes, subscribersRes] =
    await Promise.all([
      admin
        .from("email_log")
        .select("*", { count: "exact", head: true }),

      admin
        .from("email_log")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", thirtyDaysAgo),

      admin
        .from("email_log")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("sent_at", thirtyDaysAgo),

      admin
        .from("email_log")
        .select("*", { count: "exact", head: true })
        .eq("status", "bounced"),

      admin
        .from("newsletter_subscribers")
        .select("id, email, name, status, source, user_id, subscribed_at")
        .order("subscribed_at", { ascending: false }),
    ]);

  const totalSent = totalRes.count ?? 0;
  const sent30d = recent30Res.count ?? 0;
  const failed30d = failed30Res.count ?? 0;
  const bounced = bouncedRes.count ?? 0;
  const bounceRate =
    totalSent > 0 ? Math.round((bounced / totalSent) * 1000) / 10 : 0;

  const subscribers = subscribersRes.data ?? [];
  const activeSubscribers = subscribers.filter(
    (s) => s.status === "active"
  ).length;
  const paidSubscribers = subscribers.filter(
    (s) => s.status === "active" && s.user_id
  ).length;
  const freeSubscribers = activeSubscribers - paidSubscribers;

  return NextResponse.json({
    totalSent,
    sent30d,
    failed30d,
    bounceRate,
    subscribers: {
      active: activeSubscribers,
      paid: paidSubscribers,
      free: freeSubscribers,
      recent: subscribers.slice(0, 10),
    },
  });
}
