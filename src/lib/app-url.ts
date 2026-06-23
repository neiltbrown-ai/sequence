/**
 * Resolve the base URL of the current deployment.
 *
 * Used for Stripe redirect URLs, the customer-portal return URL, email links,
 * and OG/canonical metadata — all of which must point back to the SAME
 * environment the request is running in.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_APP_URL — set on Production only, to https://www.insequence.so
 *   2. https://${VERCEL_URL} — per-deployment URL on Preview, so redirects +
 *      links stay on the preview deploy instead of bouncing to production
 *   3. http://localhost:3000 — local development
 *
 * Server-side only: VERCEL_URL is not exposed to the client bundle.
 */
export function getAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}
