"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "seq_first_visit";
const DISCOUNT_DAYS = 15;

function getExpirationDate(): Date {
  if (typeof window === "undefined") return new Date();

  let firstVisit = localStorage.getItem(STORAGE_KEY);
  if (!firstVisit) {
    firstVisit = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, firstVisit);
  }

  const expiration = new Date(firstVisit);
  expiration.setDate(expiration.getDate() + DISCOUNT_DAYS);
  return expiration;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Renders the badge text: "Discount expires in X days — Month Day, Year"
 * Falls back gracefully if localStorage isn't available.
 */
export function DiscountBadge() {
  const [text, setText] = useState("");

  useEffect(() => {
    const expiration = getExpirationDate();
    const now = new Date();
    const msLeft = expiration.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    if (daysLeft <= 0) {
      setText("Introductory pricing");
    } else {
      setText(`Discount expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — ${formatDate(expiration)}`);
    }
  }, []);

  if (!text) return <>Introductory Pricing</>;
  return <>{text}</>;
}

/**
 * Inline price display: <s>$129</s> $89/year
 * Used in CTAs across the public site.
 */
export function InlinePrice({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="price-orig">$129</span> $89/year
    </span>
  );
}
