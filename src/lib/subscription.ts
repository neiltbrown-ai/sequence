import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccess, type AccessTier } from "@/lib/plans";

export type ActiveSubscription = { status: string; plan: string | null };

/**
 * Return the caller's active (or trialing) subscription, or null. Uses the
 * service-role client so it works in contexts without an RLS session (API
 * handlers, middleware). Scope the lookup to the given userId only.
 */
export async function getActiveSubscription(
  userId: string
): Promise<ActiveSubscription | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("status, plan")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .maybeSingle();
  return (data as ActiveSubscription | null) ?? null;
}

/**
 * Whether the user holds an active subscription meeting `tier` (default
 * "library" = any paid plan). Entitlement gate for paid pages + API routes —
 * authentication alone is NOT enough (a Google-SSO account exists with no
 * subscription). Returns false when there's no active subscription at all.
 */
export async function hasActiveSubscription(
  userId: string,
  tier: AccessTier = "library"
): Promise<boolean> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return false;
  return hasAccess(sub.plan, tier);
}
