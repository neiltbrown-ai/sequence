"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type {
  AssetInventoryItem,
  AssetInventoryAnalysis,
  AssetType,
  OwnershipStatus,
  LicensingPotential,
  InventoryAnalysisContent,
} from "@/types/inventory";
import {
  ASSET_TYPE_LABELS,
  OWNERSHIP_LABELS,
  LICENSING_LABELS,
} from "@/types/inventory";
import { PortalTabs, PortalTabPanel } from "@/components/portal/portal-tabs";
import { toTitleCase } from "@/lib/utils";

/* ── Constants ────────────────────────────────────────────────────── */

const MAX_ITEMS = 25;

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "ip", label: "IP" },
  { value: "judgment", label: "Judgment" },
  { value: "relationship", label: "Relationship" },
  { value: "process", label: "Process" },
  { value: "audience", label: "Audience" },
  { value: "brand", label: "Brand" },
];

const OWNERSHIP_OPTIONS: { value: OwnershipStatus; label: string }[] = [
  { value: "own_fully", label: "Own Fully" },
  { value: "own_partially", label: "Partial" },
  { value: "work_for_hire", label: "Work for Hire" },
  { value: "unclear", label: "Unclear" },
  { value: "no_ownership", label: "None" },
];

const LICENSING_OPTIONS: { value: LicensingPotential; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "already_licensed", label: "Licensed" },
  { value: "not_applicable", label: "N/A" },
];

/* ── Types ────────────────────────────────────────────────────────── */

type FormData = {
  asset_name: string;
  asset_type: AssetType;
  description: string;
  ownership_status: OwnershipStatus;
  licensing_potential: LicensingPotential;
  notes: string;
};

const EMPTY_FORM: FormData = {
  asset_name: "",
  asset_type: "ip",
  description: "",
  ownership_status: "unclear",
  licensing_potential: "medium",
  notes: "",
};

/* ── Component ────────────────────────────────────────────────────── */

export default function InventoryPage({
  initialItems,
  initialAnalysis,
  structureSlugMap = {},
}: {
  initialItems: AssetInventoryItem[];
  initialAnalysis: AssetInventoryAnalysis | null;
  structureSlugMap?: Record<number, { slug: string; title: string }>;
}) {
  const supabase = createClient();

  // Items state
  const [items, setItems] = useState<AssetInventoryItem[]>(initialItems);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Error state
  const [saveError, setSaveError] = useState("");

  // Analysis state
  const [analysis, setAnalysis] = useState<AssetInventoryAnalysis | null>(initialAnalysis);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  // Expanded items (for viewing description/notes)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /* ── Helpers ──────────────────────────────────────────────────── */

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isStale =
    analysis &&
    items.some((item) => new Date(item.updated_at) > new Date(analysis.created_at));

  /* ── CRUD ─────────────────────────────────────────────────────── */

  const handleAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleEdit = (item: AssetInventoryItem) => {
    setEditingId(item.id);
    setForm({
      asset_name: item.asset_name,
      asset_type: item.asset_type,
      description: item.description || "",
      ownership_status: item.ownership_status,
      licensing_potential: item.licensing_potential,
      notes: item.notes || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.asset_name.trim()) return;
    setSaving(true);
    setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaveError("Not authenticated. Please refresh and try again.");
      setSaving(false);
      return;
    }

    if (editingId) {
      // Update existing
      const { data, error } = await supabase
        .from("asset_inventory_items")
        .update({
          asset_name: form.asset_name.trim(),
          asset_type: form.asset_type,
          description: form.description.trim() || null,
          ownership_status: form.ownership_status,
          licensing_potential: form.licensing_potential,
          notes: form.notes.trim() || null,
        })
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }
      if (data) {
        setItems((prev) =>
          prev.map((it) => (it.id === editingId ? (data as AssetInventoryItem) : it))
        );
      }
    } else {
      // Create new
      const { data, error } = await supabase
        .from("asset_inventory_items")
        .insert({
          user_id: user.id,
          asset_name: form.asset_name.trim(),
          asset_type: form.asset_type,
          description: form.description.trim() || null,
          ownership_status: form.ownership_status,
          licensing_potential: form.licensing_potential,
          notes: form.notes.trim() || null,
          sort_order: items.length,
        })
        .select()
        .single();

      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }
      if (data) {
        setItems((prev) => [...prev, data as AssetInventoryItem]);
      }
    }

    setSaving(false);
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("asset_inventory_items").delete().eq("id", id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    setDeletingId(null);
  };

  /* ── Analysis ────────────────────────────────────────────────── */

  const handleAnalyze = useCallback(async () => {
    if (items.length === 0) return;
    setAnalyzing(true);
    setAnalyzeError("");

    try {
      const res = await fetch("/api/inventory/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to start analysis");
      }

      const { analysisId } = await res.json();

      // Poll for completion
      const poll = async () => {
        const check = await fetch(`/api/inventory/analysis/${analysisId}`);
        if (!check.ok) throw new Error("Failed to check analysis status");
        const result = await check.json();

        if (result.status === "completed") {
          setAnalysis(result as AssetInventoryAnalysis);
          setAnalyzing(false);
        } else if (result.status === "failed") {
          throw new Error("Analysis failed");
        } else {
          setTimeout(poll, 2000);
        }
      };

      await poll();
    } catch {
      setAnalyzeError("Something went wrong. Please try again.");
      setAnalyzing(false);
    }
  }, [items.length]);

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <>
      {/* Header */}
      <div className="page-header rv vis">
        <div className="page-back">
          <a href="/dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={10} height={10}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Dashboard
          </a>
        </div>
        <h1 className="page-title">Asset Inventory</h1>
        <p className="page-desc">
          Audit your unmonetized IP and judgment. See what you&apos;re sitting on.
        </p>
      </div>

      {/* Item count + Add button (only when items exist) */}
      {items.length > 0 && (
        <div className="inv-toolbar rv vis rv-d1">
          <span className="inv-count">
            {items.length} {items.length === 1 ? "asset" : "assets"}
            {items.length >= MAX_ITEMS && " (limit reached)"}
          </span>
          {!showForm && items.length < MAX_ITEMS && (
            <button type="button" className="btn btn--filled" onClick={handleAdd}>
              + Add Asset
            </button>
          )}
        </div>
      )}

      {/* Inline form (add or edit) */}
      {showForm && (
        <div className="inv-form rv vis">
          <div className="inv-form-title">
            {editingId ? "Edit Asset" : "Add Asset"}
          </div>

          <div className="set-field">
            <label className="set-label">Asset Name</label>
            <input
              type="text"
              className="set-input"
              value={form.asset_name}
              onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
              placeholder="e.g. Brand identity system for Acme Corp"
              autoFocus
            />
          </div>

          <div className="set-field" style={{ maxWidth: "none" }}>
            <label className="set-label">Type</label>
            <div className="set-option-row">
              {ASSET_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`set-option-pill${form.asset_type === opt.value ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, asset_type: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="set-field" style={{ maxWidth: "none" }}>
            <label className="set-label">Ownership</label>
            <div className="set-option-row">
              {OWNERSHIP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`set-option-pill${form.ownership_status === opt.value ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, ownership_status: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="set-field" style={{ maxWidth: "none" }}>
            <label className="set-label">Licensing Potential</label>
            <div className="set-option-row">
              {LICENSING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`set-option-pill${form.licensing_potential === opt.value ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, licensing_potential: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="set-field">
            <label className="set-label">Description (optional)</label>
            <textarea
              className="set-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this asset? Context helps the analysis."
              rows={2}
            />
          </div>

          <div className="set-field">
            <label className="set-label">Notes (optional)</label>
            <textarea
              className="set-textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. gave creative direction free for 6 months"
              rows={2}
            />
          </div>

          {saveError && (
            <p style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "#c44", marginBottom: "12px" }}>
              {saveError}
            </p>
          )}

          <div className="inv-form-actions">
            <button
              type="button"
              className="btn btn--filled"
              disabled={saving || !form.asset_name.trim()}
              onClick={handleSave}
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add to Inventory"}
            </button>
            <button type="button" className="btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !showForm && (
        <div className="inv-empty rv vis rv-d1">
          <div className="inv-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} width={48} height={48}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="inv-empty-title">No assets yet</div>
          <p className="inv-empty-desc">
            Start by adding anything you&apos;ve created, strategic judgment
            you&apos;ve given away for free, relationships, or processes you&apos;ve
            built. You can&apos;t restructure what you can&apos;t see.
          </p>
          <button
            type="button"
            className="btn btn--filled"
            onClick={handleAdd}
          >
            + Add Your First Asset
          </button>
        </div>
      )}

      {/* Item list */}
      {items.length > 0 && (
        <div className="inv-list rv vis rv-d1">
          {items.map((item) => (
            <div
              key={item.id}
              className={`inv-card${expandedIds.has(item.id) ? " expanded" : ""}`}
            >
              <div className="inv-card-main" onClick={() => toggleExpand(item.id)} data-cursor="expand">
                <div className="inv-card-left">
                  <span className="inv-card-name">{toTitleCase(item.asset_name)}</span>
                  <div className="inv-card-badges">
                    <span className="inv-badge inv-badge--type">
                      {ASSET_TYPE_LABELS[item.asset_type]}
                    </span>
                    <span className="inv-badge">
                      {OWNERSHIP_LABELS[item.ownership_status]}
                    </span>
                    <span className="inv-badge">
                      {LICENSING_LABELS[item.licensing_potential]}
                    </span>
                  </div>
                </div>
                <div className="inv-card-actions">
                  <button
                    type="button"
                    className="inv-action-btn"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  {deletingId === item.id ? (
                    <span className="inv-delete-confirm">
                      <button
                        type="button"
                        className="inv-action-btn inv-action-btn--danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="inv-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="inv-action-btn"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(item.id);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedIds.has(item.id) && (item.description || item.notes) && (
                <div className="inv-card-details">
                  {item.description && (
                    <div className="inv-detail">
                      <span className="inv-detail-label">Description</span>
                      <p className="inv-detail-text">{item.description}</p>
                    </div>
                  )}
                  {item.notes && (
                    <div className="inv-detail">
                      <span className="inv-detail-label">Notes</span>
                      <p className="inv-detail-text">{item.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Analyze button */}
      {items.length > 0 && (
        <div className="inv-analyze-section rv vis rv-d2">
          {isStale && analysis && (
            <p className="inv-stale-notice">
              Your inventory has changed since the last analysis. Re-analyze to get updated insights.
            </p>
          )}
          <button
            type="button"
            className="inv-analyze-btn"
            disabled={analyzing || items.length === 0}
            onClick={handleAnalyze}
          >
            {analyzing
              ? "Analyzing..."
              : analysis
                ? "Re-Analyze Portfolio"
                : "Analyze My Portfolio"}
          </button>
          {analyzing && (
            <p className="inv-analyze-status">
              Running valuation and scenario analysis. This may take 15-30 seconds.
            </p>
          )}
          {analyzeError && (
            <p className="inv-analyze-error">{analyzeError}</p>
          )}
        </div>
      )}

      {/* Analysis results */}
      {analysis && analysis.status === "completed" && analysis.analysis_content && (
        <AnalysisView content={analysis.analysis_content} structureSlugMap={structureSlugMap} />
      )}

      <div className="set-footer" />
    </>
  );
}

/* ── Analysis View ─────────────────────────────────────────────────── */

function AnalysisView({ content, structureSlugMap = {} }: { content: InventoryAnalysisContent; structureSlugMap?: Record<number, { slug: string; title: string }> }) {
  const [expandedVals, setExpandedVals] = useState<Set<number>>(new Set());

  const toggleVal = (i: number) => {
    setExpandedVals((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="inv-analysis rv vis rv-d1">
      {/* Summary */}
      <div className="inv-analysis-header">
        <div className="set-section-title">Portfolio Analysis</div>
      </div>

      <div className="inv-summary-card">
        <div className="inv-summary-metrics">
          <div className="inv-summary-metric">
            <span className="inv-summary-metric-value">{content.summary.total_assets}</span>
            <span className="inv-summary-metric-label">Total Assets</span>
          </div>
          <div className="inv-summary-metric">
            <span className="inv-summary-metric-value">{content.summary.estimated_total_value_range}</span>
            <span className="inv-summary-metric-label">Estimated Value</span>
          </div>
          <div className="inv-summary-metric">
            <span className={`inv-summary-metric-value inv-leverage--${content.summary.leverage_score}`}>
              {content.summary.leverage_score.charAt(0).toUpperCase() + content.summary.leverage_score.slice(1)}
            </span>
            <span className="inv-summary-metric-label">Leverage Score</span>
          </div>
        </div>
        <div className="inv-summary-insight">
          {content.summary.key_insight}
        </div>
      </div>

      {/* Asset Valuations */}
      {content.asset_valuations.length > 0 && (
        <div className="inv-section">
          <div className="set-section-title">Asset Valuations</div>
          <div className="inv-val-list">
            {content.asset_valuations.map((val, i) => (
              <div key={i} className={`inv-val-card${expandedVals.has(i) ? " expanded" : ""}`}>
                <button
                  type="button"
                  className="inv-val-header"
                  onClick={() => toggleVal(i)}
                  data-cursor="expand"
                >
                  <div>
                    <span className="inv-val-name">{toTitleCase(val.asset_name)}</span>
                    <span className="inv-badge inv-badge--type">{ASSET_TYPE_LABELS[val.asset_type]}</span>
                  </div>
                  <div className="inv-val-right">
                    <span className="inv-val-range">{val.estimated_value_range}</span>
                    <span className={`inv-val-chevron${expandedVals.has(i) ? " is-open" : ""}`}>›</span>
                  </div>
                </button>
                {expandedVals.has(i) && (
                  <div className="inv-val-details">
                    <p className="inv-val-rationale">{val.value_rationale}</p>
                    {val.immediate_actions.length > 0 && (
                      <div className="inv-val-actions">
                        <span className="inv-detail-label">Immediate Actions</span>
                        <ul className="inv-action-list">
                          {val.immediate_actions.map((action, j) => {
                            const structMatch = action.match(/\(Structure #(\d+)\)/);
                            if (structMatch) {
                              const num = parseInt(structMatch[1], 10);
                              const info = structureSlugMap[num];
                              const textBefore = action.slice(0, structMatch.index).trim();
                              return (
                                <li key={j}>
                                  {textBefore}
                                  {info ? (
                                    <Link href={`/library/structures/${info.slug}`} className="inv-structure-chip" data-cursor="arrow">
                                      {info.title}
                                    </Link>
                                  ) : (
                                    <span className="inv-structure-chip">Structure #{num}</span>
                                  )}
                                </li>
                              );
                            }
                            return <li key={j}>{action}</li>;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leverage Scenarios — tabbed layout */}
      {content.scenarios.length > 0 && (
        <div className="inv-section">
          <div className="set-section-title">Leverage Scenarios</div>
          <PortalTabs
            tabs={content.scenarios.map((s) => s.scenario_name)}
            summaryBar={
              <>
                <span className="ptl-tabs-summary-label">Estimated Total Value</span>
                <span className="ptl-tabs-summary-value">{content.summary.estimated_total_value_range}</span>
              </>
            }
          >
            {content.scenarios.map((scenario, i) => (
              <PortalTabPanel key={i}>
                <p className="inv-scenario-desc">{scenario.description}</p>
                <div className="inv-scenario-meta">
                  <div className="inv-scenario-stat">
                    <span className="inv-scenario-stat-label">Potential Value</span>
                    <span className="inv-scenario-stat-value">{scenario.potential_value}</span>
                  </div>
                  <div className="inv-scenario-stat">
                    <span className="inv-scenario-stat-label">Timeline</span>
                    <span className="inv-scenario-stat-value">{scenario.timeline}</span>
                  </div>
                  <div className="inv-scenario-stat">
                    <span className="inv-scenario-stat-label">Risk</span>
                    <span className="inv-scenario-stat-value">{toTitleCase(scenario.risk_level)}</span>
                  </div>
                </div>
                {scenario.required_steps.length > 0 && (
                  <div className="inv-scenario-steps">
                    {scenario.required_steps.map((step, j) => (
                      <div key={j} className="inv-scenario-step">
                        <span className="inv-scenario-step-num">{j + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </PortalTabPanel>
            ))}
          </PortalTabs>
        </div>
      )}

      {/* Roadmap */}
      {content.roadmap && (
        <div className="inv-section">
          <div className="set-section-title">Action Roadmap</div>

          <div className="inv-roadmap-actions">
            {content.roadmap.immediate_actions.map((action) => (
              <div key={action.order} className="inv-roadmap-step">
                <div className="inv-roadmap-num">{action.order}</div>
                <div className="inv-roadmap-content">
                  <div className="inv-roadmap-action">{action.action}</div>
                  <p className="inv-roadmap-why">{action.why}</p>
                  <span className="inv-roadmap-timeline">{action.timeline}</span>
                </div>
              </div>
            ))}
          </div>

          {content.roadmap.medium_term && (
            <div className="inv-roadmap-horizon">
              <span className="inv-detail-label">Medium Term</span>
              <p className="inv-detail-text">{content.roadmap.medium_term}</p>
            </div>
          )}

          {content.roadmap.long_term_vision && (
            <div className="inv-roadmap-horizon">
              <span className="inv-detail-label">Long Term Vision</span>
              <p className="inv-detail-text">{content.roadmap.long_term_vision}</p>
            </div>
          )}

          {content.roadmap.recommended_structures.length > 0 && (
            <div className="inv-roadmap-structures">
              <span className="inv-detail-label">Recommended Structures</span>
              <div className="inv-structure-links">
                {content.roadmap.recommended_structures.map((num) => {
                  const info = structureSlugMap[num];
                  return (
                    <Link
                      key={num}
                      href={info ? `/library/structures/${info.slug}` : `/library/structures`}
                      className="inv-structure-link"
                    >
                      {info ? info.title : `Structure #${num}`}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
