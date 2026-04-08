import Link from "next/link";
import { ReactNode } from "react";

interface SbAltsProps {
  children: ReactNode;
}

export function SbAlts({ children }: SbAltsProps) {
  return (
    <div className="sb-grid is-alts">
      <div className="sb-alts">{children}</div>
    </div>
  );
}

interface SbAltProps {
  condition: string;
  name: string;
  href?: string;
}

export function SbAlt({ condition, name, href }: SbAltProps) {
  const inner = (
    <>
      <span className="sb-alt-cond">{condition} &rarr;</span>
      <span className="sb-alt-name">{name}</span>
    </>
  );

  return (
    <div className="sb-alt">
      {href ? (
        <Link href={href}>{inner}</Link>
      ) : (
        <div style={{ display: "flex", gap: "12px", alignItems: "baseline", padding: "12px 0", width: "100%" }}>
          {inner}
        </div>
      )}
    </div>
  );
}
