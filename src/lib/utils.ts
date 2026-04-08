import { type ClassValue, clsx } from "clsx";

/**
 * Utility for conditionally joining class names.
 * Uses clsx under the hood — install with: npm install clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Convert a string to Title Case, respecting minor words.
 * First and last words are always capitalized.
 */
const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "nor", "for",
  "to", "in", "on", "at", "by", "of", "with", "vs",
]);

export function toTitleCase(str: string): string {
  if (!str) return str;
  const words = str.trim().split(/\s+/);
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i === 0 || i === words.length - 1 || !MINOR_WORDS.has(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return lower;
    })
    .join(" ");
}

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
