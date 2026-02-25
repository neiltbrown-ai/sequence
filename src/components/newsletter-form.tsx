"use client";

export default function NewsletterForm() {
  return (
    <form className="nl-form" onSubmit={(e) => e.preventDefault()}>
      <div className="nl-row">
        <input
          type="text"
          className="nl-input"
          placeholder="FULL NAME"
          aria-label="Full name"
        />
        <input
          type="email"
          className="nl-input"
          placeholder="EMAIL"
          aria-label="Email address"
        />
        <button type="submit" className="nl-submit">
          SUBSCRIBE
        </button>
      </div>
    </form>
  );
}
