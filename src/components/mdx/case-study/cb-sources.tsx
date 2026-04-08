"use client";

import { ReactNode, useState } from "react";

interface CbSourcesProps {
  children: ReactNode;
}

export function CbSources({ children }: CbSourcesProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="cb-grid" style={{ marginTop: 80 }}>
      <div className="cb-sources">
        <button
          className="cb-sources-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span className="cb-sources-toggle-left">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="7" cy="7" r="5.5" />
              <line x1="7" y1="5" x2="7" y2="9" />
              <circle cx="7" cy="3.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            Sources & Verification
          </span>
          <svg
            className={`cb-sources-chevron${open ? " open" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="3 4.5 6 7.5 9 4.5" />
          </svg>
        </button>
        <div className={`cb-sources-body${open ? " open" : ""}`}>
          <div className="cb-sources-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface CbSourceGroupProps {
  title: string;
  children: ReactNode;
}

export function CbSourceGroup({ title, children }: CbSourceGroupProps) {
  return (
    <div className="cb-source-group">
      <h4 className="cb-source-group-title">{title}</h4>
      <div className="cb-source-group-body">{children}</div>
    </div>
  );
}

interface CbSourceItemProps {
  children: ReactNode;
}

export function CbSourceItem({ children }: CbSourceItemProps) {
  return <div className="cb-source-item">{children}</div>;
}
