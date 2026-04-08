'use client';

import { useState } from 'react';
import type { SignalColor, RedFlag } from '@/types/evaluator';

interface DimensionData {
  key: string;
  label: string;
  description: string;
  score: number;
  signal: SignalColor;
  flags: string[];
  summary: string;
}

interface DimensionCardsProps {
  dimensions: DimensionData[];
  redFlags: RedFlag[];
}

function SignalDot({ signal }: { signal: SignalColor }) {
  return <span className={`eval-signal-dot eval-dot-${signal}`} />;
}

function DimensionRow({ dim }: { dim: DimensionData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`eval-dim-card ${expanded ? 'is-expanded' : ''}`}>
      <button
        className="eval-dim-card-header"
        onClick={() => setExpanded(!expanded)}
        type="button"
        data-cursor="expand"
      >
        <SignalDot signal={dim.signal} />
        <span className="eval-dim-card-label">{dim.label}</span>
        <span className="eval-dim-card-score">{dim.score.toFixed(1)}</span>
        <span className="eval-dim-card-arrow">›</span>
      </button>
      {expanded && (
        <div className="eval-dim-card-body">
          <p className="eval-dim-card-summary">{dim.summary}</p>
          {dim.flags.length > 0 && (
            <div className="eval-dim-card-flags">
              {dim.flags.map((flag, i) => (
                <div key={i} className="eval-dim-flag">
                  <span className="eval-dim-flag-icon">⚠</span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DimensionCards({ dimensions, redFlags }: DimensionCardsProps) {
  return (
    <div className="eval-dim-cards">
      {redFlags.length > 0 && (
        <div className="eval-red-flags">
          <h4 className="eval-red-flags-title">Red Flags</h4>
          {redFlags.map((rf) => (
            <div key={rf.id} className="eval-red-flag">
              <span className="eval-red-flag-icon">🔴</span>
              <span>{rf.message}</span>
            </div>
          ))}
        </div>
      )}
      {dimensions.map((dim) => (
        <DimensionRow key={dim.key} dim={dim} />
      ))}
    </div>
  );
}
