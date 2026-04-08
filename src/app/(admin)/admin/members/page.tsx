"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Member {
  id: string;
  fullName: string | null;
  email: string;
  plan: string | null;
  status: string | null;
  stage: number | null;
  disciplines: string[] | null;
  signup: string;
  lastLogin: string;
  aiCost: number;
}

type SortField = "full_name" | "email" | "plan" | "status" | "detected_stage" | "created_at" | "ai_cost";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 50;

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Library", value: "library" },
  { label: "Full Access", value: "full_access" },
  { label: "Past Due", value: "past_due" },
  { label: "Canceled", value: "canceled" },
];

const COLUMNS: Array<{ label: string; field: SortField; key: string }> = [
  { label: "Name", field: "full_name", key: "name" },
  { label: "Email", field: "email", key: "email" },
  { label: "Plan", field: "plan", key: "plan" },
  { label: "Status", field: "status", key: "status" },
  { label: "Stage", field: "detected_stage", key: "stage" },
  { label: "AI Cost", field: "ai_cost", key: "aiCost" },
  { label: "Signup", field: "created_at", key: "signup" },
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function planLabel(plan: string | null): string {
  if (!plan) return "—";
  switch (plan) {
    case "library": return "Library";
    case "full_access": return "Full Access";
    case "coaching": return "Coaching";
    case "student": return "Student";
    case "annual": return "Full Access";
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

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) {
  const isActive = field === sortField;
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        marginLeft: 4,
        verticalAlign: "middle",
        lineHeight: 0,
        gap: 1,
      }}
    >
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ opacity: isActive && sortOrder === "asc" ? 1 : 0.25 }}>
        <path d="M4 0L8 5H0L4 0Z" fill="currentColor" />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ opacity: isActive && sortOrder === "desc" ? 1 : 0.25 }}>
        <path d="M4 5L0 0H8L4 5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "full_name" || field === "email" ? "asc" : "desc");
    }
    setPage(1);
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        filter,
        sort: sortField === "ai_cost" ? "created_at" : sortField,
        order: sortField === "ai_cost" ? "desc" : sortOrder,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/members?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      let list: Member[] = data.members ?? [];
      // Client-side sort for AI cost
      if (sortField === "ai_cost") {
        list = [...list].sort((a, b) =>
          sortOrder === "asc" ? a.aiCost - b.aiCost : b.aiCost - a.aiCost
        );
      }
      setMembers(list);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, filter, debouncedSearch, sortField, sortOrder]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <div className="adm-header rv vis">
        <h1 className="adm-title">Members</h1>
        <p className="adm-subtitle">
          {total.toLocaleString()} total member{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="adm-section rv vis rv-d1">
        <div className="adm-field">
          <input
            className="adm-input"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="ptl-filter-bar" style={{ marginTop: "1rem" }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`ptl-filter-tab${filter === tab.value ? " active" : ""}`}
              onClick={() => {
                setFilter(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="adm-section rv vis rv-d2">
        {error && (
          <p style={{ color: "var(--red)", marginBottom: "1rem" }}>{error}</p>
        )}

        {loading ? (
          <p className="adm-subtitle">Loading...</p>
        ) : members.length === 0 ? (
          <p className="adm-subtitle">No members found.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.field)}
                      style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                    >
                      {col.label}
                      <SortIcon field={col.field} sortField={sortField} sortOrder={sortOrder} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => window.location.href = `/admin/members/${m.id}`}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="adm-name">{m.fullName || "—"}</td>
                    <td>{m.email}</td>
                    <td>{planLabel(m.plan)}</td>
                    <td>
                      <span className={`adm-status ${m.status ?? ""}`}>
                        {statusLabel(m.status)}
                      </span>
                    </td>
                    <td>{m.stage ? `Stage ${m.stage}` : "—"}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: m.aiCost > 1 ? "#dc2626" : m.aiCost > 0.25 ? "var(--black)" : "var(--light)" }}>
                      {m.aiCost > 0 ? `$${m.aiCost.toFixed(2)}` : "—"}
                    </td>
                    <td>{fmtDate(m.signup)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.5rem",
            }}
          >
            <button
              className="adm-btn adm-btn--sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              &larr; Previous
            </button>
            <span className="adm-stat-label">
              Page {page} of {totalPages}
            </span>
            <button
              className="adm-btn adm-btn--sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      <div className="page-footer" />
    </>
  );
}
