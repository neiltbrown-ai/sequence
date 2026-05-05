import { ReactNode } from "react";

interface CbVerifiedDataPointsProps {
  children: ReactNode;
}

export function CbVerifiedDataPoints({ children }: CbVerifiedDataPointsProps) {
  return (
    <div className="cb-source-group cb-verified-data-points">
      <h4 className="cb-source-group-title">Verified Data Points</h4>
      <div className="cb-source-group-body">{children}</div>
    </div>
  );
}

type ConfidenceLevel = "very-high" | "high" | "medium";

interface CbDataPointProps {
  confidence: ConfidenceLevel;
  children: ReactNode;
}

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  "very-high": "very high",
  high: "high",
  medium: "medium",
};

export function CbDataPoint({ confidence, children }: CbDataPointProps) {
  return (
    <div className="cb-source-item cb-data-point">
      <span className="cb-data-point-text">{children}</span>
      <span
        className={`cb-data-point-chip cb-data-point-chip--${confidence}`}
        aria-label={`Confidence: ${CONFIDENCE_LABEL[confidence]}`}
      >
        {CONFIDENCE_LABEL[confidence]}
      </span>
    </div>
  );
}
