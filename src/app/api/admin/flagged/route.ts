import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const now = new Date();
  const thirtyDaysFromNow = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [pastDueRes, expiringRes, inactiveRes] = await Promise.all([
    // Past due subscriptions
    admin
      .from("subscriptions")
      .select("user_id, plan, updated_at, profiles!inner(full_name, email)")
      .eq("status", "past_due"),

    // Expiring student verifications
    admin
      .from("student_verifications")
      .select("user_id, expires_at, profiles!inner(full_name, email)")
      .eq("verified", true)
      .gte("expires_at", now.toISOString())
      .lte("expires_at", thirtyDaysFromNow),

    // Inactive active subscribers (no profile update in 30 days)
    admin
      .from("subscriptions")
      .select("user_id, plan, profiles!inner(full_name, email, updated_at)")
      .eq("status", "active")
      .lt("profiles.updated_at", thirtyDaysAgo)
      .limit(50),
  ]);

  const flagged: Array<{
    userId: string;
    name: string;
    email: string;
    badge: string;
    badgeCls: string;
    desc: string;
  }> = [];

  // Past due
  if (pastDueRes.data) {
    for (const row of pastDueRes.data) {
      const profile = row.profiles as unknown as {
        full_name: string | null;
        email: string | null;
      };
      flagged.push({
        userId: row.user_id,
        name: profile.full_name || "Unknown",
        email: profile.email || "",
        badge: "Past Due",
        badgeCls: "bg-red-100 text-red-800",
        desc: `Payment failed — ${row.plan} plan`,
      });
    }
  }

  // Expiring student verifications
  if (expiringRes.data) {
    for (const row of expiringRes.data) {
      const profile = row.profiles as unknown as {
        full_name: string | null;
        email: string | null;
      };
      flagged.push({
        userId: row.user_id,
        name: profile.full_name || "Unknown",
        email: profile.email || "",
        badge: "Expiring",
        badgeCls: "bg-yellow-100 text-yellow-800",
        desc: `Student verification expires ${new Date(row.expires_at).toLocaleDateString()}`,
      });
    }
  }

  // Inactive
  if (inactiveRes.data) {
    for (const row of inactiveRes.data) {
      const profile = row.profiles as unknown as {
        full_name: string | null;
        email: string | null;
        updated_at: string;
      };
      flagged.push({
        userId: row.user_id,
        name: profile.full_name || "Unknown",
        email: profile.email || "",
        badge: "Inactive",
        badgeCls: "bg-gray-100 text-gray-800",
        desc: `No activity since ${new Date(profile.updated_at).toLocaleDateString()}`,
      });
    }
  }

  return NextResponse.json({ flagged });
}
