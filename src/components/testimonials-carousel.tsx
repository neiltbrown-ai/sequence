"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  image: string;
}

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const total = testimonials.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  /* Single autoplay interval — always running, checks paused flag */
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((prev) => (prev + 1) % total);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [total]);

  /* Pause on hover */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const enter = () => {
      pausedRef.current = true;
    };
    const leave = () => {
      pausedRef.current = false;
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  /* Pause briefly after manual click so autoplay doesn't fire immediately */
  const manualNav = useCallback(
    (next: number) => {
      goTo(next);
      pausedRef.current = true;
      setTimeout(() => {
        pausedRef.current = false;
      }, 4000);
    },
    [goTo]
  );

  if (total === 0) return null;

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="testimonials-track">
        {testimonials.map((t, i) => (
          <div
            className={`testimonial ${i === index ? "testimonial--active" : ""}`}
            key={i}
          >
            <div className="testimonial-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.image} alt="" />
            </div>
            <div className="testimonial-content">
              <div className="testimonial-meta">
                <span className="testimonial-name">{t.name}</span>
                <span className="testimonial-role">{t.role}</span>
              </div>
              <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
            </div>
          </div>
        ))}
      </div>
      <div className="testimonials-nav">
        <button
          className="testimonials-btn"
          onClick={() => manualNav(index - 1)}
        >
          <svg viewBox="0 0 14 14" fill="none">
            <path
              d="M9 3L5 7L9 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className="testimonials-btn"
          onClick={() => manualNav(index + 1)}
        >
          <svg viewBox="0 0 14 14" fill="none">
            <path
              d="M5 3L9 7L5 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
