"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  AssetInventoryItem,
  AssetType,
  OwnershipStatus,
  LicensingPotential,
} from "@/types/inventory";
import {
  ASSET_TYPE_LABELS,
  OWNERSHIP_LABELS,
  LICENSING_LABELS,
} from "@/types/inventory";
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
  onItemsChange,
  onAnalyze,
  analyzing = false,
  analyzeError = "",
  hasAnalysis = false,
  isStale = false,
}: {
  initialItems: AssetInventoryItem[];
  onItemsChange?: (items: AssetInventoryItem[]) => void;
  onAnalyze?: () => void;
  analyzing?: boolean;
  analyzeError?: string;
  hasAnalysis?: boolean;
  isStale?: boolean;
}) {
  const supabase = createClient();

  // Items state
  const [items, setItemsLocal] = useState<AssetInventoryItem[]>(initialItems);
  const setItems = (next: AssetInventoryItem[] | ((prev: AssetInventoryItem[]) => AssetInventoryItem[])) => {
    setItemsLocal((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      onItemsChange?.(resolved);
      return resolved;
    });
  };

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Error state
  const [saveError, setSaveError] = useState("");

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
          {isStale && hasAnalysis && (
            <p className="inv-stale-notice">
              Your inventory has changed since the last analysis. Re-analyze to get updated insights.
            </p>
          )}
          <button
            type="button"
            className="inv-analyze-btn"
            disabled={analyzing || items.length === 0}
            onClick={() => onAnalyze?.()}
          >
            {analyzing
              ? "Analyzing..."
              : hasAnalysis
                ? "Re-Analyze Portfolio"
                : "Analyze My Portfolio"}
          </button>
          {analyzeError && (
            <p className="inv-analyze-error">{analyzeError}</p>
          )}
        </div>
      )}

      <div className="set-footer" />
    </>
  );
}
