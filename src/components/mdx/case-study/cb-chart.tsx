"use client";

import { ReactNode, useEffect, useRef } from "react";

interface CbChartProps {
  title?: string;
  children: ReactNode;
}

export function CbChart({ title, children }: CbChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Equalize label widths so bars align
    const labels = el.querySelectorAll<HTMLElement>(".cb-chart-label");
    let maxW = 0;
    labels.forEach((l) => (maxW = Math.max(maxW, l.offsetWidth)));
    if (maxW > 0) labels.forEach((l) => (l.style.width = maxW + "px"));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay to next frame so bars animate from 0
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.querySelectorAll<HTMLElement>(".cb-chart-bar-fill").forEach(
                (bar) => {
                  const w = bar.getAttribute("data-width");
                  if (w) bar.style.width = w + "%";
                }
              );
            });
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cb-grid is-chart">
      <div className="cb-chart" ref={ref}>
        {title && <span className="cb-chart-title">{title}</span>}
        <div className="cb-chart-bars">{children}</div>
      </div>
    </div>
  );
}

interface CbChartRowProps {
  label: string;
  value: string;
  pct: string;
  avg?: boolean;
}

export function CbChartRow({ label, value, pct, avg }: CbChartRowProps) {
  return (
    <div className={`cb-chart-row${avg ? " is-avg" : ""}`}>
      <span className="cb-chart-label">{label}</span>
      <div className="cb-chart-bar-track">
        <div className="cb-chart-bar-fill" data-width={pct} />
      </div>
      <span className="cb-chart-val">{value}</span>
    </div>
  );
}
