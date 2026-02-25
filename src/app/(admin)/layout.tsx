export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar placeholder */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "var(--sidebar-w)",
          borderRight: "1px solid var(--border)",
          background: "var(--bg)",
          padding: "28px 0",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
      >
        <div
          style={{
            padding: "0 28px 32px",
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          In Sequence <span style={{ color: "var(--light)" }}>·</span> Admin
        </div>
      </aside>

      {/* Topbar placeholder */}
      <header
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: "var(--sidebar-w)",
          height: "var(--topbar-h)",
          background: "rgba(245,243,240,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          zIndex: 40,
        }}
      />

      {/* Main content — wider for admin */}
      <main
        style={{
          marginLeft: "var(--sidebar-w)",
          paddingTop: "var(--topbar-h)",
          minHeight: "100vh",
          width: "calc(100% - var(--sidebar-w))",
        }}
      >
        <div style={{ maxWidth: "1200px", padding: "40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
