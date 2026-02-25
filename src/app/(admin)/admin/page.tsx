"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Static data (will be replaced with Supabase queries) ── */
const METRICS = [
  { label: "Total Members", value: "847", change: "↑ 12%", detail: "vs last month", up: true },
  { label: "Active (7d)", value: "623", change: "↑ 8%", detail: "logged in this week", up: true },
  { label: "MRR", value: "$6,284", change: "↑ 5%", detail: "monthly recurring", up: true },
  { label: "Churn Rate", value: "2.1%", change: "↓ 0.3%", detail: "vs last month", up: false },
];

const ACTIVITY = [
  { icon: "signup", text: "<strong>Sarah Chen</strong> signed up — Individual plan", time: "12 min ago" },
  { icon: "payment", text: "Payment received — <strong>Marcus Webb</strong> ($89.00)", time: "1 hr ago" },
  { icon: "alert", text: "Failed payment — <strong>Jordan Miles</strong> (retry scheduled)", time: "2 hrs ago" },
  { icon: "student", text: "Student verified — <strong>Aisha Patel</strong> (UCLA)", time: "3 hrs ago" },
  { icon: "view", text: "<strong>Taylor Brooks</strong> viewed \"Revenue Share Agreements\"", time: "4 hrs ago" },
  { icon: "signup", text: "<strong>Kenji Yamamoto</strong> signed up — Student plan", time: "5 hrs ago" },
  { icon: "cancel", text: "<strong>Chris Donovan</strong> cancelled subscription", time: "8 hrs ago" },
  { icon: "payment", text: "Payment received — <strong>Nina Vasquez</strong> ($89.00)", time: "10 hrs ago" },
  { icon: "expiring", text: "Student verification expiring — <strong>Liam Foster</strong> (30 days)", time: "12 hrs ago" },
  { icon: "view", text: "<strong>Rachel Kim</strong> completed \"Negotiation Playbook\" guide", time: "1 day ago" },
];

const FLAGGED = [
  { name: "Jordan Miles", badge: "Payment", badgeCls: "payment", desc: "Failed payment — 2 retries failed. Card ending 4821." },
  { name: "Liam Foster", badge: "Verification", badgeCls: "verification", desc: "Student verification expires in 12 days. NYU Tisch." },
  { name: "Emma Rodriguez", badge: "Inactive", badgeCls: "inactive", desc: "Inactive — last login 45 days ago. No activity since Jan 10." },
  { name: "David Park", badge: "Stuck", badgeCls: "stuck", desc: "Stuck in signup — registered Feb 19, no payment completed." },
  { name: "Maya Thompson", badge: "Payment", badgeCls: "payment", desc: "Failed payment — card declined. Last successful charge Nov 15." },
];

const MEMBERS = [
  { name: "Sarah Chen", email: "sarah@designstudio.co", discipline: "Design", plan: "Individual", status: "active", statusLabel: "Active", signup: "Feb 20, 2026", lastLogin: "Today", filter: "active" },
  { name: "Marcus Webb", email: "marcus@marcuswebb.com", discipline: "Music", plan: "Individual", status: "active", statusLabel: "Active", signup: "Jan 15, 2026", lastLogin: "Yesterday", filter: "active" },
  { name: "Aisha Patel", email: "aisha.p@ucla.edu", discipline: "Film", plan: "Student", status: "student", statusLabel: "Student", signup: "Feb 18, 2026", lastLogin: "Today", filter: "student" },
  { name: "Jordan Miles", email: "jordan@freelance.io", discipline: "Marketing", plan: "Individual", status: "failed", statusLabel: "Failed Payment", signup: "Dec 3, 2025", lastLogin: "5 days ago", filter: "flagged" },
  { name: "Kenji Yamamoto", email: "kenji@artschool.edu", discipline: "Design", plan: "Student", status: "student", statusLabel: "Student", signup: "Feb 20, 2026", lastLogin: "Today", filter: "student" },
  { name: "Nina Vasquez", email: "nina@ninavasquez.com", discipline: "Photography", plan: "Individual", status: "active", statusLabel: "Active", signup: "Nov 8, 2025", lastLogin: "3 days ago", filter: "active" },
  { name: "Chris Donovan", email: "chris.d@gmail.com", discipline: "Writing", plan: "Individual", status: "cancelled", statusLabel: "Cancelled", signup: "Sep 22, 2025", lastLogin: "38 days ago", filter: "inactive" },
  { name: "Taylor Brooks", email: "taylor@studiobrooks.co", discipline: "Design", plan: "Individual", status: "active", statusLabel: "Active", signup: "Oct 14, 2025", lastLogin: "Today", filter: "active" },
  { name: "Rachel Kim", email: "rachel@rachelkim.co", discipline: "Music", plan: "Individual", status: "active", statusLabel: "Active", signup: "Aug 5, 2025", lastLogin: "2 days ago", filter: "active" },
  { name: "Liam Foster", email: "liam.f@nyu.edu", discipline: "Film", plan: "Student", status: "expiring", statusLabel: "Expiring", signup: "Jan 10, 2026", lastLogin: "12 days ago", filter: "flagged" },
  { name: "Emma Rodriguez", email: "emma@emmar.design", discipline: "Design", plan: "Individual", status: "inactive", statusLabel: "Inactive", signup: "Jul 19, 2025", lastLogin: "45 days ago", filter: "inactive" },
  { name: "David Park", email: "david.park@gmail.com", discipline: "Entertainment", plan: "Individual", status: "incomplete", statusLabel: "Incomplete", signup: "Feb 19, 2026", lastLogin: "Never", filter: "flagged" },
];

const UNI_CODES = [
  { code: "UCLA-2026-A", university: "UCLA", uses: "34 / 100", created: "Jan 5, 2026", status: "active", statusLabel: "Active" },
  { code: "NYU-ARTS-26", university: "NYU Tisch", uses: "22 / 50", created: "Jan 12, 2026", status: "active", statusLabel: "Active" },
  { code: "RISD-S26", university: "RISD", uses: "18 / 50", created: "Feb 1, 2026", status: "active", statusLabel: "Active" },
  { code: "PARSONS-26", university: "Parsons", uses: "12 / 30", created: "Feb 5, 2026", status: "active", statusLabel: "Active" },
  { code: "CALARTS-25", university: "CalArts", uses: "50 / 50", created: "Sep 1, 2025", status: "full", statusLabel: "Full" },
  { code: "SVA-FALL25", university: "SVA", uses: "28 / 40", created: "Aug 15, 2025", status: "deactivated", statusLabel: "Deactivated" },
];

const DISCOUNT_CODES = [
  { code: "LAUNCH25", type: "percentage", typeLabel: "Percentage", value: "25% off", uses: 142, limit: "500", expiry: "Mar 31, 2026", status: "active", statusLabel: "Active" },
  { code: "WELCOME10", type: "percentage", typeLabel: "Percentage", value: "10% off", uses: 89, limit: "Unlimited", expiry: "None", status: "active", statusLabel: "Active" },
  { code: "EARLYBIRD", type: "fixed", typeLabel: "Fixed", value: "$20 off", uses: 56, limit: "100", expiry: "Feb 28, 2026", status: "active", statusLabel: "Active" },
  { code: "PARTNER50", type: "percentage", typeLabel: "Percentage", value: "50% off", uses: 23, limit: "50", expiry: "Apr 15, 2026", status: "active", statusLabel: "Active" },
  { code: "FREETRIAL", type: "free", typeLabel: "Free", value: "100% off", uses: 34, limit: "50", expiry: "Jan 31, 2026", status: "expired", statusLabel: "Expired" },
  { code: "HOLIDAY30", type: "fixed", typeLabel: "Fixed", value: "$30 off", uses: 75, limit: "75", expiry: "Dec 31, 2025", status: "full", statusLabel: "Full" },
];

const MEMBER_TABS = [
  { label: "All (847)", value: "all" },
  { label: "Active (623)", value: "active" },
  { label: "Student (156)", value: "student" },
  { label: "Inactive (48)", value: "inactive" },
  { label: "Flagged (5)", value: "flagged" },
];

export default function AdminDashboardPage() {
  const [memberFilter, setMemberFilter] = useState("all");

  const filteredMembers =
    memberFilter === "all"
      ? MEMBERS
      : MEMBERS.filter((m) => m.filter === memberFilter);

  return (
    <>
      {/* Header */}
      <div className="adm-header rv vis">
        <h1 className="adm-title">Admin Overview</h1>
        <p className="adm-subtitle">
          Platform health, member activity, and flagged accounts.
        </p>
      </div>

      {/* Metrics */}
      <div className="adm-metrics rv vis rv-d1">
        {METRICS.map((m) => (
          <div key={m.label} className="adm-stat">
            <div className="adm-stat-label">{m.label}</div>
            <div className="adm-stat-value">{m.value}</div>
            <div className="adm-stat-change">
              <span className={m.up ? "up" : "down"}>{m.change}</span>{" "}
              {m.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Split: Activity Feed + Flagged */}
      <div className="adm-split">
        {/* Activity Feed */}
        <div className="rv vis rv-d2">
          <div className="adm-section-head">
            <span className="adm-section-title">Activity Feed</span>
            <a href="#" className="adm-section-link">View all</a>
          </div>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="adm-feed-item">
              <div className="adm-feed-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

        {/* Flagged Accounts */}
        <div className="rv vis rv-d3" id="flagged">
          <div className="adm-section-head">
            <span className="adm-section-title">
              Flagged Accounts{" "}
              <span className="adm-section-count">{FLAGGED.length}</span>
            </span>
          </div>
          {FLAGGED.map((f) => (
            <div key={f.name} className="adm-flag">
              <div className="adm-flag-top">
                <span className="adm-flag-name">{f.name}</span>
                <span className={`adm-flag-badge ${f.badgeCls}`}>
                  {f.badge}
                </span>
              </div>
              <div className="adm-flag-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="adm-section rv vis rv-d4" id="members">
        <div className="adm-section-head">
          <span className="adm-section-title">Members</span>
        </div>

        <div className="ptl-filter-bar">
          {MEMBER_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`ptl-filter-tab${memberFilter === tab.value ? " active" : ""}`}
              onClick={() => setMemberFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Discipline</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Signup</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.email}>
                  <td className="adm-name">
                    <Link href={`/admin/members/${encodeURIComponent(m.email)}`}>
                      {m.name}
                    </Link>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.discipline}</td>
                  <td>{m.plan}</td>
                  <td>
                    <span className={`adm-status ${m.status}`}>
                      {m.statusLabel}
                    </span>
                  </td>
                  <td>{m.signup}</td>
                  <td>{m.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* University Codes */}
      <div className="adm-section rv vis rv-d5" id="codes">
        <div className="adm-section-head">
          <span className="adm-section-title">University Codes</span>
          <button className="adm-btn">+ Generate Code</button>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>University</th>
                <th>Uses</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {UNI_CODES.map((c) => (
                <tr key={c.code}>
                  <td className="adm-name">{c.code}</td>
                  <td>{c.university}</td>
                  <td>{c.uses}</td>
                  <td>{c.created}</td>
                  <td>
                    <span className={`adm-status ${c.status}`}>
                      {c.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Codes */}
      <div className="adm-section rv vis rv-d6" id="discounts">
        <div className="adm-section-head">
          <span className="adm-section-title">Discount Codes</span>
          <button className="adm-btn">+ Create Code</button>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Uses</th>
                <th>Limit</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DISCOUNT_CODES.map((d) => (
                <tr key={d.code}>
                  <td className="adm-name">{d.code}</td>
                  <td>
                    <span className={`adm-dtype ${d.type}`}>
                      {d.typeLabel}
                    </span>
                  </td>
                  <td>{d.value}</td>
                  <td>{d.uses}</td>
                  <td>{d.limit}</td>
                  <td>{d.expiry}</td>
                  <td>
                    <span className={`adm-status ${d.status}`}>
                      {d.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-footer" />
    </>
  );
}
