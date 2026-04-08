import { ReactNode } from "react";

interface SectionProps {
  id: string;
  children: ReactNode;
}

export function Section({ id, children }: SectionProps) {
  return (
    <div id={id} className="ab-section">
      {children}
    </div>
  );
}
