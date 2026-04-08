"use client";

import { ReactNode, useState, Children, isValidElement } from "react";

interface TabsProps {
  tabsJson?: string;
  children: ReactNode;
}

export function Tabs({ tabsJson, children }: TabsProps) {
  const [active, setActive] = useState(0);
  const tabLabels: string[] = tabsJson ? JSON.parse(tabsJson) : [];
  const panels = Children.toArray(children).filter(isValidElement);

  return (
    <div className="ab-grid is-tabs">
      <div className="ab-tabs">
        <div className="ab-tabs-btns">
          {tabLabels.map((label, i) => (
            <button
              key={label}
              className={`ab-tab-btn${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              {label}
            </button>
          ))}
        </div>
        {panels.map((panel, i) => (
          <div
            key={i}
            className={`ab-tab-panel${i === active ? " active" : ""}`}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabPanel({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TabGrid({ children }: { children: ReactNode }) {
  return <div className="ab-tab-grid">{children}</div>;
}

export function TabItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="ab-tab-item">
      <div className="ab-tab-lbl">{label}</div>
      <div className="ab-tab-val">{value}</div>
    </div>
  );
}
