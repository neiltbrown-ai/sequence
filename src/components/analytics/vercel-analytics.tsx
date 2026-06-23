"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { isAnalyticsOptedOut, syncOptOutFromQuery } from "@/lib/analytics/opt-out";

/**
 * Vercel Web Analytics with a per-browser opt-out.
 *
 * Rendered from the ROOT layout, so it covers every route (including the
 * portal, where PostHog is not mounted). `beforeSend` runs client-side at send
 * time and drops the event when this browser has opted out. We also sync the
 * `?analytics=off|on` query param here on mount so the toggle works site-wide.
 */
export default function VercelAnalytics() {
  useEffect(() => {
    syncOptOutFromQuery(window.location.search);
  }, []);

  return (
    <Analytics beforeSend={(event) => (isAnalyticsOptedOut() ? null : event)} />
  );
}
