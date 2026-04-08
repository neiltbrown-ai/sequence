import type { StrategicRoadmap } from "@/types/assessment";

interface Props {
  data: NonNullable<StrategicRoadmap["entity_structure"]>;
}

/** Wrap long text into multiple lines of roughly `maxChars` width */
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

export default function RoadmapEntityDiagram({ data }: Props) {
  const { parent, children, note } = data;
  if (!children.length) return null;

  const count = children.length;
  const boxW = 180;
  const gap = 28;
  const totalW = count * boxW + (count - 1) * gap;

  // Parent box width adapts to text
  const parentLines = wrapText(parent, 28);
  const parentW = Math.max(220, Math.min(parentLines.reduce((m, l) => Math.max(m, l.length), 0) * 8.5 + 40, 360));
  const parentH = 28 + parentLines.length * 16;

  const svgW = Math.max(totalW + 60, parentW + 60, 460);
  const startX = (svgW - totalW) / 2;
  const parentX = (svgW - parentW) / 2;

  // Pre-compute child text wrapping to determine box heights
  const childData = children.map((child) => {
    const purposeLines = wrapText(child.purpose.toUpperCase(), 22);
    const nameLines = wrapText(child.name, 24);
    const lineCount = purposeLines.length + nameLines.length;
    const boxH = Math.max(64, 24 + lineCount * 13 + 16);
    return { child, purposeLines, nameLines, boxH };
  });
  const maxBoxH = Math.max(...childData.map((d) => d.boxH));

  const connectorY = parentH + 16 + 30;
  const childY = connectorY + 20;
  const svgH = childY + maxBoxH + 16;

  return (
    <>
      <div className="rdmp-diagram-svg-wrap">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", maxWidth: svgW, display: "block", margin: "0 auto" }}
        >
          {/* Parent box */}
          <rect x={parentX} y={16} width={parentW} height={parentH} rx={4} stroke="#1a1a1a" strokeWidth={1} />
          {parentLines.map((line, li) => (
            <text
              key={`parent-${li}`}
              x={svgW / 2}
              y={16 + 18 + li * 16}
              textAnchor="middle"
              fontFamily="Geist, sans-serif"
              fontSize={13}
              fontWeight={500}
              fill="#1a1a1a"
            >
              {line}
            </text>
          ))}

          {/* Vertical connector from parent to horizontal rule */}
          <line x1={svgW / 2} y1={16 + parentH} x2={svgW / 2} y2={connectorY} stroke="#d9d6d1" strokeWidth={1} />

          {/* Horizontal rule spanning all children */}
          {count > 1 && (
            <line
              x1={startX + boxW / 2}
              y1={connectorY}
              x2={startX + (count - 1) * (boxW + gap) + boxW / 2}
              y2={connectorY}
              stroke="#d9d6d1"
              strokeWidth={1}
            />
          )}

          {/* Child boxes */}
          {childData.map((cd, i) => {
            const bx = startX + i * (boxW + gap);
            const midX = bx + boxW / 2;
            return (
              <g key={i}>
                {/* Vertical connector from horizontal rule to child */}
                <line x1={midX} y1={connectorY} x2={midX} y2={childY} stroke="#d9d6d1" strokeWidth={1} />
                {/* Child box */}
                <rect x={bx} y={childY} width={boxW} height={maxBoxH} rx={4} fill="#f5f5f0" stroke="#e0e0d8" strokeWidth={1} />
                {/* Purpose label lines */}
                {cd.purposeLines.map((line, li) => (
                  <text
                    key={`p-${li}`}
                    x={midX}
                    y={childY + 16 + li * 11}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontSize={7.5}
                    letterSpacing="0.08em"
                    fill="#999"
                  >
                    {line}
                  </text>
                ))}
                {/* Entity name lines */}
                {cd.nameLines.map((line, li) => (
                  <text
                    key={`n-${li}`}
                    x={midX}
                    y={childY + 16 + cd.purposeLines.length * 11 + 8 + li * 13}
                    textAnchor="middle"
                    fontFamily="Geist, sans-serif"
                    fontSize={11}
                    fontWeight={600}
                    fill="#1a1a1a"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      {note && <p className="rdmp-diagram-note">{note}</p>}
    </>
  );
}
