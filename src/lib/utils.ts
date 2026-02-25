import { type ClassValue, clsx } from "clsx";

/**
 * Utility for conditionally joining class names.
 * Uses clsx under the hood — install with: npm install clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
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
