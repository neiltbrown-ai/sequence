"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthInput from "@/components/auth/auth-input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSent(true);
  };

  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Member
      </div>

      <div className="auth-card">
        {!sent ? (
          <>
            <h1 className="auth-title">Reset your password</h1>
            <p className="auth-subtitle">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit}>
              <AuthInput
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
                autoComplete="email"
              />

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <div className="auth-footer">
              Remember your password? <Link href="/login">Sign in</Link>
            </div>
          </>
        ) : (
          <div className="auth-success">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="auth-btn" style={{ display: "inline-flex", maxWidth: "200px", margin: "0 auto", textDecoration: "none" }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
