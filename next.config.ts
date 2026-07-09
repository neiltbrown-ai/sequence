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

// Content-Security-Policy — shipped in REPORT-ONLY mode first. It does not block
// anything yet; violations surface in the browser console so the allowlist can
// be tuned against real page loads (Spline, Stripe, PostHog, Supabase, Vercel)
// before flipping to enforcing. img-src is intentionally broad (`https:`) — case
// studies hotlink 200+ third-party image CDNs. Analytics is same-origin via the
// /ingest proxy above, so connect-src 'self' already covers ingestion.
const cspReportOnly = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval' are required by Next.js inline bootstrap and
  // Spline's wasm runtime. Tighten toward nonces when we move to enforcing.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://prod.spline.design https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.i.posthog.com https://prod.spline.design https://va.vercel-scripts.com",
  "frame-src https://js.stripe.com https://prod.spline.design",
  "media-src 'self' https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
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
