/**
 * Helpers for reading assessment answers that can be either single
 * (string) or multi (string[]) post-Phase-3 multi-select rollout.
 *
 * Industry-pool questions (Q-IND-*) flipped from single_select to
 * multi_select for 6 of the 32 questions on 2026-05-07; their stored
 * values can be either a single string (single_select) or a string[]
 * (multi_select). Use these helpers at every read site to handle both
 * shapes uniformly.
 */

/** Normalize an answer to a string[]. Empty/null/undefined → []. */
export function toAnswerArray(value: string | string[] | null | undefined): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/** Get the first answer if any. Useful for callers that still want a single value. */
export function firstAnswer(value: string | string[] | null | undefined): string | undefined {
  const arr = toAnswerArray(value);
  return arr[0];
}

/** Render an answer (single or multi) as a comma-separated string for display / AI prompts. */
export function joinAnswers(value: string | string[] | null | undefined, sep = ", "): string {
  return toAnswerArray(value).join(sep);
}
