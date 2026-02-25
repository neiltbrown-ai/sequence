"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const testimonials = [
  {
    img: "https://placehold.co/800x600/2a2a2a/555?text=Portrait+1",
    name: "Sarah M.",
    role: "CREATIVE DIRECTOR / STAGE 2",
    quote:
      "\u201cI\u2019d been underpricing advisory work for years. The structures gave me the language and the framework to restructure two client relationships. One equity deal later, I\u2019m thinking in entirely different terms.\u201d",
  },
  {
    img: "https://placehold.co/800x600/2a2a2a/555?text=Portrait+2",
    name: "James T.",
    role: "BRAND STRATEGIST / STAGE 1",
    quote:
      "\u201cThe case studies alone are worth it. Seeing how Virgil Abloh and A24 actually structured their deals \u2014 the specific terms, the reasoning \u2014 changed how I approach every new project.\u201d",
  },
  {
    img: "https://placehold.co/800x600/2a2a2a/555?text=Portrait+3",
    name: "Maria L.",
    role: "PRODUCT DESIGNER / STAGE 2",
    quote:
      "\u201cI was stuck at $180K wondering why more hours wasn\u2019t translating to more value. The progression framework showed me I was solving the wrong problem. Now I\u2019m building toward ownership.\u201d",
  },
  {
    img: "https://placehold.co/800x600/2a2a2a/555?text=Portrait+4",
    name: "David K.",
    role: "FOUNDER / STAGE 3",
    quote:
      "\u201cThe negotiation scripts and manipulation red flags saved me from a terrible net profit participation deal. I restructured it as a revenue share instead. That single change was worth 10x the membership.\u201d",
  },
];

export default function TestimonialsCarousel() {
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
                <img src={t.img} alt="" />
              </div>
              <div className="testimonial-content">
                <div className="testimonial-meta">
                  <span className="testimonial-name">{t.name}</span>
                  <span className="testimonial-role">{t.role}</span>
                </div>
                <p className="testimonial-quote">{t.quote}</p>
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
