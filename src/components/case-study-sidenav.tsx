"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface Section {
  id: string;
  label: string;
}

interface CaseStudySidenavProps {
  sections: Section[];
}

export default function CaseStudySidenav({ sections }: CaseStudySidenavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [hidden, setHidden] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleScroll = useCallback(() => {
    // Find the .cs-body element as the content container
    const body = document.querySelector(".cs-body");
    if (!body) return;
    const rect = body.getBoundingClientRect();
    // Show sidenav when content body is in view (top scrolled past 200px mark)
    const show = rect.top < 200 && rect.bottom > 200;
    setHidden(!show);
  }, []);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    // Track active section
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    els.forEach((el) => observerRef.current!.observe(el));

    // Show/hide based on scroll position
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check initial state

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections, handleScroll]);

  return (
    <nav className={`cs-sidenav${hidden ? " is-hidden" : ""}`}>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={activeId === s.id ? "active" : ""}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="nav-dot" />
          {s.label}
        </a>
      ))}
    </nav>
  );
}
