"use client";

import { useState } from "react";

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
  const [name, setName] = useState("Neil Brown");
  const [bio, setBio] = useState(
    "Brand strategist and creative advisor focused on helping creative professionals transition from execution to ownership."
  );
  const [careerStage, setCareerStage] = useState("executive");
  const [incomeRange, setIncomeRange] = useState("150-300k");
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([
    "Design",
    "Marketing",
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Deal Structures",
    "Creative Finance",
    "Negotiation",
    "Equity & Ownership",
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

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

  async function handleSave(
    setter: (v: boolean) => void,
    _section: string
  ) {
    setter(true);
    // TODO: Supabase update
    await new Promise((r) => setTimeout(r, 1000));
    setter(false);
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
        <div className="set-avatar">NB</div>

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
            value="neil@insequence.com"
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
          className="set-btn set-btn--primary"
          disabled={savingProfile}
          onClick={() => handleSave(setSavingProfile, "profile")}
        >
          {savingProfile ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* ═══ PASSWORD ═══ */}
      <div className="set-section rv vis rv-d2">
        <div className="set-section-title">Password</div>

        <div className="set-field">
          <label className="set-label">Current Password</label>
          <input
            type="password"
            className="set-input"
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </div>

        <div className="set-field">
          <label className="set-label">New Password</label>
          <input
            type="password"
            className="set-input"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
        </div>

        <div className="set-field">
          <label className="set-label">Confirm New Password</label>
          <input
            type="password"
            className="set-input"
            placeholder="Re-enter new password"
            autoComplete="new-password"
          />
        </div>

        <button
          type="button"
          className="set-btn set-btn--primary"
          disabled={savingPassword}
          onClick={() => handleSave(setSavingPassword, "password")}
        >
          {savingPassword ? "Saved!" : "Update Password"}
        </button>
      </div>

      {/* ═══ SUBSCRIPTION ═══ */}
      <div className="set-section rv vis rv-d3">
        <div className="set-section-title">Subscription</div>

        <div className="set-plan-card">
          <div className="set-plan-row">
            <span className="set-plan-label">Plan</span>
            <span className="set-plan-value">Annual Membership</span>
          </div>
          <div className="set-plan-row">
            <span className="set-plan-label">Price</span>
            <span className="set-plan-value">$89 / year</span>
          </div>
          <div className="set-plan-row">
            <span className="set-plan-label">Status</span>
            <span className="set-plan-value is-active">Active</span>
          </div>
          <div className="set-plan-row">
            <span className="set-plan-label">Renews</span>
            <span className="set-plan-value">Feb 24, 2027</span>
          </div>
        </div>

        <button type="button" className="set-btn">
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
          className="set-btn set-btn--primary"
          disabled={savingPrefs}
          onClick={() => handleSave(setSavingPrefs, "preferences")}
        >
          {savingPrefs ? "Saved!" : "Update Preferences"}
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
          className="set-btn set-btn--danger"
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
              className="set-btn"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="set-btn set-btn--danger"
              onClick={() => {
                // TODO: Supabase account deletion
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
