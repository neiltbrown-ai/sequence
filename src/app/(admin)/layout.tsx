import "./admin.css";
import { PortalShellProvider } from "@/components/portal/portal-shell-context";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopbar from "@/components/admin/topbar";
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
        <AdminTopbar />
        <main className="main">
          <div className="content" style={{ maxWidth: "1200px" }}>
            {children}
          </div>
        </main>
      </div>
    </PortalShellProvider>
  );
}
