"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { syncOptOutFromQuery } from "@/lib/analytics/opt-out";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

// Manual pageview capture — App Router client-side navigations don't trigger a
// full page load, so we fire $pageview on pathname/search change ourselves.
// Lives behind Suspense because useSearchParams() requires it.
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;
    // Honor the per-browser analytics opt-out (shared with Vercel Analytics).
    // Sync the ?analytics=off|on toggle, then opt the PostHog client in/out.
    if (syncOptOutFromQuery(window.location.search)) {
      posthog.opt_out_capturing();
      return;
    }
    posthog.opt_in_capturing();
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Mounted in the (public) and (auth) layouts only — intentionally NOT the
 * portal. If NEXT_PUBLIC_POSTHOG_KEY is unset, init is skipped and every
 * capture() no-ops, so local/dev and pre-key deploys are unaffected.
 */
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return;
    // Don't pollute the production project with local-dev / test traffic.
    // Preview + production deploys have real hostnames and still track.
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return;
    }
    posthog.init(POSTHOG_KEY, {
      api_host: "/ingest", // same-origin reverse proxy (see next.config.ts)
      ui_host: POSTHOG_HOST, // so dashboard links resolve to the real app
      person_profiles: "identified_only", // don't profile anonymous marketing traffic
      capture_pageview: false, // handled manually by PageViewTracker
      capture_pageleave: true,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
