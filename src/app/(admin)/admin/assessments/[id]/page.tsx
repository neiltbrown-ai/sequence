"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  StrategicRoadmap,
  StageNumber,
  MisalignmentFlag,
} from "@/types/assessment";

const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Execution Excellence",
  2: "Judgment Positioning",
  3: "Ownership Accumulation",
  4: "Capital Formation",
};

type PlanDetail = {
  id: string;
  status: string;
  plan_content: StrategicRoadmap;
  review_notes: string | null;
  created_at: string;
  published_at: string | null;
  assessment: {
    discipline: string;
    sub_discipline: string | null;
    creative_mode: string;
    detected_stage: number;
    stage_score: number;
    transition_readiness: string;
    misalignment_flags: MisalignmentFlag[];
    archetype_primary: string;
    archetype_secondary: string | null;
    income_range: string;
    income_structure: Record<string, number>;
    what_they_pay_for: string;
    equity_positions: string;
    demand_level: string;
    business_structure: string;
    dream_response: string;
    three_year_goal: string;
    risk_tolerance: string;
    constraints: string[];
    specific_question: string;
  };
  user: {
    email: string;
    full_name: string;
  };
};

export default function AdminAssessmentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/assessment/review?planId=${planId}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
        setReviewNotes(data.review_notes || "");
      } else {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || `Failed to load plan (${res.status})`);
      }
      setLoading(false);
    }
    load();
  }, [planId]);

  async function handleAction(action: "approve" | "reject") {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/assessment/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          action,
          reviewNotes,
        }),
      });
      if (res.ok) {
        router.push("/admin/assessments");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Action failed");
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="adm-review-loading">Loading plan details...</div>
    );
  }

  if (error && !plan) {
    return <div className="adm-review-error">{error}</div>;
  }

  if (!plan) return null;

  const roadmap = plan.plan_content;
  const assessment = plan.assessment;
  const stage = assessment.detected_stage as StageNumber;

  return (
    <div className="adm-review">
      {/* Header */}
      <div className="adm-review-header">
        <div>
          <a href="/admin/assessments" className="adm-review-back">
            ← Back to queue
          </a>
          <h1>{plan.user.full_name || plan.user.email}</h1>
          <div className="adm-review-meta">
            <span>{plan.user.email}</span>
            <span>·</span>
            <span className={`adm-status adm-status--${plan.status}`}>
              {plan.status}
            </span>
            <span>·</span>
            <span>
              {new Date(plan.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="adm-review-grid">
        {/* Left: Assessment Data */}
        <div className="adm-review-data">
          <h2>Assessment Answers</h2>

          <div className="adm-review-section">
            <h3>Profile</h3>
            <dl className="adm-review-dl">
              <dt>Discipline</dt>
              <dd>
                {assessment.discipline}
                {assessment.sub_discipline && ` → ${assessment.sub_discipline}`}
              </dd>
              <dt>Creative Mode</dt>
              <dd>{assessment.creative_mode}</dd>
              <dt>Detected Stage</dt>
              <dd>
                Stage {stage} — {STAGE_NAMES[stage]} (score:{" "}
                {assessment.stage_score})
              </dd>
              <dt>Transition Readiness</dt>
              <dd>{assessment.transition_readiness}</dd>
              <dt>Archetype</dt>
              <dd>
                {assessment.archetype_primary?.replace(/_/g, " ")}
                {assessment.archetype_secondary &&
                  ` + ${assessment.archetype_secondary.replace(/_/g, " ")}`}
              </dd>
            </dl>
          </div>

          <div className="adm-review-section">
            <h3>Current Reality</h3>
            <dl className="adm-review-dl">
              <dt>Income Range</dt>
              <dd>{assessment.income_range || "—"}</dd>
              <dt>Income Structure</dt>
              <dd>
                {assessment.income_structure
                  ? Object.entries(assessment.income_structure)
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => `${k}: ${v}%`)
                      .join(", ")
                  : "—"}
              </dd>
              <dt>What They Pay For</dt>
              <dd>{assessment.what_they_pay_for || "—"}</dd>
              <dt>Equity Positions</dt>
              <dd>{assessment.equity_positions || "—"}</dd>
              <dt>Demand Level</dt>
              <dd>{assessment.demand_level || "—"}</dd>
              <dt>Business Structure</dt>
              <dd>{assessment.business_structure || "—"}</dd>
            </dl>
          </div>

          <div className="adm-review-section">
            <h3>Misalignment Flags</h3>
            {assessment.misalignment_flags?.length > 0 ? (
              <ul className="adm-review-flags">
                {assessment.misalignment_flags.map((f) => (
                  <li key={f}>{f.replace(/_/g, " ")}</li>
                ))}
              </ul>
            ) : (
              <p className="adm-review-none">No misalignments detected</p>
            )}
          </div>

          <div className="adm-review-section">
            <h3>Vision &amp; Ambition</h3>
            <dl className="adm-review-dl">
              <dt>Dream Response</dt>
              <dd>{assessment.dream_response || "—"}</dd>
              <dt>3-Year Goal</dt>
              <dd>{assessment.three_year_goal || "—"}</dd>
              <dt>Risk Tolerance</dt>
              <dd>{assessment.risk_tolerance || "—"}</dd>
              <dt>Constraints</dt>
              <dd>{assessment.constraints?.join(", ") || "—"}</dd>
              <dt>Specific Question</dt>
              <dd>{assessment.specific_question || "—"}</dd>
            </dl>
          </div>
        </div>

        {/* Right: Generated Plan */}
        <div className="adm-review-plan">
          <h2>Generated Roadmap</h2>

          {roadmap.position && (
            <div className="adm-review-section">
              <h3>Position</h3>
              <p>{roadmap.position.stage_description}</p>
              {roadmap.position.industry_context && (
                <p className="adm-review-muted">
                  {roadmap.position.industry_context}
                </p>
              )}
            </div>
          )}

          {roadmap.misalignment_detail?.map((m) => (
            <div key={m.flag} className="adm-review-misalignment">
              <strong>{m.flag.replace(/_/g, " ")}</strong>
              <p>{m.what_its_costing}</p>
              <p className="adm-review-muted">{m.why_it_matters}</p>
            </div>
          ))}

          {roadmap.actions?.map((action) => (
            <div key={action.order} className="adm-review-action">
              <div className="adm-review-action-header">
                <span className="adm-review-action-type">{action.type}</span>
                <strong>
                  Step {action.order}: {action.title}
                </strong>
              </div>
              <p>{action.what}</p>
              <p className="adm-review-muted">Why: {action.why}</p>
              <p className="adm-review-muted">How: {action.how}</p>
              <p className="adm-review-muted">
                Timeline: {action.timeline} · Done: {action.done_signal}
              </p>
            </div>
          ))}

          {roadmap.vision && (
            <div className="adm-review-section">
              <h3>Vision</h3>
              <p>
                <strong>12-month:</strong>{" "}
                {roadmap.vision.twelve_month_target}
              </p>
              <p>
                <strong>3-year:</strong> {roadmap.vision.three_year_horizon}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      {plan.status === "review" && (
        <div className="adm-review-actions">
          <div className="adm-review-notes">
            <label htmlFor="review-notes">Review Notes (internal)</label>
            <textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Optional notes about this plan..."
              rows={3}
            />
          </div>
          {error && <p className="adm-review-error-msg">{error}</p>}
          <div className="adm-review-btns">
            <button
              className="adm-review-btn adm-review-btn--reject"
              onClick={() => handleAction("reject")}
              disabled={submitting}
            >
              Reject
            </button>
            <button
              className="adm-review-btn adm-review-btn--approve"
              onClick={() => handleAction("approve")}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Approve & Publish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
