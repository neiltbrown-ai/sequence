"use client";

import Link from "next/link";
import { ARCHETYPES } from "@/lib/assessment/archetypes";
import type { CreativeIdentitySnapshot } from "@/types/creative-identity";
import { ArchetypeSigil } from "@/components/shared/archetype-sigil";

/**
 * Visual "portrait" view of a completed Creative Identity:
 * archetype hero (sigil + name + description), stage band with rail,
 * facet cards (Discipline / Creative Mode / Archetype), and friction
 * points list.
 *
 * Reused by:
 *   - Settings → Creative Identity tab (CreativeIdentityPanel) — `ctaVariant="default"`
 *     renders the View Roadmap + Refine Identity CTAs and the "Last updated" footer.
 *   - Assessment wizard completion screen — `ctaVariant="none"` renders the
 *     portrait only; the wizard owns the surrounding header / CTAs / "What
 *     happens next" copy so the celebratory framing stays intact.
 */

interface Props {
  snapshot: CreativeIdentitySnapshot;
  ctaVariant?: "default" | "none";
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

export default function CreativeIdentityPortrait({
  snapshot,
  ctaVariant = "default",
}: Props) {
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

      {/* CTAs + "Last updated" — only in default variant */}
      {ctaVariant === "default" && (
        <>
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
        </>
      )}
    </div>
  );
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
  // sub_discipline is `string[] | null` since the multi-select rollout
  // (migration 00019). Join multiple subs with " + " for display.
  const subs = snapshot.subDiscipline;
  if (subs && subs.length > 0) {
    return `${humanize(snapshot.discipline)} / ${subs.map(humanize).join(" + ")}`;
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
