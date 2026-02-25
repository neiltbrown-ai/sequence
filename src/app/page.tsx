export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "var(--bg)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "40px",
        }}
      >
        IN SEQUENCE
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "var(--sans)",
          fontWeight: 300,
          fontSize: "clamp(48px, 8vw, 100px)",
          letterSpacing: "-0.05em",
          lineHeight: 0.9,
          textAlign: "center",
          maxWidth: "800px",
          marginBottom: "24px",
        }}
      >
        Design system
        <br />
        verified.
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "var(--sans)",
          fontSize: "15px",
          color: "var(--mid)",
          lineHeight: 1.7,
          textAlign: "center",
          maxWidth: "480px",
          marginBottom: "32px",
        }}
      >
        Fonts, colors, and CSS variables are working correctly.
        This page will be replaced with the landing page.
      </p>

      {/* Token checks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {[
          { label: "BG", value: "#f5f3f0", color: "var(--bg)" },
          { label: "BLACK", value: "#1a1a1a", color: "var(--black)" },
          { label: "MID", value: "#555", color: "var(--mid)" },
          { label: "LIGHT", value: "#999", color: "var(--light)" },
          { label: "BORDER", value: "#d9d6d1", color: "var(--border)" },
          { label: "WHITE", value: "#fff", color: "var(--white)" },
        ].map((token) => (
          <div
            key={token.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              background: "var(--white)",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "2px",
                background: token.color,
                border: "1px solid var(--border)",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--light)",
                }}
              >
                {token.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "var(--black)",
                }}
              >
                {token.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button test */}
      <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
        <button className="btn">
          Geist Sans
          <span className="btn-arrow">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--light)",
            display: "flex",
            alignItems: "center",
          }}
        >
          PT Mono
        </span>
      </div>
    </div>
  );
}
