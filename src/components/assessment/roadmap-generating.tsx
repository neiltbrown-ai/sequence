"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import GenerationProgress, {
  resolveStageLabel,
  easedProgress,
  type ProgressStage,
} from "@/components/shared/generation-progress";

const POLL_INTERVAL = 2000;
const MAX_POLLS = 90; // 3 minutes max
const EXPECTED_DURATION = 35000; // 35s typical generation time
const TICK_INTERVAL = 200;

const STAGES: ProgressStage[] = [
  { at: 0, label: "Analyzing your Creative Identity" },
  { at: 12, label: "Mapping your position in the creative economy" },
  { at: 28, label: "Identifying structural misalignments" },
  { at: 48, label: "Building your personalized action playbook" },
  { at: 68, label: "Designing entity structure and value flywheel" },
  { at: 85, label: "Finalizing your strategic roadmap" },
];

export default function RoadmapGenerating({ planId }: { planId: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startTime = useRef(Date.now());
  const pollCount = useRef(0);

  // Eased progress animation — fast start, slows as it approaches 90%
  useEffect(() => {
    const timer = setInterval(() => {
      if (done) return;
      setProgress(easedProgress(Date.now() - startTime.current, EXPECTED_DURATION));
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

  const pct = Math.round(progress);
  const stageLabel = done ? "Complete" : resolveStageLabel(pct, STAGES);

  return (
    <div style={{ padding: "48px 24px" }}>
      <GenerationProgress
        label="Strategic Roadmap"
        title={done ? "Complete" : "Generating your roadmap"}
        description="Your personalized plan is being woven from your Creative Identity, Portfolio, and recent deal activity."
        progress={pct}
        stageLabel={stageLabel}
        footerNote="Usually ready in under a minute"
        timedOut={timedOut}
        timeoutTitle="This is taking longer than expected"
        timeoutBody="Your roadmap is still being generated. Please check back in a few minutes, or return to your dashboard."
        timeoutAction={{ href: "/dashboard", label: "Return to Dashboard" }}
      />
    </div>
  );
}
