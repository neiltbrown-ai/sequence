"use client";

import Link from "next/link";
import type { CreativeIdentitySnapshot } from "@/types/creative-identity";
import { CREATIVE_IDENTITY_TOTAL_SECTIONS } from "@/types/creative-identity";

interface Props {
  snapshot: CreativeIdentitySnapshot;
}

const STAGE_LABELS: Record<number, string> = {
  1: "Stage 1 — Execution Excellence",
  2: "Stage 2 — Judgment Positioning",
  3: "Stage 3 — Ownership Accumulation",
  4: "Stage 4 — Capital Formation",
};

const MODE_LABELS: Record<string, string> = {
  maker: "Maker",
  service: "Service Provider",
  hybrid: "Hybrid",
  performer: "Performer",
  builder: "Builder",
  transition: "In Transition",
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
          your roadmap, deal evaluations, and AI advisor guidance. Skip for now,
          refine over time.
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

function CompleteState({ snapshot }: { snapshot: CreativeIdentitySnapshot }) {
  const stageLabel = snapshot.detectedStage
    ? STAGE_LABELS[snapshot.detectedStage] ?? `Stage ${snapshot.detectedStage}`
    : null;
  const modeLabel = snapshot.creativeMode
    ? MODE_LABELS[snapshot.creativeMode] ?? snapshot.creativeMode
    : null;

  const completedDate = snapshot.completedAt
    ? new Date(snapshot.completedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="ci-state ci-state--complete">
      <div className="ci-summary-grid">
        <SummaryCell label="Discipline" value={formatDiscipline(snapshot)} />
        <SummaryCell label="Creative Mode" value={modeLabel} />
        <SummaryCell label="Position" value={stageLabel} />
        <SummaryCell
          label="Archetype"
          value={
            snapshot.archetypePrimary
              ? humanize(snapshot.archetypePrimary)
              : null
          }
        />
      </div>

      {snapshot.misalignmentFlags.length > 0 && (
        <div className="ci-flags">
          <span className="ci-flags-label">
            {snapshot.misalignmentFlags.length} misalignment
            {snapshot.misalignmentFlags.length === 1 ? "" : "s"} detected
          </span>
          <ul className="ci-flags-list">
            {snapshot.misalignmentFlags.slice(0, 3).map((f) => (
              <li key={f}>{humanize(f)}</li>
            ))}
            {snapshot.misalignmentFlags.length > 3 && (
              <li className="ci-flags-more">
                +{snapshot.misalignmentFlags.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {completedDate && (
        <p className="ci-meta">Last updated {completedDate}</p>
      )}

      <div className="ci-state-cta-row">
        <Link href="/assessment?mode=refine" className="btn">
          REFINE
        </Link>
        <Link href="/roadmap" className="btn btn--ghost">
          VIEW ROADMAP
        </Link>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="ci-summary-cell">
      <span className="ci-summary-label">{label}</span>
      <span className="ci-summary-value">{value || "—"}</span>
    </div>
  );
}

function formatDiscipline(snapshot: CreativeIdentitySnapshot): string | null {
  if (!snapshot.discipline) return null;
  if (snapshot.subDiscipline) {
    return `${humanize(snapshot.discipline)} / ${humanize(snapshot.subDiscipline)}`;
  }
  return humanize(snapshot.discipline);
}

function humanize(s: string): string {
  return s
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
