"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  newsletterEmailHtml,
  type NewsletterEntry,
  type NewsletterData,
} from "@/lib/email/templates/newsletter";

/* ── Types ── */
type TabId = "history" | "compose";

interface EmailStats {
  totalSent: number;
  sent30d: number;
  failed30d: number;
  bounceRate: number;
  subscribers: {
    active: number;
    paid: number;
    free: number;
    recent: Array<{
      id: string;
      email: string;
      name: string | null;
      status: string;
      source: string;
      user_id: string | null;
      subscribed_at: string;
    }>;
  };
}

interface EmailLogEntry {
  id: string;
  user_id: string | null;
  email_type: string;
  recipient_email: string;
  subject: string | null;
  sent_at: string;
  status: string;
}

const PAGE_SIZE = 50;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Image Upload Component ── */
function ImageUpload({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/newsletter/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  }

  const dropStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "24px 16px",
    border: "1px dashed var(--border)",
    borderRadius: 2,
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
    ...(uploading ? { opacity: 0.6, pointerEvents: "none" as const } : {}),
  };

  const monoSmall: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      {value ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={value}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: 200,
              borderRadius: 2,
              border: "1px solid var(--border)",
              display: "block",
            }}
          />
          <button
            onClick={() => onChange("")}
            type="button"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              border: "none",
              padding: "4px 10px",
              ...monoSmall,
              fontSize: 10,
              letterSpacing: "0.08em",
              cursor: "pointer",
              borderRadius: 2,
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          style={dropStyle}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {uploading ? (
            <span style={{ ...monoSmall, color: "var(--mid)" }}>
              Uploading...
            </span>
          ) : (
            <>
              <span
                style={{
                  fontSize: 20,
                  lineHeight: 1,
                  color: "var(--mid)",
                  fontWeight: 300,
                }}
              >
                +
              </span>
              <span style={{ ...monoSmall, color: "var(--fg)" }}>
                Click or drop image
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--mid)",
                  letterSpacing: "0.02em",
                }}
              >
                JPEG, PNG, GIF, WebP &middot; 5MB max
              </span>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#c44" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Empty Entry Template ── */
const EMPTY_ENTRY: NewsletterEntry = {
  title: "",
  image: "",
  summary: "",
  buttonText: "Read More",
  buttonUrl: "",
};

/* ── Main Page ── */
export default function AdminNewsletterPage() {
  const [tab, setTab] = useState<TabId>("history");

  /* ── History tab state ── */
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [emails, setEmails] = useState<EmailLogEntry[]>([]);
  const [emailTotal, setEmailTotal] = useState(0);
  const [emailPage, setEmailPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  /* ── Compose tab state ── */
  const [subject, setSubject] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [intro, setIntro] = useState("");
  const [entries, setEntries] = useState<NewsletterEntry[]>([
    { ...EMPTY_ENTRY },
    { ...EMPTY_ENTRY },
  ]);
  const [audience, setAudience] = useState<string[]>(["all"]);
  const [showPreview, setShowPreview] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [sendResult, setSendResult] = useState("");
  const [testEmail, setTestEmail] = useState("");

  /* ── Fetch stats once ── */
  useEffect(() => {
    fetch("/api/admin/email/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setStats(d);
      })
      .catch((e) => setHistoryError(e.message));
  }, []);

  /* ── Fetch email log ── */
  const fetchLog = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ page: String(emailPage) });
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/admin/email/log?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEmails(data.emails ?? []);
      setEmailTotal(data.total ?? 0);
    } catch (e) {
      setHistoryError((e as Error).message);
    } finally {
      setHistoryLoading(false);
    }
  }, [emailPage, typeFilter]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const uniqueTypes = Array.from(
    new Set(emails.map((e) => e.email_type))
  ).sort();
  const totalPages = Math.ceil(emailTotal / PAGE_SIZE);

  /* ── Compose helpers ── */
  function updateEntry(
    index: number,
    field: keyof NewsletterEntry,
    value: string
  ) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  }

  function addEntry() {
    setEntries((prev) => [...prev, { ...EMPTY_ENTRY }]);
  }

  function removeEntry(index: number) {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function getPreviewHtml(): string {
    const data: NewsletterData = {
      subject,
      headerImage,
      intro,
      entries: entries.filter((e) => e.title),
    };
    return newsletterEmailHtml(data, "#", "Preview");
  }

  async function handleSend(isTest: boolean) {
    if (!subject || !intro || !entries.some((e) => e.title)) {
      setSendStatus("error");
      setSendResult(
        "Subject, intro, and at least one entry with a title are required."
      );
      return;
    }

    if (isTest && !testEmail) {
      setSendStatus("error");
      setSendResult("Enter a test email address.");
      return;
    }

    setSendStatus("sending");

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletter: {
            subject,
            headerImage,
            intro,
            entries: entries.filter((e) => e.title),
          },
          audience,
          ...(isTest ? { testEmail } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendStatus("error");
        setSendResult(data.error || "Failed to send.");
        return;
      }

      setSendStatus("sent");
      if (data.test) {
        setSendResult(`Test email sent to ${testEmail}`);
      } else {
        setSendResult(
          `Sent to ${data.sent} of ${data.total} subscribers${data.failed ? ` (${data.failed} failed)` : ""}`
        );
      }
    } catch {
      setSendStatus("error");
      setSendResult("Something went wrong.");
    }
  }

  return (
    <>
      <div className="adm-header rv vis">
        <h1 className="adm-title">Newsletter</h1>
        <p className="adm-subtitle">
          Send history, subscriber metrics, and compose.
        </p>
      </div>

      {/* Tabs */}
      <div className="adm-tabs rv vis rv-d1">
        <button
          className={`adm-tab${tab === "history" ? " active" : ""}`}
          onClick={() => setTab("history")}
        >
          History
        </button>
        <button
          className={`adm-tab${tab === "compose" ? " active" : ""}`}
          onClick={() => setTab("compose")}
        >
          Compose
        </button>
      </div>

      {/* ═══════════════════ History Tab ═══════════════════ */}
      {tab === "history" && (
        <>
          {historyError && (
            <p style={{ color: "var(--red)", margin: "1rem 0" }}>
              {historyError}
            </p>
          )}

          {/* Metric Cards */}
          {stats && (
            <div className="adm-metrics rv vis rv-d1">
              <div className="adm-stat">
                <div className="adm-stat-label">Total Sent</div>
                <div className="adm-stat-value">
                  {stats.totalSent.toLocaleString()}
                </div>
                <div className="adm-stat-change">all time</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Sent (30d)</div>
                <div className="adm-stat-value">
                  {stats.sent30d.toLocaleString()}
                </div>
                <div className="adm-stat-change">last 30 days</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Failed (30d)</div>
                <div className="adm-stat-value">
                  {stats.failed30d.toLocaleString()}
                </div>
                <div className="adm-stat-change">last 30 days</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Bounce Rate</div>
                <div className="adm-stat-value">{stats.bounceRate}%</div>
                <div className="adm-stat-change">all time</div>
              </div>
            </div>
          )}

          {/* Subscriber Stats */}
          {stats && (
            <div className="adm-section rv vis rv-d2">
              <div className="adm-section-head">
                <span className="adm-section-title">
                  Newsletter Subscribers
                </span>
              </div>
              <div className="adm-metrics" style={{ marginBottom: "1.5rem" }}>
                <div className="adm-stat">
                  <div className="adm-stat-label">Active</div>
                  <div className="adm-stat-value">
                    {stats.subscribers.active.toLocaleString()}
                  </div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Paid Members</div>
                  <div className="adm-stat-value">
                    {stats.subscribers.paid.toLocaleString()}
                  </div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-label">Free Subscribers</div>
                  <div className="adm-stat-value">
                    {stats.subscribers.free.toLocaleString()}
                  </div>
                </div>
              </div>

              {stats.subscribers.recent.length > 0 && (
                <>
                  <div className="adm-section-head">
                    <span className="adm-section-title">Recent Signups</span>
                  </div>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Name</th>
                          <th>Source</th>
                          <th>Type</th>
                          <th>Subscribed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.subscribers.recent.map((s) => (
                          <tr key={s.id}>
                            <td>{s.email}</td>
                            <td>{s.name || "\u2014"}</td>
                            <td>{s.source}</td>
                            <td>{s.user_id ? "Paid" : "Free"}</td>
                            <td>{fmtDate(s.subscribed_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Email Log */}
          <div className="adm-section rv vis rv-d3">
            <div className="adm-section-head">
              <span className="adm-section-title">
                Email Log ({emailTotal.toLocaleString()})
              </span>
            </div>

            {/* Type filter */}
            <div className="ptl-filter-bar" style={{ marginBottom: "1rem" }}>
              <button
                className={`ptl-filter-tab${typeFilter === "" ? " active" : ""}`}
                onClick={() => {
                  setTypeFilter("");
                  setEmailPage(1);
                }}
              >
                All
              </button>
              {uniqueTypes.map((t) => (
                <button
                  key={t}
                  className={`ptl-filter-tab${typeFilter === t ? " active" : ""}`}
                  onClick={() => {
                    setTypeFilter(t);
                    setEmailPage(1);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {historyLoading ? (
              <p className="adm-subtitle">Loading...</p>
            ) : emails.length === 0 ? (
              <p className="adm-subtitle">No emails found.</p>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Recipient</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <span className="adm-email-type">
                            {e.email_type}
                          </span>
                        </td>
                        <td>{e.recipient_email}</td>
                        <td>{e.subject || "\u2014"}</td>
                        <td>{fmtDate(e.sent_at)}</td>
                        <td>
                          <div className="adm-email-status">
                            <span
                              className={`adm-email-dot ${e.status === "sent" ? "delivered" : e.status}`}
                            />
                            {e.status}
                          </div>
                        </td>
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
                  disabled={emailPage <= 1}
                  onClick={() => setEmailPage((p) => p - 1)}
                >
                  &larr; Previous
                </button>
                <span className="adm-stat-label">
                  Page {emailPage} of {totalPages}
                </span>
                <button
                  className="adm-btn adm-btn--sm"
                  disabled={emailPage >= totalPages}
                  onClick={() => setEmailPage((p) => p + 1)}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════ Compose Tab ═══════════════════ */}
      {tab === "compose" && (
        <>
          <div className="adm-nl-layout">
            {/* Compose Form */}
            <div className="adm-section">
              <div className="adm-section-head">
                <h2 className="adm-section-title">Compose</h2>
              </div>

              <div style={{ border: "1px solid var(--black)", borderRadius: "6px", padding: "20px", marginBottom: "1.5rem" }}>
                <div className="adm-field">
                  <label className="adm-label">Subject Line</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="What's new this week..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <ImageUpload
                  value={headerImage}
                  onChange={setHeaderImage}
                  label="Header Image (optional)"
                />

                <div className="adm-field" style={{ marginBottom: 0 }}>
                  <label className="adm-label">Intro</label>
                  <textarea
                    className="adm-textarea"
                    rows={3}
                    placeholder="Opening paragraph..."
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                  />
                </div>
              </div>

              {entries.map((entry, i) => (
                <div key={i} className="adm-nl-entry">
                  <div className="adm-nl-entry-head">
                    <span className="adm-nl-entry-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {entries.length > 1 && (
                      <button
                        className="adm-nl-remove"
                        onClick={() => removeEntry(i)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Entry title"
                      value={entry.title}
                      onChange={(e) => updateEntry(i, "title", e.target.value)}
                    />
                  </div>

                  <ImageUpload
                    value={entry.image}
                    onChange={(url) => updateEntry(i, "image", url)}
                    label="Image (optional)"
                  />

                  <div className="adm-field">
                    <label className="adm-label">Summary</label>
                    <textarea
                      className="adm-textarea"
                      rows={3}
                      placeholder="Brief description..."
                      value={entry.summary}
                      onChange={(e) =>
                        updateEntry(i, "summary", e.target.value)
                      }
                    />
                  </div>

                  <div className="adm-nl-row">
                    <div className="adm-field" style={{ flex: 1 }}>
                      <label className="adm-label">Button Text</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={entry.buttonText}
                        onChange={(e) =>
                          updateEntry(i, "buttonText", e.target.value)
                        }
                      />
                    </div>
                    <div className="adm-field" style={{ flex: 2 }}>
                      <label className="adm-label">Button URL</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="https://insequence.so/..."
                        value={entry.buttonUrl}
                        onChange={(e) =>
                          updateEntry(i, "buttonUrl", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button className="adm-nl-add" onClick={addEntry}>
                + Add Entry
              </button>
            </div>

            {/* Send Controls */}
            <div className="adm-section">
              <div className="adm-section-head">
                <h2 className="adm-section-title">Send</h2>
              </div>

              <div className="adm-field">
                <label className="adm-label">Audience</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { value: "all", label: "All Subscribers" },
                    { value: "members", label: "Paid Members" },
                    { value: "free", label: "Free Subscribers" },
                    { value: "book_download", label: "Book Downloads" },
                  ].map((opt) => (
                    <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={audience.includes(opt.value)}
                        onChange={(e) => {
                          if (opt.value === "all") {
                            setAudience(e.target.checked ? ["all"] : []);
                          } else {
                            const next = e.target.checked
                              ? [...audience.filter((a) => a !== "all"), opt.value]
                              : audience.filter((a) => a !== opt.value);
                            setAudience(next.length === 0 ? ["all"] : next);
                          }
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="adm-field">
                <label className="adm-label">Test Email</label>
                <div className="adm-nl-row">
                  <input
                    type="email"
                    className="adm-input"
                    placeholder="your@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="adm-btn"
                    onClick={() => handleSend(true)}
                    disabled={sendStatus === "sending"}
                  >
                    Send Test
                  </button>
                </div>
              </div>

              <div className="adm-nl-actions">
                <button
                  className="adm-btn"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Hide Preview" : "Preview"}
                </button>
                <button
                  className="adm-btn adm-btn--primary"
                  onClick={() => {
                    if (
                      confirm(
                        `Send this newsletter to ${audience.includes("all") ? "all subscribers" : audience.join(", ")}?`
                      )
                    ) {
                      handleSend(false);
                    }
                  }}
                  disabled={sendStatus === "sending"}
                >
                  {sendStatus === "sending" ? "Sending..." : "Send Newsletter"}
                </button>
              </div>

              {sendResult && (
                <p
                  className={`adm-nl-result ${sendStatus === "error" ? "adm-nl-result--error" : ""}`}
                >
                  {sendResult}
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="adm-section" style={{ marginTop: 24 }}>
              <div className="adm-section-head">
                <h2 className="adm-section-title">Preview</h2>
              </div>
              <div style={{ marginTop: 16 }}>
                <iframe
                  srcDoc={getPreviewHtml()}
                  title="Newsletter Preview"
                  style={{
                    width: "100%",
                    height: 800,
                    border: "1px solid var(--border)",
                    borderRadius: 2,
                    background: "#f5f3f0",
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="page-footer" />
    </>
  );
}
