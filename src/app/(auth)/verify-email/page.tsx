import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Member
      </div>

      <div className="auth-card">
        <div className="auth-success">
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
            We sent you a verification link. Click it to confirm your account and get started.
          </p>
          <Link
            href="/login"
            className="auth-btn"
            style={{ display: "inline-flex", maxWidth: "200px", margin: "0 auto", textDecoration: "none" }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    </>
  );
}
