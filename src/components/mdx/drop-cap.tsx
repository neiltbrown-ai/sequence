import type { ReactNode } from "react";

export function DropCap({ children }: { children: ReactNode }) {
  return (
    <div className="ab-grid">
      <p className="ab-p has-dropcap rv vis">{children}</p>
    </div>
  );
}
