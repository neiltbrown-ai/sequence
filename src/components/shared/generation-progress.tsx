"use client";

/**
 * GenerationProgress — unified loading/progress UI for long-running AI
 * operations across the portal. One visual pattern, four callers:
 *
 *   - Portfolio Analysis (Valuation tab)
 *   - Roadmap generation (RoadmapGenerating page)
 *   - Creative Identity wizard (completion submit state)
 *   - Deal Evaluator (computing + generating phases)
 *
 * Variants:
 *   - `progress` provided → determinate progress bar with % text
 *   - `progress` undefined → indeterminate spinner only
 *   - `timedOut` true → swap to timeout/retry state
 *
 * The component owns zero state — callers pass props based on their
 * own lifecycle (polling, fetch resolution, state machine transitions).
 * This keeps timing logic co-located with the feature that owns it.
 */

import type { CSSProperties, ReactNode } from "react";

interface TimeoutAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ProgressStage {
  /** Progress threshold (0-100) at or above which this stage shows */
  at: number;
  label: string;
}

export interface GenerationProgressProps {
  /** Top-of-card mono label, e.g. "CREATIVE IDENTITY" */
  label: string;
  /** Main heading */
  title: string;
  /** Optional subtitle below title */
  description?: string;
  /**
   * Progress percent 0-100. Omit (or pass null) for indeterminate state —
   * spinner continues but no bar renders.
   */
  progress?: number | null;
  /**
   * Current stage label (e.g. "Analyzing your Creative Identity"). When
   * `progress` is also set, appears between title and the bar.
   */
  stageLabel?: string;
  /** Small mono footer text, e.g. "Usually under 60 seconds" */
  footerNote?: string;
  /** Switches to timeout state */
  timedOut?: boolean;
  timeoutTitle?: string;
  timeoutBody?: string;
  timeoutAction?: TimeoutAction;
  /** Extra content slotted in below footer (for custom CTAs) */
  children?: ReactNode;
  /** Optional override style on the card wrapper */
  style?: CSSProperties;
}

export default function GenerationProgress({
  label,
  title,
  description,
  progress,
  stageLabel,
  footerNote,
  timedOut,
  timeoutTitle = "This is taking longer than expected",
  timeoutBody = "Your content is still being generated. Please check back in a few minutes, or return to your dashboard.",
  timeoutAction,
  children,
  style,
}: GenerationProgressProps) {
  if (timedOut) {
    return (
      <div className="gen-progress" style={style}>
        <div className="gen-progress-icon gen-progress-icon--alert" aria-hidden>
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.25" width="48" height="48">
            <circle cx="24" cy="24" r="20" />
            <path d="M24 14v12M24 30v2" />
          </svg>
        </div>
        <div className="gen-progress-label">{label}</div>
        <h2 className="gen-progress-title">{timeoutTitle}</h2>
        <p className="gen-progress-desc">{timeoutBody}</p>
        {timeoutAction && (
          <div className="gen-progress-cta">
            {timeoutAction.href ? (
              <a href={timeoutAction.href} className="btn">
                {timeoutAction.label}
              </a>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={timeoutAction.onClick}
              >
                {timeoutAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const pct = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : null;
  const hasBar = pct !== null;

  return (
    <div className="gen-progress" style={style}>
      <div className="gen-progress-graphic" aria-hidden>
        {/* Rotating spinner only — cleaner feel, lets the progress bar
            below carry the state communication */}
        <span className="gen-progress-spinner" />
      </div>

      <div className="gen-progress-label">{label}</div>
      <h2 className="gen-progress-title">{title}</h2>
      {description && <p className="gen-progress-desc">{description}</p>}

      {hasBar && (
        <div className="gen-progress-bar-wrap">
          {stageLabel && (
            <div className="gen-progress-stage">{stageLabel}</div>
          )}
          <div className="gen-progress-bar">
            <div
              className="gen-progress-bar-fill"
              style={{ width: `${Math.max(pct, 4)}%` }}
            >
              <span className="gen-progress-pct">{Math.round(pct)}%</span>
            </div>
          </div>
        </div>
      )}

      {!hasBar && stageLabel && (
        <p className="gen-progress-stage gen-progress-stage--standalone">
          {stageLabel}
        </p>
      )}

      {footerNote && <p className="gen-progress-footer">{footerNote}</p>}
      {children && <div className="gen-progress-extra">{children}</div>}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Look up the label for a given progress percent across a stages array.
 * Use with eased progress animation:
 *   const label = resolveStageLabel(progress, STAGES);
 */
export function resolveStageLabel(
  progress: number,
  stages: ProgressStage[]
): string {
  if (!stages.length) return "";
  let label = stages[0].label;
  for (const s of stages) {
    if (progress >= s.at) label = s.label;
  }
  return label;
}

/**
 * Ease-out curve from 0 → 90% over expectedMs. Used by both Portfolio
 * and Roadmap loading screens. Returns a number 0-90.
 */
export function easedProgress(elapsedMs: number, expectedMs: number): number {
  const raw = elapsedMs / expectedMs;
  const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2.5);
  return Math.min(eased * 90, 90);
}
