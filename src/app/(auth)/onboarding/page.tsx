"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProgressDots from "@/components/auth/progress-dots";

const STEP_LABELS = ["Disciplines", "Career Stage", "Interests"];

const DISCIPLINES = [
  "Brand Strategy",
  "Visual Design",
  "Motion Design",
  "Photography",
  "Film / Video",
  "Music Production",
  "Art Direction",
  "UX / Product Design",
  "Illustration",
  "Architecture",
  "Fashion Design",
  "Creative Direction",
  "Copywriting",
  "Sound Design",
  "3D / Spatial Design",
  "Animation",
];

const CAREER_STAGES = [
  { label: "Stage 1 — Building Foundation", desc: "Less than 3 years in your field. Learning the craft." },
  { label: "Stage 2 — Gaining Traction", desc: "3–7 years. Developing a reputation and client base." },
  { label: "Stage 3 — Established Expert", desc: "7–15 years. Known in your field. Selective about work." },
  { label: "Stage 4 — Industry Leader", desc: "15+ years. Shaping the industry. Building legacy." },
];

const INCOME_RANGES = [
  "Under $50K",
  "$50K–$100K",
  "$100K–$150K",
  "$150K–$200K",
  "$200K–$300K",
  "$300K+",
];

const INTERESTS = [
  "Equity & Ownership",
  "Revenue Share",
  "Retainers & Advisory",
  "Licensing & IP",
  "Negotiation Strategy",
  "Pricing & Positioning",
  "Business Formation",
  "Contract Templates",
  "Client Management",
  "Building Teams",
  "Passive Income",
  "Exit Strategy",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [careerStage, setCareerStage] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleDiscipline = (d: string) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const toggleInterest = (i: string) => {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        disciplines,
        career_stage: careerStage,
        income_range: incomeRange,
        interests,
        updated_at: new Date().toISOString(),
      });
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Setup
      </div>

      <div className="auth-card auth-card--wide">
        <ProgressDots steps={3} currentStep={step} labels={STEP_LABELS} />

        {/* STEP 0: Disciplines */}
        {step === 0 && (
          <>
            <h1 className="auth-title">What do you do?</h1>
            <p className="auth-subtitle">
              Select the creative disciplines that describe your work. This helps us recommend relevant structures.
            </p>

            <div className="auth-tag-grid">
              {DISCIPLINES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`auth-tag${disciplines.includes(d) ? " selected" : ""}`}
                  onClick={() => toggleDiscipline(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="auth-btn"
              onClick={() => setStep(1)}
              disabled={disciplines.length === 0}
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 1: Career Stage + Income */}
        {step === 1 && (
          <>
            <h1 className="auth-title">Where are you in your career?</h1>
            <p className="auth-subtitle">
              This helps us match you with the right structures for your level.
            </p>

            <div className="auth-option-group">
              {CAREER_STAGES.map((stage) => (
                <div
                  key={stage.label}
                  className={`auth-option${careerStage === stage.label ? " selected" : ""}`}
                  onClick={() => setCareerStage(stage.label)}
                >
                  <div className="auth-radio-dot" />
                  <div>
                    <div>{stage.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--light)", marginTop: "2px" }}>
                      {stage.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-subsection-label">Annual Income Range</div>
            <div className="auth-option-row">
              {INCOME_RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  className={`auth-option-pill${incomeRange === range ? " selected" : ""}`}
                  onClick={() => setIncomeRange(range)}
                >
                  {range}
                </button>
              ))}
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
                onClick={() => setStep(2)}
                disabled={!careerStage}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Interests */}
        {step === 2 && (
          <>
            <h1 className="auth-title">What interests you most?</h1>
            <p className="auth-subtitle">
              Select the topics you want to focus on. You can change these anytime in settings.
            </p>

            <div className="auth-tag-grid">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`auth-tag${interests.includes(i) ? " selected" : ""}`}
                  onClick={() => toggleInterest(i)}
                >
                  {i}
                </button>
              ))}
            </div>

            <div className="auth-actions">
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
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? "Saving…" : "Complete Setup"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
