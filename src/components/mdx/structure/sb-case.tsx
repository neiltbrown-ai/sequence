"use client";

import { ReactNode, useState } from "react";

interface SbCaseProps {
  label?: string;
  name: string;
  tag?: string;
  outcome?: string;
  children: ReactNode;
}

export function SbCase({ label, name, tag, outcome, children }: SbCaseProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sb-grid is-case">
      <div className={`sb-case${open ? " open" : ""}`}>
        <div className="sb-case-head" onClick={() => setOpen(!open)}>
          <div className="sb-case-info">
            {label && <div className="sb-case-lbl">{label}</div>}
            <div className="sb-case-name">{name}</div>
          </div>
          <div className="sb-case-meta">
            {tag && <span className="sb-case-tag">{tag}</span>}
            {outcome && <span className="sb-case-outcome">{outcome}</span>}
          </div>
        </div>
        <div className="sb-case-body">
          <div className="sb-case-content">
            {typeof children === "string" ? (
              <p className="sb-case-text">{children}</p>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SbCaseTextProps {
  children: ReactNode;
}

export function SbCaseText({ children }: SbCaseTextProps) {
  return <div className="sb-case-text">{children}</div>;
}
