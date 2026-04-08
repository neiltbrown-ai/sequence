import { ReactNode } from "react";

interface CbDropCapProps {
  children: ReactNode;
}

export function CbDropCap({ children }: CbDropCapProps) {
  return (
    <div className="cb-grid">
      <p className="cb-p has-dropcap">{children}</p>
    </div>
  );
}
