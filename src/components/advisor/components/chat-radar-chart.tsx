"use client";

import { useEffect, useRef } from "react";

interface ChatRadarChartProps {
  title?: string;
  dimensions: { key: string; label: string; score: number }[];
  onReady: () => void;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const MAX_RADIUS = 100;

function polarToCartesian(angle: number, radius: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function getPoints(scores: number[], count: number): string {
  return scores
    .map((score, i) => {
      const angle = (360 / count) * i;
      const radius = (score / 10) * MAX_RADIUS;
      const [x, y] = polarToCartesian(angle, radius);
      return `${x},${y}`;
    })
    .join(" ");
}

function gridPoints(level: number, count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const [x, y] = polarToCartesian(angle, level * MAX_RADIUS);
    return `${x},${y}`;
  }).join(" ");
}

export function ChatRadarChart({ title, dimensions, onReady }: ChatRadarChartProps) {
  const resolved = useRef(false);

  useEffect(() => {
    if (!resolved.current) {
      resolved.current = true;
      onReady();
    }
  }, [onReady]);

  if (!dimensions?.length) return null;
  const count = dimensions.length;
  const scores = dimensions.map((d) => d.score);
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="adv-visual-wrap">
      {title && <div className="adv-visual-title">{title}</div>}
      <div className="adv-visual-radar">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="adv-visual-radar-svg">
          {/* Grid lines */}
          {gridLevels.map((level) => (
            <polygon
              key={level}
              points={gridPoints(level, count)}
              fill="none"
              stroke="var(--c-border, #ddd)"
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
                stroke="var(--c-border, #ddd)"
                strokeWidth="0.5"
                opacity="0.4"
              />
            );
          })}

          {/* Score polygon */}
          <polygon
            points={getPoints(scores, count)}
            fill="var(--black, #1a1a1a)"
            fillOpacity="0.08"
            stroke="var(--black, #1a1a1a)"
            strokeWidth="1.5"
          />

          {/* Score dots */}
          {scores.map((score, i) => {
            const angle = (360 / count) * i;
            const radius = (score / 10) * MAX_RADIUS;
            const [x, y] = polarToCartesian(angle, radius);
            return <circle key={i} cx={x} cy={y} r="3" fill="var(--black, #1a1a1a)" />;
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
                fontSize="9"
                fill="var(--mid, #888)"
                fontFamily="var(--mono)"
                letterSpacing="0.05em"
                style={{ textTransform: "uppercase" }}
              >
                {dim.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
