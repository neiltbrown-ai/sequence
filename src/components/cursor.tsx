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
      const link = target.closest("a");
      const button = target.closest("button");
      if (button) {
        cursor.classList.remove("cursor--arrow");
      } else if (
        link &&
        (link.querySelector("img") || link.querySelector(".rc-wrap"))
      ) {
        cursor.classList.add("cursor--arrow");
      } else {
        cursor.classList.remove("cursor--arrow");
      }
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
      cursor.style.borderColor = dark
        ? "rgba(255,255,255,0.6)"
        : "rgba(0,0,0,0.45)";
      cursor.style.color = dark
        ? "rgba(255,255,255,0.6)"
        : "rgba(0,0,0,0.45)";
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
    </div>
  );
}
