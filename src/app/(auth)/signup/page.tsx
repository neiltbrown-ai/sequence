"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SocialButtons from "@/components/auth/social-buttons";
import AuthDivider from "@/components/auth/auth-divider";
import AuthInput from "@/components/auth/auth-input";
import ProgressDots from "@/components/auth/progress-dots";

const STEP_LABELS = ["Create Account", "Select Plan", "Payment", "Confirmation"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSelectPlan = () => {
    setStep(2);
  };

  const handlePayment = () => {
    // Stripe integration deferred — skip to confirmation
    setStep(3);
  };

  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Member
      </div>

      <div className={`auth-card${step >= 1 ? " auth-card--wide" : ""}`}>
        <ProgressDots steps={4} currentStep={step} labels={STEP_LABELS} />

        {/* STEP 0: Create Account */}
        {step === 0 && (
          <>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">
              Start building leverage in your creative career.
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
              Already have an account? <Link href="/login">Sign in</Link>
            </div>
          </>
        )}

        {/* STEP 1: Select Plan */}
        {step === 1 && (
          <>
            <h1 className="auth-title">Choose your plan</h1>
            <p className="auth-subtitle">
              Full access to every structure, case study, and guide.
            </p>

            <div className="auth-plan-card">
              <div className="auth-plan-name">Annual Membership</div>
              <div>
                <span className="auth-plan-price">$89</span>
                <span className="auth-plan-period"> / year</span>
              </div>
              <ul className="auth-plan-features">
                <li>35+ deal structures with implementation guides</li>
                <li>Real case studies across creative disciplines</li>
                <li>Practical guides for negotiation and positioning</li>
                <li>New structures and cases added monthly</li>
                <li>Cancel anytime — no long-term commitment</li>
              </ul>
            </div>

            <div className="auth-actions">
              <button
                type="button"
                className="auth-btn auth-btn--outline"
                onClick={() => setStep(0)}
              >
                Back
              </button>
              <button
                type="button"
                className="auth-btn"
                onClick={handleSelectPlan}
              >
                Continue to Payment
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Payment */}
        {step === 2 && (
          <>
            <h1 className="auth-title">Payment details</h1>
            <p className="auth-subtitle">
              Secure checkout powered by Stripe.
            </p>

            <div className="auth-stripe-badge">
              <svg viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Secured by Stripe
            </div>

            {/* Stripe Elements placeholder */}
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)" }}>
                Stripe checkout will be activated once API keys are configured.
              </p>
            </div>

            <div className="auth-order-summary">
              <span>Annual Membership</span>
              <span className="auth-order-total">$89.00</span>
            </div>

            <div className="auth-actions" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="auth-btn auth-btn--outline"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="auth-btn"
                onClick={handlePayment}
              >
                Complete Purchase
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="auth-success">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h1 className="auth-title">Welcome to In Sequence</h1>
            <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
              Your account is ready. Let&apos;s personalize your experience.
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

      {step === 0 && (
        <div style={{ marginTop: "16px" }}>
          <Link
            href="/student-signup"
            className="auth-link"
            style={{ fontSize: "13px" }}
          >
            Student? Get verified for a discount →
          </Link>
        </div>
      )}
    </>
  );
}
