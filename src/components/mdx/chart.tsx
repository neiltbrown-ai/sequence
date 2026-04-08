"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function Chart({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Equalize label widths so bars align
    const labels = el.querySelectorAll<HTMLElement>(".ab-chart-label");
    let maxW = 0;
    labels.forEach((l) => (maxW = Math.max(maxW, l.offsetWidth)));
    if (maxW > 0) labels.forEach((l) => (l.style.width = maxW + "px"));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.querySelectorAll<HTMLElement>(".ab-chart-bar-fill").forEach(
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
    <div className="ab-grid is-chart">
      <div className="ab-chart rv vis" ref={ref}>
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
  width: string | number;
  display: string;
}) {
  const pct = typeof width === "string" ? parseFloat(width) : width;
  return (
    <div className="ab-chart-row">
      <span className="ab-chart-label">{label}</span>
      <div className="ab-chart-bar-track">
        <div
          className="ab-chart-bar-fill"
          data-width={pct}
        ></div>
      </div>
      <span className="ab-chart-val">{display}</span>
    </div>
  );
}
