import { PortalShellProvider } from "@/components/portal/portal-shell-context";
import AdminSidebar from "@/components/admin/sidebar";
import PortalTopbar from "@/components/portal/topbar";
import RevealProvider from "@/components/reveal-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShellProvider>
      <RevealProvider />
      <div className="app">
        <AdminSidebar />
        <PortalTopbar />
        <main className="main">
          <div className="content" style={{ maxWidth: "1200px" }}>
            {children}
          </div>
        </main>
      </div>
    </PortalShellProvider>
  );
}
