"use client";

import { useEffect, useState } from "react";

interface SaveButtonProps {
  contentType: "structure" | "case_study" | "article";
  slug: string;
  initialSaved?: boolean;
}

export default function SaveButton({
  contentType,
  slug,
  initialSaved,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [busy, setBusy] = useState(false);

  /* If no initialSaved was provided, check on mount */
  useEffect(() => {
    if (initialSaved !== undefined) return;
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => {
        const match = d.bookmarks?.some(
          (b: { content_type: string; slug: string }) =>
            b.content_type === contentType && b.slug === slug
        );
        if (match) setSaved(true);
      })
      .catch(() => {});
  }, [contentType, slug, initialSaved]);

  async function toggle() {
    if (busy) return;
    const prev = saved;
    setSaved(!prev);
    setBusy(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: contentType, slug }),
      });
      if (!res.ok) setSaved(prev);
    } catch {
      setSaved(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`btn-bookmark${saved ? " is-saved" : ""}`}
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from saved" : "Save"}
    >
      <svg
        viewBox="0 0 24 24"
        width={14}
        height={14}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>{" "}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
