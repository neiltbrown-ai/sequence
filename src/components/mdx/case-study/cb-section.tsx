import { ReactNode } from "react";

interface CbSectionProps {
  id: string;
  children: ReactNode;
}

export function CbSection({ id, children }: CbSectionProps) {
  return (
    <div id={id} className="cb-section">
      {children}
    </div>
  );
}
