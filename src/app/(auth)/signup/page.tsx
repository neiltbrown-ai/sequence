"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SocialButtons from "@/components/auth/social-buttons";
import AuthDivider from "@/components/auth/auth-divider";
import AuthInput from "@/components/auth/auth-input";
import ProgressDots from "@/components/auth/progress-dots";

const STEP_LABELS = ["Create Account", "Select Plan", "Payment", "Confirmation"];

type SelectedPlan = "library" | "full_access";
type Billing = "monthly" | "annual";

const PLAN_DETAILS: Record<SelectedPlan, { label: string; features: string[] }> = {
  library: {
    label: "Library",
    features: [
      "35+ deal structures with negotiation scripts",
      "70+ case studies across creative industries",
      "Decision frameworks and strategic roadmaps",
      "Weekly new content and library updates",
      "Save and organize content in your library",
    ],
  },
  full_access: {
    label: "Full Access",
    features: [
      "Everything in Library",
      "AI Strategic Advisor — personalized guidance",
      "Deal Evaluator — score and analyze any deal",
      "Career Assessment with custom roadmap",
      "Asset Inventory tracking and valuation",
    ],
  },
};

function getPriceDisplay(plan: SelectedPlan, billing: Billing): string {
  if (plan === "library") return "$12.00";
  return billing === "monthly" ? "$19.00" : "$190.00";
}

function getPriceLabel(plan: SelectedPlan, billing: Billing): string {
  if (plan === "library") return "$12 / year";
  return billing === "monthly" ? "$19 / month" : "$190 / year";
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Determine initial step from URL (e.g. returning from Stripe checkout)
  const stepParam = searchParams.get("step");
  const sessionId = searchParams.get("session_id");
  const initialStep = stepParam === "confirmation" && sessionId ? 3 : 0;

  const [step, setStep] = useState(initialStep);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Plan selection state
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>("full_access");
  const [billing, setBilling] = useState<Billing>("monthly");

  // Pre-select plan from URL param — skip plan step if already chosen
  const planFromUrl = searchParams.get("plan");
  useEffect(() => {
    if (planFromUrl === "library") setSelectedPlan("library");
    if (planFromUrl === "full_access") setSelectedPlan("full_access");
  }, [planFromUrl]);

  // Store user ID from signUp response (session may not exist if email confirmation is on)
  const [signupUserId, setSignupUserId] = useState<string | null>(null);

  // Discount code state
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [codeApplied, setCodeApplied] = useState(false);
  const [codeResult, setCodeResult] = useState<{
    code_id: string;
    is_full_discount: boolean;
    plan_granted: string | null;
    description: string | null;
  } | null>(null);
  const [codeError, setCodeError] = useState("");

  // On confirmation step, verify the Stripe session to provision subscription
  // (fallback for when webhooks can't reach the server, e.g. localhost)
  useEffect(() => {
    if (step === 3 && sessionId) {
      fetch("/api/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {
        // Silent — webhook may have already handled it
      });
    }
  }, [step, sessionId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
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

    if (data.user) setSignupUserId(data.user.id);

    setLoading(false);
    // Always show plan selection (step 1) so user can choose billing cycle
    setStep(1);
  };

  const handleSelectPlan = () => {
    setStep(2);
  };

  const handleApplyCode = async () => {
    setCodeError("");
    if (!discountCode.trim()) return;

    try {
      const res = await fetch("/api/codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode.trim(), type: "discount" }),
      });
      const data = await res.json();

      if (!data.valid) {
        setCodeError(data.error || "Invalid code");
        setCodeApplied(false);
        setCodeResult(null);
        return;
      }

      setCodeApplied(true);
      setCodeResult(data);
      setCodeError("");
    } catch {
      setCodeError("Failed to validate code");
    }
  };

  const handleRemoveCode = () => {
    setCodeApplied(false);
    setCodeResult(null);
    setDiscountCode("");
    setCodeError("");
  };

  const handleRedeemCode = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.trim(),
          signupUserId: signupUserId || undefined,
          signupEmail: email || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Redemption failed");
      }

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          billing: selectedPlan === "library" ? "annual" : billing,
          // Pass signup context for unauthenticated checkout (email confirmation pending)
          signupUserId: signupUserId || undefined,
          signupEmail: email || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setStep(3);
          return;
        }
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
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
              Pick the level of access that works for you.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              {/* Library card */}
              <button
                type="button"
                className={`auth-plan-card${selectedPlan === "library" ? " auth-plan-card--selected" : ""}`}
                onClick={() => setSelectedPlan("library")}
              >
                <div>
                  <div className="auth-plan-name">Library</div>
                  <div style={{ marginTop: "4px" }}>
                    <span className="auth-plan-price">$12</span>
                    <span className="auth-plan-period"> / year</span>
                  </div>
                </div>
                <ul className="auth-plan-features">
                  {PLAN_DETAILS.library.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </button>

              {/* Full Access card */}
              <button
                type="button"
                className={`auth-plan-card${selectedPlan === "full_access" ? " auth-plan-card--selected" : ""}`}
                onClick={() => setSelectedPlan("full_access")}
              >
                <div>
                  <div className="auth-plan-name">
                    Full Access
                    <span style={{ marginLeft: "8px", fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mid)", background: "var(--bg)", borderRadius: "100px", padding: "3px 10px", verticalAlign: "middle" }}>
                      Most Popular
                    </span>
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <span className="auth-plan-price">{billing === "monthly" ? "$19" : "$190"}</span>
                    <span className="auth-plan-period"> / {billing === "monthly" ? "month" : "year"}</span>
                  </div>
                </div>
                {selectedPlan === "full_access" && (
                  <div style={{ display: "flex", gap: "8px", margin: "8px 0 4px" }}>
                    <button
                      type="button"
                      className={`auth-billing-btn${billing === "monthly" ? " auth-billing-btn--active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setBilling("monthly"); }}
                    >
                      Monthly — $19/mo
                    </button>
                    <button
                      type="button"
                      className={`auth-billing-btn${billing === "annual" ? " auth-billing-btn--active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setBilling("annual"); }}
                    >
                      Annual — $190/yr (save $38)
                    </button>
                  </div>
                )}
                <ul className="auth-plan-features">
                  {PLAN_DETAILS.full_access.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </button>
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
              {codeApplied && codeResult?.is_full_discount
                ? "Your code has been applied."
                : "Secure checkout powered by Stripe."}
            </p>

            {!(codeApplied && codeResult?.is_full_discount) && (
              <div className="auth-stripe-badge">
                <svg viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Secured by Stripe
              </div>
            )}

            {!(codeApplied && codeResult?.is_full_discount) && (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)" }}>
                  You&apos;ll be redirected to Stripe&apos;s secure checkout to complete payment.
                </p>
              </div>
            )}

            {/* Discount code input */}
            <div style={{ marginBottom: "16px" }}>
              {!showCodeInput && !codeApplied && (
                <button
                  type="button"
                  onClick={() => setShowCodeInput(true)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".08em",
                    textTransform: "uppercase", color: "var(--mid)", textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Have a discount code?
                </button>
              )}
              {showCodeInput && !codeApplied && (
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter code"
                      className="set-input"
                      style={{ fontFamily: "var(--mono)", fontSize: "13px", letterSpacing: ".05em", textTransform: "uppercase" }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleApplyCode(); }}
                    />
                  </div>
                  <button
                    type="button"
                    className="auth-btn"
                    style={{ padding: "10px 20px", whiteSpace: "nowrap" }}
                    onClick={handleApplyCode}
                  >
                    Apply
                  </button>
                </div>
              )}
              {codeError && (
                <p style={{ fontFamily: "var(--sans)", fontSize: "12px", color: "#c0392b", marginTop: "6px" }}>
                  {codeError}
                </p>
              )}
              {codeApplied && codeResult && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: "rgba(0,128,0,0.04)", border: "1px solid rgba(0,128,0,0.15)",
                  borderRadius: "4px",
                }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: ".06em", color: "#2d6a2e" }}>
                    ✓ Code applied — {codeResult.is_full_discount ? "Full Access (Free)" : codeResult.description}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCode}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "var(--sans)", fontSize: "12px", color: "var(--mid)", textDecoration: "underline",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {error && (
              <p style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "#c0392b", textAlign: "center", marginBottom: "16px" }}>
                {error}
              </p>
            )}

            <div className="auth-order-summary">
              <span>
                {codeApplied && codeResult?.is_full_discount
                  ? "Full Access — Free"
                  : `${PLAN_DETAILS[selectedPlan].label} — ${getPriceLabel(selectedPlan, billing)}`}
              </span>
              <span className="auth-order-total">
                {codeApplied && codeResult?.is_full_discount ? "$0.00" : getPriceDisplay(selectedPlan, billing)}
              </span>
            </div>

            <div className="auth-actions" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="auth-btn auth-btn--outline"
                onClick={() => { setStep(1); handleRemoveCode(); }}
              >
                Back
              </button>
              {codeApplied && codeResult?.is_full_discount ? (
                <button
                  type="button"
                  className="auth-btn"
                  onClick={handleRedeemCode}
                  disabled={loading}
                >
                  {loading ? "Activating…" : "Activate Membership"}
                </button>
              ) : (
                <button
                  type="button"
                  className="auth-btn"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Redirecting to checkout…" : "Complete Purchase"}
                </button>
              )}
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
            <p className="auth-subtitle" style={{ marginBottom: "12px" }}>
              Your account is ready. Check your email for a verification link to activate your account.
            </p>
            <p className="auth-subtitle" style={{ marginBottom: "24px", fontSize: "13px" }}>
              Once verified, sign in to start exploring.
            </p>
            <button
              type="button"
              className="auth-btn"
              style={{ maxWidth: "280px", margin: "0 auto" }}
              onClick={() => router.push("/login")}
            >
              Continue to Login
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
            Student? Get verified for free library access →
          </Link>
        </div>
      )}
    </>
  );
}
