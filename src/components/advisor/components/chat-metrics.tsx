"use client";

import { useEffect, useRef } from "react";

interface ChatMetricsProps {
  metrics: { value: string; label: string }[];
  onReady: () => void;
}

export function ChatMetrics({ metrics, onReady }: ChatMetricsProps) {
  const resolved = useRef(false);

  useEffect(() => {
    if (!resolved.current) {
      resolved.current = true;
      onReady();
    }
  }, [onReady]);

  if (!metrics?.length) return null;

  return (
    <div className="adv-visual-wrap">
      <div className="adv-visual-metrics">
        {metrics.map((m, i) => (
          <div key={i} className="adv-visual-metric">
            <div className="adv-visual-metric-val">{m.value}</div>
            <div className="adv-visual-metric-lbl">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
