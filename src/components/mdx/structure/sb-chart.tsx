"use client";

import { ReactNode, useEffect, useRef } from "react";

interface SbChartProps {
  title?: string;
  children: ReactNode;
}

export function SbChart({ title, children }: SbChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Equalize label widths so bars align
    const labels = el.querySelectorAll<HTMLElement>(".sb-chart-label");
    let maxW = 0;
    labels.forEach((l) => (maxW = Math.max(maxW, l.offsetWidth)));
    if (maxW > 0) labels.forEach((l) => (l.style.width = maxW + "px"));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.querySelectorAll<HTMLElement>(".sb-chart-bar-fill").forEach(
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
    <div className="sb-grid is-chart">
      <div className="sb-chart" ref={ref}>
        {title && <span className="sb-chart-title">{title}</span>}
        <div className="sb-chart-bars">{children}</div>
      </div>
    </div>
  );
}

interface SbChartRowProps {
  label: string;
  value: string;
  pct: string;
}

export function SbChartRow({ label, value, pct }: SbChartRowProps) {
  return (
    <div className="sb-chart-row">
      <span className="sb-chart-label">{label}</span>
      <div className="sb-chart-bar-track">
        <div className="sb-chart-bar-fill" data-width={pct} />
      </div>
      <span className="sb-chart-val">{value}</span>
    </div>
  );
}
