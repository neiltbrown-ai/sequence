import { ReactNode } from "react";

interface CbFlywheelProps {
  title?: string;
  children: ReactNode;
}

export function CbFlywheel({ title, children }: CbFlywheelProps) {
  return (
    <div className="cb-grid is-flywheel">
      <div className="cs-flywheel">
        {title && <div className="cs-flywheel-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}
