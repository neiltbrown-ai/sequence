"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import type { Profile } from "@/types/database";

const DISCIPLINES = [
  "Film", "Music", "Design", "Fashion", "Technology", "Publishing",
  "Sports", "Gaming", "Marketing", "Architecture", "Food & Beverage", "Other",
];

const INTERESTS = [
  "Deal Structures", "Revenue Models", "IP Valuation", "Catalog Strategy",
  "Creative Finance", "Negotiation", "Equity & Ownership", "Licensing",
  "Career Transition", "Starting a Business",
];

const CAREER_STAGES = [
  { value: "student", label: "Student" },
  { value: "early-career", label: "Early Career" },
  { value: "mid-career", label: "Mid Career" },
  { value: "executive", label: "Executive" },
  { value: "founder", label: "Founder / Entrepreneur" },
  { value: "investor", label: "Investor" },
];

const INCOME_RANGES = [
  { value: "under-50k", label: "<$50K" },
  { value: "50-75k", label: "$50–75K" },
  { value: "75-150k", label: "$75–150K" },
  { value: "150-300k", label: "$150–300K" },
  { value: "300-500k", label: "$300–500K" },
  { value: "500k-plus", label: "$500K+" },
];

export default function SettingsForm() {
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [careerStage, setCareerStage] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Subscription state
  const [subPlan, setSubPlan] = useState("—");
  const [subPrice, setSubPrice] = useState("—");
  const [subStatus, setSubStatus] = useState("—");
  const [subRenews, setSubRenews] = useState("—");

  // UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile + subscription on mount
  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        const p = profile as Profile;
        setName(p.full_name || "");
        setBio(p.bio || "");
        setCareerStage(p.career_stage || "");
        setIncomeRange(p.income_range || "");
        setSelectedDisciplines(p.disciplines || []);
        setSelectedInterests(p.interests || []);
      }

      // Load subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sub) {
        const planLabels: Record<string, string> = {
          library: "Library",
          full_access: "Full Access",
          coaching: "1:1 Coaching",
          annual: "Full Access (Legacy)",
          student: "Student",
        };
        setSubPlan(planLabels[sub.plan] || sub.plan);
        const priceLabels: Record<string, string> = {
          library: "$12 / year",
          full_access: "$19 / month or $190 / year",
          coaching: "$5,000 / month",
          annual: "$89 / year (legacy)",
          student: "Free",
        };
        setSubPrice(priceLabels[sub.plan] || "—");
        setSubStatus(sub.status);
        if (sub.current_period_end) {
          setSubRenews(
            new Date(sub.current_period_end).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          );
        }
      }

      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleDiscipline(d: string) {
    setSelectedDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function toggleInterest(i: string) {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    setSavedProfile(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        full_name: name,
        bio,
        career_stage: careerStage || null,
        income_range: incomeRange || null,
      })
      .eq("id", user.id);

    setSavingProfile(false);
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
  }

  async function handleSavePrefs() {
    setSavingPrefs(true);
    setSavedPrefs(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        disciplines: selectedDisciplines,
        interests: selectedInterests,
      })
      .eq("id", user.id);

    setSavingPrefs(false);
    setSavedPrefs(true);
    setTimeout(() => setSavedPrefs(false), 2000);
  }

  async function handleUpdatePassword() {
    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess(false);

    const newPw = (
      document.querySelector('input[name="new-password"]') as HTMLInputElement
    )?.value;
    const confirmPw = (
      document.querySelector(
        'input[name="confirm-password"]'
      ) as HTMLInputElement
    )?.value;

    if (!newPw || newPw.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setSavingPassword(false);
      return;
    }

    if (newPw !== confirmPw) {
      setPasswordError("Passwords do not match");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 2000);
    }

    setSavingPassword(false);
  }

  async function handleManageStripe() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  if (loading) {
    return (
      <div className="set-header rv vis">
        <h1 className="set-title">Settings</h1>
        <p className="set-subtitle">Loading…</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="set-header rv vis">
        <h1 className="set-title">Settings</h1>
        <p className="set-subtitle">
          Manage your account, subscription, and preferences.
        </p>
      </div>

      {/* ═══ PROFILE ═══ */}
      <div
        className="set-section rv vis rv-d1"
        style={{ borderTop: "none", paddingTop: 0 }}
      >
        <div className="set-section-title">Profile</div>
        <div className="set-avatar">
          {name
            ? name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "—"}
        </div>

        <div className="set-field">
          <label className="set-label">Full Name</label>
          <input
            type="text"
            className="set-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="set-field">
          <label className="set-label">Email</label>
          <input
            type="email"
            className="set-input"
            value={email}
            readOnly
          />
        </div>

        <div className="set-field">
          <label className="set-label">Bio</label>
          <textarea
            className="set-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself..."
          />
        </div>

        <div className="set-field">
          <label className="set-label">Discipline</label>
          <div
            className="set-input"
            style={{ color: "var(--mid)", cursor: "default" }}
          >
            {selectedDisciplines.join(", ") || "None selected"}
          </div>
        </div>

        <div className="set-field" style={{ maxWidth: 480 }}>
          <label className="set-label">Career Stage</label>
          <div className="set-option-group">
            {CAREER_STAGES.map((opt) => (
              <div
                key={opt.value}
                className={`set-option${careerStage === opt.value ? " selected" : ""}`}
                onClick={() => setCareerStage(opt.value)}
              >
                <div className="set-radio-dot" />
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        <div className="set-field" style={{ maxWidth: 480 }}>
          <label className="set-label">Income Range</label>
          <div className="set-option-row">
            {INCOME_RANGES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`set-option-pill${incomeRange === opt.value ? " selected" : ""}`}
                onClick={() => setIncomeRange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn--filled"
          disabled={savingProfile}
          onClick={handleSaveProfile}
        >
          {savedProfile ? "Saved!" : savingProfile ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ═══ PASSWORD ═══ */}
      <div className="set-section rv vis rv-d2">
        <div className="set-section-title">Password</div>

        <div className="set-field">
          <label className="set-label">New Password</label>
          <input
            type="password"
            name="new-password"
            className="set-input"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
        </div>

        <div className="set-field">
          <label className="set-label">Confirm New Password</label>
          <input
            type="password"
            name="confirm-password"
            className="set-input"
            placeholder="Re-enter new password"
            autoComplete="new-password"
          />
        </div>

        {passwordError && (
          <p style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "#c0392b", marginBottom: "12px" }}>
            {passwordError}
          </p>
        )}

        <button
          type="button"
          className="btn btn--filled"
          disabled={savingPassword}
          onClick={handleUpdatePassword}
        >
          {passwordSuccess
            ? "Updated!"
            : savingPassword
              ? "Updating…"
              : "Update Password"}
        </button>
      </div>

      {/* ═══ SUBSCRIPTION ═══ */}
      <div className="set-section rv vis rv-d3">
        <div className="set-section-title">Subscription</div>

        <div className="set-plan-card">
          <div className="set-plan-row">
            <span className="set-plan-label">Plan</span>
            <span className="set-plan-value">{subPlan}</span>
          </div>
          <div className="set-plan-row">
            <span className="set-plan-label">Price</span>
            <span className="set-plan-value">{subPrice}</span>
          </div>
          <div className="set-plan-row">
            <span className="set-plan-label">Status</span>
            <span
              className={`set-plan-value${subStatus === "active" ? " is-active" : ""}`}
            >
              {subStatus === "active"
                ? "Active"
                : subStatus === "past_due"
                  ? "Past Due"
                  : subStatus === "canceled"
                    ? "Canceled"
                    : subStatus === "trialing"
                      ? "Trial"
                      : subStatus}
            </span>
          </div>
          <div className="set-plan-row">
            <span className="set-plan-label">Renews</span>
            <span className="set-plan-value">{subRenews}</span>
          </div>
        </div>

        <button type="button" className="btn" onClick={handleManageStripe}>
          Manage on Stripe
        </button>
      </div>

      {/* ═══ PREFERENCES ═══ */}
      <div className="set-section rv vis rv-d4">
        <div className="set-section-title">Preferences</div>
        <p className="set-pref-desc">
          Your content recommendations are based on these selections.
        </p>

        <div className="set-pref-label">Discipline</div>
        <div className="set-tag-grid">
          {DISCIPLINES.map((d) => (
            <button
              key={d}
              type="button"
              className={`set-tag${selectedDisciplines.includes(d) ? " selected" : ""}`}
              onClick={() => toggleDiscipline(d)}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="set-pref-label">Interests</div>
        <div className="set-tag-grid">
          {INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              className={`set-tag${selectedInterests.includes(i) ? " selected" : ""}`}
              onClick={() => toggleInterest(i)}
            >
              {i}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn--filled"
          disabled={savingPrefs}
          onClick={handleSavePrefs}
        >
          {savedPrefs ? "Saved!" : savingPrefs ? "Saving…" : "Update Preferences"}
        </button>
      </div>

      {/* ═══ APPEARANCE ═══ */}
      <div className="set-section rv vis rv-d5">
        <div className="set-section-title">Appearance</div>
        <p className="set-pref-desc">
          Choose between light and dark mode for the portal interface.
        </p>
        <div className="set-theme-row">
          <button
            type="button"
            className={`set-theme-btn${theme === "light" ? " selected" : ""}`}
            onClick={() => setTheme("light")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Light
          </button>
          <button
            type="button"
            className={`set-theme-btn${theme === "dark" ? " selected" : ""}`}
            onClick={() => setTheme("dark")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            Dark
          </button>
        </div>
      </div>

      {/* ═══ LOG OUT ═══ */}
      <div className="set-section rv vis rv-d5">
        <div className="set-section-title">Session</div>
        <p className="set-pref-desc">
          Sign out of your account on this device.
        </p>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
        >
          Log Out
        </button>
      </div>

      {/* ═══ DANGER ZONE ═══ */}
      <div className="set-section set-danger rv vis rv-d5">
        <div className="set-section-title">Danger Zone</div>
        <p className="set-danger-desc">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>

      <div className="set-footer" />

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      <div
        className={`set-confirm-overlay${showDeleteModal ? " active" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowDeleteModal(false);
        }}
      >
        <div className="set-confirm-modal">
          <div className="set-confirm-title">Delete your account?</div>
          <div className="set-confirm-desc">
            This action is permanent and cannot be undone. All your data, saved
            items, and subscription will be removed.
          </div>
          <div className="set-confirm-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                // TODO: Server action for account deletion (requires admin client)
                setShowDeleteModal(false);
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
