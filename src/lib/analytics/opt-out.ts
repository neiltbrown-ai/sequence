/**
 * Client-side analytics opt-out.
 *
 * Lets an individual browser exclude itself from BOTH Vercel Web Analytics and
 * PostHog without resorting to a firewall IP block (which 403s the whole site).
 *
 * Toggle by visiting any page with a query param — the flag then persists in
 * localStorage across navigations and reloads on that device:
 *   ?analytics=off   → opt this browser out
 *   ?analytics=on    → opt back in
 *
 * Consumed by:
 *   - src/components/analytics/vercel-analytics.tsx  (Vercel `beforeSend`)
 *   - src/components/analytics/posthog-provider.tsx  (posthog opt_in/out_capturing)
 */

export const ANALYTICS_OPT_OUT_KEY = "seq-analytics-opt-out";

/** True if this browser has opted out of analytics. SSR-safe (returns false). */
export function isAnalyticsOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Apply a `?analytics=off|on` query param to the persisted flag, if present.
 * Returns the resulting opt-out state. No-ops (and reads existing state) when
 * the param is absent. SSR-safe.
 */
export function syncOptOutFromQuery(search: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const value = new URLSearchParams(search).get("analytics");
    if (value === "off") {
      if (!isAnalyticsOptedOut()) {
        window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1");
        console.info("[analytics] opted out on this device");
      }
    } else if (value === "on") {
      if (isAnalyticsOptedOut()) {
        window.localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
        console.info("[analytics] opted back in on this device");
      }
    }
    return isAnalyticsOptedOut();
  } catch {
    return false;
  }
}
