"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL = 2000;
const MAX_POLLS = 90; // 3 minutes max
const EXPECTED_DURATION = 35000; // 35s typical generation time
const TICK_INTERVAL = 200; // smooth updates

const STAGES = [
  { at: 0, label: "Analyzing your assessment responses" },
  { at: 12, label: "Mapping your position in the creative economy" },
  { at: 28, label: "Identifying structural misalignments" },
  { at: 48, label: "Building your personalized action playbook" },
  { at: 68, label: "Designing entity structure and value flywheel" },
  { at: 85, label: "Finalizing your strategic roadmap" },
];

function getStageLabel(pct: number): string {
  let label = STAGES[0].label;
  for (const s of STAGES) {
    if (pct >= s.at) label = s.label;
  }
  return label;
}

export default function RoadmapGenerating({ planId }: { planId: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startTime = useRef(Date.now());
  const pollCount = useRef(0);

  // Smooth progress animation — eases toward 90% over EXPECTED_DURATION
  useEffect(() => {
    const timer = setInterval(() => {
      if (done) return;
      const elapsed = Date.now() - startTime.current;
      // Ease-out curve: fast start, slows as it approaches 90%
      const raw = elapsed / EXPECTED_DURATION;
      const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2.5);
      setProgress(Math.min(eased * 90, 90));
    }, TICK_INTERVAL);

    return () => clearInterval(timer);
  }, [done]);

  // Poll for completion
  const checkStatus = useCallback(async () => {
    if (done) return;
    pollCount.current += 1;

    if (pollCount.current >= MAX_POLLS) {
      setTimedOut(true);
      return;
    }

    try {
      const res = await fetch(`/api/assessment/roadmap?planId=${planId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.plan?.status !== "generating") {
        setDone(true);
        setProgress(100);
        // Brief pause at 100% before navigating
        setTimeout(() => router.refresh(), 600);
      }
    } catch {
      // Silently retry
    }
  }, [planId, router, done]);

  useEffect(() => {
    const pollTimer = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(pollTimer);
  }, [checkStatus]);

  if (timedOut) {
    return (
      <div className="rdmp-generating">
        <div className="rdmp-generating-content">
          <h2>This is taking longer than expected</h2>
          <p>
            Your roadmap is still being generated. Please check back in a few
            minutes, or return to your dashboard.
          </p>
          <a href="/dashboard" className="rdmp-pending-btn">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const pct = Math.round(progress);
  const stageLabel = done ? "Complete" : getStageLabel(pct);

  return (
    <div className="rdmp-generating">
      <div className="rdmp-generating-content">
        <div className="rdmp-generating-spinner" />
        <h2>Generating your roadmap</h2>
        <p className="rdmp-generating-message">{stageLabel}</p>
        <div className="rdmp-generating-progress">
          <div
            className="rdmp-generating-progress-bar"
            style={{ width: `${Math.max(pct, 8)}%` }}
          >
            <span className="rdmp-generating-pct">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
