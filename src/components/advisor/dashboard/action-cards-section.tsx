"use client";

import { useState, useCallback } from "react";
import type { ActionContext } from "@/types/advisor";

interface ActionCardsSectionProps {
  actions: Record<string, unknown>[];
  actionStatuses: ActionContext[];
  onGetHelp: (actionId: string) => void;
}

export default function ActionCardsSection({
  actions,
  actionStatuses,
  onGetHelp,
}: ActionCardsSectionProps) {
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>(
    {}
  );

  const getStatus = (order: number) => {
    if (localStatuses[order] !== undefined) {
      return localStatuses[order];
    }
    const statusRecord = actionStatuses.find((s) => s.action_order === order);
    return statusRecord?.status || "pending";
  };

  const handleToggle = useCallback(
    async (order: number, actionType: string) => {
      const currentStatus = getStatus(order);
      const newStatus =
        currentStatus === "completed" ? "pending" : "completed";

      // Optimistic update
      setLocalStatuses((prev) => ({ ...prev, [order]: newStatus }));

      try {
        const res = await fetch("/api/assessment/actions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionOrder: order,
            actionType: (actionType || "foundation").toLowerCase(),
            status: newStatus,
          }),
        });
        if (!res.ok) {
          setLocalStatuses((prev) => ({ ...prev, [order]: currentStatus }));
        }
      } catch {
        setLocalStatuses((prev) => ({ ...prev, [order]: currentStatus }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actionStatuses, localStatuses]
  );

  const allCompleted =
    actions.length > 0 &&
    actions.every(
      (action) => getStatus(action.order as number) === "completed"
    );

  return (
    <div className="adv-dash-actions">
      <div className="adv-dash-actions-grid">
        {actions.map((action) => {
          const order = action.order as number;
          const status = getStatus(order);
          const statusRecord = actionStatuses.find(
            (s) => s.action_order === order
          );

          return (
            <div
              key={order}
              className={`adv-dash-action-card status-${status}`}
            >
              <div className="adv-dash-action-header">
                <label className="adv-dash-action-check">
                  <input
                    type="checkbox"
                    checked={status === "completed"}
                    onChange={() => handleToggle(order, action.type as string)}
                  />
                  <span className="adv-dash-action-checkmark" />
                </label>
                <span className="adv-dash-action-num">{order}</span>
                <span className="adv-dash-action-type">
                  {action.type as string}
                </span>
              </div>
              <h4 className="adv-dash-action-title">
                {action.title as string}
              </h4>
              <p className="adv-dash-action-what">{action.what as string}</p>
              {action.timeline != null && (
                <span className="adv-dash-action-timeline">
                  {String(action.timeline)}
                </span>
              )}
              {status !== "completed" && (
                <button
                  type="button"
                  className="adv-dash-action-help"
                  onClick={() =>
                    onGetHelp(statusRecord?.id || `order-${order}`)
                  }
                >
                  Get help &rarr;
                </button>
              )}
            </div>
          );
        })}
      </div>
      {allCompleted && (
        <div className="adv-dash-actions-complete">
          <p className="adv-dash-actions-complete-text">
            All actions complete. Retake your assessment to recalibrate your
            position and unlock the next stage.
          </p>
          <a href="/assessment" className="adv-dash-actions-complete-btn">
            Update your roadmap
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
