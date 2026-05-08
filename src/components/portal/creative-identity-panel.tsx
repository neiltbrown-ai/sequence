"use client";

import Link from "next/link";
import type { CreativeIdentitySnapshot } from "@/types/creative-identity";
import { CREATIVE_IDENTITY_TOTAL_SECTIONS } from "@/types/creative-identity";
import CreativeIdentityPortrait from "./creative-identity-portrait";

interface Props {
  snapshot: CreativeIdentitySnapshot;
}

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
        <CreativeIdentityPortrait snapshot={snapshot} ctaVariant="default" />
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

