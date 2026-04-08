'use client';

import type { SignalColor } from '@/types/evaluator';

interface RadarDimension {
  key: string;
  label: string;
  score: number;
  signal: SignalColor;
}

interface RadarChartProps {
  dimensions: RadarDimension[];
}

// 6 axes at 60° intervals, starting from top (north)
const SIZE = 240;
const CENTER = SIZE / 2;
const MAX_RADIUS = 100;

function polarToCartesian(angle: number, radius: number): [number, number] {
  // Angle in radians, 0 = north (top), clockwise
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function getPoints(scores: number[]): string {
  return scores
    .map((score, i) => {
      const angle = (360 / scores.length) * i;
      const radius = (score / 10) * MAX_RADIUS;
      const [x, y] = polarToCartesian(angle, radius);
      return `${x},${y}`;
    })
    .join(' ');
}

function gridPoints(level: number, count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const [x, y] = polarToCartesian(angle, level * MAX_RADIUS);
    return `${x},${y}`;
  }).join(' ');
}

export function RadarChart({ dimensions }: RadarChartProps) {
  const count = dimensions.length;
  const scores = dimensions.map((d) => d.score);
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="eval-radar">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="eval-radar-svg">
        {/* Grid lines */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={gridPoints(level, count)}
            fill="none"
            stroke="var(--c-border)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}

        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const angle = (360 / count) * i;
          const [x, y] = polarToCartesian(angle, MAX_RADIUS);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="var(--c-border)"
              strokeWidth="0.5"
              opacity="0.4"
            />
          );
        })}

        {/* Score polygon */}
        <polygon
          points={getPoints(scores)}
          fill="var(--c-accent)"
          fillOpacity="0.15"
          stroke="var(--c-accent)"
          strokeWidth="1.5"
        />

        {/* Score dots */}
        {scores.map((score, i) => {
          const angle = (360 / count) * i;
          const radius = (score / 10) * MAX_RADIUS;
          const [x, y] = polarToCartesian(angle, radius);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="var(--c-accent)"
            />
          );
        })}

        {/* Labels */}
        {dimensions.map((dim, i) => {
          const angle = (360 / count) * i;
          const [x, y] = polarToCartesian(angle, MAX_RADIUS + 16);
          return (
            <text
              key={dim.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="eval-radar-label"
              fontSize="9"
              fill="var(--c-text-2)"
            >
              {dim.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
