"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

/* ── Types ── */
interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  status: string;
  disciplines: string[];
  career_stage: string | null;
  income_range: string | null;
  creative_mode: string | null;
  detected_stage: number | null;
  archetype_primary: string | null;
  assessment_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface Assessment {
  id: string;
  status: string;
  version: number;
  discipline: string | null;
  sub_discipline: string | null;
  creative_mode: string | null;
  energy_ranking: Record<string, number> | null;
  drains: string[] | null;
  dream_response: string | null;
  income_range: string | null;
  income_structure: Record<string, number> | null;
  what_they_pay_for: string | null;
  equity_positions: string | null;
  demand_level: string | null;
  business_structure: string | null;
  stage_questions: Record<string, string> | null;
  industry_questions: Record<string, string> | null;
  discernment_questions: Record<string, string> | null;
  three_year_goal: string | null;
  risk_tolerance: string | null;
  constraints: string[] | null;
  specific_question: string | null;
  detected_stage: number | null;
  stage_score: number | null;
  transition_readiness: string | null;
  misalignment_flags: string[] | null;
  archetype_primary: string | null;
  archetype_secondary: string | null;
  current_section: number | null;
  current_question: number | null;
  started_at: string | null;
  completed_at: string | null;
}

interface StrategicPlan {
  id: string;
  assessment_id: string | null;
  plan_content: Record<string, unknown>;
  plan_markdown: string | null;
  status: string;
  review_notes: string | null;
  created_at: string;
  published_at: string | null;
}

interface DealEvaluation {
  id: string;
  status: string;
  deal_type: string | null;
  deal_name: string | null;
  creative_mode: string | null;
  overall_score: number | null;
  overall_signal: string | null;
  red_flags: string[] | null;
  scores: Record<string, number> | null;
  answers_financial: Record<string, unknown> | null;
  answers_career: Record<string, unknown> | null;
  answers_partner: Record<string, unknown> | null;
  answers_structure: Record<string, unknown> | null;
  answers_risk: Record<string, unknown> | null;
  answers_legal: Record<string, unknown> | null;
  deal_outcome: string | null;
  outcome_notes: string | null;
  started_at: string | null;
  completed_at: string | null;
}

interface DealVerdict {
  id: string;
  evaluation_id: string;
  verdict_content: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface InventoryItem {
  id: string;
  asset_name: string;
  asset_type: string;
  description: string | null;
  ownership_status: string;
  licensing_potential: string;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

interface InventoryAnalysis {
  id: string;
  analysis_content: Record<string, unknown>;
  item_count: number;
  status: string;
  created_at: string;
}

interface EmailEntry {
  id: string;
  email_type: string;
  subject: string | null;
  sent_at: string;
  status: string;
}

interface Note {
  id: string;
  note: string;
  created_at: string;
  admin: { full_name: string | null } | null;
}

interface Bookmark {
  id: string;
  slug: string | null;
  content_type: string | null;
  content_id: string | null;
  created_at: string;
}

interface MemberData {
  profile: Profile;
  subscription: Subscription | null;
  assessment: Assessment | null;
  strategicPlans: StrategicPlan[];
  dealEvaluations: DealEvaluation[];
  dealVerdicts: DealVerdict[];
  inventoryItems: InventoryItem[];
  inventoryAnalyses: InventoryAnalysis[];
  emails: EmailEntry[];
  notes: Note[];
  bookmarks: Bookmark[];
  stats: {
    conversationCount: number;
    totalMessages: number;
    dealEvalCount: number;
    verdictCount: number;
    planCount: number;
    analysisCount: number;
    inventoryItemCount: number;
    estimatedCost: number;
  };
}

/* ── Helpers ── */
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function planLabel(plan: string | null): string {
  if (!plan) return "—";
  switch (plan) {
    case "library": return "Library ($12/yr)";
    case "full_access": return "Full Access ($190/yr)";
    case "coaching": return "Coaching";
    case "student": return "Student";
    case "annual": return "Full Access ($190/yr)";
    default: return plan;
  }
}

function statusLabel(status: string | null): string {
  if (!status) return "—";
  switch (status) {
    case "active": return "Active";
    case "past_due": return "Past Due";
    case "canceled": return "Canceled";
    case "trialing": return "Trialing";
    case "incomplete": return "Incomplete";
    default: return status;
  }
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function signalColor(signal: string | null): string {
  switch (signal) {
    case "green": return "#2a7d2a";
    case "yellow": return "#92400e";
    case "red": return "#dc2626";
    default: return "var(--mid)";
  }
}

/** Extract display value from deal answer objects like {value: 4, source: "evaluator"} */
function extractValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.map(extractValue).join(", ");
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    // Handle {value, source} pattern from deal evaluations
    if ("value" in obj) return extractValue(obj.value);
    // Handle other simple objects
    return Object.entries(obj)
      .map(([k, val]) => `${formatKey(k)}: ${extractValue(val)}`)
      .join(", ");
  }
  return String(v);
}

/** Extract score value — could be number or {score: n, ...} */
function extractScore(v: unknown): string {
  if (typeof v === "number") return v.toFixed(1);
  if (typeof v === "object" && v !== null) {
    const obj = v as Record<string, unknown>;
    if ("score" in obj && typeof obj.score === "number") return obj.score.toFixed(1);
    if ("value" in obj && typeof obj.value === "number") return obj.value.toFixed(1);
  }
  return String(v);
}

function potentialBadge(potential: string): { color: string; bg: string } {
  switch (potential) {
    case "high": return { color: "#2a7d2a", bg: "rgba(42,125,42,0.06)" };
    case "medium": return { color: "#92400e", bg: "rgba(146,64,14,0.06)" };
    case "low": return { color: "var(--light)", bg: "rgba(0,0,0,0.03)" };
    case "already_licensed": return { color: "#1e40af", bg: "rgba(30,64,175,0.06)" };
    default: return { color: "var(--light)", bg: "rgba(0,0,0,0.03)" };
  }
}

/* ── Misalignment flag metadata ── */
const FLAG_META: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
  income_exceeds_structure: {
    title: "Income Outpacing Structure",
    desc: "Earning $300K+ with minimal business infrastructure to protect or grow it.",
    icon: <svg viewBox="0 0 24 24"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></svg>,
  },
  judgment_not_priced: {
    title: "Judgment Isn't Priced",
    desc: "Clients pay for direction and strategic thinking, but income is mostly fees or salary.",
    icon: <svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18" /><path d="M16 7l-4 5-4-5" /><path d="M8 17l4-5 4 5" /></svg>,
  },
  relationships_not_converted: {
    title: "Relationships Not Converted",
    desc: "Strong demand and network, but no equity positions or ownership stakes.",
    icon: <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>,
  },
  ip_not_monetized: {
    title: "IP Not Monetized",
    desc: "Creating original work but earning less than 5% from royalties or equity.",
    icon: <svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>,
  },
  demand_exceeds_capacity: {
    title: "Demand Exceeds Capacity",
    desc: "Overflow demand but operating as a sole practitioner with no leverage model.",
    icon: <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  },
  talent_without_structure: {
    title: "Talent Without Structure",
    desc: "Strong creative discernment but minimal business or legal infrastructure.",
    icon: <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
};

function MisalignmentFlag({ flag }: { flag: string }) {
  const meta = FLAG_META[flag];
  if (!meta) {
    return (
      <div className="adm-flag-card">
        <div className="adm-flag-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>
        <div className="adm-flag-body">
          <div className="adm-flag-title">{formatKey(flag)}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="adm-flag-card">
      <div className="adm-flag-icon">{meta.icon}</div>
      <div className="adm-flag-body">
        <div className="adm-flag-title">{meta.title}</div>
        <div className="adm-flag-desc">{meta.desc}</div>
      </div>
    </div>
  );
}

/* ── What They Pay For — natural language ── */
function payForLabel(value: string | null): string {
  switch (value) {
    case "execution": return "Clients pay for execution — specific deliverables and task completion.";
    case "elevation": return "Clients pay for elevated craft — quality and skill above the baseline.";
    case "solution": return "Clients pay for solutions — solving problems, not just completing tasks.";
    case "direction": return "Clients pay for direction — creative judgment and strategic thinking.";
    case "partnership": return "Clients pay for partnership — shared risk, shared upside, co-ownership.";
    default: return value ? formatKey(value) : "—";
  }
}

/* ── Stage names ── */
function stageName(stage: number | null): string {
  switch (stage) {
    case 1: return "Foundation";
    case 2: return "Growth";
    case 3: return "Scale";
    case 4: return "Legacy";
    default: return "—";
  }
}

/* ── Plan Badge ── */
function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return <span>—</span>;
  // Normalize legacy "annual" plan to "full_access"
  const normalized = plan === "annual" ? "full_access" : plan;
  const cls = normalized.replace(/\s+/g, "_");
  const icons: Record<string, React.ReactNode> = {
    library: (
      <svg viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    full_access: (
      <svg viewBox="0 0 24 24">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    coaching: (
      <svg viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
  };
  return (
    <span className={`adm-plan-badge ${cls}`}>
      {icons[normalized] ?? (
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
      )}
      {planLabel(plan)}
    </span>
  );
}

/* ── Tab definitions ── */
type TabId = "profile" | "assessment" | "deals" | "inventory";

export default function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<MemberData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("profile");
  const [noteFormVisible, setNoteFormVisible] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/members/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function saveNote() {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText.trim() }),
      });
      const newNote = await res.json();
      if (newNote.error) throw new Error(newNote.error);
      setData((prev) =>
        prev ? { ...prev, notes: [newNote, ...prev.notes] } : prev
      );
      setNoteText("");
      setNoteFormVisible(false);
    } catch (e) {
      alert("Error saving note: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <>
        <div className="adm-back rv vis">
          <Link href="/admin/members">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All Members
          </Link>
        </div>
        <div className="adm-header rv vis">
          <h1 className="adm-title">Member Not Found</h1>
          <p className="adm-subtitle" style={{ color: "var(--red)" }}>{error}</p>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <div className="adm-back rv vis">
          <Link href="/admin/members">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All Members
          </Link>
        </div>
        <div className="adm-header rv vis">
          <p className="adm-subtitle">Loading...</p>
        </div>
      </>
    );
  }

  const {
    profile, subscription, assessment, strategicPlans,
    dealEvaluations, dealVerdicts, inventoryItems, inventoryAnalyses,
    emails, notes, bookmarks, stats,
  } = data;

  const initials = (profile.full_name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stripeUrl = subscription?.stripe_customer_id
    ? `https://dashboard.stripe.com/customers/${subscription.stripe_customer_id}`
    : null;

  // Count assessment-tab items for badge
  const assessmentItemCount = (assessment ? 1 : 0) + dealEvaluations.length + inventoryItems.length;

  return (
    <>
      {/* Back Link */}
      <div className="adm-back rv vis">
        <Link href="/admin/members">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          All Members
        </Link>
      </div>

      {/* Member Header */}
      <div className="adm-member-header rv vis rv-d1">
        <div className="adm-member-avatar">{initials}</div>
        <div className="adm-member-info">
          <h1 className="adm-member-name">
            {profile.full_name || "Unknown"}
          </h1>
          <div className="adm-member-meta">
            <span>{profile.email}</span>
            <span className="adm-member-meta-dot" />
            <span
              className={`adm-status ${subscription?.status ?? profile.status}`}
            >
              {statusLabel(subscription?.status ?? null)}
            </span>
            <span className="adm-member-meta-dot" />
            <PlanBadge plan={subscription?.plan ?? null} />
          </div>
          <div className="adm-member-actions">
            {stripeUrl ? (
              <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="adm-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View in Stripe
              </a>
            ) : (
              <button className="adm-btn" disabled>No Stripe ID</button>
            )}
            <button
              className="adm-btn"
              onClick={() => {
                setTab("profile");
                setNoteFormVisible(!noteFormVisible);
                if (!noteFormVisible) {
                  setTimeout(() => {
                    document.getElementById("notes-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
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

      {/* Tabs */}
      <div className="adm-tabs rv vis rv-d1">
        <button
          className={`adm-tab${tab === "profile" ? " active" : ""}`}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
        <button
          className={`adm-tab${tab === "assessment" ? " active" : ""}`}
          onClick={() => setTab("assessment")}
        >
          Assessment
          {assessment?.status === "completed" && <span className="adm-tab-dot completed" />}
          {assessment && assessment.status !== "completed" && <span className="adm-tab-dot in-progress" />}
        </button>
        <button
          className={`adm-tab${tab === "deals" ? " active" : ""}`}
          onClick={() => setTab("deals")}
        >
          Deal Evaluations
          {dealEvaluations.length > 0 && (
            <span className="adm-tab-count">{dealEvaluations.length}</span>
          )}
        </button>
        <button
          className={`adm-tab${tab === "inventory" ? " active" : ""}`}
          onClick={() => setTab("inventory")}
        >
          Asset Inventory
          {inventoryItems.length > 0 && (
            <span className="adm-tab-count">{inventoryItems.length}</span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ PROFILE TAB ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === "profile" && (
        <>
          <div className="adm-section rv vis rv-d2">
            <div className="adm-section-head">
              <span className="adm-section-title">Profile Details</span>
            </div>
            <div className="adm-profile-grid">
              <div className="adm-profile-card">
                <div className="adm-profile-card-title">Account</div>
                <ProfileRow label="Email" value={profile.email} />
                <ProfileRow label="Discipline" value={profile.disciplines?.length ? profile.disciplines.join(", ") : null} />
                <ProfileRow label="Career Stage" value={profile.detected_stage ? `Stage ${profile.detected_stage}` : profile.career_stage} />
                <ProfileRow label="Income Range" value={profile.income_range} />
                <ProfileRow label="Signup Date" value={fmtDate(profile.created_at)} />
                <ProfileRow label="Last Active" value={fmtDate(profile.updated_at)} />
              </div>
              <div className="adm-profile-card">
                <div className="adm-profile-card-title">Subscription</div>
                <ProfileRow label="Plan" value={planLabel(subscription?.plan ?? null)} />
                <ProfileRow label="Status" value={statusLabel(subscription?.status ?? null)} />
                <ProfileRow label="Period End" value={fmtDate(subscription?.current_period_end ?? null)} />
                <ProfileRow label="Cancel at End" value={subscription?.cancel_at_period_end ? "Yes" : "No"} />
                <ProfileRow
                  label="Stripe Customer"
                  value={subscription?.stripe_customer_id ? (
                    <a href={stripeUrl!} target="_blank" rel="noopener noreferrer">
                      {subscription.stripe_customer_id.slice(0, 14)}...
                    </a>
                  ) : "—"}
                />
              </div>
            </div>
          </div>

          {/* AI Cost Estimate */}
          <div className="adm-section rv vis rv-d2">
            <div className="adm-section-head">
              <span className="adm-section-title">AI Usage &amp; Cost Estimate</span>
            </div>
            <div className="adm-metrics" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
              <div className="adm-stat">
                <div className="adm-stat-label">Messages</div>
                <div className="adm-stat-value">{stats.totalMessages.toLocaleString()}</div>
                <div className="adm-stat-change">{stats.conversationCount} conversation{stats.conversationCount !== 1 ? "s" : ""}</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Roadmaps</div>
                <div className="adm-stat-value">{stats.planCount}</div>
                <div className="adm-stat-change">~$0.057 each</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Verdicts</div>
                <div className="adm-stat-value">{stats.verdictCount}</div>
                <div className="adm-stat-change">~$0.053 each</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Analyses</div>
                <div className="adm-stat-value">{stats.analysisCount}</div>
                <div className="adm-stat-change">~$0.039 each</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Est. Total Cost</div>
                <div className="adm-stat-value" style={{ color: stats.estimatedCost > 1 ? "#dc2626" : stats.estimatedCost > 0.5 ? "#92400e" : "var(--black)" }}>
                  ${stats.estimatedCost.toFixed(2)}
                </div>
                <div className="adm-stat-change">at ~$0.014/msg</div>
              </div>
            </div>
          </div>

          {/* Email Log */}
          <div className="adm-section rv vis rv-d3">
            <div className="adm-section-head">
              <span className="adm-section-title">Email Log</span>
            </div>
            {emails.length > 0 ? (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>Type</th><th>Subject</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {emails.map((e) => (
                      <tr key={e.id}>
                        <td><span className="adm-email-type">{e.email_type}</span></td>
                        <td>{e.subject || "—"}</td>
                        <td>{fmtDate(e.sent_at)}</td>
                        <td>
                          <div className="adm-email-status">
                            <span className={`adm-email-dot ${e.status === "sent" ? "delivered" : e.status}`} />
                            {e.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="adm-subtitle">No emails sent.</p>
            )}
          </div>

          {/* Internal Notes */}
          <div className="adm-section rv vis rv-d4" id="notes-section">
            <div className="adm-section-head">
              <span className="adm-section-title">Internal Notes</span>
            </div>
            {noteFormVisible && (
              <div className="adm-note-form visible">
                <textarea
                  className="adm-textarea"
                  placeholder="Add a note about this member..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
                <div className="adm-note-form-actions">
                  <button className="adm-btn adm-btn--primary" onClick={saveNote} disabled={saving || !noteText.trim()}>
                    {saving ? "Saving..." : "Save Note"}
                  </button>
                  <button className="adm-btn" onClick={() => { setNoteFormVisible(false); setNoteText(""); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {notes.length > 0
              ? notes.map((n) => (
                  <div key={n.id} className="adm-note">
                    <div className="adm-note-text">{n.note}</div>
                    <div className="adm-note-meta">
                      {(n.admin as { full_name: string | null } | null)?.full_name || "Admin"} · {fmtDate(n.created_at)}
                    </div>
                  </div>
                ))
              : !noteFormVisible && <p className="adm-subtitle">No notes yet.</p>}
          </div>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="adm-section rv vis rv-d5">
              <div className="adm-section-head">
                <span className="adm-section-title">Saved Items ({bookmarks.length})</span>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Item</th><th>Type</th><th>Saved</th></tr></thead>
                  <tbody>
                    {bookmarks.map((b) => (
                      <tr key={b.id}>
                        <td className="adm-name">{b.slug || b.content_id || "—"}</td>
                        <td>{b.content_type || "—"}</td>
                        <td>{fmtDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ ASSESSMENT & AI TAB ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === "assessment" && (
        <>
          {/* ── Assessment ── */}
          {!assessment ? (
            <div className="adm-section rv vis rv-d2">
              <div className="adm-section-head">
                <span className="adm-section-title">Assessment</span>
              </div>
              <p className="adm-subtitle">No assessment data for this member.</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="adm-metrics rv vis rv-d2">
                <div className="adm-stat">
                  <div className="adm-stat-label">Detected Stage</div>
                  <div className="adm-stat-value">
                    {assessment.detected_stage ? `Stage ${assessment.detected_stage}` : "—"}
                  </div>
                  <div className="adm-stat-change">{stageName(assessment.detected_stage)}</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Stage Score</div>
                  <div className="adm-stat-value">
                    {assessment.stage_score != null ? assessment.stage_score.toFixed(1) : "—"}
                  </div>
                  <div className="adm-stat-change">out of 4.0</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Transition Readiness</div>
                  <div className="adm-stat-value" style={{ fontSize: "24px" }}>
                    {assessment.transition_readiness ? formatKey(assessment.transition_readiness) : "—"}
                  </div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Primary Archetype</div>
                  <div className="adm-stat-value" style={{ fontSize: "20px" }}>
                    {assessment.archetype_primary ? formatKey(assessment.archetype_primary) : "—"}
                  </div>
                  {assessment.archetype_secondary && (
                    <div className="adm-stat-change">{formatKey(assessment.archetype_secondary)}</div>
                  )}
                </div>
              </div>

              {/* Assessment dates + status */}
              <div className="adm-asmt-meta rv vis rv-d2">
                <span>
                  <span className={`adm-status ${assessment.status}`}>
                    {assessment.status === "completed" ? "Completed" : assessment.status === "in_progress" ? "In Progress" : formatKey(assessment.status)}
                  </span>
                </span>
                <span>Started <strong>{fmtDate(assessment.started_at)}</strong></span>
                <span>Completed <strong>{fmtDate(assessment.completed_at)}</strong></span>
              </div>

              {/* Misalignment Flags */}
              {assessment.misalignment_flags && assessment.misalignment_flags.length > 0 && (
                <div className="adm-section rv vis rv-d2">
                  <div className="adm-section-head">
                    <span className="adm-section-title">Misalignment Flags ({assessment.misalignment_flags.length})</span>
                  </div>
                  {assessment.misalignment_flags.map((flag, i) => (
                    <MisalignmentFlag key={i} flag={flag} />
                  ))}
                </div>
              )}

              {/* Section 1: Identity */}
              <div className="adm-section rv vis rv-d2">
                <div className="adm-section-head">
                  <span className="adm-section-title">Identity</span>
                </div>
                <div className="adm-metrics">
                  <div className="adm-stat">
                    <div className="adm-stat-label">Discipline</div>
                    <div className="adm-stat-value" style={{ fontSize: "20px" }}>
                      {assessment.discipline ? formatKey(assessment.discipline) : "—"}
                    </div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">Sub-Discipline</div>
                    <div className="adm-stat-value" style={{ fontSize: "20px" }}>
                      {assessment.sub_discipline ? formatKey(assessment.sub_discipline) : "—"}
                    </div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">Creative Mode</div>
                    <div className="adm-stat-value" style={{ fontSize: "20px" }}>
                      {assessment.creative_mode ? (
                        <span className="adm-badge-inline">{formatKey(assessment.creative_mode)}</span>
                      ) : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Feeling + Energy */}
              <div className="adm-section rv vis rv-d2">
                <div className="adm-section-head">
                  <span className="adm-section-title">Feeling &amp; Energy</span>
                </div>
                <div className="adm-profile-card">
                  {assessment.energy_ranking && Object.keys(assessment.energy_ranking).length > 0 && (
                    <>
                      <div className="adm-profile-label" style={{ marginBottom: 4 }}>Energy Ranking</div>
                      <div className="adm-rank-list">
                        {Object.entries(assessment.energy_ranking)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([k, v]) => (
                            <div key={k} className="adm-rank-item">
                              <span className="adm-rank-num">{Number(k) + 1}</span>
                              <span className="adm-rank-label">{formatKey(String(v))}</span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  {assessment.drains && assessment.drains.length > 0 && (
                    <>
                      <div className="adm-profile-label" style={{ marginTop: 16, marginBottom: 4 }}>Energy Drains</div>
                      <div className="adm-tags">
                        {assessment.drains.map((d, i) => (
                          <span key={i} className="adm-tag">{formatKey(d)}</span>
                        ))}
                      </div>
                    </>
                  )}
                  {assessment.dream_response && (
                    <>
                      <div className="adm-profile-label" style={{ marginTop: 16, marginBottom: 4 }}>Dream Response</div>
                      <p style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "var(--mid)", lineHeight: 1.6, margin: 0 }}>
                        {assessment.dream_response}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Section 3: Current Reality */}
              <div className="adm-section rv vis rv-d2">
                <div className="adm-section-head">
                  <span className="adm-section-title">Current Reality</span>
                </div>

                {/* Income overview */}
                <div className="adm-profile-card">
                  <div className="adm-profile-label" style={{ marginBottom: 8 }}>Income</div>
                  <div style={{ fontSize: "24px", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 12 }}>
                    {assessment.income_range ? formatKey(assessment.income_range) : "—"}
                  </div>
                  {assessment.income_structure && Object.keys(assessment.income_structure).length > 0 && (
                    <div className="adm-pct-bars">
                      {Object.entries(assessment.income_structure)
                        .filter(([, v]) => (v as number) > 0)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([k, v]) => (
                          <div key={k} className="adm-pct-row">
                            <span className="adm-pct-label">{formatKey(k)}</span>
                            <div className="adm-pct-track">
                              <div className="adm-pct-fill" style={{ width: `${v}%` }} />
                            </div>
                            <span className="adm-pct-val">{String(v)}%</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Value positioning */}
                <div className="adm-profile-card" style={{ marginTop: 12 }}>
                  <div className="adm-profile-label" style={{ marginBottom: 4 }}>What Clients Pay For</div>
                  <p style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "var(--mid)", lineHeight: 1.6, margin: 0 }}>
                    {payForLabel(assessment.what_they_pay_for)}
                  </p>
                </div>

                {/* Structure indicators */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {assessment.equity_positions && (
                    <span className="adm-badge-inline">
                      Equity: {formatKey(assessment.equity_positions)}
                    </span>
                  )}
                  {assessment.demand_level && (
                    <span className="adm-badge-inline">
                      Demand: {formatKey(assessment.demand_level)}
                    </span>
                  )}
                  {assessment.business_structure && (
                    <span className="adm-badge-inline">
                      Structure: {formatKey(assessment.business_structure)}
                    </span>
                  )}
                </div>
              </div>

              {/* Section 4: Deep Dive */}
              {hasDeepDive(assessment) && (
                <div className="adm-section rv vis rv-d2">
                  <div className="adm-section-head">
                    <span className="adm-section-title">Section 4 — Adaptive Deep Dive</span>
                  </div>
                  <JsonAnswerCards
                    sections={[
                      { title: "Stage Questions", data: assessment.stage_questions },
                      { title: "Industry Questions", data: assessment.industry_questions },
                      { title: "Discernment Questions", data: assessment.discernment_questions },
                    ]}
                  />
                </div>
              )}

              {/* Section 5: Vision + Ambition */}
              <div className="adm-section rv vis rv-d2">
                <div className="adm-section-head">
                  <span className="adm-section-title">Section 5 — Vision &amp; Ambition</span>
                </div>
                <div className="adm-profile-card">
                  <ProfileRow label="Three-Year Goal" value={assessment.three_year_goal} long />
                  <ProfileRow label="Risk Tolerance" value={assessment.risk_tolerance ? formatKey(assessment.risk_tolerance) : null} />
                  {assessment.constraints && assessment.constraints.length > 0 && (
                    <ProfileRow label="Constraints" value={assessment.constraints.join(", ")} />
                  )}
                  <ProfileRow label="Specific Question" value={assessment.specific_question} long />
                </div>
              </div>
            </>
          )}

          {/* ── Strategic Roadmaps ── */}
          <div className="adm-section rv vis rv-d3">
            <div className="adm-section-head">
              <span className="adm-section-title">Strategic Roadmaps ({strategicPlans.length})</span>
            </div>
            {strategicPlans.length > 0 ? (
              strategicPlans.map((plan) => (
                <div key={plan.id} className="adm-expandable">
                  <button
                    className="adm-expandable-header"
                    onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  >
                    <div className="adm-expandable-left">
                      <span className={`adm-status ${plan.status}`}>{formatKey(plan.status)}</span>
                      <span className="adm-expandable-title">
                        Roadmap — {fmtDate(plan.created_at)}
                      </span>
                    </div>
                    <svg className={`adm-expandable-chevron${expandedPlan === plan.id ? " open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedPlan === plan.id && (
                    <div className="adm-expandable-body">
                      <div className="adm-profile-card" style={{ marginBottom: "1rem" }}>
                        <ProfileRow label="Status" value={formatKey(plan.status)} />
                        <ProfileRow label="Created" value={fmtDate(plan.created_at)} />
                        <ProfileRow label="Published" value={fmtDate(plan.published_at)} />
                        {plan.review_notes && <ProfileRow label="Review Notes" value={plan.review_notes} long />}
                      </div>
                      <RoadmapDisplay content={plan.plan_content} markdown={plan.plan_markdown} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="adm-subtitle">No strategic roadmaps generated.</p>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ DEAL EVALUATIONS TAB ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === "deals" && (
        <>
          {/* Summary Metrics */}
          {dealEvaluations.length > 0 && (() => {
            const scored = dealEvaluations.filter((d) => d.overall_score != null);
            const avgScore = scored.length > 0
              ? scored.reduce((sum, d) => sum + (d.overall_score ?? 0), 0) / scored.length
              : 0;
            const greens = dealEvaluations.filter((d) => d.overall_signal === "green").length;
            const yellows = dealEvaluations.filter((d) => d.overall_signal === "yellow").length;
            const reds = dealEvaluations.filter((d) => d.overall_signal === "red").length;
            const completed = dealEvaluations.filter((d) => d.status === "completed").length;
            return (
              <div className="adm-metrics rv vis rv-d2">
                <div className="adm-stat">
                  <div className="adm-stat-label">Total Evaluations</div>
                  <div className="adm-stat-value">{dealEvaluations.length}</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Average Score</div>
                  <div className="adm-stat-value">{scored.length > 0 ? avgScore.toFixed(1) : "—"}</div>
                  <div className="adm-stat-change">{scored.length > 0 ? "out of 10" : "no scored deals"}</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Signal Breakdown</div>
                  <div className="adm-stat-value" style={{ fontSize: "20px" }}>
                    <span style={{ color: "#2a7d2a" }}>{greens}</span>
                    {" / "}
                    <span style={{ color: "#92400e" }}>{yellows}</span>
                    {" / "}
                    <span style={{ color: "#dc2626" }}>{reds}</span>
                  </div>
                  <div className="adm-stat-change">green / yellow / red</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Completed</div>
                  <div className="adm-stat-value">{completed}</div>
                  <div className="adm-stat-change">of {dealEvaluations.length} total</div>
                </div>
              </div>
            );
          })()}

          {/* ── Deal Evaluations ── */}
          <div className="adm-section rv vis rv-d3">
            <div className="adm-section-head">
              <span className="adm-section-title">Deal Evaluations ({dealEvaluations.length})</span>
            </div>
            {dealEvaluations.length > 0 ? (
              dealEvaluations.map((deal) => {
                const verdict = dealVerdicts.find((v) => v.evaluation_id === deal.id);
                return (
                  <div key={deal.id} className="adm-expandable">
                    <button
                      className="adm-expandable-header"
                      onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
                    >
                      <div className="adm-expandable-left">
                        {deal.overall_signal && (
                          <span
                            className="adm-signal-dot"
                            style={{ background: signalColor(deal.overall_signal) }}
                          />
                        )}
                        <span className="adm-expandable-title">
                          {deal.deal_name || "Untitled Deal"}
                        </span>
                        {deal.deal_type && (
                          <span className="adm-expandable-meta">{formatKey(deal.deal_type)}</span>
                        )}
                        {deal.overall_score != null && (
                          <span className="adm-expandable-meta">
                            Score: {deal.overall_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <svg className={`adm-expandable-chevron${expandedDeal === deal.id ? " open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {expandedDeal === deal.id && (
                      <div className="adm-expandable-body">
                        <div className="adm-profile-grid">
                          <div className="adm-profile-card">
                            <div className="adm-profile-card-title">Deal Details</div>
                            <ProfileRow label="Deal Name" value={deal.deal_name} />
                            <ProfileRow label="Deal Type" value={deal.deal_type ? formatKey(deal.deal_type) : null} />
                            <ProfileRow label="Creative Mode" value={deal.creative_mode ? formatKey(deal.creative_mode) : null} />
                            <ProfileRow label="Status" value={formatKey(deal.status)} />
                            <ProfileRow label="Started" value={fmtDate(deal.started_at)} />
                            <ProfileRow label="Completed" value={fmtDate(deal.completed_at)} />
                            {deal.deal_outcome && <ProfileRow label="Outcome" value={formatKey(deal.deal_outcome)} />}
                            {deal.outcome_notes && <ProfileRow label="Outcome Notes" value={deal.outcome_notes} long />}
                          </div>
                          <div className="adm-profile-card">
                            <div className="adm-profile-card-title">Scoring</div>
                            <ProfileRow
                              label="Overall Score"
                              value={deal.overall_score != null ? deal.overall_score.toFixed(1) : null}
                              bold
                            />
                            <ProfileRow
                              label="Signal"
                              value={deal.overall_signal ? (
                                <span style={{ color: signalColor(deal.overall_signal), fontWeight: 600 }}>
                                  {formatKey(deal.overall_signal)}
                                </span>
                              ) : "—"}
                            />
                            {deal.scores && Object.keys(deal.scores).length > 0 && (
                              <>
                                <div className="adm-profile-card-title" style={{ marginTop: "12px" }}>Dimension Scores</div>
                                {Object.entries(deal.scores).map(([dim, score]) => (
                                  <ProfileRow key={dim} label={formatKey(dim)} value={extractScore(score)} />
                                ))}
                              </>
                            )}
                            {deal.red_flags && deal.red_flags.length > 0 && (
                              <>
                                <div className="adm-profile-card-title" style={{ marginTop: "12px", color: "#dc2626" }}>Red Flags ({deal.red_flags.length})</div>
                                {deal.red_flags.map((flag, i) => (
                                  <div key={i} className="adm-profile-row">
                                    <span className="adm-profile-value" style={{ color: "#dc2626" }}>{formatKey(flag)}</span>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Dimension Answers */}
                        <DimensionAnswers deal={deal} />

                        {/* Verdict */}
                        {verdict && (
                          <VerdictDisplay verdict={verdict} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="adm-subtitle">No deal evaluations.</p>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ ASSET INVENTORY TAB ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === "inventory" && (
        <>
          {/* Summary Metrics */}
          {inventoryItems.length > 0 && (() => {
            const fullyOwned = inventoryItems.filter((i) => i.ownership_status === "own_fully").length;
            const highPotential = inventoryItems.filter((i) => i.licensing_potential === "high").length;
            return (
              <div className="adm-metrics rv vis rv-d2">
                <div className="adm-stat">
                  <div className="adm-stat-label">Total Assets</div>
                  <div className="adm-stat-value">{inventoryItems.length}</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Fully Owned</div>
                  <div className="adm-stat-value">{fullyOwned}</div>
                  <div className="adm-stat-change">of {inventoryItems.length} assets</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">High Potential</div>
                  <div className="adm-stat-value">{highPotential}</div>
                  <div className="adm-stat-change">high licensing potential</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Analyses</div>
                  <div className="adm-stat-value">{inventoryAnalyses.length}</div>
                  <div className="adm-stat-change">portfolio analyses</div>
                </div>
              </div>
            );
          })()}

          {/* ── Asset Inventory ── */}
          <div className="adm-section rv vis rv-d3">
            <div className="adm-section-head">
              <span className="adm-section-title">Asset Inventory ({inventoryItems.length})</span>
            </div>
            {inventoryItems.length > 0 ? (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Type</th>
                      <th>Ownership</th>
                      <th>Licensing Potential</th>
                      <th>Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => {
                      const badge = potentialBadge(item.licensing_potential);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="adm-name">{item.asset_name}</div>
                            {item.description && (
                              <div style={{ fontSize: "12px", color: "var(--light)", marginTop: 2 }}>
                                {item.description.length > 80
                                  ? item.description.slice(0, 80) + "..."
                                  : item.description}
                              </div>
                            )}
                          </td>
                          <td>{formatKey(item.asset_type)}</td>
                          <td>{formatKey(item.ownership_status)}</td>
                          <td>
                            <span style={{
                              color: badge.color,
                              background: badge.bg,
                              padding: "2px 8px",
                              borderRadius: "2px",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}>
                              {formatKey(item.licensing_potential)}
                            </span>
                          </td>
                          <td>{fmtDate(item.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="adm-subtitle">No assets inventoried.</p>
            )}
          </div>

          {/* ── Asset Portfolio Analysis ── */}
          {inventoryAnalyses.length > 0 && (
            <div className="adm-section rv vis rv-d3">
              <div className="adm-section-head">
                <span className="adm-section-title">Asset Portfolio Analysis ({inventoryAnalyses.length})</span>
              </div>
              {inventoryAnalyses.map((analysis) => (
                <div key={analysis.id} className="adm-expandable">
                  <button
                    className="adm-expandable-header"
                    onClick={() => setExpandedAnalysis(expandedAnalysis === analysis.id ? null : analysis.id)}
                  >
                    <div className="adm-expandable-left">
                      <span className={`adm-status ${analysis.status}`}>{formatKey(analysis.status)}</span>
                      <span className="adm-expandable-title">
                        Portfolio Analysis — {fmtDate(analysis.created_at)}
                      </span>
                      <span className="adm-expandable-meta">{analysis.item_count} assets analyzed</span>
                    </div>
                    <svg className={`adm-expandable-chevron${expandedAnalysis === analysis.id ? " open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedAnalysis === analysis.id && (
                    <div className="adm-expandable-body">
                      <AnalysisDisplay content={analysis.analysis_content} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="page-footer" />
    </>
  );
}

/* ── Reusable Components ── */

function ProfileRow({
  label,
  value,
  bold,
  long,
}: {
  label: string;
  value: React.ReactNode | string | null;
  bold?: boolean;
  long?: boolean;
}) {
  return (
    <div className="adm-profile-row">
      <span className="adm-profile-label">{label}</span>
      <span className={`adm-profile-value${long ? " adm-profile-value--long" : ""}`} style={bold ? { fontWeight: 600 } : undefined}>
        {value || "—"}
      </span>
    </div>
  );
}

function hasDeepDive(assessment: Assessment): boolean {
  return (
    (!!assessment.stage_questions && Object.keys(assessment.stage_questions).length > 0) ||
    (!!assessment.industry_questions && Object.keys(assessment.industry_questions).length > 0) ||
    (!!assessment.discernment_questions && Object.keys(assessment.discernment_questions).length > 0)
  );
}

function JsonAnswerCards({
  sections,
}: {
  sections: Array<{ title: string; data: Record<string, string> | null }>;
}) {
  return (
    <>
      {sections.map(({ title, data }) => {
        if (!data || Object.keys(data).length === 0) return null;
        return (
          <div key={title} className="adm-profile-card" style={{ marginBottom: "1rem" }}>
            <div className="adm-profile-card-title">{title}</div>
            {Object.entries(data).map(([k, v]) => (
              <ProfileRow key={k} label={formatKey(k)} value={typeof v === "string" ? v : JSON.stringify(v)} long />
            ))}
          </div>
        );
      })}
    </>
  );
}

/* ── Question labels for deal evaluator dimensions ── */
const QUESTION_LABELS: Record<string, string> = {
  F1: "Cash compensation", F2: "Market rate comparison", F3: "Financial buffer",
  F4: "Months of savings", F5: "Income concentration %", F6: "Equity % offered",
  F7: "Equity valuation basis", F8: "Valuation method", F10: "Can wait for liquidity",
  F11: "Guaranteed minimum", F12: "Revenue/profit definition",
  C1: "Current stage", C2: "Stage progression impact", C3: "Portfolio visibility",
  C4: "New access gained", C5: "Future deal leverage", C6: "Below current level",
  C7: "Specialist vs generalist", C8: "Strategic partner or vendor",
  C9: "Judgment vs execution", C10: "Ownership included", C11: "Portfolio asset added",
  C12: "Deal leverage created",
  P1: "Relationship history", P2: "Track record", P3: "Fair dealing history",
  P4: "Financial stability", P5: "Transparency level", P6: "Scope creep history",
  P7: "Decision-maker clarity", P8: "Founder experience", P9: "Funding & runway",
  P10: "Product-market fit", P11: "Market size (TAM)", P12: "Distribution capability",
  P13: "Past licensing record",
  D1: "Value capture position", D2: "Scope clarity", D3: "Exit/termination terms",
  D4: "Rights retained", D5: "Exclusivity/non-compete", D6: "Audit rights",
  D7: "Equity type", D8: "Vesting schedule", D9: "Change of control acceleration",
  D10: "Pro-rata rights", D11: "Information rights", D12: "Anti-dilution protection",
  D13: "Revenue calculation basis", D14: "Deduction caps", D15: "Payment floor",
  D16: "Dispute resolution", D17: "Exclusive or non-exclusive", D18: "License term",
  D19: "Reversion rights", D20: "Territory & media limits", D21: "Sublicensing rights",
  D22: "Operating agreement", D23: "Decision-making process", D24: "Partner exit terms",
  D25: "IP ownership allocation",
  R1: "Worst realistic outcome", R2: "Downside if deal fails", R3: "Income diversification",
  R4: "Prior deal experience", R5: "Downside protections", R6: "Exit timeline",
  R7: "Current equity positions", R8: "Burn rate vs runway",
  L1: "Lawyer review", L2: "Tax implications understood", L3: "Written agreement",
  L4: "Jurisdiction provisions", L5: "83(b) election discussed", L6: "Stock options vs RSUs",
  L7: "Entity structure fit",
};

function questionLabel(id: string): string {
  return QUESTION_LABELS[id.toUpperCase()] || formatKey(id);
}

function DimensionAnswers({ deal }: { deal: DealEvaluation }) {
  const dimensions = [
    { label: "Financial", data: deal.answers_financial },
    { label: "Career", data: deal.answers_career },
    { label: "Partner", data: deal.answers_partner },
    { label: "Structure", data: deal.answers_structure },
    { label: "Risk", data: deal.answers_risk },
    { label: "Legal", data: deal.answers_legal },
  ].filter((d) => d.data && Object.keys(d.data).length > 0);

  if (dimensions.length === 0) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <div className="adm-profile-card-title">Dimension Answers</div>
      <div className="adm-profile-grid">
        {dimensions.map(({ label, data }) => (
          <div key={label} className="adm-profile-card">
            <div className="adm-profile-card-title">{label}</div>
            {Object.entries(data!).map(([k, v]) => {
              const val = extractValue(v);
              const CURRENCY_KEYS = new Set(["F1", "F2", "F3"]);
              const key = k.toUpperCase();
              let displayVal: string | number;
              const numVal = typeof val === "number" ? val : (typeof val === "string" && /^\d+$/.test(val) ? Number(val) : null);
              if (CURRENCY_KEYS.has(key) && numVal !== null) {
                displayVal = "$" + numVal.toLocaleString();
              } else {
                displayVal = typeof val === "string" ? formatKey(val) : val;
              }
              return (
                <div key={k} className="adm-dim-row">
                  <div className="adm-dim-id">{k.toUpperCase()}</div>
                  <div className="adm-dim-body">
                    <div className="adm-dim-label">{questionLabel(k)}</div>
                    <div className="adm-dim-value">{displayVal || "---"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function VerdictDisplay({ verdict }: { verdict: DealVerdict }) {
  const vc = verdict.verdict_content as {
    signal?: { color?: string; headline?: string; summary?: string };
    dimension_summaries?: Record<string, string>;
    recommended_actions?: Array<{ order: number; action: string; detail: string; structure_ref?: { id: number; slug: string; title: string } }>;
    resources?: { structures?: Array<{ id: number; slug: string; title: string; why: string }>; case_studies?: Array<{ slug: string; title: string; why: string }> };
  };

  if (!vc || Object.keys(vc).length === 0) {
    return (
      <div style={{ marginTop: "1rem" }}>
        <div className="adm-profile-card-title">AI Verdict</div>
        <p className="adm-subtitle">Verdict pending.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <div className="adm-profile-card-title">AI Verdict</div>

      {/* Signal Header */}
      {vc.signal && (
        <div className="adm-verdict-signal" style={{ borderLeftColor: signalColor(vc.signal.color ?? null) }}>
          <div className="adm-verdict-headline">{vc.signal.headline}</div>
          <div className="adm-verdict-summary">{vc.signal.summary}</div>
        </div>
      )}

      {/* Dimension Summaries */}
      {vc.dimension_summaries && Object.keys(vc.dimension_summaries).length > 0 && (
        <div className="adm-profile-card" style={{ marginTop: "1rem" }}>
          <div className="adm-profile-card-title">Dimension Summaries</div>
          {Object.entries(vc.dimension_summaries).map(([dim, summary]) => (
            <div key={dim} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", alignItems: "baseline" }}>
              <span style={{ fontSize: "14px", color: "var(--light)" }}>{formatKey(dim)}</span>
              <span style={{ fontSize: "14px", color: "var(--black)", fontWeight: 500, lineHeight: 1.6, textAlign: "left" }}>{summary}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Actions */}
      {vc.recommended_actions && vc.recommended_actions.length > 0 && (
        <div className="adm-profile-card" style={{ marginTop: "1rem" }}>
          <div className="adm-profile-card-title">Recommended Actions</div>
          {vc.recommended_actions
            .sort((a, b) => a.order - b.order)
            .map((action, i) => (
              <div key={i} className="adm-verdict-action">
                <div className="adm-verdict-action-num">{action.order}</div>
                <div>
                  <div className="adm-verdict-action-title">{action.action}</div>
                  <div className="adm-verdict-action-detail">{action.detail}</div>
                  {action.structure_ref && (
                    <div className="adm-verdict-action-ref">
                      Structure: {action.structure_ref.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Resources */}
      {vc.resources && (
        (vc.resources.structures?.length ?? 0) > 0 || (vc.resources.case_studies?.length ?? 0) > 0
      ) && (
        <div className="adm-profile-card" style={{ marginTop: "1rem" }}>
          <div className="adm-profile-card-title">Linked Resources</div>
          {vc.resources.structures && vc.resources.structures.length > 0 && (
            <>
              <div className="adm-profile-card-title" style={{ marginTop: "8px", fontSize: "9px", color: "var(--light)" }}>Structures</div>
              {vc.resources.structures.map((s, i) => (
                <div key={i} className="adm-profile-row" style={{ alignItems: "flex-start" }}>
                  <span className="adm-profile-label">{s.title}</span>
                  <span className="adm-profile-value adm-profile-value--long">{s.why}</span>
                </div>
              ))}
            </>
          )}
          {vc.resources.case_studies && vc.resources.case_studies.length > 0 && (
            <>
              <div className="adm-profile-card-title" style={{ marginTop: "8px", fontSize: "9px", color: "var(--light)" }}>Case Studies</div>
              {vc.resources.case_studies.map((cs, i) => (
                <div key={i} className="adm-profile-row" style={{ alignItems: "flex-start" }}>
                  <span className="adm-profile-label">{cs.title}</span>
                  <span className="adm-profile-value adm-profile-value--long">{cs.why}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RoadmapDisplay({ content, markdown }: { content: Record<string, unknown>; markdown: string | null }) {
  // Try to render structured plan_content
  const pc = content as {
    position?: {
      detected_stage?: number;
      stage_name?: string;
      stage_description?: string;
      transition_readiness?: string;
      industry_context?: string;
      misalignments?: Array<{ flag: string; what_its_costing: string; why_it_matters: string }>;
    };
    actions?: Array<{
      order: number;
      type: string;
      title: string;
      what: string;
      why: string;
      how: string;
      timeline: string;
      done_signal: string;
    }>;
    vision?: {
      twelve_month_target?: string;
      three_year_horizon?: string;
      transition_signals?: string[];
    };
    library?: {
      recommended_structures?: Array<{ id: number; title: string; why: string }>;
      recommended_cases?: Array<{ slug: string; title: string; why: string }>;
      reading_path?: string[];
    };
  };

  // If we have structured content with known keys, render it nicely
  if (pc.position || pc.actions || pc.vision) {
    return (
      <>
        {/* Position */}
        {pc.position && (
          <div className="adm-profile-card" style={{ marginTop: "1rem" }}>
            <div className="adm-profile-card-title">Position</div>
            <ProfileRow label="Stage" value={pc.position.stage_name ? `Stage ${pc.position.detected_stage} — ${pc.position.stage_name}` : null} bold />
            <ProfileRow label="Description" value={pc.position.stage_description} long />
            <ProfileRow label="Transition Readiness" value={pc.position.transition_readiness} />
            <ProfileRow label="Industry Context" value={pc.position.industry_context} long />
            {pc.position.misalignments && pc.position.misalignments.length > 0 && (
              <>
                <div className="adm-profile-card-title" style={{ marginTop: "12px", color: "#dc2626" }}>Misalignments</div>
                {pc.position.misalignments.map((m, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#dc2626" }}>{formatKey(m.flag)}</div>
                    <div style={{ fontSize: "12px", color: "var(--mid)", lineHeight: 1.5 }}>{m.what_its_costing}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Actions */}
        {pc.actions && pc.actions.length > 0 && (
          <div className="adm-profile-card" style={{ marginTop: "1rem" }}>
            <div className="adm-profile-card-title">Action Plan</div>
            {pc.actions
              .sort((a, b) => a.order - b.order)
              .map((action, i) => (
                <div key={i} className="adm-verdict-action" style={{ alignItems: "flex-start", paddingBottom: 16, marginBottom: 4 }}>
                  <div className="adm-verdict-action-num">{action.order}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                      <span className="adm-verdict-action-title" style={{ marginBottom: 0 }}>{action.title}</span>
                      <span style={{ fontSize: "10px", fontFamily: "var(--mono)", color: "var(--light)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>
                        {formatKey(action.type)} · {action.timeline}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--black)", lineHeight: 1.6, marginBottom: 8 }}>{action.what}</div>
                    {(action.why || action.how) && (
                      <div style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--mid)", borderLeft: "2px solid rgba(0,0,0,0.06)", paddingLeft: 12, marginBottom: 8 }}>
                        {action.why && <div><span style={{ fontWeight: 500, color: "var(--light)", fontSize: "10px", textTransform: "uppercase", letterSpacing: ".05em" }}>Why</span><br />{action.why}</div>}
                        {action.how && <div style={{ marginTop: action.why ? 6 : 0 }}><span style={{ fontWeight: 500, color: "var(--light)", fontSize: "10px", textTransform: "uppercase", letterSpacing: ".05em" }}>How</span><br />{action.how}</div>}
                      </div>
                    )}
                    {action.done_signal && (
                      <div style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--light)", background: "rgba(0,0,0,0.02)", padding: "6px 10px", borderRadius: 4, letterSpacing: ".01em" }}>
                        ✓ Done when: {action.done_signal}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Vision */}
        {pc.vision && (
          <div className="adm-profile-card" style={{ marginTop: "1rem" }}>
            <div className="adm-profile-card-title">Vision</div>
            <ProfileRow label="12-Month Target" value={pc.vision.twelve_month_target} long />
            <ProfileRow label="3-Year Horizon" value={pc.vision.three_year_horizon} long />
            {pc.vision.transition_signals && pc.vision.transition_signals.length > 0 && (
              <ProfileRow label="Transition Signals" value={pc.vision.transition_signals.join(", ")} long />
            )}
          </div>
        )}

        {/* Library Recommendations */}
        {pc.library && (
          <div className="adm-profile-card" style={{ marginTop: "1rem" }}>
            <div className="adm-profile-card-title">Recommended Resources</div>
            {pc.library.recommended_structures && pc.library.recommended_structures.length > 0 && (
              <>
                <div style={{ fontSize: "10px", color: "var(--light)", fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: "8px", marginBottom: "4px" }}>Structures</div>
                {pc.library.recommended_structures.map((s, i) => (
                  <ProfileRow key={i} label={s.title} value={s.why} long />
                ))}
              </>
            )}
            {pc.library.recommended_cases && pc.library.recommended_cases.length > 0 && (
              <>
                <div style={{ fontSize: "10px", color: "var(--light)", fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: "12px", marginBottom: "4px" }}>Case Studies</div>
                {pc.library.recommended_cases.map((cs, i) => (
                  <ProfileRow key={i} label={cs.title} value={cs.why} long />
                ))}
              </>
            )}
            {pc.library.reading_path && pc.library.reading_path.length > 0 && (
              <ProfileRow label="Reading Path" value={pc.library.reading_path.join(" → ")} long />
            )}
          </div>
        )}
      </>
    );
  }

  // Fallback to markdown or JSON
  if (markdown) {
    return <div className="adm-markdown-block">{markdown}</div>;
  }

  if (content && Object.keys(content).length > 0) {
    return (
      <pre className="adm-json-block">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  }

  return null;
}

function AnalysisDisplay({ content }: { content: Record<string, unknown> }) {
  const ac = content as {
    summary?: {
      total_assets?: number;
      estimated_total_value_range?: string;
      leverage_score?: string;
      key_insight?: string;
    };
    asset_valuations?: Array<{
      asset_name: string;
      asset_type?: string;
      estimated_value_range: string;
      value_rationale: string;
      immediate_actions?: string[];
    }>;
    scenarios?: Array<{
      scenario_name: string;
      description: string;
      potential_value: string;
      required_steps?: string[];
      timeline: string;
      risk_level: string;
    }>;
    roadmap?: {
      immediate_actions?: Array<{ order: number; action: string; why: string; timeline: string }>;
      medium_term?: string;
      long_term_vision?: string;
      recommended_structures?: number[];
    };
  };

  if (!ac || Object.keys(ac).length === 0) {
    return <p className="adm-subtitle">Analysis content unavailable.</p>;
  }

  // If we don't recognize the structure, fall back to JSON
  if (!ac.summary && !ac.asset_valuations && !ac.scenarios && !ac.roadmap) {
    return (
      <pre className="adm-json-block">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  }

  return (
    <>
      {/* Summary */}
      {ac.summary && (
        <div className="adm-verdict-signal" style={{ borderLeftColor: "#2a7d2a", marginBottom: "1rem" }}>
          <div className="adm-verdict-headline">
            {ac.summary.estimated_total_value_range && (
              <span>Est. Portfolio Value: {ac.summary.estimated_total_value_range}</span>
            )}
            {ac.summary.leverage_score && (
              <span style={{ marginLeft: 16, fontSize: "13px", fontWeight: 400, color: "var(--mid)" }}>
                Leverage Score: {ac.summary.leverage_score}
              </span>
            )}
          </div>
          {ac.summary.key_insight && (
            <div className="adm-verdict-summary">{ac.summary.key_insight}</div>
          )}
        </div>
      )}

      {/* Asset Valuations */}
      {ac.asset_valuations && ac.asset_valuations.length > 0 && (
        <div className="adm-profile-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-profile-card-title">Asset Valuations</div>
          {ac.asset_valuations.map((av, i) => (
            <div key={i} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: i < ac.asset_valuations!.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <span style={{ fontWeight: 500, fontSize: "13px", color: "var(--black)" }}>
                  {av.asset_name}
                  {av.asset_type && (
                    <span style={{ marginLeft: 8, fontSize: "10px", color: "var(--light)", fontWeight: 400 }}>
                      {formatKey(av.asset_type)}
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 600, color: "#2a7d2a" }}>
                  {av.estimated_value_range}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--mid)", lineHeight: 1.5, marginBottom: "4px" }}>
                {av.value_rationale}
              </div>
              {av.immediate_actions && av.immediate_actions.length > 0 && (
                <div style={{ fontSize: "11px", color: "var(--light)" }}>
                  Actions: {av.immediate_actions.join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scenarios */}
      {ac.scenarios && ac.scenarios.length > 0 && (
        <div className="adm-profile-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-profile-card-title">Monetization Scenarios</div>
          {ac.scenarios.map((s, i) => (
            <div key={i} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: i < ac.scenarios!.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <span style={{ fontWeight: 500, fontSize: "13px", color: "var(--black)" }}>{s.scenario_name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 600, color: "#2a7d2a" }}>
                  {s.potential_value}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--mid)", lineHeight: 1.5, marginBottom: "4px" }}>
                {s.description}
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "var(--light)" }}>
                <span>Timeline: {s.timeline}</span>
                <span>Risk: {s.risk_level}</span>
              </div>
              {s.required_steps && s.required_steps.length > 0 && (
                <div style={{ fontSize: "11px", color: "var(--light)", marginTop: "4px" }}>
                  Steps: {s.required_steps.join(" → ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Roadmap */}
      {ac.roadmap && (
        <div className="adm-profile-card">
          <div className="adm-profile-card-title">Portfolio Roadmap</div>
          {ac.roadmap.immediate_actions && ac.roadmap.immediate_actions.length > 0 && (
            <>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--light)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Immediate Actions</div>
              {ac.roadmap.immediate_actions
                .sort((a, b) => a.order - b.order)
                .map((action, i) => (
                  <div key={i} className="adm-verdict-action" style={{ alignItems: "flex-start", paddingBottom: 14, marginBottom: 2 }}>
                    <div className="adm-verdict-action-num">{action.order}</div>
                    <div style={{ flex: 1 }}>
                      <div className="adm-verdict-action-title" style={{ marginBottom: 4 }}>{action.action}</div>
                      <div style={{ fontSize: "12px", color: "var(--mid)", lineHeight: 1.6, borderLeft: "2px solid rgba(0,0,0,0.06)", paddingLeft: 12, marginBottom: 6 }}>{action.why}</div>
                      <div style={{ fontSize: "10px", fontFamily: "var(--mono)", color: "var(--light)", letterSpacing: ".02em" }}>{action.timeline}</div>
                    </div>
                  </div>
                ))}
            </>
          )}
          {(ac.roadmap.medium_term || ac.roadmap.long_term_vision) && (
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: 8, paddingTop: 12 }}>
              {ac.roadmap.medium_term && (
                <div style={{ marginBottom: ac.roadmap.long_term_vision ? 12 : 0 }}>
                  <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--light)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Medium Term</div>
                  <div style={{ fontSize: "13px", color: "var(--mid)", lineHeight: 1.6 }}>{ac.roadmap.medium_term}</div>
                </div>
              )}
              {ac.roadmap.long_term_vision && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--light)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Long-Term Vision</div>
                  <div style={{ fontSize: "13px", color: "var(--black)", lineHeight: 1.6 }}>{ac.roadmap.long_term_vision}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
