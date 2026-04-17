"use client";

import Link from "next/link";
import { ARCHETYPES } from "@/lib/assessment/archetypes";
import type { CreativeIdentitySnapshot } from "@/types/creative-identity";
import { CREATIVE_IDENTITY_TOTAL_SECTIONS } from "@/types/creative-identity";

interface Props {
  snapshot: CreativeIdentitySnapshot;
}

const STAGE_NAMES: Record<number, string> = {
  1: "Execution Excellence",
  2: "Judgment Positioning",
  3: "Ownership Accumulation",
  4: "Capital Formation",
};

const STAGE_RANGES: Record<number, string> = {
  1: "$75K–$200K",
  2: "$200K–$500K",
  3: "$500K–$2M+",
  4: "$2M+",
};

const MODE_LABELS: Record<string, string> = {
  maker: "Maker",
  service: "Service Provider",
  hybrid: "Hybrid",
  performer: "Performer",
  builder: "Builder",
  transition: "In Transition",
};

const FLAG_LABELS: Record<string, string> = {
  income_exceeds_structure: "Income exceeds entity structure",
  judgment_not_priced: "Judgment given away free",
  relationships_not_converted: "Relationships not converted",
  ip_not_monetized: "IP not monetized",
  demand_exceeds_capacity: "Demand exceeds capacity",
  talent_without_structure: "Talent without structure",
};

export default function CreativeIdentityPanel({ snapshot }: Props) {
  const effectiveStatus =
    snapshot.status === "abandoned" ? "empty" : snapshot.status;

  return (
    <div className="ci-panel">
      <header className="ci-panel-head">
        <h2 className="ci-panel-title">Creative Identity</h2>
        <p className="ci-panel-desc">
          Your Creative Identity tunes every recommendation across the platform —
          your roadmap, deal evaluations, and AI advisor guidance. Refine over
          time as your work evolves.
        </p>
      </header>

      {effectiveStatus === "empty" && <EmptyState />}
      {effectiveStatus === "in_progress" && (
        <InProgressState snapshot={snapshot} />
      )}
      {effectiveStatus === "completed" && (
        <CompleteState snapshot={snapshot} />
      )}
    </div>
  );
}

// ── Empty ───────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="ci-state ci-state--empty">
      <div className="ci-state-copy">
        <h3 className="ci-state-title">Build your Creative Identity</h3>
        <p>
          A 10-minute guided flow captures your discipline, creative mode,
          stage, and ambitions. Every AI feature on the platform gets sharper
          once it knows who you are.
        </p>
        <ul className="ci-benefits">
          <li>Roadmap tailored to your stage and archetype</li>
          <li>Deal evaluations weighted to your misalignment flags</li>
          <li>Advisor conversations that skip the warm-up questions</li>
        </ul>
      </div>
      <div className="ci-state-cta">
        <Link href="/assessment" className="btn">
          START CREATIVE IDENTITY
        </Link>
      </div>
    </div>
  );
}

// ── In progress ─────────────────────────────────────────────────

function InProgressState({ snapshot }: { snapshot: CreativeIdentitySnapshot }) {
  const pct = Math.round(
    ((snapshot.currentSection - 1) / CREATIVE_IDENTITY_TOTAL_SECTIONS) * 100
  );
  return (
    <div className="ci-state ci-state--progress">
      <div className="ci-progress-row">
        <span className="ci-progress-label">
          Section {snapshot.currentSection} of {CREATIVE_IDENTITY_TOTAL_SECTIONS}
        </span>
        <span className="ci-progress-pct">{pct}%</span>
      </div>
      <div className="ci-progress-bar">
        <div className="ci-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="ci-state-desc">
        You&apos;ve started your Creative Identity but haven&apos;t finished. Pick
        up where you left off — your answers are saved.
      </p>
      <div className="ci-state-cta">
        <Link href="/assessment" className="btn">
          RESUME
        </Link>
      </div>
    </div>
  );
}

// ── Complete — the "portrait" ───────────────────────────────────

function CompleteState({ snapshot }: { snapshot: CreativeIdentitySnapshot }) {
  const archetype = snapshot.archetypePrimary
    ? ARCHETYPES.find((a) => a.id === snapshot.archetypePrimary)
    : null;

  const modeLabel = snapshot.creativeMode
    ? MODE_LABELS[snapshot.creativeMode] ?? humanize(snapshot.creativeMode)
    : null;

  const disciplineLabel = formatDiscipline(snapshot);
  const stage = snapshot.detectedStage;
  const stageName = stage ? STAGE_NAMES[stage] : null;
  const stageRange = stage ? STAGE_RANGES[stage] : null;

  const completedDate = snapshot.completedAt
    ? new Date(snapshot.completedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const flags = snapshot.misalignmentFlags;

  return (
    <div className="ci-complete">
      {/* Hero — archetype is the identity */}
      <div className="ci-hero">
        <div className="ci-sigil">
          <ArchetypeSigil archetypeId={snapshot.archetypePrimary} />
        </div>
        <div className="ci-hero-text">
          <span className="ci-hero-kicker">Archetype</span>
          <h3 className="ci-hero-title">
            {archetype?.name ?? "Your Profile"}
          </h3>
          {archetype?.description && (
            <p className="ci-hero-desc">{archetype.description}</p>
          )}
        </div>
      </div>

      {/* Stage callout */}
      {stage && (
        <div className="ci-stage-band">
          <div className="ci-stage-inner">
            <div className="ci-stage-col">
              <span className="ci-stage-label">Current Stage</span>
              <span className="ci-stage-number">Stage {stage}</span>
              <span className="ci-stage-name">{stageName}</span>
            </div>
            <div className="ci-stage-rail">
              <StageRail current={stage} />
            </div>
            <div className="ci-stage-col ci-stage-col--right">
              <span className="ci-stage-label">Income Band</span>
              <span className="ci-stage-range">{stageRange}</span>
            </div>
          </div>
        </div>
      )}

      {/* Facet grid */}
      <div className="ci-facets">
        {disciplineLabel && (
          <Facet label="Discipline" value={disciplineLabel} />
        )}
        {modeLabel && <Facet label="Creative Mode" value={modeLabel} />}
        {archetype && (
          <Facet label="Archetype" value={shortArchetype(archetype.name)} />
        )}
      </div>

      {/* Friction points */}
      {flags.length > 0 && (
        <div className="ci-friction">
          <div className="ci-friction-head">
            <span className="ci-friction-icon" aria-hidden>
              <svg viewBox="0 0 22 20" fill="none" width="22" height="20">
                <path d="M11 1L21 19H1L11 1Z" stroke="currentColor" strokeWidth="1.25" fill="none" />
              </svg>
            </span>
            <span className="ci-friction-title">
              {flags.length} friction point{flags.length === 1 ? "" : "s"} to address
            </span>
          </div>
          <ul className="ci-friction-list">
            {flags.map((f) => (
              <li key={f}>{FLAG_LABELS[f] ?? humanize(f)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTAs */}
      <div className="ci-ctas">
        <Link href="/roadmap" className="btn btn--filled">
          View Your Roadmap
        </Link>
        <Link href="/assessment?mode=refine" className="btn btn--ghost">
          Refine Identity
        </Link>
      </div>

      {completedDate && (
        <p className="ci-complete-meta">Last updated {completedDate}</p>
      )}
    </div>
  );
}

// ── Sigil — 6 archetype-specific SVG marks ──────────────────────

function ArchetypeSigil({ archetypeId }: { archetypeId: string | null }) {
  const S = 140;
  const c = S / 2;
  const stroke = "currentColor";

  switch (archetypeId) {
    case "unstructured_creative":
      // Scattered fragments — unformed potential
      return (
        <svg viewBox={`0 0 ${S} ${S}`} className="ci-sigil-svg">
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
      // Concentric rings — established core, one ring transitioning
      return (
        <svg viewBox={`0 0 ${S} ${S}`} className="ci-sigil-svg">
          <circle cx={c} cy={c} r="20" fill={stroke} />
          <circle cx={c} cy={c} r="34" stroke={stroke} strokeWidth="1.5" fill="none" />
          <circle cx={c} cy={c} r="48" stroke={stroke} strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx={c} cy={c} r="62" stroke={stroke} strokeWidth="0.75" fill="none" opacity="0.4" strokeDasharray="4 4" />
        </svg>
      );

    case "maker_without_structure":
      // Triangle — making without the holding structure around it
      return (
        <svg viewBox={`0 0 ${S} ${S}`} className="ci-sigil-svg">
          <polygon points={`${c},18 ${S - 18},${S - 22} 18,${S - 22}`} stroke={stroke} strokeWidth="1.25" fill="none" />
          <polygon points={`${c},46 ${c + 30},${S - 38} ${c - 30},${S - 38}`} stroke={stroke} strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx={c} cy={c + 10} r="3" fill={stroke} />
        </svg>
      );

    case "platform_builder":
      // Hub + spokes — already platform-shaped
      return (
        <svg viewBox={`0 0 ${S} ${S}`} className="ci-sigil-svg">
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
      // Grid of cells — inventory partly used
      return (
        <svg viewBox={`0 0 ${S} ${S}`} className="ci-sigil-svg">
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
      // Ascending bars that stop short of the top — income without ownership
      return (
        <svg viewBox={`0 0 ${S} ${S}`} className="ci-sigil-svg">
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
          {/* Ceiling line — ownership they haven't reached */}
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
      // Generic fallback — nested geometric mark
      return (
        <svg viewBox={`0 0 ${S} ${S}`} className="ci-sigil-svg">
          <circle cx={c} cy={c} r="50" stroke={stroke} strokeWidth="0.75" fill="none" opacity="0.3" />
          <circle cx={c} cy={c} r="30" stroke={stroke} strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx={c} cy={c} r="10" fill={stroke} />
        </svg>
      );
  }
}

// ── Stage rail — dot sequence showing progression ───────────────

function StageRail({ current }: { current: number }) {
  return (
    <div className="ci-stage-rail-inner" aria-label={`Stage ${current} of 4`}>
      {[1, 2, 3, 4].map((stage) => {
        const filled = stage <= current;
        const active = stage === current;
        return (
          <div
            key={stage}
            className={`ci-stage-dot${filled ? " ci-stage-dot--filled" : ""}${
              active ? " ci-stage-dot--active" : ""
            }`}
            aria-label={`Stage ${stage}${active ? " (current)" : ""}`}
          >
            <span className="ci-stage-dot-num">{stage}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Small components ────────────────────────────────────────────

function Facet({ label, value }: { label: string; value: string }) {
  return (
    <div className="ci-facet">
      <span className="ci-facet-label">{label}</span>
      <span className="ci-facet-value">{value}</span>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function formatDiscipline(snapshot: CreativeIdentitySnapshot): string | null {
  if (!snapshot.discipline) return null;
  if (snapshot.subDiscipline) {
    return `${humanize(snapshot.discipline)} / ${humanize(snapshot.subDiscipline)}`;
  }
  return humanize(snapshot.discipline);
}

function humanize(s: string): string {
  return s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function shortArchetype(name: string): string {
  // Trim "The " prefix and anything after a dash/em-dash for a compact tag
  return name.replace(/^The\s+/i, "").replace(/\s+—.*$/i, "");
}
