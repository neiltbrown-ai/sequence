"use client";

import { useEffect, useRef } from "react";

/**
 * IntersectionObserver hook for scroll-triggered reveal animations.
 * Adds the 'vis' class to elements with the 'rv' or 'anim-text-up' class
 * when they enter the viewport.
 */
export function useReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(".rv, .anim-text-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vis");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
