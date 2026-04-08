"use client";

import { ReactNode } from "react";
import { useCaseStudyContext } from "./case-study-context";

interface CbTimelineProps {
  children: ReactNode;
}

export function CbTimeline({ children }: CbTimelineProps) {
  const { secondaryImage, secondaryAlt, secondaryPosition } = useCaseStudyContext();

  return (
    <>
      <div className="cb-grid is-timeline">
        <div className="cs-timeline">{children}</div>
      </div>
      {secondaryImage && (
        <div className="cb-grid is-secondary-img">
          <div className="cs-secondary-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="cs-secondary-img"
              src={secondaryImage}
              alt={secondaryAlt || ""}
              style={secondaryPosition ? { objectPosition: secondaryPosition } : undefined}
            />
          </div>
        </div>
      )}
    </>
  );
}

interface CbTimelineEraProps {
  label: string;
  children: ReactNode;
}

export function CbTimelineEra({ label, children }: CbTimelineEraProps) {
  return (
    <div className="cs-timeline-era">
      <div className="cs-timeline-era-label">{label}</div>
      {children}
    </div>
  );
}

interface CbTimelineEventProps {
  year: string;
  children: ReactNode;
}

export function CbTimelineEvent({ year, children }: CbTimelineEventProps) {
  return (
    <div className="cs-timeline-event">
      <span className="cs-timeline-year">{year}</span>
      <span className="cs-timeline-desc">{children}</span>
    </div>
  );
}
