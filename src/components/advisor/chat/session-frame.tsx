"use client";

/**
 * Session frame — wizard chrome for the "Where You Stand" guided
 * session in chat (simplification strategy §3.2).
 *
 * Docked above the thread: bead progress (one bead per section),
 * within-section question count, time remaining, and the autosave
 * promise (the pause affordance — the state machine already
 * autosaves and resumes, so we surface that instead of a button).
 *
 * The beads track the scripted spine only. Interstitial beats (the
 * mirror) render between beads and never move the bar; it never goes
 * backward. On completion the frame unmounts and a compact summary
 * line takes over in-thread (see assessment-flow.tsx).
 */

import { SECTION_META } from "@/lib/assessment/questions";

interface SessionFrameProps {
  /** Current section on the spine, 1-5 */
  currentSection: number;
  /** 0-based index of the current question within the section */
  questionIndex: number;
  /** Number of questions in the current section */
  questionCount: number;
}

function parseMinutes(estimate: string): number {
  const match = estimate.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export default function SessionFrame({
  currentSection,
  questionIndex,
  questionCount,
}: SessionFrameProps) {
  // Sum the current + remaining sections' estimates from SECTION_META —
  // the spine is scripted, so its length is known and the bar never lies.
  const minutesLeft = SECTION_META.filter(
    (meta) => meta.number >= currentSection
  ).reduce((sum, meta) => sum + parseMinutes(meta.estimatedTime), 0);

  const qNumber = Math.min(questionIndex + 1, questionCount);

  return (
    <div className="session-frame">
      <div className="session-frame-row">
        <span className="session-frame-title">Where You Stand</span>
        <div className="session-frame-beads" aria-hidden>
          {SECTION_META.map((meta) => {
            const state =
              meta.number < currentSection
                ? "done"
                : meta.number === currentSection
                  ? "current"
                  : "upcoming";
            return (
              <span
                key={meta.number}
                title={meta.title}
                className={`session-frame-bead session-frame-bead--${state}`}
              />
            );
          })}
          {questionCount > 0 && (
            <span className="session-frame-count">
              Q {qNumber}/{questionCount}
            </span>
          )}
        </div>
        <span className="session-frame-meta">
          Section {currentSection} of {SECTION_META.length} &middot; ~
          {minutesLeft} min left
        </span>
      </div>
      <div className="session-frame-note">
        Autosaves &mdash; leave any time, resume where you left off
      </div>
    </div>
  );
}
