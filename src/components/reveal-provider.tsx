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
      ".hero, .page-hero, .lib-hero, .pr-hero, .ct-hero, .art-header, .cs-header";

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
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    document.querySelectorAll(ANIM_SEL).forEach((el) => observer.observe(el));

    // 3. After hydration: trigger hero animations + start watching for async content
    let mutation: MutationObserver | null = null;
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

      // 4. Watch for new elements added to the DOM (async server components)
      // Started after hydration to avoid hydration mismatch errors
      mutation = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            const targets = node.matches?.(ANIM_SEL)
              ? [node, ...node.querySelectorAll(ANIM_SEL)]
              : node.querySelectorAll(ANIM_SEL);
            targets.forEach((el) => {
              if (!el.classList.contains("vis")) {
                observer.observe(el);
              }
            });
          }
        }
      });
      mutation.observe(document.body, { childList: true, subtree: true });
    }, 150);

    return () => {
      observer.disconnect();
      mutation?.disconnect();
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
