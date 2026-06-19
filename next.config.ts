import type { NextConfig } from "next";

// PostHog reverse-proxy: routes analytics through our own domain (/ingest) so
// ad-blockers don't drop events. Region-aware — derives the assets host from
// NEXT_PUBLIC_POSTHOG_HOST (us.i.posthog.com → us-assets.i.posthog.com, eu → eu).
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(
  ".i.posthog.com",
  "-assets.i.posthog.com",
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${POSTHOG_HOST}/:path*`,
      },
    ];
  },
  // Required so PostHog's trailing-slash API calls reach the proxy correctly.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
