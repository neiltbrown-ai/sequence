"use client";

import { useState } from "react";

interface BookDownloadFormProps {
  variant?: "dark" | "light";
}

export default function BookDownloadForm({ variant = "dark" }: BookDownloadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/book/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, honeypot }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setDownloadUrl(data.downloadUrl || null);
      setMessage(
        data.downloadUrl
          ? "We've also sent the link to your email."
          : "Your request was received. We'll email you the download link shortly."
      );
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form className={`bk-form bk-form--${variant}`} onSubmit={handleSubmit}>
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
        aria-hidden="true"
      />

      {status === "success" ? (
        <div className="bk-success">
          <p className="bk-success-title">Your copy of In Sequence is ready.</p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bk-download-btn"
            >
              Download PDF
              <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                <path
                  d="M2 6H10M10 6L6 2M10 6L6 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
          <p className="bk-success-note">{message}</p>
        </div>
      ) : (
        <>
          <div className="bk-form-row">
            <input
              type="text"
              className="bk-input"
              placeholder="FULL NAME"
              aria-label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "loading"}
              required
            />
            <input
              type="email"
              className="bk-input"
              placeholder="EMAIL"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
            />
            <button
              type="submit"
              className="bk-submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "SENDING..." : "DOWNLOAD BOOK"}
            </button>
          </div>
          {status === "error" && (
            <p className="bk-message bk-error">{message}</p>
          )}
        </>
      )}
    </form>
  );
}
