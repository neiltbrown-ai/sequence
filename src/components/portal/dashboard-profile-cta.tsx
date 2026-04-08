"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardProfileCtaProps {
  completedCount: number;
  totalCount: number;
}

const DISMISS_KEY = "seq-profile-cta-dismissed";
const DISMISS_DAYS = 7;

export default function DashboardProfileCta({
  completedCount,
  totalCount,
}: DashboardProfileCtaProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw) {
      const ts = parseInt(raw, 10);
      if (Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }
    setDismissed(false);
  }, []);

  if (dismissed || completedCount >= totalCount) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  return (
    <div className="dash-section rv rv-d1">
      <div className="dash-profile-cta-content">
        <div className="dash-profile-cta-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="dash-profile-cta-title">Personalize your library</span>
        </div>
        <p className="dash-profile-cta-desc">
          Set your discipline and interests so we can surface the structures and case studies most relevant to your work.
        </p>
        <div className="dash-profile-cta-footer">
          <div className="dash-profile-cta-progress">
            <div className="dash-profile-cta-progress-bar">
              <div
                className="dash-profile-cta-progress-fill"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="dash-profile-cta-progress-text">
              {completedCount} of {totalCount} preferences set
            </span>
          </div>
          <div className="dash-profile-cta-actions">
            <Link href="/settings#preferences" className="btn btn--filled">
              Complete Profile
            </Link>
            <button type="button" className="btn" onClick={handleDismiss}>
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
