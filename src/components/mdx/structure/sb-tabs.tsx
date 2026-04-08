"use client";

import { ReactNode, useState, Children, isValidElement } from "react";

interface SbTabsProps {
  tabs?: string[];
  tabsJson?: string;
  children: ReactNode;
}

export function SbTabs({ tabs, tabsJson, children }: SbTabsProps) {
  const [active, setActive] = useState(0);
  const tabLabels: string[] = tabs || (tabsJson ? JSON.parse(tabsJson) : []);
  const panels = Children.toArray(children).filter(isValidElement);

  return (
    <div className="sb-grid is-tiers">
      <div className="sb-tiers">
        <div className="sb-tiers-tabs">
          {tabLabels.map((label, i) => (
            <button
              key={label}
              className={`sb-tier-tab${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              {label}
            </button>
          ))}
        </div>
        {panels.map((panel, i) => (
          <div
            key={i}
            className={`sb-tier-panel${i === active ? " active" : ""}`}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SbTabPanelProps {
  children: ReactNode;
}

export function SbTabPanel({ children }: SbTabPanelProps) {
  return <>{children}</>;
}

interface SbTabGridProps {
  children: ReactNode;
}

export function SbTabGrid({ children }: SbTabGridProps) {
  return <div className="sb-tier-grid">{children}</div>;
}

interface SbTabItemProps {
  label: string;
  value: string;
}

export function SbTabItem({ label, value }: SbTabItemProps) {
  return (
    <div className="sb-tier-item">
      <div className="sb-tier-lbl">{label}</div>
      <div className="sb-tier-val">{value}</div>
    </div>
  );
}

interface SbTabNoteProps {
  children: ReactNode;
}

export function SbTabNote({ children }: SbTabNoteProps) {
  return <div className="sb-tier-note">{children}</div>;
}

interface SbTabBarProps {
  children: ReactNode;
}

export function SbTabBar({ children }: SbTabBarProps) {
  return <div className="sb-tier-bar">{children}</div>;
}

interface SbTabBarRowProps {
  label: string;
  pct: string;
}

export function SbTabBarRow({ label, pct }: SbTabBarRowProps) {
  return (
    <div className="sb-tier-bar-row">
      <span className="sb-tier-bar-label">{label}</span>
      <div className="sb-tier-bar-track">
        <div className="sb-tier-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
