"use client";

import { useEffect, useRef } from "react";

interface ChatEntityChartProps {
  title?: string;
  parent: string;
  children: { name: string; desc: string }[];
  onReady: () => void;
}

export function ChatEntityChart({ title, parent, children, onReady }: ChatEntityChartProps) {
  const resolved = useRef(false);

  useEffect(() => {
    if (!resolved.current) {
      resolved.current = true;
      onReady();
    }
  }, [onReady]);

  if (!parent || !children?.length) return null;

  return (
    <div className="adv-visual-wrap">
      {title && <div className="adv-visual-title">{title}</div>}
      <div className="adv-visual-org">
        <div className="adv-visual-org-parent">
          <div className="adv-visual-org-parent-name">{parent}</div>
        </div>
        <div className="adv-visual-org-connector" />
        <div className="adv-visual-org-children">
          {children.map((c) => (
            <div key={c.name} className="adv-visual-org-child">
              <div className="adv-visual-org-child-name">{c.name}</div>
              <div className="adv-visual-org-child-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
