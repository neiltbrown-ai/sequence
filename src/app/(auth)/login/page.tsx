"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SocialButtons from "@/components/auth/social-buttons";
import AuthDivider from "@/components/auth/auth-divider";
import AuthInput from "@/components/auth/auth-input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Member
      </div>

      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to access your deal structures and case studies.
        </p>

        <SocialButtons />
        <AuthDivider />

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <AuthInput
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
            autoComplete="current-password"
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-forgot">
          <Link href="/forgot-password">Forgot your password?</Link>
        </div>

        <div className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Create one</Link>
        </div>
      </div>
    </>
  );
}
