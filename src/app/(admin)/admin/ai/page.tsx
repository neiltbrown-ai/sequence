"use client";

import { useState, useEffect, useCallback } from "react";

/* ── AI Stats Types ── */
interface AIStats {
  totalConversations: number;
  activeConversations7d: number;
  totalMessages: number;
  messages30d: number;
  byMode: Array<{
    mode: string;
    conversations: number;
    messages: number;
    lastUsed: string | null;
    plans: number;
    verdicts: number;
    analyses: number;
    estimatedCost: number;
  }>;
  topUsers: Array<{
    name: string;
    conversations: number;
    messages: number;
    lastActive: string | null;
    generations?: { plans: number; verdicts: number; analyses: number };
    estimatedCost?: number;
  }>;
  generations: {
    strategicPlans: number;
    dealVerdicts: number;
    inventoryAnalyses: number;
  };
  costs: {
    totalAllTime: number;
    last30d: number;
    projected90d: number;
    rates: {
      perMessage: number;
      perRoadmap: number;
      perVerdict: number;
      perAnalysis: number;
    };
    last30dBreakdown: {
      messages: number;
      plans: number;
      verdicts: number;
      analyses: number;
    };
  };
}

/* ── Settings Types ── */
interface Setting {
  key: string;
  value: string;
  label: string | null;
  description: string | null;
  category: string | null;
  updated_at: string | null;
}

interface EditState {
  [key: string]: {
    value: string;
    saving: boolean;
    saved: boolean;
    error: string | null;
  };
}

/* ── Helpers ── */
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(v);

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function modeLabel(mode: string): string {
  switch (mode) {
    case "map": return "Assessment";
    case "assessment": return "Assessment";
    case "evaluate": return "Deal Evaluator";
    case "evaluator": return "Deal Evaluator";
    case "negotiation": return "Negotiation";
    case "library": return "Library";
    case "action_coaching": return "Action Coaching";
    case "explore": return "Explore";
    case "general": return "General / Explore";
    default: return mode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function parseValue(val: unknown): string {
  if (typeof val === "string") return val;
  if (val === null || val === undefined) return "";
  return String(val);
}

const NON_CURRENCY_KEYS = new Set([
  "ai_regen_multiplier",
  "ai_model_primary",
]);

type SubTab = "usage" | "config";

export default function AdminAIPage() {
  const [subTab, setSubTab] = useState<SubTab>("usage");

  // AI Stats state
  const [stats, setStats] = useState<AIStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<Setting[]>([]);
  const [edits, setEdits] = useState<EditState>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Fetch AI stats
  useEffect(() => {
    fetch("/api/admin/ai/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setStats(d);
      })
      .catch((e) => setStatsError(e.message));
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = (data.settings ?? []).map((s: Setting) => ({
        ...s,
        value: parseValue(s.value),
      }));
      setSettings(parsed);
      const initial: EditState = {};
      for (const s of parsed) {
        initial[s.key] = { value: s.value, saving: false, saved: false, error: null };
      }
      setEdits(initial);
    } catch (e) {
      setSettingsError((e as Error).message);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key: string, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, saved: false, error: null },
    }));
  };

  const handleSave = async (key: string) => {
    const edit = edits[key];
    if (!edit) return;

    setEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], saving: true, error: null },
    }));

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: edit.value }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSettings((prev) =>
        prev.map((s) =>
          s.key === key
            ? { ...s, value: parseValue(data.setting.value), updated_at: data.setting.updated_at }
            : s
        )
      );
      setEdits((prev) => ({
        ...prev,
        [key]: { ...prev[key], saving: false, saved: true },
      }));
      setTimeout(() => {
        setEdits((prev) => ({
          ...prev,
          [key]: prev[key] ? { ...prev[key], saved: false } : prev[key],
        }));
      }, 2000);
    } catch (e) {
      setEdits((prev) => ({
        ...prev,
        [key]: { ...prev[key], saving: false, error: (e as Error).message },
      }));
    }
  };

  const isDirty = (key: string) => {
    const setting = settings.find((s) => s.key === key);
    const edit = edits[key];
    return setting && edit && edit.value !== setting.value;
  };

  const costSettings = settings.filter((s) => s.category === "ai_costs");
  const configSettings = settings.filter((s) => s.category === "ai_config");

  return (
    <>
      <div className="adm-header rv vis">
        <h1 className="adm-title">AI & Configuration</h1>
        <p className="adm-subtitle">
          Usage metrics, cost tracking, and platform settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="adm-tabs rv vis rv-d1">
        <button
          className={`adm-tab${subTab === "usage" ? " active" : ""}`}
          onClick={() => setSubTab("usage")}
        >
          Usage
        </button>
        <button
          className={`adm-tab${subTab === "config" ? " active" : ""}`}
          onClick={() => setSubTab("config")}
        >
          Configuration
        </button>
      </div>

      {/* ═══ USAGE TAB ═══ */}
      {subTab === "usage" && (
        <>
          {statsError ? (
            <p className="adm-subtitle" style={{ color: "var(--red)", padding: "20px 0" }}>
              Error: {statsError}
            </p>
          ) : !stats ? (
            <p className="adm-subtitle" style={{ padding: "20px 0" }}>Loading...</p>
          ) : (
            <>
              {/* Metric Cards */}
              <div className="adm-metrics rv vis rv-d1">
                <div className="adm-stat">
                  <div className="adm-stat-label">Total Conversations</div>
                  <div className="adm-stat-value">
                    {stats.totalConversations.toLocaleString()}
                  </div>
                  <div className="adm-stat-change">all time</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Active (7d)</div>
                  <div className="adm-stat-value">
                    {stats.activeConversations7d.toLocaleString()}
                  </div>
                  <div className="adm-stat-change">last 7 days</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Total Messages</div>
                  <div className="adm-stat-value">
                    {stats.totalMessages.toLocaleString()}
                  </div>
                  <div className="adm-stat-change">all time</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Messages (30d)</div>
                  <div className="adm-stat-value">
                    {stats.messages30d.toLocaleString()}
                  </div>
                  <div className="adm-stat-change">last 30 days</div>
                </div>
              </div>

              {/* Usage by Mode */}
              {stats.byMode.length > 0 && (
                <div className="adm-section rv vis rv-d2">
                  <div className="adm-section-head">
                    <span className="adm-section-title">Usage by Mode</span>
                  </div>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Mode</th>
                          <th>Conversations</th>
                          <th>Messages</th>
                          <th>Generations</th>
                          <th>Est. Cost</th>
                          <th>Last Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byMode.map((m) => {
                          const genParts = [];
                          if (m.plans) genParts.push(`${m.plans} plan${m.plans > 1 ? "s" : ""}`);
                          if (m.verdicts) genParts.push(`${m.verdicts} verdict${m.verdicts > 1 ? "s" : ""}`);
                          if (m.analyses) genParts.push(`${m.analyses} analys${m.analyses > 1 ? "es" : "is"}`);
                          return (
                            <tr key={m.mode}>
                              <td className="adm-name">{modeLabel(m.mode)}</td>
                              <td>{m.conversations.toLocaleString()}</td>
                              <td>{m.messages.toLocaleString()}</td>
                              <td>{genParts.length > 0 ? genParts.join(", ") : "—"}</td>
                              <td style={{ fontWeight: 500 }}>{fmtCurrency(m.estimatedCost)}</td>
                              <td>{fmtDate(m.lastUsed)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top Users */}
              {stats.topUsers.length > 0 && (
                <div className="adm-section rv vis rv-d3">
                  <div className="adm-section-head">
                    <span className="adm-section-title">Top Users</span>
                  </div>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Conversations</th>
                          <th>Messages</th>
                          <th>Generations</th>
                          <th>Est. Cost</th>
                          <th>Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topUsers.map((u, i) => {
                          const gen = u.generations;
                          const genParts = [];
                          if (gen?.plans) genParts.push(`${gen.plans} plan${gen.plans > 1 ? "s" : ""}`);
                          if (gen?.verdicts) genParts.push(`${gen.verdicts} verdict${gen.verdicts > 1 ? "s" : ""}`);
                          if (gen?.analyses) genParts.push(`${gen.analyses} analys${gen.analyses > 1 ? "es" : "is"}`);
                          return (
                            <tr key={i}>
                              <td className="adm-name">{u.name}</td>
                              <td>{u.conversations.toLocaleString()}</td>
                              <td>{u.messages.toLocaleString()}</td>
                              <td>{genParts.length > 0 ? genParts.join(", ") : "—"}</td>
                              <td style={{ fontWeight: 500 }}>{u.estimatedCost != null ? fmtCurrency(u.estimatedCost) : "—"}</td>
                              <td>{fmtDate(u.lastActive)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cost Overview */}
              <div className="adm-section rv vis rv-d4">
                <div className="adm-section-head">
                  <span className="adm-section-title">Cost Overview</span>
                </div>
                <div className="adm-metrics">
                  <div className="adm-stat">
                    <div className="adm-stat-label">Total Cost (All Time)</div>
                    <div className="adm-stat-value">{fmtCurrency(stats.costs.totalAllTime)}</div>
                    <div className="adm-stat-change">
                      {stats.totalMessages.toLocaleString()} msgs + {(stats.generations.strategicPlans + stats.generations.dealVerdicts + stats.generations.inventoryAnalyses).toLocaleString()} generations
                    </div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">Last 30 Days</div>
                    <div className="adm-stat-value">{fmtCurrency(stats.costs.last30d)}</div>
                    <div className="adm-stat-change">
                      {stats.costs.last30dBreakdown.messages.toLocaleString()} msgs · {stats.costs.last30dBreakdown.plans + stats.costs.last30dBreakdown.verdicts + stats.costs.last30dBreakdown.analyses} gens
                    </div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">90-Day Projection</div>
                    <div className="adm-stat-value" style={{ color: stats.costs.projected90d > 50 ? "var(--red)" : "var(--black)" }}>
                      {fmtCurrency(stats.costs.projected90d)}
                    </div>
                    <div className="adm-stat-change">based on 30d run rate × 3</div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">Avg Cost per Message</div>
                    <div className="adm-stat-value">{fmtCurrency(stats.costs.rates.perMessage)}</div>
                    <div className="adm-stat-change">per AI response</div>
                  </div>
                </div>
              </div>

              {/* Generation Counts */}
              <div className="adm-section rv vis rv-d5">
                <div className="adm-section-head">
                  <span className="adm-section-title">Generation Counts</span>
                </div>
                <div className="adm-metrics">
                  <div className="adm-stat">
                    <div className="adm-stat-label">Strategic Plans</div>
                    <div className="adm-stat-value">
                      {stats.generations.strategicPlans.toLocaleString()}
                    </div>
                    <div className="adm-stat-change">{fmtCurrency(stats.costs.rates.perRoadmap)}/ea</div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">Deal Verdicts</div>
                    <div className="adm-stat-value">
                      {stats.generations.dealVerdicts.toLocaleString()}
                    </div>
                    <div className="adm-stat-change">{fmtCurrency(stats.costs.rates.perVerdict)}/ea</div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">Inventory Analyses</div>
                    <div className="adm-stat-value">
                      {stats.generations.inventoryAnalyses.toLocaleString()}
                    </div>
                    <div className="adm-stat-change">{fmtCurrency(stats.costs.rates.perAnalysis)}/ea</div>
                  </div>
                  <div className="adm-stat">
                    <div className="adm-stat-label">Total Generation Cost</div>
                    <div className="adm-stat-value">
                      {fmtCurrency(
                        stats.generations.strategicPlans * stats.costs.rates.perRoadmap +
                        stats.generations.dealVerdicts * stats.costs.rates.perVerdict +
                        stats.generations.inventoryAnalyses * stats.costs.rates.perAnalysis
                      )}
                    </div>
                    <div className="adm-stat-change">all generations combined</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ CONFIGURATION TAB ═══ */}
      {subTab === "config" && (
        <>
          {settingsError ? (
            <p className="adm-subtitle" style={{ color: "var(--red)", padding: "20px 0" }}>
              Error: {settingsError}
            </p>
          ) : settingsLoading ? (
            <p className="adm-subtitle" style={{ padding: "20px 0" }}>Loading...</p>
          ) : (
            <>
              {/* AI Cost Configuration */}
              <div className="adm-section rv vis rv-d1">
                <div className="adm-section-head">
                  <span className="adm-section-title">AI Cost Configuration</span>
                </div>
                <p style={{ fontFamily: "var(--sans)", fontSize: "12px", color: "var(--mid)", lineHeight: 1.5, margin: "0 0 1rem" }}>
                  These values are used to estimate AI costs across the platform. Adjust when model pricing or usage patterns change.
                </p>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Setting</th>
                        <th>Value</th>
                        <th>Last Updated</th>
                        <th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {costSettings.map((s) => {
                        const edit = edits[s.key];
                        if (!edit) return null;
                        const isCurrency = !NON_CURRENCY_KEYS.has(s.key);
                        return (
                          <tr key={s.key}>
                            <td>
                              <div className="adm-name">{s.label ?? s.key}</div>
                              {s.description && (
                                <div style={{ fontSize: "11px", color: "var(--light)", lineHeight: 1.4, marginTop: "2px", maxWidth: "360px" }}>
                                  {s.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                {isCurrency && (
                                  <span style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "var(--light)" }}>$</span>
                                )}
                                <input
                                  type="text"
                                  value={edit.value}
                                  onChange={(e) => handleChange(s.key, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && isDirty(s.key)) handleSave(s.key);
                                  }}
                                  style={{
                                    width: isCurrency ? "80px" : "60px",
                                    padding: "6px 8px",
                                    fontFamily: "var(--mono)",
                                    fontSize: "13px",
                                    color: "var(--black)",
                                    background: "var(--bg)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "4px",
                                    outline: "none",
                                    transition: "border-color .2s",
                                  }}
                                  onFocus={(e) => { e.target.style.borderColor = "var(--black)"; e.target.style.background = "var(--white)"; }}
                                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg)"; }}
                                />
                                {s.key === "ai_regen_multiplier" && (
                                  <span style={{ fontFamily: "var(--sans)", fontSize: "11px", color: "var(--light)", marginLeft: "4px" }}>×</span>
                                )}
                              </div>
                              {edit.error && (
                                <div style={{ fontSize: "11px", color: "#c44", marginTop: "4px" }}>{edit.error}</div>
                              )}
                            </td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--light)" }}>
                              {fmtDateTime(s.updated_at)}
                            </td>
                            <td>
                              {isDirty(s.key) ? (
                                <button
                                  className="adm-action-btn"
                                  onClick={() => handleSave(s.key)}
                                  disabled={edit.saving}
                                >
                                  {edit.saving ? "Saving..." : "Save"}
                                </button>
                              ) : edit.saved ? (
                                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "#2a7d2a", letterSpacing: ".05em" }}>
                                  Saved ✓
                                </span>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Model Configuration */}
              <div className="adm-section rv vis rv-d2">
                <div className="adm-section-head">
                  <span className="adm-section-title">AI Model Configuration</span>
                </div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Setting</th>
                        <th>Value</th>
                        <th>Last Updated</th>
                        <th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {configSettings.map((s) => {
                        const edit = edits[s.key];
                        if (!edit) return null;
                        return (
                          <tr key={s.key}>
                            <td>
                              <div className="adm-name">{s.label ?? s.key}</div>
                              {s.description && (
                                <div style={{ fontSize: "11px", color: "var(--light)", lineHeight: 1.4, marginTop: "2px" }}>
                                  {s.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <input
                                type="text"
                                value={edit.value}
                                onChange={(e) => handleChange(s.key, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && isDirty(s.key)) handleSave(s.key);
                                }}
                                style={{
                                  width: "260px",
                                  padding: "6px 8px",
                                  fontFamily: "var(--mono)",
                                  fontSize: "13px",
                                  color: "var(--black)",
                                  background: "var(--bg)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "4px",
                                  outline: "none",
                                  transition: "border-color .2s",
                                }}
                                onFocus={(e) => { e.target.style.borderColor = "var(--black)"; e.target.style.background = "var(--white)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg)"; }}
                              />
                              {edit.error && (
                                <div style={{ fontSize: "11px", color: "#c44", marginTop: "4px" }}>{edit.error}</div>
                              )}
                            </td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--light)" }}>
                              {fmtDateTime(s.updated_at)}
                            </td>
                            <td>
                              {isDirty(s.key) ? (
                                <button
                                  className="adm-action-btn"
                                  onClick={() => handleSave(s.key)}
                                  disabled={edit.saving}
                                >
                                  {edit.saving ? "Saving..." : "Save"}
                                </button>
                              ) : edit.saved ? (
                                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "#2a7d2a", letterSpacing: ".05em" }}>
                                  Saved ✓
                                </span>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="page-footer" />
    </>
  );
}
