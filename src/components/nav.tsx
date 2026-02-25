import Link from "next/link";

export default function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "16px var(--margin)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(245,243,240,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--mono)",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        SEQUENCE
      </Link>

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "var(--mono)",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <Link href="/" style={{ color: "var(--light)", transition: "color 0.2s" }}>
          HOME
        </Link>
        <span style={{ color: "var(--light)" }}>/</span>
        <Link href="/about" style={{ color: "var(--light)", transition: "color 0.2s" }}>
          ABOUT
        </Link>
        <span style={{ color: "var(--light)" }}>/</span>
        <Link href="/resources" style={{ color: "var(--light)", transition: "color 0.2s" }}>
          RESOURCES
        </Link>
        <span style={{ color: "var(--light)" }}>/</span>
        <Link href="/contact" style={{ color: "var(--light)", transition: "color 0.2s" }}>
          CONTACT
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Link
          href="/signup"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--light)",
            transition: "color 0.2s",
          }}
        >
          SIGN UP
        </Link>
        <Link
          href="/login"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "var(--black)",
            color: "var(--white)",
            padding: "8px 14px",
            borderRadius: "4px",
            transition: "opacity 0.2s",
          }}
        >
          LOGIN
        </Link>
      </div>
    </nav>
  );
}
