import type { ReactNode } from "react";

export function Chart({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="ab-grid is-chart">
      <div className="ab-chart rv vis">
        <div className="ab-chart-title">{title}</div>
        <div className="ab-chart-bars">{children}</div>
      </div>
    </div>
  );
}

export function ChartRow({
  label,
  width,
  display,
}: {
  label: string;
  width: number;
  display: string;
}) {
  return (
    <div className="ab-chart-row">
      <span className="ab-chart-label">{label}</span>
      <div className="ab-chart-bar-track">
        <div
          className="ab-chart-bar-fill"
          style={{ width: `${width}%` }}
        ></div>
      </div>
      <span className="ab-chart-val">{display}</span>
    </div>
  );
}
