"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Static member data (will be replaced with Supabase query) ── */
const MEMBER = {
  initials: "SC",
  name: "Sarah Chen",
  email: "sarah@designstudio.co",
  status: "active",
  statusLabel: "Active",
  plan: "Individual Plan",
};

const ACCOUNT_DETAILS = [
  { label: "Email", value: "sarah@designstudio.co" },
  { label: "Discipline", value: "Design" },
  { label: "Career Stage", value: "Stage 2" },
  { label: "Income Level", value: "$75K–$150K" },
  { label: "Signup Date", value: "Feb 20, 2026" },
  { label: "Last Login", value: "Today, 2:34 PM" },
];

const SUBSCRIPTION_DETAILS = [
  { label: "Plan", value: "Individual ($89/yr)" },
  { label: "Status", value: "Active", active: true },
  { label: "Billing Period", value: "Annual" },
  { label: "Next Renewal", value: "Feb 20, 2027" },
  { label: "Total Paid", value: "$89.00" },
  { label: "Stripe ID", value: "cus_Qx8f2kL9...", link: true },
];

const EMAIL_LOG = [
  { type: "Welcome", subject: "Welcome to In Sequence", date: "Feb 20, 2026", status: "Delivered · Opened", opened: true },
  { type: "Verification", subject: "Verify your email address", date: "Feb 20, 2026", status: "Delivered · Opened", opened: true },
  { type: "Receipt", subject: "Payment receipt — $89.00", date: "Feb 20, 2026", status: "Delivered · Opened", opened: true },
  { type: "Onboarding", subject: "Getting started with your library", date: "Feb 21, 2026", status: "Delivered · Opened", opened: true },
  { type: "Content", subject: "New this week: 3 structures added", date: "Feb 24, 2026", status: "Delivered", opened: false },
  { type: "Content", subject: "Featured: Why the Middle Is Getting Squeezed", date: "Feb 18, 2026", status: "Delivered · Opened", opened: true },
];

const NOTES = [
  { text: "Interested in upgrading to advisory tier when available. Follow up Q2.", author: "NB", date: "Feb 22, 2026" },
  { text: "Referred by university partnership program (UCLA). Strong engagement with structures library — completed 8 structures in first 48 hours.", author: "NB", date: "Feb 20, 2026" },
];

const ACTIVITY = [
  { icon: "view", text: 'Viewed <strong>"Revenue Share Agreements"</strong> structure', time: "Today, 2:34 PM" },
  { icon: "complete", text: 'Completed <strong>"Deals Foundation Guide"</strong>', time: "Today, 1:12 PM" },
  { icon: "view", text: 'Viewed <strong>"Virgil Abloh"</strong> case study', time: "Yesterday, 4:45 PM" },
  { icon: "save", text: 'Saved <strong>"Negotiation Playbook"</strong> guide', time: "Yesterday, 3:20 PM" },
  { icon: "view", text: 'Viewed <strong>"Equity vs. Fee"</strong> article', time: "Feb 22, 2:10 PM" },
  { icon: "complete", text: "Completed <strong>onboarding assessment</strong>", time: "Feb 21, 11:30 AM" },
];

export default function AdminMemberDetailPage() {
  const [noteFormVisible, setNoteFormVisible] = useState(false);
  const [noteText, setNoteText] = useState("");

  return (
    <>
      {/* Back Link */}
      <div className="adm-back rv vis">
        <Link href="/admin#members">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          All Members
        </Link>
      </div>

      {/* Member Header */}
      <div className="adm-member-header rv vis rv-d1">
        <div className="adm-member-avatar">{MEMBER.initials}</div>
        <div className="adm-member-info">
          <h1 className="adm-member-name">{MEMBER.name}</h1>
          <div className="adm-member-meta">
            <span>{MEMBER.email}</span>
            <span className="adm-member-meta-dot" />
            <span className={`adm-status ${MEMBER.status}`}>
              {MEMBER.statusLabel}
            </span>
            <span className="adm-member-meta-dot" />
            <span>{MEMBER.plan}</span>
          </div>
          <div className="adm-member-actions">
            <button className="adm-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View in Stripe
            </button>
            <button className="adm-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Resend Verification
            </button>
            <button
              className="adm-btn"
              onClick={() => setNoteFormVisible(!noteFormVisible)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="adm-section rv vis rv-d2">
        <div className="adm-section-head">
          <span className="adm-section-title">Profile Details</span>
        </div>
        <div className="adm-profile-grid">
          <div className="adm-profile-card">
            <div className="adm-profile-card-title">Account</div>
            {ACCOUNT_DETAILS.map((r) => (
              <div key={r.label} className="adm-profile-row">
                <span className="adm-profile-label">{r.label}</span>
                <span className="adm-profile-value">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="adm-profile-card">
            <div className="adm-profile-card-title">Subscription</div>
            {SUBSCRIPTION_DETAILS.map((r) => (
              <div key={r.label} className="adm-profile-row">
                <span className="adm-profile-label">{r.label}</span>
                <span
                  className={`adm-profile-value${r.active ? " is-active" : ""}`}
                >
                  {r.link ? <a href="#">{r.value}</a> : r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Log */}
      <div className="adm-section rv vis rv-d3">
        <div className="adm-section-head">
          <span className="adm-section-title">Email Log</span>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {EMAIL_LOG.map((e, i) => (
                <tr key={i}>
                  <td>
                    <span className="adm-email-type">{e.type}</span>
                  </td>
                  <td>{e.subject}</td>
                  <td>{e.date}</td>
                  <td>
                    <div className="adm-email-status">
                      <span
                        className={`adm-email-dot ${e.opened ? "opened" : "delivered"}`}
                      />
                      {e.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="adm-section rv vis rv-d4">
        <div className="adm-section-head">
          <span className="adm-section-title">Internal Notes</span>
        </div>

        {noteFormVisible && (
          <div className="adm-note-form visible">
            <textarea
              className="adm-textarea"
              placeholder="Add a note about this member…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
            />
            <div className="adm-note-form-actions">
              <button
                className="adm-btn adm-btn--primary"
                onClick={() => {
                  // TODO: Save note to Supabase
                  setNoteFormVisible(false);
                  setNoteText("");
                }}
              >
                Save Note
              </button>
              <button
                className="adm-btn"
                onClick={() => {
                  setNoteFormVisible(false);
                  setNoteText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {NOTES.map((n, i) => (
          <div key={i} className="adm-note">
            <div className="adm-note-text">{n.text}</div>
            <div className="adm-note-meta">
              {n.author} · {n.date}
            </div>
          </div>
        ))}
      </div>

      {/* Activity History */}
      <div className="adm-section rv vis rv-d5">
        <div className="adm-section-head">
          <span className="adm-section-title">Activity History</span>
        </div>
        {ACTIVITY.map((a, i) => (
          <div key={i} className="adm-feed-item">
            <div className="adm-feed-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="adm-feed-body">
              <div
                className="adm-feed-text"
                dangerouslySetInnerHTML={{ __html: a.text }}
              />
              <div className="adm-feed-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="page-footer" />
    </>
  );
}
