"use client";

import { ReactNode, useState, Children, isValidElement } from "react";

interface SbNegProps {
  tabs?: string[];
  tabsJson?: string;
  children: ReactNode;
}

export function SbNeg({ tabs, tabsJson, children }: SbNegProps) {
  const [active, setActive] = useState(0);
  const tabLabels: string[] = tabs || (tabsJson ? JSON.parse(tabsJson) : []);
  const panels = Children.toArray(children).filter(isValidElement);

  return (
    <div className="sb-grid is-neg">
      <div className="sb-neg">
        <div className="sb-neg-tabs">
          {tabLabels.map((label, i) => (
            <button
              key={label}
              className={`sb-neg-tab${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              {label}
            </button>
          ))}
        </div>
        {panels.map((panel, i) => (
          <div
            key={i}
            className={`sb-neg-panel${i === active ? " active" : ""}`}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SbNegPanelProps {
  children: ReactNode;
}

export function SbNegPanel({ children }: SbNegPanelProps) {
  return <div className="sb-neg-detail">{children}</div>;
}

interface SbNegRowProps {
  label: string;
  children: ReactNode;
}

export function SbNegRow({ label, children }: SbNegRowProps) {
  return (
    <div className="sb-neg-row">
      <span className="sb-neg-label">{label}</span>
      <div className="sb-neg-value">{children}</div>
    </div>
  );
}
