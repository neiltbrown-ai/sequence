import { ReactNode } from "react";

interface CbMetricsProps {
  children: ReactNode;
}

export function CbMetrics({ children }: CbMetricsProps) {
  return (
    <div className="cb-grid is-metrics">
      <div className="cb-metrics">{children}</div>
    </div>
  );
}

interface CbMetricProps {
  value: string;
  label: string;
}

export function CbMetric({ value, label }: CbMetricProps) {
  return (
    <div className="cb-metric">
      <div className="cb-metric-val">{value}</div>
      <div className="cb-metric-lbl">{label}</div>
    </div>
  );
}
