import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type"); // Supabase passes type=recovery for password reset

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Detect password recovery flow and redirect to reset-password page
      const isRecovery =
        type === "recovery" ||
        next === "/reset-password" ||
        data.session?.user?.recovery_sent_at;

      let destination = isRecovery ? "/reset-password" : next;

      // A net-new Google-SSO login lands here with a session but no
      // subscription (OAuth skips checkout). Route those users into
      // plan-selection + checkout on their existing session rather than the
      // dead-end dashboard. Recovery flow is exempt.
      if (!isRecovery) {
        const userId = data.session?.user?.id;
        if (userId && !(await hasActiveSubscription(userId))) {
          destination = "/signup?checkout=1";
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`);
      } else {
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
