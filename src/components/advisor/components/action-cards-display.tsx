"use client";

import { useState } from "react";

interface Action {
  order: number;
  type: string;
  title: string;
  what: string;
  timeline?: string;
}

interface ActionCardsDisplayProps {
  actions: Action[];
  prompt?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function ChatActionCards({
  actions,
  prompt,
  onSelect,
  disabled = false,
}: ActionCardsDisplayProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (actionOrder: number) => {
    if (disabled || selected) return;
    const value = `action_${actionOrder}`;
    setSelected(value);
    onSelect(value);
  };

  if (selected) {
    const action = actions.find(
      (a) => `action_${a.order}` === selected
    );
    return (
      <div className="adv-comp-collapsed">
        <span className="adv-comp-collapsed-label">
          Action {action?.order}: {action?.title}
        </span>
      </div>
    );
  }

  return (
    <div className="adv-comp-action-cards">
      <div className="adv-comp-actions-grid">
        {actions.map((action) => (
          <button
            key={action.order}
            type="button"
            className="adv-comp-action-card"
            onClick={() => handleSelect(action.order)}
            disabled={disabled}
          >
            <div className="adv-comp-action-header">
              <span className="adv-comp-action-num">{action.order}</span>
              <span className="adv-comp-action-type">{action.type}</span>
            </div>
            <h4 className="adv-comp-action-title">{action.title}</h4>
            <p className="adv-comp-action-desc">{action.what}</p>
            {action.timeline && (
              <span className="adv-comp-action-timeline">{action.timeline}</span>
            )}
          </button>
        ))}
      </div>
      {prompt && <p className="adv-comp-action-prompt">{prompt}</p>}
    </div>
  );
}
