"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Horizontal scroller for the Platform page's Creative Identity archetype
 * cards. The track is wider than the viewport so all 6 cards sit in a
 * single row.
 *
 * Desktop (hover: hover, pointer: fine): mouse x-position inside the
 * section drives scrollLeft — move cursor right to reveal later cards.
 * Smoothed via rAF lerp so motion isn't jittery.
 *
 * Everything else (touch, coarse pointer, reduced-motion): native
 * horizontal scroll via overflow-x: auto + scroll-snap.
 */
export function ArchetypeScroller({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflowSides, setOverflowSides] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    function updateEdges() {
      if (!track) return;
      const { scrollLeft, scrollWidth, clientWidth } = track;
      setOverflowSides({
        left: scrollLeft > 4,
        right: scrollLeft + clientWidth < scrollWidth - 4,
      });
    }
    updateEdges();
    track.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);

    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!canHover || reducedMotion) {
      return () => {
        track.removeEventListener("scroll", updateEdges);
        window.removeEventListener("resize", updateEdges);
      };
    }

    let raf = 0;
    let targetScroll = track.scrollLeft;
    let isActive = false;

    function onEnter() {
      isActive = true;
    }
    function onLeave() {
      isActive = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function onMove(e: MouseEvent) {
      if (!isActive || !section || !track) return;
      const rect = section.getBoundingClientRect();
      // Normalize cursor x within the section's horizontal bounds, with
      // a small inset so the extreme edges don't feel like dead zones.
      const inset = rect.width * 0.08;
      const usable = Math.max(1, rect.width - inset * 2);
      const x = (e.clientX - rect.left - inset) / usable;
      const clamped = Math.max(0, Math.min(1, x));
      const overflow = track.scrollWidth - track.clientWidth;
      if (overflow <= 0) return;
      targetScroll = clamped * overflow;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      if (!track) {
        raf = 0;
        return;
      }
      const current = track.scrollLeft;
      const diff = targetScroll - current;
      if (Math.abs(diff) < 0.5) {
        track.scrollLeft = targetScroll;
        raf = 0;
        return;
      }
      track.scrollLeft = current + diff * 0.14;
      raf = requestAnimationFrame(tick);
    }

    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);
    section.addEventListener("mousemove", onMove);

    return () => {
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
      section.removeEventListener("mousemove", onMove);
      track.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`archetype-scroller${overflowSides.left ? " has-overflow-left" : ""}${overflowSides.right ? " has-overflow-right" : ""}`}
    >
      <div ref={trackRef} className="archetype-scroller-track">
        {children}
      </div>
    </div>
  );
}
