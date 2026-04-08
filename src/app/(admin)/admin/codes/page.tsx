"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface UniversityCode {
  id: string;
  code: string;
  university_name: string;
  discount_percent: number;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

/* ── Helpers ── */
function fmtDate(iso: string | null): string {
  if (!iso) return "None";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function codeStatus(
  active: boolean,
  maxUses: number | null,
  currentUses: number,
  expiresAt: string | null
): { label: string; cls: string } {
  if (!active) return { label: "Deactivated", cls: "cancelled" };
  if (expiresAt && new Date(expiresAt) < new Date())
    return { label: "Expired", cls: "failed" };
  if (maxUses && currentUses >= maxUses)
    return { label: "Full", cls: "failed" };
  return { label: "Active", cls: "active" };
}

/* ── Discount Form ── */
function DiscountForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: DiscountCode;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [discountType, setDiscountType] = useState(
    initial?.discount_type ?? "percent"
  );
  const [discountValue, setDiscountValue] = useState(
    initial?.discount_value?.toString() ?? ""
  );
  const [maxUses, setMaxUses] = useState(
    initial?.max_uses?.toString() ?? ""
  );
  const [expiresAt, setExpiresAt] = useState(
    initial?.expires_at ? initial.expires_at.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...(initial && { id: initial.id }),
        code,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        expires_at: expiresAt || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
      <div className="adm-split" style={{ gap: "1rem", marginBottom: "1rem" }}>
        <div className="adm-field">
          <label className="adm-label">Code</label>
          <input
            className="adm-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="adm-field">
          <label className="adm-label">Type</label>
          <select
            className="adm-select"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
      </div>
      <div className="adm-split" style={{ gap: "1rem", marginBottom: "1rem" }}>
        <div className="adm-field">
          <label className="adm-label">
            Value ({discountType === "percent" ? "%" : "$"})
          </label>
          <input
            className="adm-input"
            type="number"
            min="0"
            step="any"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
        </div>
        <div className="adm-field">
          <label className="adm-label">Max Uses (optional)</label>
          <input
            className="adm-input"
            type="number"
            min="0"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
      </div>
      <div className="adm-field" style={{ marginBottom: "1rem" }}>
        <label className="adm-label">Expiry Date (optional)</label>
        <input
          className="adm-input"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="submit"
          className="adm-btn adm-btn--primary"
          disabled={saving}
        >
          {saving ? "Saving..." : initial ? "Update Code" : "Create Code"}
        </button>
        <button type="button" className="adm-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ── University Form ── */
function UniversityForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: UniversityCode;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [universityName, setUniversityName] = useState(
    initial?.university_name ?? ""
  );
  const [discountPercent, setDiscountPercent] = useState(
    initial?.discount_percent?.toString() ?? "100"
  );
  const [maxUses, setMaxUses] = useState(
    initial?.max_uses?.toString() ?? ""
  );
  const [expiresAt, setExpiresAt] = useState(
    initial?.expires_at ? initial.expires_at.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...(initial && { id: initial.id }),
        code,
        university_name: universityName,
        discount_percent: parseInt(discountPercent, 10),
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        expires_at: expiresAt || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
      <div className="adm-split" style={{ gap: "1rem", marginBottom: "1rem" }}>
        <div className="adm-field">
          <label className="adm-label">Code</label>
          <input
            className="adm-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="adm-field">
          <label className="adm-label">University</label>
          <input
            className="adm-input"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="adm-split" style={{ gap: "1rem", marginBottom: "1rem" }}>
        <div className="adm-field">
          <label className="adm-label">Discount %</label>
          <input
            className="adm-input"
            type="number"
            min="0"
            max="100"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            required
          />
        </div>
        <div className="adm-field">
          <label className="adm-label">Max Uses (optional)</label>
          <input
            className="adm-input"
            type="number"
            min="0"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
      </div>
      <div className="adm-field" style={{ marginBottom: "1rem" }}>
        <label className="adm-label">Expiry Date (optional)</label>
        <input
          className="adm-input"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="submit"
          className="adm-btn adm-btn--primary"
          disabled={saving}
        >
          {saving ? "Saving..." : initial ? "Update Code" : "Create Code"}
        </button>
        <button type="button" className="adm-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ── Main Page ── */
export default function AdminCodesPage() {
  const [tab, setTab] = useState<"discount" | "university">("discount");
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [universityCodes, setUniversityCodes] = useState<UniversityCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | undefined>();
  const [showUniForm, setShowUniForm] = useState(false);
  const [editingUni, setEditingUni] = useState<UniversityCode | undefined>();

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, uRes] = await Promise.all([
        fetch("/api/admin/codes/discount").then((r) => r.json()),
        fetch("/api/admin/codes/university").then((r) => r.json()),
      ]);
      if (dRes.error) throw new Error(dRes.error);
      if (uRes.error) throw new Error(uRes.error);
      setDiscountCodes(Array.isArray(dRes) ? dRes : []);
      setUniversityCodes(Array.isArray(uRes) ? uRes : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  /* ── Discount CRUD ── */
  async function saveDiscount(data: Record<string, unknown>) {
    const isEdit = !!data.id;
    const res = await fetch("/api/admin/codes/discount", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    setShowDiscountForm(false);
    setEditingDiscount(undefined);
    fetchCodes();
  }

  async function deleteDiscount(id: string) {
    if (!confirm("Delete this discount code?")) return;
    const res = await fetch(`/api/admin/codes/discount?id=${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    fetchCodes();
  }

  /* ── University CRUD ── */
  async function saveUniversity(data: Record<string, unknown>) {
    const isEdit = !!data.id;
    const res = await fetch("/api/admin/codes/university", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    setShowUniForm(false);
    setEditingUni(undefined);
    fetchCodes();
  }

  async function deleteUniversity(id: string) {
    if (!confirm("Delete this university code?")) return;
    const res = await fetch(`/api/admin/codes/university?id=${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    fetchCodes();
  }

  return (
    <>
      <div className="adm-header rv vis">
        <h1 className="adm-title">Codes</h1>
        <p className="adm-subtitle">Manage discount and university access codes.</p>
      </div>

      {/* Tabs */}
      <div className="adm-section rv vis rv-d1">
        <div className="ptl-filter-bar">
          <button
            className={`ptl-filter-tab${tab === "discount" ? " active" : ""}`}
            onClick={() => setTab("discount")}
          >
            Discount Codes
          </button>
          <button
            className={`ptl-filter-tab${tab === "university" ? " active" : ""}`}
            onClick={() => setTab("university")}
          >
            University Codes
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--red)", margin: "1rem 0" }}>{error}</p>
      )}

      {loading ? (
        <div className="adm-section rv vis rv-d2">
          <p className="adm-subtitle">Loading...</p>
        </div>
      ) : tab === "discount" ? (
        /* ── Discount Codes Tab ── */
        <div className="adm-section rv vis rv-d2">
          <div className="adm-section-head">
            <span className="adm-section-title">
              Discount Codes ({discountCodes.length})
            </span>
            <button
              className="adm-btn"
              onClick={() => {
                setEditingDiscount(undefined);
                setShowDiscountForm(true);
              }}
            >
              + Create Code
            </button>
          </div>

          {showDiscountForm && (
            <DiscountForm
              initial={editingDiscount}
              onSave={saveDiscount}
              onCancel={() => {
                setShowDiscountForm(false);
                setEditingDiscount(undefined);
              }}
            />
          )}

          {discountCodes.length > 0 ? (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Uses / Limit</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discountCodes.map((d) => {
                    const s = codeStatus(
                      d.active,
                      d.max_uses,
                      d.current_uses,
                      d.expires_at
                    );
                    return (
                      <tr key={d.id}>
                        <td className="adm-name">{d.code}</td>
                        <td>
                          <span
                            className={`adm-dtype ${d.discount_type === "percent" ? "percentage" : "fixed"}`}
                          >
                            {d.discount_type === "percent"
                              ? "Percentage"
                              : "Fixed"}
                          </span>
                        </td>
                        <td>
                          {d.discount_type === "percent"
                            ? `${d.discount_value}% off`
                            : `$${d.discount_value} off`}
                        </td>
                        <td>
                          {d.current_uses} /{" "}
                          {d.max_uses ?? "Unlimited"}
                        </td>
                        <td>{fmtDate(d.expires_at)}</td>
                        <td>
                          <span className={`adm-status ${s.cls}`}>
                            {s.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            <button
                              className="adm-btn adm-btn--sm"
                              onClick={() => {
                                setEditingDiscount(d);
                                setShowDiscountForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="adm-btn adm-btn--sm adm-btn--danger"
                              onClick={() => deleteDiscount(d.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="adm-subtitle">No discount codes.</p>
          )}
        </div>
      ) : (
        /* ── University Codes Tab ── */
        <div className="adm-section rv vis rv-d2">
          <div className="adm-section-head">
            <span className="adm-section-title">
              University Codes ({universityCodes.length})
            </span>
            <button
              className="adm-btn"
              onClick={() => {
                setEditingUni(undefined);
                setShowUniForm(true);
              }}
            >
              + Create Code
            </button>
          </div>

          {showUniForm && (
            <UniversityForm
              initial={editingUni}
              onSave={saveUniversity}
              onCancel={() => {
                setShowUniForm(false);
                setEditingUni(undefined);
              }}
            />
          )}

          {universityCodes.length > 0 ? (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>University</th>
                    <th>Discount %</th>
                    <th>Uses / Limit</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {universityCodes.map((u) => {
                    const s = codeStatus(
                      u.active,
                      u.max_uses,
                      u.current_uses,
                      u.expires_at
                    );
                    return (
                      <tr key={u.id}>
                        <td className="adm-name">{u.code}</td>
                        <td>{u.university_name}</td>
                        <td>{u.discount_percent}%</td>
                        <td>
                          {u.current_uses} /{" "}
                          {u.max_uses ?? "Unlimited"}
                        </td>
                        <td>{fmtDate(u.expires_at)}</td>
                        <td>
                          <span className={`adm-status ${s.cls}`}>
                            {s.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            <button
                              className="adm-btn adm-btn--sm"
                              onClick={() => {
                                setEditingUni(u);
                                setShowUniForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="adm-btn adm-btn--sm adm-btn--danger"
                              onClick={() => deleteUniversity(u.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="adm-subtitle">No university codes.</p>
          )}
        </div>
      )}

      <div className="page-footer" />
    </>
  );
}
