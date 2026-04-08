import type { ReactNode } from "react";

export function DropCap({ children }: { children: ReactNode }) {
  return <div className="dropcap-wrap">{children}</div>;
}
