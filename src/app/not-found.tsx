import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
        }}
      >
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(48px, 10vw, 96px)",
              fontWeight: 300,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              margin: "0 0 16px",
            }}
          >
            404
          </h1>

          <p
            style={{
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: 1.4,
              margin: "0 0 8px",
            }}
          >
            This page doesn&apos;t exist yet.
          </p>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "var(--mid)",
              margin: "0 0 36px",
            }}
          >
            Maybe it&apos;s still being structured. In the meantime, the deal structures, case studies, and frameworks are all waiting.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" as const }}>
            <Link
              href="/platform"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                background: "var(--black, #1a1a1a)",
                color: "#fff",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
                borderRadius: "2px",
              }}
            >
              Platform
            </Link>
            <Link
              href="/signup"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                border: "1px solid var(--border, #d9d6d1)",
                color: "var(--black, #1a1a1a)",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
                borderRadius: "2px",
              }}
            >
              Sign Up
            </Link>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                border: "1px solid var(--border, #d9d6d1)",
                color: "var(--black, #1a1a1a)",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
                borderRadius: "2px",
              }}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
