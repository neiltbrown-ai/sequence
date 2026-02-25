import type { ReactNode } from "react";

export function Metrics({ children }: { children: ReactNode }) {
  return (
    <div className="ab-grid is-metrics">
      <div className="ab-metrics rv vis">{children}</div>
    </div>
  );
}

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="ab-metric">
      <span className="ab-metric-val">{value}</span>
      <span className="ab-metric-lbl">{label}</span>
    </div>
  );
}
