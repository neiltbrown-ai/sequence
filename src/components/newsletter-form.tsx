"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
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
      setMessage(
        data.already
          ? "You're already subscribed."
          : "You're in. Welcome to the sequence."
      );
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form className="nl-form" onSubmit={handleSubmit}>
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
        <p className="nl-message nl-success">{message}</p>
      ) : (
        <>
          <div className="nl-row">
            <input
              type="text"
              className="nl-input"
              placeholder="FULL NAME"
              aria-label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "loading"}
            />
            <input
              type="email"
              className="nl-input"
              placeholder="EMAIL"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
            />
            <button
              type="submit"
              className="nl-submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "..." : "SUBSCRIBE"}
            </button>
          </div>
          {status === "error" && (
            <p className="nl-message nl-error">{message}</p>
          )}
        </>
      )}
    </form>
  );
}
