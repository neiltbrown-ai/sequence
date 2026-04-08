import { ReactNode } from "react";

interface SbHeadingProps {
  children: ReactNode;
}

export function SbHeading({ children }: SbHeadingProps) {
  return (
    <div className="sb-grid is-section">
      <h2 className="sb-h2">{children}</h2>
    </div>
  );
}

export function SbSubheading({ children }: SbHeadingProps) {
  return (
    <div className="sb-grid is-sub">
      <h3 className="sb-h3">{children}</h3>
    </div>
  );
}
