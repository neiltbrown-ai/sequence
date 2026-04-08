"use client";

import { ReactNode, useState, Children, isValidElement, cloneElement } from "react";

interface CbAccordionProps {
  children: ReactNode;
}

export function CbAccordion({ children }: CbAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cards = Children.toArray(children).filter(isValidElement);

  return (
    <div className="cb-grid is-cards">
      <div className="cb-cards">
        {cards.map((card, i) =>
          cloneElement(card as React.ReactElement<CbAccordionCardInternalProps>, {
            _isOpen: openIndex === i,
            _onToggle: () => setOpenIndex(openIndex === i ? null : i),
            _index: i,
          })
        )}
      </div>
    </div>
  );
}

interface CbAccordionCardInternalProps {
  _isOpen?: boolean;
  _onToggle?: () => void;
  _index?: number;
}

interface CbAccordionCardProps {
  num?: string;
  label: string;
  children: ReactNode;
  _isOpen?: boolean;
  _onToggle?: () => void;
  _index?: number;
}

export function CbAccordionCard({
  num,
  label,
  children,
  _isOpen,
  _onToggle,
  _index,
}: CbAccordionCardProps) {
  const displayNum = num ?? String((_index ?? 0) + 1).padStart(2, "0");

  return (
    <div className={`cb-card${_isOpen ? " open" : ""}`}>
      <div className="cb-card-head" onClick={_onToggle}>
        <div className="cb-card-head-left">
          <span className="cb-card-num">{displayNum}</span>
          <span className="cb-card-label">{label}</span>
        </div>
        <svg
          className="cb-card-icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <line x1="10" y1="4" x2="10" y2="16" />
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </div>
      <div className="cb-card-body">
        <div className="cb-card-content">
          {typeof children === "string" ? (
            <p className="cb-card-text">{children}</p>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
