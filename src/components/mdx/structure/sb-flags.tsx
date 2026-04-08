import { ReactNode } from "react";

interface SbFlagsProps {
  children: ReactNode;
}

export function SbFlags({ children }: SbFlagsProps) {
  return (
    <div className="sb-grid is-flags">
      <div className="sb-flags">{children}</div>
    </div>
  );
}

interface SbFlagColProps {
  header: string;
  type?: string; /* "use" | "avoid" */
  children: ReactNode;
}

export function SbFlagCol({ header, children }: SbFlagColProps) {
  return (
    <div className="sb-flag-col">
      <div className="sb-flag-header">{header}</div>
      {children}
    </div>
  );
}

interface SbFlagProps {
  type?: string; /* "use" | "avoid" */
  children: ReactNode;
}

export function SbFlag({ type = "use", children }: SbFlagProps) {
  const mark = type === "avoid" ? "\u2717" : "\u2713";
  const cls = type === "avoid" ? "red" : "green";

  return (
    <div className="sb-flag">
      <span className={`sb-flag-mark ${cls}`}>{mark}</span>
      <span>{children}</span>
    </div>
  );
}
