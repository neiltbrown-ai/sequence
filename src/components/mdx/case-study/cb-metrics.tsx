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
  estimated?: boolean;
}

export function CbMetric({ value, label, estimated }: CbMetricProps) {
  return (
    <div className="cb-metric">
      <div className="cb-metric-val">{value}</div>
      {estimated && <div className="cb-metric-est">Est.</div>}
      <div className="cb-metric-lbl">{label}</div>
    </div>
  );
}
