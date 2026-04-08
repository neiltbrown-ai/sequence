"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mx = -100,
      my = -100,
      cx = -100,
      cy = -100;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.opacity = "1";
      updateCursorColor();
    };

    const onMouseLeave = () => {
      cursor.style.opacity = "0";
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Data-attribute system (preferred for new components)
      const expandAttr = target.closest('[data-cursor="expand"]');
      const arrowAttr = target.closest('[data-cursor="arrow"]');

      // Legacy class-based detection (MDX content)
      const link = target.closest("a");
      const button = target.closest("button");
      const cardHead = target.closest(".cb-card-head") || target.closest(".str-card-head") || target.closest(".sb-card-head") || target.closest(".sb-case-head");
      const sourcesToggle = target.closest(".cb-sources-toggle");
      const tab = target.closest(".str-tier-tab") || target.closest(".sb-tier-tab") || target.closest(".sb-neg-tab");

      cursor.classList.remove("cursor--arrow", "cursor--arrow-down");

      if (expandAttr || cardHead || sourcesToggle || tab) {
        cursor.classList.add("cursor--arrow-down");
      } else if (arrowAttr || link || button) {
        cursor.classList.add("cursor--arrow");
      }

      // Re-run color to boost opacity when icon is active
      updateCursorColor();
    };

    // Detect dark sections for cursor color
    const darkEls = document.querySelectorAll(
      ".newsletter,.footer,.callout"
    );

    const updateCursorColor = () => {
      let dark = false;
      darkEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (my >= r.top && my <= r.bottom) dark = true;
      });
      const hasIcon = cursor.classList.contains("cursor--arrow") || cursor.classList.contains("cursor--arrow-down");
      if (dark) {
        cursor.style.borderColor = hasIcon ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)";
        cursor.style.color = hasIcon ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)";
      } else {
        cursor.style.borderColor = hasIcon ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.45)";
        cursor.style.color = hasIcon ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.45)";
      }
    };

    const tick = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(tick);
    };
    tick();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseover", onMouseOver);
    window.addEventListener("scroll", updateCursorColor);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("scroll", updateCursorColor);
    };
  }, []);

  return (
    <div id="cursor" ref={cursorRef}>
      <svg
        className="cursor-arrow-up"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 10L10 2M10 2H4M10 2V8"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="cursor-arrow-down"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2L10 10M10 10H4M10 10V4"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
