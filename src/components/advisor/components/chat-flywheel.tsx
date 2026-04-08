"use client";

import { useEffect, useRef } from "react";

interface ChatFlywheelProps {
  title?: string;
  center?: string;
  steps: { label: string; detail?: string }[];
  onReady: () => void;
}

const RADIUS = 150;
const CENTER_X = 200;
const CENTER_Y = 200;
const CENTER_R = 40;
const BOX_H = 32;
const BOX_RX = 6;

// Wrap long labels into multiple lines (max ~18 chars per line)
function wrapLabel(text: string, maxChars = 18): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && (current + " " + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Wrap center label for the circle
function wrapCenter(text: string, maxChars = 12): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && (current + " " + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function ChatFlywheel({ title, center, steps, onReady }: ChatFlywheelProps) {
  const resolved = useRef(false);

  useEffect(() => {
    if (!resolved.current) {
      resolved.current = true;
      onReady();
    }
  }, [onReady]);

  if (!steps?.length) return null;
  const count = steps.length;
  const angleStep = 360 / count;

  // Calculate positions for each step around the circle
  const positions = steps.map((_, i) => {
    const angle = ((angleStep * i - 90) * Math.PI) / 180;
    return {
      x: CENTER_X + RADIUS * Math.cos(angle),
      y: CENTER_Y + RADIUS * Math.sin(angle),
    };
  });

  // Measure box widths based on label length
  const boxWidths = steps.map((s) => {
    const lines = wrapLabel(s.label);
    const maxLineLen = Math.max(...lines.map((l) => l.length));
    return Math.max(120, maxLineLen * 7.5 + 24);
  });

  const boxHeights = steps.map((s) => {
    const lines = wrapLabel(s.label);
    return Math.max(BOX_H, lines.length * 14 + 16);
  });

  // Generate arrow arc paths between consecutive steps
  const arcs = steps.map((_, i) => {
    const next = (i + 1) % count;
    const startAngle = (angleStep * i - 90) * (Math.PI / 180);
    const endAngle = (angleStep * next - 90) * (Math.PI / 180);
    const arcR = RADIUS - 35;
    const midAngle = (startAngle + endAngle) / 2;
    const adjustedMid =
      next === 0 ? (startAngle + endAngle + 2 * Math.PI) / 2 : midAngle;
    const sx = CENTER_X + arcR * Math.cos(startAngle + 0.35);
    const sy = CENTER_Y + arcR * Math.sin(startAngle + 0.35);
    const ex = CENTER_X + arcR * Math.cos(endAngle - 0.35);
    const ey = CENTER_Y + arcR * Math.sin(endAngle - 0.35);
    const mx = CENTER_X + (arcR - 12) * Math.cos(adjustedMid);
    const my = CENTER_Y + (arcR - 12) * Math.sin(adjustedMid);
    return `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
  });

  const centerLines = center ? wrapCenter(center) : [];

  return (
    <div className="adv-visual-wrap">
      {title && <div className="adv-visual-title">{title}</div>}
      <div className="adv-visual-flywheel">
        <svg
          viewBox="0 0 400 400"
          className="adv-visual-flywheel-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="adv-arrow"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6" fill="var(--mid, #888)" />
            </marker>
          </defs>

          {/* Arrow arcs */}
          {arcs.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="var(--mid, #888)"
              strokeWidth="1"
              strokeDasharray="4 3"
              markerEnd="url(#adv-arrow)"
              opacity="0.5"
            />
          ))}

          {/* Black center circle */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={CENTER_R}
            fill="var(--black, #1a1a1a)"
          />
          {centerLines.map((line, i) => (
            <text
              key={i}
              x={CENTER_X}
              y={CENTER_Y + (i - (centerLines.length - 1) / 2) * 11}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fontFamily="var(--mono)"
              letterSpacing="0.06em"
              fill="var(--white, #fff)"
              style={{ textTransform: "uppercase" }}
            >
              {line}
            </text>
          ))}

          {/* Step boxes */}
          {steps.map((step, i) => {
            const pos = positions[i];
            const bw = boxWidths[i];
            const bh = boxHeights[i];
            const lines = wrapLabel(step.label);
            return (
              <g key={i}>
                <rect
                  x={pos.x - bw / 2}
                  y={pos.y - bh / 2}
                  width={bw}
                  height={bh}
                  rx={BOX_RX}
                  fill="var(--white, #fff)"
                  stroke="var(--border, #e0e0e0)"
                  strokeWidth="1"
                />
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={pos.x}
                    y={pos.y + (li - (lines.length - 1) / 2) * 13}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontFamily="var(--sans)"
                    fontWeight="500"
                    fill="var(--black, #1a1a1a)"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>

        {/* Step details below if any have detail text */}
        {steps.some((s) => s.detail) && (
          <div className="adv-visual-flywheel-details">
            {steps.map(
              (step, i) =>
                step.detail && (
                  <div key={i} className="adv-visual-flywheel-detail">
                    <span className="adv-visual-flywheel-detail-num">
                      {i + 1}
                    </span>
                    <div>
                      <div className="adv-visual-flywheel-detail-label">
                        {step.label}
                      </div>
                      <div className="adv-visual-flywheel-detail-text">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
