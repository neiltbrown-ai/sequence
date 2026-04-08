"use client";

import { useState, useCallback } from "react";

interface RankingWidgetProps {
  questionId: string;
  questionText: string;
  options: { value: string; label: string; description?: string }[];
  onSelect: (value: string[]) => void;
  disabled?: boolean;
}

export default function ChatRankingWidget({
  questionId,
  questionText,
  options,
  onSelect,
  disabled = false,
}: RankingWidgetProps) {
  const [ranked, setRanked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleTap = useCallback(
    (value: string) => {
      if (disabled || submitted) return;
      if (ranked.includes(value)) {
        const idx = ranked.indexOf(value);
        setRanked(ranked.slice(0, idx));
      } else {
        const next = [...ranked, value];
        setRanked(next);
        // Auto-submit when all items ranked
        if (next.length === options.length) {
          setSubmitted(true);
          onSelect(next);
        }
      }
    },
    [ranked, options.length, disabled, submitted, onSelect]
  );

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newOrder = [...ranked];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, moved);
    setRanked(newOrder);
    setDragIdx(targetIdx);
  };

  const handleDragEnd = () => setDragIdx(null);

  const handleDone = () => {
    if (ranked.length < options.length) return;
    setSubmitted(true);
    onSelect(ranked);
  };

  // After submission, hide entirely — the state machine renders the user bubble
  if (submitted) return null;

  const rankedItems = ranked.map((v) => options.find((o) => o.value === v)!).filter(Boolean);
  const unrankedItems = options.filter((o) => !ranked.includes(o.value));

  return (
    <div className="adv-comp-ranking" data-question-id={questionId}>
      <p className="adv-comp-hint">
        {ranked.length === options.length
          ? "Drag to reorder"
          : `Tap to rank (${ranked.length}/${options.length})`}
      </p>

      {rankedItems.length > 0 && (
        <div className="adv-comp-rank-list">
          {rankedItems.map((opt, idx) => (
            <div
              key={opt.value}
              className={`adv-comp-rank-item ranked${dragIdx === idx ? " dragging" : ""}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => handleTap(opt.value)}
            >
              <span className="adv-comp-rank-num">{idx + 1}</span>
              <span className="adv-comp-rank-label">{opt.label}</span>
            </div>
          ))}
        </div>
      )}

      {unrankedItems.length > 0 && (
        <div className="adv-comp-rank-list unranked">
          {unrankedItems.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="adv-comp-rank-item"
              onClick={() => handleTap(opt.value)}
              disabled={disabled}
            >
              <span className="adv-comp-rank-num">—</span>
              <span className="adv-comp-rank-label">{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {ranked.length === options.length && (
        <button type="button" className="adv-comp-done-btn" onClick={handleDone}>
          Confirm ranking
        </button>
      )}
    </div>
  );
}
