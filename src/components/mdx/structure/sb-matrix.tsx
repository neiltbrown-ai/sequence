import { ReactNode } from "react";

interface SbMatrixProps {
  title?: string;
  children: ReactNode;
}

export function SbMatrix({ title, children }: SbMatrixProps) {
  return (
    <div className="sb-grid is-matrix">
      <div className="sb-matrix">
        {title && <div className="sb-matrix-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

interface SbMatrixRowProps {
  score: string;
  desc: string;
  action: string;
}

export function SbMatrixRow({ score, desc, action }: SbMatrixRowProps) {
  return (
    <div className="sb-matrix-row">
      <div className="sb-matrix-score">{score}</div>
      <div className="sb-matrix-desc">{desc}</div>
      <div className="sb-matrix-action">{action}</div>
    </div>
  );
}
