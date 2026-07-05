/**
 * Escape a string for safe interpolation into an HTML context.
 *
 * Use this anywhere user-controlled text is concatenated into an HTML string
 * that will later be rendered as markup — outbound email bodies, admin feed
 * items rendered via dangerouslySetInnerHTML, etc. Do NOT rely on it for
 * attribute-context escaping of URLs (validate the scheme instead).
 */
export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
