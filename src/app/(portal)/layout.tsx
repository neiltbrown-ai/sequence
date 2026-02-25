import { PortalShellProvider } from "@/components/portal/portal-shell-context";
import PortalSidebar from "@/components/portal/sidebar";
import PortalTopbar from "@/components/portal/topbar";
import RevealProvider from "@/components/reveal-provider";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShellProvider>
      <RevealProvider />
      <div className="app">
        <PortalSidebar />
        <PortalTopbar />
        <main className="main">
          <div className="content">{children}</div>
        </main>
      </div>
    </PortalShellProvider>
  );
}
