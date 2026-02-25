import Link from "next/link";

export default function EduVerifyPage() {
  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Student
      </div>

      <div className="auth-card">
        <div className="auth-success">
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h1 className="auth-title">Student status verified</h1>
          <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
            Your .edu email has been confirmed. Your student discount is now active.
          </p>
          <Link
            href="/dashboard"
            className="auth-btn"
            style={{ display: "inline-flex", maxWidth: "200px", margin: "0 auto", textDecoration: "none" }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
