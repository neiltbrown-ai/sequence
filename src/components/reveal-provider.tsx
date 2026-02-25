"use client";

import { useEffect } from "react";

/**
 * Client component that sets up IntersectionObserver for
 * scroll-triggered reveal animations (.rv, .anim-text-up,
 * .anim-reveal-down, .anim-scale-in).
 *
 * Also triggers hero animations on load.
 */
export default function RevealProvider() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vis");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    document
      .querySelectorAll(".anim-text-up, .anim-reveal-down, .anim-scale-in, .rv")
      .forEach((el) => observer.observe(el));

    // Trigger hero animations immediately on load
    const timer = setTimeout(() => {
      document
        .querySelectorAll(
          ".hero .anim-text-up, .hero .anim-reveal-down, .hero .rv"
        )
        .forEach((el) => el.classList.add("vis"));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return null;
}
