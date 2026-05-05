type ConfidenceLevel = "disclosed" | "mixed" | "inferred";

interface CbConfidenceBadgeProps {
  level: ConfidenceLevel;
}

const LABEL: Record<ConfidenceLevel, string> = {
  disclosed: "Disclosed",
  mixed: "Mixed",
  inferred: "Inferred",
};

const TITLE: Record<ConfidenceLevel, string> = {
  disclosed: "Disclosed terms — public financial record, named primary sources, deal terms verifiable through filings or named interviews.",
  mixed: "Mixed sources — some disclosed figures, some industry-comparable estimates.",
  inferred: "Inferred from comparables — most figures are industry estimates; structural pattern is documented but specific numbers are inferred.",
};

export function CbConfidenceBadge({ level }: CbConfidenceBadgeProps) {
  return (
    <a
      href="#sources"
      className={`cb-confidence-badge cb-confidence-badge--${level}`}
      title={TITLE[level]}
      aria-label={`Confidence: ${LABEL[level]}. Click to view verification block.`}
    >
      [ {LABEL[level].toUpperCase()} ]
    </a>
  );
}
