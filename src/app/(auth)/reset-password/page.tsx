"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthInput from "@/components/auth/auth-input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({
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
        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="New Password"
            name="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <AuthInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error}
            required
            autoComplete="new-password"
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </>
  );
}
