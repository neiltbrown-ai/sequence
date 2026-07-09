import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fixed-window rate limiting backed by Supabase (see migration
 * 00020_rate_limit_counters.sql). Deliberately FAILS OPEN: if the RPC errors or
 * the table/function doesn't exist yet (e.g. code deployed before the migration
 * is applied), the request is allowed. A rate limiter must never take the site
 * down — better to under-enforce than to hard-fail every request.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      // Table/function missing or transient DB error → fail open.
      return { allowed: true };
    }
    return { allowed: data === true };
  } catch {
    return { allowed: true };
  }
}

/**
 * Best-effort client IP for keying anonymous/public rate limits. On Vercel the
 * left-most x-forwarded-for entry is the real client; fall back to x-real-ip.
 * Returns "unknown" when neither is present (all such callers share one bucket).
 */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Standard 429 response with a Retry-After hint (seconds).
 */
export function rateLimitedResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

/**
 * Convenience wrapper: returns a 429 NextResponse when the caller is over the
 * limit, or null when the request may proceed. Fails open (returns null) via
 * checkRateLimit. Usage:
 *
 *   const limited = await enforceRateLimit({ key: `ai:analyze:${user.id}`, limit: 15, windowSeconds: 3600 });
 *   if (limited) return limited;
 */
export async function enforceRateLimit(opts: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<NextResponse | null> {
  const { allowed } = await checkRateLimit(opts.key, opts.limit, opts.windowSeconds);
  return allowed ? null : rateLimitedResponse(opts.windowSeconds);
}
