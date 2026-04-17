"use client";

import { useEffect, useState } from "react";
import type { DealVerdict, RedFlag, SignalColor } from "@/types/evaluator";

interface Props {
  verdict: DealVerdict;
  overallSignal: SignalColor;
  redFlags: RedFlag[];
}

/**
 * Shown below the verdict's Recommended Actions when:
 *   1. The user has an existing roadmap (otherwise "refresh" is meaningless —
 *      they should go complete Creative Identity or Portfolio first).
 *   2. The deal introduced "meaningful new signal":
 *      - overall_signal is yellow or red (friction to address in the plan), OR
 *      - any red flags triggered (structural gaps the roadmap should know about).
 *      Green deals with no flags are routine — the roadmap doesn't need to
 *      regen just because a member looked at a deal.
 *
 * On click: POST /api/roadmap/refresh and surface the result.
 */
export default function RefreshRoadmapCTA({
  overallSignal,
  redFlags,
}: Props) {
  const [hasRoadmap, setHasRoadmap] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a roadmap exists for this user
  useEffect(() => {
    let cancelled = false;
    fetch("/api/assessment/roadmap")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setHasRoadmap(!!data?.plan);
      })
      .catch(() => {
        if (!cancelled) setHasRoadmap(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const meaningful =
    overallSignal === "yellow" ||
    overallSignal === "red" ||
    (redFlags && redFlags.length > 0);

  // Hide until we know the roadmap state (avoid flash)
  if (hasRoadmap === null) return null;
  if (!hasRoadmap) return null;
  if (!meaningful) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/roadmap/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggerReason: "deal_evaluation" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to refresh roadmap");
      }
      setRefreshed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="eval-section eval-refresh-cta">
      <h4 className="eval-section-title">Refresh Your Roadmap</h4>
      <p className="eval-refresh-cta-desc">
        {overallSignal === "red"
          ? "This deal has structural problems worth folding into your plan."
          : overallSignal === "yellow"
            ? "This deal surfaced friction worth addressing in your plan."
            : "This deal introduced new signal worth folding into your plan."}{" "}
        Regenerating incorporates the new information into your roadmap&apos;s
        actions, recommended structures, and vision.
      </p>

      {refreshed ? (
        <div className="eval-refresh-cta-done">
          <span className="eval-refresh-cta-checkmark" aria-hidden>
            ✓
          </span>
          <strong>Roadmap refresh started.</strong> Your updated plan will be
          ready in under a minute.
          <a href="/roadmap" className="eval-refresh-cta-link">
            View Roadmap →
          </a>
        </div>
      ) : (
        <div className="eval-refresh-cta-actions">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn--filled"
          >
            {refreshing ? "REFRESHING…" : "REFRESH ROADMAP"}
          </button>
          {error && <span className="eval-refresh-cta-error">{error}</span>}
        </div>
      )}
    </div>
  );
}
