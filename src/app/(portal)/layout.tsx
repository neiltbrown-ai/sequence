import "./portal.css";
import { PortalShellProvider } from "@/components/portal/portal-shell-context";
import PortalSidebar from "@/components/portal/sidebar";
import PortalTopbar from "@/components/portal/topbar";
import RevealProvider from "@/components/reveal-provider";
import CustomCursor from "@/components/cursor";
import ThemeProvider from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/server";
import { planTier, type AccessTier } from "@/lib/plans";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasActiveSubscription = false;
  let accessTier: AccessTier = "library";

  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, plan")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle();
    hasActiveSubscription = !!sub;
    if (sub) {
      accessTier = planTier(sub.plan);
    }
  }

  return (
    <ThemeProvider>
    <PortalShellProvider hasActiveSubscription={hasActiveSubscription} accessTier={accessTier}>
      <CustomCursor />
      <RevealProvider />
      <div className="app">
        <PortalSidebar />
        <PortalTopbar />
        <main className="main">
          <div className="content">{children}</div>
        </main>
      </div>
    </PortalShellProvider>
    </ThemeProvider>
  );
}
