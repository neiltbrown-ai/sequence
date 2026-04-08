"use client";

import { ReactNode, useState, Children, isValidElement, cloneElement } from "react";

interface AccordionProps {
  children: ReactNode;
}

export function Accordion({ children }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cards = Children.toArray(children).filter(isValidElement);

  return (
    <div className="ab-grid is-cards">
      <div className="ab-cards">
        {cards.map((card, i) =>
          cloneElement(card as React.ReactElement<AccordionCardInternalProps>, {
            _isOpen: openIndex === i,
            _onToggle: () => setOpenIndex(openIndex === i ? null : i),
            _index: i,
          })
        )}
      </div>
    </div>
  );
}

interface AccordionCardInternalProps {
  _isOpen?: boolean;
  _onToggle?: () => void;
  _index?: number;
}

interface AccordionCardProps {
  num?: string;
  label: string;
  children: ReactNode;
  _isOpen?: boolean;
  _onToggle?: () => void;
  _index?: number;
}

export function AccordionCard({
  num,
  label,
  children,
  _isOpen,
  _onToggle,
  _index,
}: AccordionCardProps) {
  const displayNum = num ?? String((_index ?? 0) + 1).padStart(2, "0");

  return (
    <div className={`ab-card${_isOpen ? " open" : ""}`}>
      <div className="ab-card-head" onClick={_onToggle}>
        <div className="ab-card-head-left">
          <span className="ab-card-num">{displayNum}</span>
          <span className="ab-card-label">{label}</span>
        </div>
        <svg
          className="ab-card-icon"
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <line x1="10" y1="4" x2="10" y2="16" />
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </div>
      <div className="ab-card-body">
        <div className="ab-card-content">
          {typeof children === "string" ? (
            <p className="ab-card-text">{children}</p>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export function AccordionCardText({ children }: { children: ReactNode }) {
  return <p className="ab-card-text">{children}</p>;
}
