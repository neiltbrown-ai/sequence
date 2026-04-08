'use client';

import type { SignalColor } from '@/types/evaluator';

interface VerdictSummaryProps {
  signal: SignalColor;
  score: number;
  headline: string;
  summary: string;
}

const SIGNAL_LABELS: Record<SignalColor, string> = {
  green: 'GREEN',
  yellow: 'YELLOW',
  red: 'RED',
};

export function VerdictSummary({ signal, score, headline, summary }: VerdictSummaryProps) {
  return (
    <div className={`eval-verdict-signal eval-signal-${signal}`}>
      <div className="eval-verdict-light">
        <div className={`eval-verdict-dot eval-dot-${signal}`} />
        <span className="eval-verdict-label">{SIGNAL_LABELS[signal]}</span>
        <span className="eval-verdict-score">{score.toFixed(1)}/10</span>
      </div>
      <h3 className="eval-verdict-headline">{headline}</h3>
      <p className="eval-verdict-summary">{summary}</p>
    </div>
  );
}
