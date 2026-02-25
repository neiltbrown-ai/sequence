"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SocialButtons from "@/components/auth/social-buttons";
import AuthDivider from "@/components/auth/auth-divider";
import AuthInput from "@/components/auth/auth-input";
import ProgressDots from "@/components/auth/progress-dots";

const STEP_LABELS = ["Create Account", "Verify Student", "Confirmation"];

export default function StudentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyTab, setVerifyTab] = useState<"edu" | "code">("edu");
  const [eduEmail, setEduEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          is_student: true,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(1);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: Verify .edu email or access code against database
    // For now, proceed to confirmation
    setLoading(false);
    setStep(2);
  };

  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Student
      </div>

      <div className="auth-card">
        <ProgressDots steps={3} currentStep={step} labels={STEP_LABELS} />

        {/* STEP 0: Create Account */}
        {step === 0 && (
          <>
            <h1 className="auth-title">Student sign up</h1>
            <p className="auth-subtitle">
              Verified students get discounted access to the full library.
            </p>

            <SocialButtons />
            <AuthDivider />

            <form onSubmit={handleCreateAccount}>
              <div className="auth-field-row">
                <AuthInput
                  label="First Name"
                  name="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
                <AuthInput
                  label="Last Name"
                  name="lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
                required
                autoComplete="new-password"
              />

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Creating account…" : "Continue"}
              </button>
            </form>

            <div className="auth-footer">
              Not a student? <Link href="/signup">Regular sign up</Link>
            </div>
          </>
        )}

        {/* STEP 1: Verify Student */}
        {step === 1 && (
          <>
            <h1 className="auth-title">Verify student status</h1>
            <p className="auth-subtitle">
              Use your .edu email or a university access code.
            </p>

            <div className="auth-tab-bar">
              <button
                className={`auth-tab${verifyTab === "edu" ? " active" : ""}`}
                onClick={() => setVerifyTab("edu")}
              >
                .edu Email
              </button>
              <button
                className={`auth-tab${verifyTab === "code" ? " active" : ""}`}
                onClick={() => setVerifyTab("code")}
              >
                Access Code
              </button>
            </div>

            <form onSubmit={handleVerify}>
              {verifyTab === "edu" ? (
                <AuthInput
                  label="University Email"
                  name="eduEmail"
                  type="email"
                  placeholder="you@university.edu"
                  value={eduEmail}
                  onChange={(e) => setEduEmail(e.target.value)}
                  error={error}
                  required
                />
              ) : (
                <AuthInput
                  label="Access Code"
                  name="accessCode"
                  placeholder="Enter your university code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  error={error}
                  required
                />
              )}

              <div className="auth-actions">
                <button
                  type="button"
                  className="auth-btn auth-btn--outline"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Verifying…" : "Verify"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 2: Confirmation */}
        {step === 2 && (
          <div className="auth-success">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h1 className="auth-title">Student verified</h1>
            <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
              Your student discount has been applied. Let&apos;s set up your profile.
            </p>
            <button
              type="button"
              className="auth-btn"
              style={{ maxWidth: "280px", margin: "0 auto" }}
              onClick={() => router.push("/onboarding")}
            >
              Continue to Setup
            </button>
          </div>
        )}
      </div>
    </>
  );
}
