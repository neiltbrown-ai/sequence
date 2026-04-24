// Archetype sigil — 6 archetype-specific SVG marks used in the CI portrait
// and on the public Platform page. Inherits currentColor from its parent.
//
// Each archetype sets its own viewBox tight to the shape's bounding box
// so the visible mark left-aligns with surrounding text rather than sitting
// inside a wider bounding container.

interface ArchetypeSigilProps {
  archetypeId: string | null;
  className?: string;
}

export function ArchetypeSigil({ archetypeId, className = "ci-sigil-svg" }: ArchetypeSigilProps) {
  const S = 140;
  const c = S / 2;
  const stroke = "currentColor";

  switch (archetypeId) {
    case "unstructured_creative":
      // Scattered dots inside a dashed ring r=50 centered at 70 → bbox 20–120
      return (
        <svg viewBox="20 20 100 100" className={className}>
          <circle cx={c} cy={c} r="6" fill={stroke} />
          {[
            [30, 40],
            [108, 30],
            [118, 96],
            [28, 104],
            [80, 20],
            [40, 80],
            [100, 110],
            [88, 56],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill={stroke} opacity="0.45" />
          ))}
          <circle cx={c} cy={c} r="50" stroke={stroke} strokeWidth="0.5" fill="none" strokeDasharray="2 4" opacity="0.3" />
        </svg>
      );

    case "established_practitioner":
      // Concentric rings, outer r=62 centered at 70 → bbox 8–132
      return (
        <svg viewBox="8 8 124 124" className={className}>
          <circle cx={c} cy={c} r="20" fill={stroke} />
          <circle cx={c} cy={c} r="34" stroke={stroke} strokeWidth="1.5" fill="none" />
          <circle cx={c} cy={c} r="48" stroke={stroke} strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx={c} cy={c} r="62" stroke={stroke} strokeWidth="0.75" fill="none" opacity="0.4" strokeDasharray="4 4" />
        </svg>
      );

    case "maker_without_structure":
      // Outer triangle points include x=18 and x=122 → bbox 18–122
      return (
        <svg viewBox="18 18 104 104" className={className}>
          <polygon points={`${c},18 ${S - 18},${S - 22} 18,${S - 22}`} stroke={stroke} strokeWidth="1.25" fill="none" />
          <polygon points={`${c},46 ${c + 30},${S - 38} ${c - 30},${S - 38}`} stroke={stroke} strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx={c} cy={c + 10} r="3" fill={stroke} />
        </svg>
      );

    case "platform_builder":
      // Spokes reach 54 from center 70 → extent 16–124
      return (
        <svg viewBox="16 16 108 108" className={className}>
          <circle cx={c} cy={c} r="8" fill={stroke} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const x = c + Math.cos(a) * 54;
            const y = c + Math.sin(a) * 54;
            return (
              <g key={i}>
                <line x1={c} y1={c} x2={x} y2={y} stroke={stroke} strokeWidth="0.75" opacity="0.5" />
                <circle cx={x} cy={y} r="3.5" fill={stroke} opacity="0.75" />
              </g>
            );
          })}
        </svg>
      );

    case "untapped_catalog":
      // 4×4 grid of 22px cells starting at 20, stepping 26 → bbox 20–120
      return (
        <svg viewBox="20 20 100 100" className={className}>
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 4 }).map((__, col) => {
              const x = 20 + col * 26;
              const y = 20 + r * 26;
              const isFilled = (r === 1 && col === 1) || (r === 2 && col === 2);
              return (
                <rect
                  key={`${r}-${col}`}
                  x={x}
                  y={y}
                  width="22"
                  height="22"
                  rx="2"
                  stroke={stroke}
                  strokeWidth="1"
                  fill={isFilled ? stroke : "none"}
                  opacity={isFilled ? 1 : 0.4}
                />
              );
            })
          )}
        </svg>
      );

    case "high_earner_no_ownership":
      // Bars from x=28 (width 14, 4 bars at stride 24) → 28–114;
      // ceiling line y=28, bar bottoms at y=118 → bbox 18–118 padded
      return (
        <svg viewBox="18 18 100 104" className={className}>
          {[30, 50, 70, 90].map((h, i) => {
            const x = 28 + i * 24;
            return (
              <rect
                key={i}
                x={x}
                y={S - 22 - h}
                width="14"
                height={h}
                rx="1.5"
                fill={stroke}
                opacity={0.6 + i * 0.1}
              />
            );
          })}
          <line
            x1="18"
            y1="28"
            x2={S - 18}
            y2="28"
            stroke={stroke}
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.5"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="20 20 100 100" className={className}>
          <circle cx={c} cy={c} r="50" stroke={stroke} strokeWidth="0.75" fill="none" opacity="0.3" />
          <circle cx={c} cy={c} r="30" stroke={stroke} strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx={c} cy={c} r="10" fill={stroke} />
        </svg>
      );
  }
}
