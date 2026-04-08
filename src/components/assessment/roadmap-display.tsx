"use client";

import { useState } from "react";
import type {
  StrategicPlan,
  StrategicRoadmap,
  AssessmentAction,
  StageNumber,
} from "@/types/assessment";
import ActionCard from "./action-card";
import RoadmapDiagrams from "./roadmap-diagrams";
import { resolveStructureSlug } from "@/lib/structure-slugs";

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

/**
 * Parse a reading path string into a link if it references a structure or case study.
 * Patterns:
 *   "Structure #17: Equity-for-Services" → /library/structures/17-equity-for-services
 *   "Structure #5: Co-Creation Joint Venture" → /library/structures/05-co-creation-joint-venture
 *   "Johan Liden case study" → /library/case-studies/johan-liden
 *   "Collins case study" → /library/case-studies/collins
 *   "Collins: Design as Strategy Infrastructure" → /library/case-studies/collins
 */
function parseReadingPathItem(
  item: string,
  structures: { id: string; title: string }[],
  cases: { slug: string; title: string }[],
): { text: string; href: string | null } {
  const lower = item.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  // Structure reference: "Structure #17: Equity-for-Services"
  const structMatch = item.match(/Structure\s*#(\d+)[:\s\-—]+(.+)/i);
  if (structMatch) {
    const name = structMatch[2].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    return { text: item, href: `/library/structures/${resolveStructureSlug(name)}` };
  }

  // Case study reference: "Name case study" or "Name case"
  const caseMatch = item.match(/^(.+?)\s+case(?:\s+study)?$/i);
  if (caseMatch) {
    const slug = caseMatch[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return { text: item, href: `/library/case-studies/${slug}` };
  }

  // Case study with subtitle: "Collins: Design as Strategy Infrastructure"
  const colonMatch = item.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*):\s/);
  if (colonMatch) {
    const slug = colonMatch[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return { text: item, href: `/library/case-studies/${slug}` };
  }

  // Fuzzy match against known structures by title
  for (const s of structures) {
    const sLower = s.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (lower.includes(sLower) || sLower.includes(lower)) {
      return { text: item, href: `/library/structures/${resolveStructureSlug(s.id)}` };
    }
  }

  // Fuzzy match against known case studies by title or slug
  for (const c of cases) {
    const cLower = c.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const cSlug = c.slug.replace(/-/g, " ");
    if (lower.includes(cLower) || cLower.includes(lower) || lower.includes(cSlug) || cSlug.includes(lower)) {
      return { text: item, href: `/library/case-studies/${c.slug}` };
    }
  }

  return { text: item, href: null };
}

export default function RoadmapDisplay({
  plan,
  actions,
  userId,
}: {
  plan: StrategicPlan;
  actions: AssessmentAction[];
  userId: string;
}) {
  const roadmap = plan.plan_content as StrategicRoadmap;
  const stage = roadmap.position.detected_stage as StageNumber;
  const [regenerating, setRegenerating] = useState(false);

  function getTracking(order: 1 | 2 | 3) {
    return actions.find((a) => a.action_order === order) || null;
  }

  // Fallback: some regenerated roadmaps put misalignments in position.misalignments only
  const misalignments = roadmap.misalignment_detail?.length
    ? roadmap.misalignment_detail
    : roadmap.position?.misalignments?.length
      ? roadmap.position.misalignments
      : [];

  async function handleRegenerate() {
    if (!confirm("Regenerate your roadmap? This will replace the current content with a fresh AI-generated version including entity structure and value flywheel diagrams.")) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/assessment/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(`Regeneration failed: ${data.error || "Unknown error"}`);
        setRegenerating(false);
      }
    } catch (err) {
      alert(`Regeneration failed: ${err}`);
      setRegenerating(false);
    }
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header rv vis">
        <div className="page-back">
          <a href="/dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={10} height={10}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </a>
        </div>

        <div className="str-meta rv vis">
          <div className="str-meta-tags">
            <span className="str-meta-cat">Strategic Roadmap</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            {/* TEMP: Regenerate button — remove after testing */}
            <button
              type="button"
              className="btn-bookmark"
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{ opacity: regenerating ? 0.5 : 1 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
              </svg>
              {regenerating ? "Regenerating…" : "Regenerate"}
            </button>
            <a
              href={`/api/assessment/pdf?planId=${plan.id}`}
              className="btn-bookmark"
              download
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download PDF
            </a>
          </div>
        </div>

        <h1 className="page-title rv vis">Your Strategic Roadmap</h1>
        <p className="page-desc rv vis rv-d1">
          Personalized guidance based on your assessment results
        </p>
      </div>

      {/* ── 1. Your Position ── */}
      <div className="rdmp-section rv vis rv-d1">
        <div className="rdmp-section-heading">Your Position</div>
        <div className="rdmp-position-card">
          <div className="rdmp-position-top">
            <div className="rdmp-position-stage">
              <span className="str-stat-lbl">Stage {stage}</span>
              <span className="rdmp-position-name">{STAGE_NAMES[stage]}</span>
              <span className="rdmp-position-range">{STAGE_RANGES[stage]}</span>
            </div>
            <div className="rdmp-position-readiness">
              <span className="str-stat-lbl">Transition Readiness</span>
              <span className={`str-stat-val rdmp-readiness--${roadmap.position.transition_readiness}`}>
                {roadmap.position.transition_readiness}
              </span>
            </div>
          </div>
          <p className="rdmp-position-desc">
            {roadmap.position.stage_description}
          </p>
          {roadmap.position.industry_context && (
            <p className="rdmp-industry-context">
              {roadmap.position.industry_context}
            </p>
          )}
        </div>
      </div>

      {/* ── 2. Your Vision + Diagrams ── */}
      <div className="rdmp-section rv vis rv-d1">
        <div className="rdmp-section-heading">Your Vision</div>
        <div className="rdmp-vision-grid">
          <div className="rdmp-vision-card">
            <div className="rdmp-vision-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1} width={48} height={48}>
                <rect x="6" y="8" width="36" height="34" rx="3" />
                <line x1="6" y1="18" x2="42" y2="18" />
                <line x1="16" y1="8" x2="16" y2="4" />
                <line x1="32" y1="8" x2="32" y2="4" />
                <line x1="14" y1="26" x2="22" y2="26" />
                <line x1="14" y1="32" x2="26" y2="32" />
              </svg>
            </div>
            <div className="str-stat-lbl">12-Month Target</div>
            <p className="rdmp-vision-text">{roadmap.vision.twelve_month_target}</p>
          </div>
          <div className="rdmp-vision-card">
            <div className="rdmp-vision-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1} width={48} height={48}>
                <circle cx="24" cy="24" r="20" />
                <circle cx="24" cy="24" r="8" />
                <circle cx="24" cy="24" r="2" fill="currentColor" />
                <line x1="24" y1="4" x2="24" y2="10" />
                <line x1="24" y1="38" x2="24" y2="44" />
                <line x1="4" y1="24" x2="10" y2="24" />
                <line x1="38" y1="24" x2="44" y2="24" />
              </svg>
            </div>
            <div className="str-stat-lbl">3-Year Horizon</div>
            <p className="rdmp-vision-text">{roadmap.vision.three_year_horizon}</p>
          </div>
        </div>

        {/* Entity structure + Flywheel diagrams (tabbed) */}
        <RoadmapDiagrams
          entityStructure={roadmap.entity_structure}
          valueFlywheel={roadmap.value_flywheel}
        />

        {roadmap.vision.transition_signals &&
          roadmap.vision.transition_signals.length > 0 && (
            <div className="rdmp-vision-signals-wrap">
              <div className="str-stat-lbl" style={{ marginBottom: 12 }}>Transition Signals</div>
              <ul className="rdmp-vision-signals">
                {roadmap.vision.transition_signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {/* ── 3. Structural Misalignments ── */}
      {misalignments.length > 0 && (
        <div className="rdmp-section rv vis rv-d1">
          <div className="rdmp-misalignments-card">
            <div className="rdmp-misalignments-header">
              <span className="rdmp-misalignments-title">Structural Misalignments</span>
              <span className="rdmp-misalignments-count-triangle">
                <svg viewBox="0 0 22 20" fill="none" width={22} height={20}>
                  <path d="M11 1L21 19H1L11 1Z" stroke="#ef4444" strokeWidth={1} fill="none" />
                </svg>
                <span className="rdmp-misalignments-count-num">
                  {misalignments.length}
                </span>
              </span>
            </div>
            <div className="rdmp-misalignments">
              {misalignments.map((m) => (
                <div key={m.flag} className="rdmp-misalignment">
                  <h3 className="rdmp-misalignment-flag">
                    {formatFlag(m.flag)}
                  </h3>
                  <div className="rdmp-misalignment-body">
                    <div>
                      <strong>What it&apos;s costing you</strong>
                      <p>{m.what_its_costing}</p>
                    </div>
                    <div>
                      <strong>Why it matters</strong>
                      <p>{m.why_it_matters}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Your 3 Next Steps ── */}
      <div className="rdmp-section rv vis rv-d1">
        <div className="rdmp-section-heading">Your 3 Next Steps</div>
        <div className="rdmp-actions">
          {roadmap.actions.map((action) => (
            <ActionCard
              key={action.order}
              action={action}
              tracking={getTracking(action.order)}
              userId={userId}
              planId={plan.id}
            />
          ))}
        </div>
      </div>

      {/* ── 5. Recommended Reading ── */}
      <div className="rdmp-section rv vis rv-d1">
        <div className="rdmp-section-heading">Recommended Reading</div>
        {roadmap.library.recommended_structures &&
          roadmap.library.recommended_structures.length > 0 && (
            <div className="rdmp-library-group">
              <div className="str-stat-lbl" style={{ marginBottom: 12 }}>Deal Structures</div>
              <div className="rdmp-library-items">
                {roadmap.library.recommended_structures.map((s) => (
                  <a
                    key={s.id}
                    href={`/library/structures/${resolveStructureSlug(s.id)}`}
                    className="rdmp-library-item"
                  >
                    <span className="rdmp-library-item-title">
                      {s.title}
                    </span>
                    <span className="rdmp-library-item-why">{s.why}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        {roadmap.library.recommended_cases &&
          roadmap.library.recommended_cases.length > 0 && (
            <div className="rdmp-library-group">
              <div className="str-stat-lbl" style={{ marginBottom: 12 }}>Case Studies</div>
              <div className="rdmp-library-items">
                {roadmap.library.recommended_cases.map((c) => (
                  <a
                    key={c.slug}
                    href={`/library/case-studies/${c.slug}`}
                    className="rdmp-library-item"
                  >
                    <span className="rdmp-library-item-title">
                      {c.title}
                    </span>
                    <span className="rdmp-library-item-why">{c.why}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        {roadmap.library.reading_path &&
          roadmap.library.reading_path.length > 0 && (
            <div className="rdmp-library-group">
              <div className="str-stat-lbl" style={{ marginBottom: 12 }}>Reading Path</div>
              <ol className="rdmp-reading-path">
                {roadmap.library.reading_path.map((item, i) => {
                  const parsed = parseReadingPathItem(
                    item,
                    (roadmap.library.recommended_structures || []).map((s) => ({
                      id: String(s.id).padStart(2, "0") + "-" + s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
                      title: s.title,
                    })),
                    roadmap.library.recommended_cases || [],
                  );
                  return (
                    <li key={i}>
                      <span className="rdmp-reading-num">{i + 1}</span>
                      {parsed.href ? (
                        <a href={parsed.href} className="rdmp-reading-link">
                          {parsed.text}
                        </a>
                      ) : (
                        parsed.text
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
      </div>

      {/* ── Footer ── */}
      <div className="str-footer-nav">
        <a href="/dashboard">
          <svg viewBox="0 0 12 12" fill="none" width={10} height={10}>
            <path d="M10 6H2M2 6L6 2M2 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>{" "}
          Dashboard
        </a>
        <span />
      </div>
      <div className="page-footer" />
    </>
  );
}

function formatFlag(flag: string): string {
  return flag
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
