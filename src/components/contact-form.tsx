"use client";

import { useState, FormEvent } from "react";
import ButtonArrow from "@/components/ui/button-arrow";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, inquiryType, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="ct-success-grid">
        <div className="ct-success-content">
          <svg viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="20" />
            <polyline points="16 24 22 30 32 18" />
          </svg>
          <h3 className="ct-success-title">Message sent</h3>
          <p className="ct-success-desc">
            Thank you for reaching out. We&apos;ll get back to you within 48
            hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ct-grid">
      {/* Form */}
      <form className="ct-form rv" onSubmit={handleSubmit}>
        <div className="ct-field">
          <label className="ct-label" htmlFor="ctName">
            Full Name
          </label>
          <input
            type="text"
            id="ctName"
            className="ct-input"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="ct-field">
          <label className="ct-label" htmlFor="ctEmail">
            Email
          </label>
          <input
            type="email"
            id="ctEmail"
            className="ct-input"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="ct-field">
          <label className="ct-label" htmlFor="ctType">
            Inquiry Type
          </label>
          <select
            id="ctType"
            className="ct-input ct-select"
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
          >
            <option value="" disabled>
              Select an inquiry type
            </option>
            <option value="general">General Inquiry</option>
            <option value="press">Press &amp; Media</option>
            <option value="advisory">Advisory Interest</option>
            <option value="partnership">Partnership</option>
            <option value="support">Support</option>
          </select>
        </div>
        <div className="ct-field">
          <label className="ct-label" htmlFor="ctSubject">
            Subject
          </label>
          <input
            type="text"
            id="ctSubject"
            className="ct-input"
            placeholder="What is this regarding?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="ct-field">
          <label className="ct-label" htmlFor="ctMessage">
            Message
          </label>
          <textarea
            id="ctMessage"
            className="ct-input ct-textarea"
            placeholder="Tell us more..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        {error && (
          <p style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "#c0392b", marginBottom: "8px" }}>
            {error}
          </p>
        )}
        <div className="ct-submit">
          <button type="submit" className="btn" disabled={sending}>
            {sending ? "SENDING…" : "SEND MESSAGE"}
            {!sending && <ButtonArrow />}
          </button>
        </div>
      </form>

    </div>
  );
}
