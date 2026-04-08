"use client";

import { ReactNode, useState, Children, isValidElement } from "react";

/* ─────────────────────────────────────────────
   PortalTabs — Reusable tabbed panel component
   for portal pages (scenarios, comparisons, etc.)
   ───────────────────────────────────────────── */

interface PortalTabsProps {
  tabs: string[];
  children: ReactNode;
  /** Persistent bar that always shows (e.g. total value summary) */
  summaryBar?: ReactNode;
}

export function PortalTabs({ tabs, children, summaryBar }: PortalTabsProps) {
  const [active, setActive] = useState(0);
  const panels = Children.toArray(children).filter(isValidElement);

  return (
    <div className="ptl-tabs">
      <div className="ptl-tabs-bar">
        {tabs.map((label, i) => (
          <button
            key={label}
            className={`ptl-tabs-btn${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
            data-cursor="expand"
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          className={`ptl-tabs-panel${i === active ? " active" : ""}`}
        >
          {panel}
        </div>
      ))}
      {summaryBar && <div className="ptl-tabs-summary">{summaryBar}</div>}
    </div>
  );
}

export function PortalTabPanel({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
