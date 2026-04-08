"use client";

import { ReactNode, useState, Children, isValidElement } from "react";

interface CbTabsProps {
  tabs?: string[];
  tabsJson?: string;
  children: ReactNode;
}

export function CbTabs({ tabs, tabsJson, children }: CbTabsProps) {
  const [active, setActive] = useState(0);
  const tabLabels: string[] = tabs || (tabsJson ? JSON.parse(tabsJson) : []);
  const panels = Children.toArray(children).filter(isValidElement);

  return (
    <div className="cb-grid is-tiers">
      <div className="cb-tiers">
        <div className="cb-tiers-tabs">
          {tabLabels.map((label, i) => (
            <button
              key={label}
              className={`cb-tier-tab${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              {label}
            </button>
          ))}
        </div>
        {panels.map((panel, i) => (
          <div
            key={i}
            className={`cb-tier-panel${i === active ? " active" : ""}`}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CbTabPanelProps {
  children: ReactNode;
}

export function CbTabPanel({ children }: CbTabPanelProps) {
  return <>{children}</>;
}

interface CbTabGridProps {
  children: ReactNode;
}

export function CbTabGrid({ children }: CbTabGridProps) {
  return <div className="cb-tier-grid">{children}</div>;
}

interface CbTabItemProps {
  label: string;
  value: string;
}

export function CbTabItem({ label, value }: CbTabItemProps) {
  return (
    <div className="cb-tier-item">
      <div className="cb-tier-lbl">{label}</div>
      <div className="cb-tier-val">{value}</div>
    </div>
  );
}

interface CbTabNoteProps {
  children: ReactNode;
}

export function CbTabNote({ children }: CbTabNoteProps) {
  return <div className="cb-tier-note">{children}</div>;
}
