"use client";

import { useEffect, useRef } from "react";

interface ChatBarChartProps {
  title?: string;
  rows: { label: string; value: string; pct: number }[];
  onReady: () => void;
}

export function ChatBarChart({ title, rows, onReady }: ChatBarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const resolved = useRef(false);

  useEffect(() => {
    if (!resolved.current) {
      resolved.current = true;
      onReady();
    }
  }, [onReady]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Equalize label widths so bars align
    const labels = el.querySelectorAll<HTMLElement>(".adv-visual-chart-label");
    let maxW = 0;
    labels.forEach((l) => (maxW = Math.max(maxW, l.offsetWidth)));
    if (maxW > 0) labels.forEach((l) => (l.style.width = maxW + "px"));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.querySelectorAll<HTMLElement>(".adv-visual-chart-fill").forEach(
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

  if (!rows?.length) return null;

  return (
    <div className="adv-visual-wrap" ref={ref}>
      {title && <div className="adv-visual-title">{title}</div>}
      <div className="adv-visual-chart-rows">
        {rows.map((row, i) => (
          <div key={i} className="adv-visual-chart-row">
            <span className="adv-visual-chart-label">{row.label}</span>
            <div className="adv-visual-chart-track">
              <div className="adv-visual-chart-fill" data-width={row.pct} />
            </div>
            <span className="adv-visual-chart-val">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
