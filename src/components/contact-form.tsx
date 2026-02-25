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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="ct-submit">
          <button type="submit" className="btn">
            SEND MESSAGE
            <ButtonArrow />
          </button>
        </div>
      </form>

      {/* Info sidebar */}
      <div className="ct-info rv rv-d2">
        <div className="ct-info-block">
          <span className="ct-info-label">[EMAIL]</span>
          <a href="mailto:insequence@gmail.com" className="ct-info-link">
            insequence@gmail.com
          </a>
        </div>
        <div className="ct-info-block">
          <span className="ct-info-label">[LOCATION]</span>
          <span className="ct-info-text">Chattanooga, TN</span>
          <span className="ct-info-coord">
            35.0456&deg; N, 85.3097&deg; W
          </span>
        </div>
        <div className="ct-info-block">
          <span className="ct-info-label">[SOCIAL]</span>
          <div className="ct-info-socials">
            <a href="#" className="ct-info-link">
              Instagram
            </a>
            <a href="#" className="ct-info-link">
              X
            </a>
            <a href="#" className="ct-info-link">
              LinkedIn
            </a>
          </div>
        </div>
        <div className="ct-info-block">
          <span className="ct-info-label">[RESPONSE TIME]</span>
          <span className="ct-info-text">
            We typically respond within 48 hours.
          </span>
        </div>
      </div>
    </div>
  );
}
