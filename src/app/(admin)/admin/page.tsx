"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ── Types ── */
interface Stats {
  totalMembers: number;
  wau: number;
  prevWau: number;
  mrr: number;
  churnCount: number;
  newMembers30d: number;
}

interface ActivityItem {
  type: string;
  text: string;
  time: string;
  userId?: string;
}

interface FlaggedItem {
  userId: string;
  name: string;
  email: string;
  badge: string;
  badgeCls: string;
  desc: string;
}

interface RecentMember {
  id: string;
  fullName: string | null;
  email: string;
  plan: string | null;
  status: string | null;
  signup: string;
}

/* ── Helpers ── */
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(v);

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const ICON_MAP: Record<string, React.ReactNode> = {
  signup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  cancel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  assessment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
};

const defaultIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── Badge class mapping ── */
function flagBadgeCls(badge: string): string {
  const b = badge.toLowerCase();
  if (b.includes("due") || b.includes("payment")) return "payment";
  if (b.includes("expir") || b.includes("verif")) return "verification";
  if (b.includes("inactive")) return "inactive";
  if (b.includes("stuck")) return "stuck";
  return "payment";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [flagged, setFlagged] = useState<FlaggedItem[] | null>(null);
  const [recentMembers, setRecentMembers] = useState<RecentMember[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/activity").then((r) => r.json()),
      fetch("/api/admin/flagged").then((r) => r.json()),
      fetch("/api/admin/members?page=1&sort=created_at").then((r) => r.json()),
    ])
      .then(([s, a, f, m]) => {
        setStats(s);
        setActivity(a);
        setFlagged(f.flagged ?? []);
        setRecentMembers((m.members ?? []).slice(0, 5));
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="adm-header rv vis">
        <h1 className="adm-title">Admin Overview</h1>
        <p className="adm-subtitle" style={{ color: "var(--red)" }}>
          Error loading dashboard: {error}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="adm-header rv vis">
        <h1 className="adm-title">Admin Overview</h1>
        <p className="adm-subtitle">Loading...</p>
      </div>
    );
  }

  const churnRate =
    stats.totalMembers + stats.churnCount > 0
      ? Math.round(
          (stats.churnCount / (stats.totalMembers + stats.churnCount)) * 1000
        ) / 10
      : 0;

  const arr = stats.mrr * 12;

  const wauChange =
    stats.prevWau > 0
      ? Math.round(((stats.wau - stats.prevWau) / stats.prevWau) * 100)
      : 0;

  const metrics = [
    {
      label: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      detail: `+${stats.newMembers30d} new this month`,
    },
    {
      label: "Weekly Active",
      value: stats.wau.toLocaleString(),
      detail:
        wauChange >= 0
          ? `+${wauChange}% vs prior week`
          : `${wauChange}% vs prior week`,
    },
    {
      label: "MRR",
      value: fmtCurrency(stats.mrr),
      detail: `${fmtCurrency(arr)} ARR`,
    },
    {
      label: "Churn Rate",
      value: `${churnRate}%`,
      detail: `${stats.churnCount} canceled (30d)`,
    },
  ];

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
        {metrics.map((m) => (
          <div key={m.label} className="adm-stat">
            <div className="adm-stat-label">{m.label}</div>
            <div className="adm-stat-value">{m.value}</div>
            <div className="adm-stat-change">{m.detail}</div>
          </div>
        ))}
      </div>

      {/* Split: Activity Feed + Flagged */}
      <div className="adm-split">
        {/* Activity Feed */}
        <div className="rv vis rv-d2">
          <div className="adm-section-head">
            <span className="adm-section-title">Activity Feed</span>
          </div>
          {activity && activity.length > 0 ? (
            activity.map((a, i) => (
              <div key={i} className="adm-feed-item">
                <div className="adm-feed-icon">
                  {ICON_MAP[a.type] || defaultIcon}
                </div>
                <div className="adm-feed-body">
                  <div
                    className="adm-feed-text"
                    dangerouslySetInnerHTML={{ __html: a.text }}
                  />
                  <div className="adm-feed-time">{timeAgo(a.time)}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="adm-subtitle">No recent activity.</p>
          )}
        </div>

        {/* Flagged Accounts */}
        <div className="rv vis rv-d3" id="flagged">
          <div className="adm-section-head">
            <span className="adm-section-title">
              Flagged Accounts{" "}
              <span className="adm-section-count">
                {flagged?.length ?? 0}
              </span>
            </span>
          </div>
          {flagged && flagged.length > 0 ? (
            flagged.map((f) => (
              <Link
                key={f.userId}
                href={`/admin/members/${f.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="adm-flag">
                  <div className="adm-flag-top">
                    <span className="adm-flag-name">{f.name}</span>
                    <span className={`adm-flag-badge ${flagBadgeCls(f.badge)}`}>
                      {f.badge}
                    </span>
                  </div>
                  <div className="adm-flag-desc">{f.desc}</div>
                </div>
              </Link>
            ))
          ) : (
            <p className="adm-subtitle">No flagged accounts.</p>
          )}
        </div>
      </div>

      {/* Recent Members */}
      <div className="adm-section rv vis rv-d4">
        <div className="adm-section-head">
          <span className="adm-section-title">Recent Signups</span>
          <Link href="/admin/members" className="adm-section-link">
            View all &rarr;
          </Link>
        </div>
        {recentMembers && recentMembers.length > 0 ? (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Signup</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => window.location.href = `/admin/members/${m.id}`}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="adm-name">{m.fullName || "—"}</td>
                    <td>{m.email}</td>
                    <td>{m.plan ?? "—"}</td>
                    <td>
                      <span className={`adm-status ${m.status ?? ""}`}>
                        {m.status ?? "—"}
                      </span>
                    </td>
                    <td>
                      {new Date(m.signup).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="adm-subtitle">No members yet.</p>
        )}
      </div>

      <div className="page-footer" />
    </>
  );
}
