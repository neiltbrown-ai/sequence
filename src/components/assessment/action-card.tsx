"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveApprovedProvider } from "@/lib/roadmap/approved-providers";
import type {
  RoadmapAction,
  ActionStatus,
  AssessmentAction,
} from "@/types/assessment";

const STATUS_LABELS: Record<ActionStatus, string> = {
  pending: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  skipped: "Skipped",
};

const STATUS_CYCLE: ActionStatus[] = ["pending", "in_progress", "completed"];

export default function ActionCard({
  action,
  tracking,
  userId,
  planId,
}: {
  action: RoadmapAction;
  tracking: AssessmentAction | null;
  userId: string;
  planId: string;
}) {
  const [status, setStatus] = useState<ActionStatus>(
    tracking?.status || "pending"
  );
  const [trackingId, setTrackingId] = useState<string | null>(
    tracking?.id || null
  );
  const [expanded, setExpanded] = useState(false);
  const supabase = createClient();

  async function cycleStatus() {
    const currentIdx = STATUS_CYCLE.indexOf(status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    setStatus(nextStatus);

    if (trackingId) {
      await supabase
        .from("assessment_actions")
        .update({
          status: nextStatus,
          completed_at:
            nextStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", trackingId);
    } else {
      const { data } = await supabase
        .from("assessment_actions")
        .insert({
          user_id: userId,
          plan_id: planId,
          action_order: action.order,
          action_type: action.type,
          status: nextStatus,
          completed_at:
            nextStatus === "completed" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();
      if (data) setTrackingId(data.id);
    }
  }

  return (
    <div className={`rdmp-action-card rdmp-action-card--${status}`}>
      <div className="rdmp-action-header">
        <div className="rdmp-action-meta">
          <span className="rdmp-action-tag">{action.type}</span>
          <span className="rdmp-action-order">Step {action.order}</span>
        </div>
        <button
          className={`btn-bookmark rdmp-status-btn rdmp-status-btn--${status}`}
          onClick={cycleStatus}
          title={`Status: ${STATUS_LABELS[status]}. Click to change.`}
        >
          {status === "completed" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : status === "in_progress" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
          {STATUS_LABELS[status]}
        </button>
      </div>

      <h3 className="rdmp-action-title">{action.title}</h3>
      <p className="rdmp-action-what">{action.what}</p>

      <button
        className="rdmp-action-expand"
        onClick={() => setExpanded(!expanded)}
        data-cursor="expand"
      >
        {expanded ? "Show less" : "Show details"}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          width="12"
          height="12"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="rdmp-action-details">
          <div className="rdmp-action-detail">
            <strong>Why this matters</strong>
            <p>{action.why}</p>
          </div>
          <div className="rdmp-action-detail">
            <strong>How to do it</strong>
            <p>{action.how}</p>
          </div>
          <div className="rdmp-action-detail-row">
            <div className="rdmp-action-detail">
              <strong>Timeline</strong>
              <p>{action.timeline}</p>
            </div>
            <div className="rdmp-action-detail">
              <strong>Done when</strong>
              <p>{action.done_signal}</p>
            </div>
          </div>

          {action.ai_assist && (
            <a
              href={`/advisor?prompt=${encodeURIComponent(
                `Help me with Step ${action.order}: ${action.title} — ${action.ai_assist.description}`
              )}`}
              className="rdmp-action-ai-assist"
            >
              <span className="rdmp-action-ai-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                AI Assist
              </span>
              <p>{action.ai_assist.description}</p>
              <span className="rdmp-action-ai-cta">Open in Advisor →</span>
            </a>
          )}

          {(() => {
            // Only show providers that match our approved-provider whitelist.
            // Claude frequently produces generic suggestions ("find a tax
            // accountant") or hallucinated URLs; the whitelist guarantees
            // every link is real and goes to the canonical domain we verified.
            const validProviders = (action.providers || [])
              .map((p) => resolveApprovedProvider({ name: p.name, url: p.url }))
              .filter((p): p is NonNullable<typeof p> => p !== null)
              // de-dupe in case Claude emitted e.g. "LegalZoom" twice with
              // slightly different framing
              .filter(
                (p, i, arr) => arr.findIndex((o) => o.name === p.name) === i
              );

            if (validProviders.length === 0) return null;

            return (
              <div className="rdmp-action-providers">
                <strong>Recommended providers</strong>
                <div className="rdmp-provider-list">
                  {validProviders.map((p) => (
                    <a
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rdmp-provider-link"
                    >
                      {p.name}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
