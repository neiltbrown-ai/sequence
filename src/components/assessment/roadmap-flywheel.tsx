import type { StrategicRoadmap } from "@/types/assessment";

interface Props {
  data: NonNullable<StrategicRoadmap["value_flywheel"]>;
}

/** Wrap text into lines of roughly `maxChars` */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
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

export default function RoadmapFlywheel({ data }: Props) {
  const { nodes, center_label, center_subtitle } = data;
  if (!nodes.length) return null;

  // A flywheel by definition is a cycle — each node enables the next.
  // Claude occasionally outputs non-sequential edges ({0→2}, {1→3}) which
  // render as lines cutting through the center of the diagram.
  // We ignore data.edges and always render the outer cycle: 0→1→2→…→n-1→0.
  // This guarantees arrows stay on the perimeter and the flywheel reads
  // correctly regardless of AI output.
  const sequentialEdges = nodes.map((_, i) => ({
    from: i,
    to: (i + 1) % nodes.length,
  }));

  const W = 660;
  const H = 480;
  const cx = W / 2;
  const cy = H / 2;
  const radius = 175;
  const boxW = 160;
  const boxH = 60;
  const centerR = 62;

  // Calculate node positions in a circle
  const nodePositions = nodes.map((_, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / nodes.length;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  // Pre-compute all node text wrapping
  const nodeData = nodes.map((node) => {
    const labelLines = wrapText(node.label, 20);
    const subtitleText = node.subtitle ? node.subtitle.toUpperCase() : null;
    const subLines = subtitleText ? wrapText(subtitleText, 20) : [];
    return { node, labelLines, subLines };
  });

  // Get edge points on the box boundary closest to the next node
  function edgePoint(fromIdx: number, toIdx: number) {
    const from = nodePositions[fromIdx];
    const to = nodePositions[toIdx];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    const hx = boxW / 2;
    const hy = boxH / 2;
    const tx = Math.abs(nx) > 0.001 ? hx / Math.abs(nx) : Infinity;
    const ty = Math.abs(ny) > 0.001 ? hy / Math.abs(ny) : Infinity;
    const t = Math.min(tx, ty);
    const sx = from.x + nx * t;
    const sy = from.y + ny * t;

    const dnx = -nx;
    const dny = -ny;
    const tx2 = Math.abs(dnx) > 0.001 ? hx / Math.abs(dnx) : Infinity;
    const ty2 = Math.abs(dny) > 0.001 ? hy / Math.abs(dny) : Infinity;
    const t2 = Math.min(tx2, ty2);
    const ex = to.x + dnx * t2;
    const ey = to.y + dny * t2;

    return { sx, sy, ex, ey };
  }

  // Wrap center label for the circle
  const centerLines = wrapText(center_label.toUpperCase(), 14);
  const subtitleLines = center_subtitle ? wrapText(center_subtitle.toUpperCase(), 16) : [];

  return (
    <>
      <div className="rdmp-diagram-svg-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }}
        >
          <defs>
            <marker
              id="flywheel-arrow"
              markerWidth={8}
              markerHeight={6}
              refX={8}
              refY={3}
              orient="auto"
            >
              <path d="M0 0L8 3L0 6" fill="var(--diag-line)" />
            </marker>
          </defs>

          {/* Dashed radial lines from center to each node */}
          {nodePositions.map((pos, i) => (
            <line
              key={`radial-${i}`}
              x1={cx}
              y1={cy}
              x2={pos.x}
              y2={pos.y}
              stroke="var(--diag-line)"
              strokeWidth={0.75}
              strokeDasharray="3,3"
              opacity={0.6}
            />
          ))}

          {/* Connector arrows — always outer cycle, never cross-diagram */}
          {sequentialEdges.map((edge, i) => {
            const { sx, sy, ex, ey } = edgePoint(edge.from, edge.to);
            return (
              <path
                key={`edge-${i}`}
                d={`M${sx} ${sy} L${ex} ${ey}`}
                stroke="var(--diag-line)"
                strokeWidth={1}
                markerEnd="url(#flywheel-arrow)"
              />
            );
          })}

          {/* Center circle — fill + 1px border for visibility in dark mode */}
          <circle
            cx={cx}
            cy={cy}
            r={centerR}
            fill="var(--diag-center-bg)"
            stroke="var(--diag-center-border)"
            strokeWidth={1}
          />
          {/* Center label — multi-line */}
          {centerLines.map((line, li) => {
            const totalH = centerLines.length * 11 + (subtitleLines.length > 0 ? subtitleLines.length * 10 + 6 : 0);
            const startY = cy - totalH / 2 + 9;
            return (
              <text
                key={`cl-${li}`}
                x={cx}
                y={startY + li * 11}
                textAnchor="middle"
                fill="var(--diag-center-text)"
                fontFamily="monospace"
                fontSize={8.5}
                letterSpacing="0.06em"
              >
                {line}
              </text>
            );
          })}
          {/* Center subtitle — multi-line */}
          {subtitleLines.map((line, li) => {
            const labelH = centerLines.length * 11;
            const totalH = labelH + subtitleLines.length * 10 + 6;
            const startY = cy - totalH / 2 + labelH + 6 + 8;
            return (
              <text
                key={`cs-${li}`}
                x={cx}
                y={startY + li * 10}
                textAnchor="middle"
                fill="var(--diag-muted-text)"
                fontFamily="monospace"
                fontSize={7}
                letterSpacing="0.05em"
              >
                {line}
              </text>
            );
          })}

          {/* Node boxes */}
          {nodeData.map((nd, i) => {
            const pos = nodePositions[i];
            const rx = pos.x - boxW / 2;
            const ry = pos.y - boxH / 2;
            const labelBlockH = nd.labelLines.length * 14;
            const subBlockH = nd.subLines.length * 10;
            const totalTextH = labelBlockH + (nd.subLines.length > 0 ? subBlockH + 4 : 0);
            const textStartY = pos.y - totalTextH / 2 + 10;

            return (
              <g key={i}>
                <rect
                  x={rx}
                  y={ry}
                  width={boxW}
                  height={boxH}
                  rx={4}
                  fill="var(--diag-child-bg)"
                  stroke="var(--diag-child-border)"
                  strokeWidth={1}
                />
                {/* Node label — wrapped */}
                {nd.labelLines.map((line, li) => (
                  <text
                    key={`label-${li}`}
                    x={pos.x}
                    y={textStartY + li * 14}
                    textAnchor="middle"
                    fontFamily="Geist, sans-serif"
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--diag-child-text)"
                  >
                    {line}
                  </text>
                ))}
                {/* Node subtitle — wrapped */}
                {nd.subLines.map((sl, li) => (
                  <text
                    key={`sub-${li}`}
                    x={pos.x}
                    y={textStartY + nd.labelLines.length * 14 + 4 + li * 10}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontSize={7.5}
                    letterSpacing="0.06em"
                    fill="var(--diag-muted-text)"
                  >
                    {sl}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
