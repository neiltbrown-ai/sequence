import type { ReactNode } from "react";

export function Subhead({ children }: { children: ReactNode }) {
  return (
    <div className="ab-grid is-subhead">
      <h2 className="ab-h2 rv vis">{children}</h2>
    </div>
  );
}

export function SmallSubhead({ children }: { children: ReactNode }) {
  return (
    <div className="ab-grid is-subhead-sm">
      <h3 className="ab-h3 rv vis">{children}</h3>
    </div>
  );
}
