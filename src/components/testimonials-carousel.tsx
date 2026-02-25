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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const total = testimonials.length;

  const startAutoplay = useCallback(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 5000);
  }, [total]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [stopAutoplay, startAutoplay]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + total) % total);
    resetAutoplay();
  }, [total, resetAutoplay]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % total);
    resetAutoplay();
  }, [total, resetAutoplay]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  /* Pause on hover */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const enter = () => stopAutoplay();
    const leave = () => startAutoplay();
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, [stopAutoplay, startAutoplay]);

  if (total === 0) return null;

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="testimonials-track">
        <div
          className="testimonials-inner"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {testimonials.map((t, i) => (
            <div className="testimonial" key={i}>
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
      </div>
      <div className="testimonials-nav">
        <button className="testimonials-btn" onClick={goPrev}>
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
        <button className="testimonials-btn" onClick={goNext}>
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
