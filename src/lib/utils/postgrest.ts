/**
 * Sanitize a user-supplied search term for safe embedding inside a PostgREST
 * `.or(...)` / `.ilike(...)` filter STRING.
 *
 * Inside `.or()`, PostgREST treats `,` `(` `)` and `\` as structural syntax —
 * they are NOT parameterized — so a crafted value like `x,role.eq.admin` could
 * inject additional conditions referencing other columns. We drop those, and
 * also neutralize the LIKE wildcards `%` `_` `*` so the term matches literally
 * and can't be abused for pattern-match load. Collapses whitespace and trims.
 */
export function sanitizePostgrestSearch(input: string): string {
  return input
    .replace(/[,()\\%_*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
