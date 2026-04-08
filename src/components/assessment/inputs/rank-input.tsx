"use client";

import { useState, useCallback } from "react";
import type { QuestionOption } from "@/types/assessment";

interface RankInputProps {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

export default function RankInput({ options, value, onChange }: RankInputProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Tap-to-rank: tap an unranked item to assign the next rank
  const handleTap = useCallback(
    (optValue: string) => {
      if (value.includes(optValue)) {
        // Remove it and everything after it in the ranking
        const idx = value.indexOf(optValue);
        onChange(value.slice(0, idx));
      } else {
        onChange([...value, optValue]);
      }
    },
    [value, onChange]
  );

  // Drag handlers (desktop)
  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;

    const newOrder = [...value];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, moved);
    onChange(newOrder);
    setDragIdx(targetIdx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
  };

  // Show items in current rank order + unranked items
  const rankedItems = value.map((v) => options.find((o) => o.value === v)!).filter(Boolean);
  const unrankedItems = options.filter((o) => !value.includes(o.value));

  return (
    <div className="asmt-rank">
      <p className="asmt-select-hint">
        {value.length === options.length
          ? "Drag to reorder, or tap to remove"
          : `Tap to rank (${value.length}/${options.length})`}
      </p>

      {/* Ranked items */}
      {rankedItems.length > 0 && (
        <div className="asmt-rank-list">
          {rankedItems.map((opt, idx) => (
            <div
              key={opt.value}
              className={`asmt-rank-item ranked${dragIdx === idx ? " dragging" : ""}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => handleTap(opt.value)}
            >
              <span className="asmt-rank-num">{idx + 1}</span>
              <span className="asmt-rank-label">{opt.label}</span>
              {opt.description && (
                <span className="asmt-rank-desc">{opt.description}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Unranked items */}
      {unrankedItems.length > 0 && (
        <div className="asmt-rank-list asmt-rank-unranked">
          {unrankedItems.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="asmt-rank-item unranked"
              onClick={() => handleTap(opt.value)}
            >
              <span className="asmt-rank-num">—</span>
              <span className="asmt-rank-label">{opt.label}</span>
              {opt.description && (
                <span className="asmt-rank-desc">{opt.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
