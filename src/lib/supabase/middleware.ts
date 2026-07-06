import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { FULL_ACCESS_ROUTES, LIBRARY_ROUTES, hasAccess } from "@/lib/plans";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Skip auth checks if Supabase is not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected portal routes — redirect to login if no session
  const portalRoutes = [
    "/dashboard",
    "/library",
    "/guides",
    "/saved",
    "/settings",
    "/advisor",
    "/inventory",
  ];

  const isPortalRoute = portalRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Admin routes — require login + admin role
  const isAdminRoute = pathname.startsWith("/admin");

  if (!user && (isPortalRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Admin role gate — check profile role for /admin routes
  if (user && isAdminRoute) {
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ── Subscription gating (two-tier) ─────────────────
  // Determine which tier is required for this route
  const allGatedRoutes = [...LIBRARY_ROUTES, ...FULL_ACCESS_ROUTES];

  const isGatedRoute = allGatedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // /dashboard is the member home and also requires an active subscription.
  // Without this, a net-new Google-SSO account (a session but no subscription,
  // since OAuth skips checkout) lands on an empty, dead-end dashboard. Any paid
  // tier satisfies it.
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const requiresSubscription = isGatedRoute || isDashboard;

  if (user && requiresSubscription) {
    // Use service role client to bypass RLS for server-side subscription check
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("status, plan")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle();

    if (!subscription) {
      // Authenticated but never subscribed (classically: Google SSO straight
      // from the login page). Send them FORWARD into plan-selection + checkout
      // on their existing session — NOT to /pricing, which routes back through
      // "create account with Google" and produces a perceived infinite loop.
      const url = request.nextUrl.clone();
      url.pathname = "/signup";
      url.search = "";
      url.searchParams.set("checkout", "1");
      return NextResponse.redirect(url);
    }

    // Check if route requires full_access tier
    const needsFullAccess = FULL_ACCESS_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (needsFullAccess && !hasAccess(subscription.plan, "full_access")) {
      // Library-tier user trying to access full_access features
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      url.searchParams.set("reason", "upgrade_required");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
