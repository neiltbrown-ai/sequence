import { ReactNode } from "react";

interface SbSectionProps {
  id: string;
  children: ReactNode;
}

export function SbSection({ id, children }: SbSectionProps) {
  return (
    <div id={id} className="sb-section">
      {children}
    </div>
  );
}
