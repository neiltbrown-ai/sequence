import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

interface ActivityItem {
  type: "signup" | "cancel" | "alert" | "assessment";
  text: string;
  time: string;
  userId?: string;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const [signupsRes, cancelsRes, failedPaymentsRes, assessmentsRes, failedEmailsRes] =
    await Promise.all([
      // Recent signups
      admin
        .from("subscriptions")
        .select("user_id, plan, created_at, profiles!inner(full_name)")
        .order("created_at", { ascending: false })
        .limit(10),

      // Recent cancellations
      admin
        .from("subscriptions")
        .select("user_id, plan, updated_at, profiles!inner(full_name)")
        .eq("status", "canceled")
        .order("updated_at", { ascending: false })
        .limit(10),

      // Failed payments from email_log
      admin
        .from("email_log")
        .select("user_id, recipient_email, sent_at")
        .eq("email_type", "payment_failed")
        .order("sent_at", { ascending: false })
        .limit(10),

      // Assessment completions
      admin
        .from("assessments")
        .select("user_id, completed_at, profiles!inner(full_name)")
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(10),

      // Failed emails
      admin
        .from("email_log")
        .select("user_id, recipient_email, email_type, sent_at")
        .eq("status", "failed")
        .order("sent_at", { ascending: false })
        .limit(10),
    ]);

  const items: ActivityItem[] = [];

  // Signups
  if (signupsRes.data) {
    for (const s of signupsRes.data) {
      const profile = s.profiles as unknown as { full_name: string | null };
      const name = profile?.full_name || "Unknown";
      const planLabel =
        s.plan === "library"
          ? "Library"
          : s.plan === "full_access"
            ? "Full Access"
            : s.plan || "Unknown";
      items.push({
        type: "signup",
        text: `<strong>${name}</strong> signed up — ${planLabel} plan`,
        time: s.created_at,
        userId: s.user_id,
      });
    }
  }

  // Cancellations
  if (cancelsRes.data) {
    for (const c of cancelsRes.data) {
      const profile = c.profiles as unknown as { full_name: string | null };
      const name = profile?.full_name || "Unknown";
      items.push({
        type: "cancel",
        text: `<strong>${name}</strong> canceled their subscription`,
        time: c.updated_at,
        userId: c.user_id,
      });
    }
  }

  // Failed payments
  if (failedPaymentsRes.data) {
    for (const f of failedPaymentsRes.data) {
      items.push({
        type: "alert",
        text: `Payment failed for <strong>${f.recipient_email}</strong>`,
        time: f.sent_at,
        userId: f.user_id ?? undefined,
      });
    }
  }

  // Assessment completions
  if (assessmentsRes.data) {
    for (const a of assessmentsRes.data) {
      const profile = a.profiles as unknown as { full_name: string | null };
      const name = profile?.full_name || "Unknown";
      items.push({
        type: "assessment",
        text: `<strong>${name}</strong> completed their assessment`,
        time: a.completed_at!,
        userId: a.user_id,
      });
    }
  }

  // Failed emails
  if (failedEmailsRes.data) {
    for (const e of failedEmailsRes.data) {
      items.push({
        type: "alert",
        text: `Email delivery failed: ${e.email_type} to <strong>${e.recipient_email}</strong>`,
        time: e.sent_at,
        userId: e.user_id ?? undefined,
      });
    }
  }

  // Sort by time descending, return top 20
  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return NextResponse.json(items.slice(0, 20));
}
