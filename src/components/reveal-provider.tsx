"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Client component that sets up IntersectionObserver for
 * scroll-triggered reveal animations (.rv, .anim-text-up,
 * .anim-reveal-down, .anim-scale-in).
 *
 * Re-initialises on every client-side route change so new
 * page elements get observed.
 */
export default function RevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Selectors for all animatable elements
    const ANIM_SEL = ".anim-text-up, .anim-reveal-down, .anim-scale-in, .rv";

    // Hero wrapper selectors used across different page types
    const HERO_SEL =
      ".hero, .page-hero, .lib-hero, .pr-hero, .ct-hero, .art-header";

    // 1. Strip stale "vis" class so animations replay on navigation
    document.querySelectorAll(ANIM_SEL).forEach((el) => {
      el.classList.remove("vis");
    });

    // 2. Set up IntersectionObserver for scroll-triggered reveals
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

    document.querySelectorAll(ANIM_SEL).forEach((el) => observer.observe(el));

    // 3. Trigger hero animations immediately (above-the-fold content)
    const timer = setTimeout(() => {
      const heroContainers = document.querySelectorAll(HERO_SEL);
      heroContainers.forEach((hero) => {
        hero
          .querySelectorAll(".anim-text-up, .anim-reveal-down, .rv")
          .forEach((el) => el.classList.add("vis"));
      });

      // Also fire any top-level animated elements that are in the viewport
      // on initial paint (e.g. standalone elements not inside a hero)
      document.querySelectorAll(ANIM_SEL).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("vis");
        }
      });
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
