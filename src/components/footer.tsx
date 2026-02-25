import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        padding: "80px var(--margin) 40px",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: "var(--gutter)",
        }}
      >
        {/* Logo */}
        <div style={{ gridColumn: "1 / 3" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            In Sequence
          </Link>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "13px",
              color: "var(--light)",
              marginTop: "12px",
              lineHeight: 1.6,
            }}
          >
            Creative deal structures
            <br />
            for creative professionals.
          </p>
        </div>

        {/* Nav links */}
        <div style={{ gridColumn: "5 / 7" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--light)",
              marginBottom: "16px",
            }}
          >
            Navigate
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontFamily: "var(--sans)",
              fontSize: "13px",
              color: "var(--mid)",
            }}
          >
            <Link href="/about">About</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/articles">Articles</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        {/* Legal */}
        <div style={{ gridColumn: "7 / 9" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--light)",
              marginBottom: "16px",
            }}
          >
            Legal
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontFamily: "var(--sans)",
              fontSize: "13px",
              color: "var(--mid)",
            }}
          >
            <Link href="/legal">Terms of Service</Link>
            <Link href="/legal">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          marginTop: "60px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border)",
          fontFamily: "var(--mono)",
          fontSize: "9px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--light)",
        }}
      >
        &copy; {new Date().getFullYear()} In Sequence. All rights reserved.
      </div>
    </footer>
  );
}
