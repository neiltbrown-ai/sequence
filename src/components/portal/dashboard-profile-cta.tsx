"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardProfileCtaProps {
  /**
   * True when the member has completed their Creative Identity
   * assessment. When true, the CTA is hidden — they've already
   * done this step.
   */
  creativeIdentityComplete: boolean;
}

const DISMISS_KEY = "seq-profile-cta-dismissed";
const DISMISS_DAYS = 7;

export default function DashboardProfileCta({
  creativeIdentityComplete,
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

  if (dismissed || creativeIdentityComplete) return null;

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
          <span className="dash-profile-cta-title">Define your Creative Identity</span>
        </div>
        <p className="dash-profile-cta-desc">
          An 8–10 minute guided flow captures your discipline, creative
          mode, stage, and ambitions. It tunes every recommendation across
          the platform — your roadmap, deal evaluations, and advisor
          guidance — so you get advice built around your actual situation.
        </p>
        <div className="dash-profile-cta-footer">
          <div className="dash-profile-cta-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>~8–10 minutes</span>
          </div>
          <div className="dash-profile-cta-actions">
            <Link href="/assessment" className="btn btn--filled">
              Start Creative Identity
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
