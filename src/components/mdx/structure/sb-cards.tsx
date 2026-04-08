"use client";

import { ReactNode, useState, Children, isValidElement, cloneElement } from "react";

interface SbCardsProps {
  children: ReactNode;
}

export function SbCards({ children }: SbCardsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cards = Children.toArray(children).filter(isValidElement);

  return (
    <div className="sb-grid is-cards">
      <div className="sb-cards">
        {cards.map((card, i) =>
          cloneElement(card as React.ReactElement<SbCardInternalProps>, {
            _isOpen: openIndex === i,
            _onToggle: () => setOpenIndex(openIndex === i ? null : i),
            _index: i,
          })
        )}
      </div>
    </div>
  );
}

interface SbCardInternalProps {
  _isOpen?: boolean;
  _onToggle?: () => void;
  _index?: number;
}

interface SbCardProps {
  num?: string;
  label: string;
  warn?: string;
  children: ReactNode;
  _isOpen?: boolean;
  _onToggle?: () => void;
  _index?: number;
}

export function SbCard({
  num,
  label,
  warn,
  children,
  _isOpen,
  _onToggle,
  _index,
}: SbCardProps) {
  const displayNum = num ?? String((_index ?? 0) + 1).padStart(2, "0");
  const isWarn = warn === "true" || warn === "yes";

  return (
    <div className={`sb-card${_isOpen ? " open" : ""}${isWarn ? " is-warn" : ""}`}>
      <div className="sb-card-head" onClick={_onToggle}>
        <div className="sb-card-head-left">
          <span className="sb-card-num">{isWarn ? `\u26A0 ${displayNum}` : displayNum}</span>
          <span className="sb-card-label">{label}</span>
        </div>
        <svg
          className="sb-card-icon"
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
      <div className="sb-card-body">
        <div className="sb-card-content">
          {typeof children === "string" ? (
            <p className="sb-card-text">{children}</p>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

interface SbCardTextProps {
  children: ReactNode;
}

export function SbCardText({ children }: SbCardTextProps) {
  return <div className="sb-card-text">{children}</div>;
}

interface SbCardSubProps {
  children: ReactNode;
}

export function SbCardSub({ children }: SbCardSubProps) {
  return <div className="sb-card-sub">{children}</div>;
}
