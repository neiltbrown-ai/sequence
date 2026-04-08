import { ReactNode } from "react";

interface CbHeadingProps {
  children: ReactNode;
}

export function CbHeading({ children }: CbHeadingProps) {
  return (
    <div className="cb-grid is-section">
      <h2 className="cb-h2">{children}</h2>
    </div>
  );
}

export function CbSubheading({ children }: CbHeadingProps) {
  return (
    <div className="cb-grid is-sub">
      <h3 className="cb-h3">{children}</h3>
    </div>
  );
}
