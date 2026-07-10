import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The Member File — durable facts with source + confidence
 * (simplification strategy §2.2).
 *
 * One canonical data object per member: schematized, aggregatable facts
 * about their situation. Every fact carries where it came from and how
 * sure we are. The advisor writes through the update_member_file tool;
 * every read site MUST degrade gracefully (empty file) because the
 * `member_file_facts` migration (00021) is applied to production
 * manually and may not exist yet where this code runs.
 */

export type MemberFileFactSource = "stated" | "inferred" | "computed" | "imported";
export type MemberFileFactConfidence = "low" | "medium" | "high";

export type MemberFileFact = {
  /** snake_case key, e.g. 'discipline', 'owns_masters', 'entity_setup' */
  fact: string;
  /** string | number | boolean | object (jsonb) */
  value: unknown;
  source: MemberFileFactSource;
  confidence: MemberFileFactConfidence;
  /** e.g. 'inferred from "label owns everything"' or 'imported from assessment' */
  provenance?: string | null;
  updated_at: string;
};

export type MemberFileFactInput = {
  fact: string;
  value: unknown;
  source: MemberFileFactSource;
  confidence: MemberFileFactConfidence;
  provenance?: string | null;
};

/**
 * Load a member's file. Returns [] on ANY error — including the table not
 * existing yet (migration lands later than the code) — so callers never
 * need their own guard.
 */
export async function getMemberFile(
  userId: string,
  client: SupabaseClient
): Promise<MemberFileFact[]> {
  try {
    const { data, error } = await client
      .from("member_file_facts")
      .select("fact, value, source, confidence, provenance, updated_at")
      .eq("user_id", userId)
      .order("fact", { ascending: true });

    if (error || !data) return [];
    return data as MemberFileFact[];
  } catch {
    return [];
  }
}

/**
 * Upsert facts onto a member's file (one row per (user_id, fact) — updates
 * overwrite). Never throws: failures come back as { ok: false, error }.
 */
export async function upsertFacts(
  userId: string,
  facts: MemberFileFactInput[],
  client: SupabaseClient
): Promise<{ ok: boolean; error?: string }> {
  if (facts.length === 0) return { ok: true };

  try {
    const now = new Date().toISOString();
    const rows = facts.map((f) => ({
      user_id: userId,
      fact: f.fact,
      value: f.value,
      source: f.source,
      confidence: f.confidence,
      provenance: f.provenance ?? null,
      updated_at: now,
    }));

    const { error } = await client
      .from("member_file_facts")
      .upsert(rows, { onConflict: "user_id,fact" });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Format facts as a compact text block for AI system prompts.
 * One line per fact:
 *   - discipline: "musician / touring + sync" (stated, high)
 * Provenance is included only for inferred facts (that's where it earns
 * its tokens — it quotes the member's words).
 */
export function formatFactsForPrompt(facts: MemberFileFact[]): string {
  return facts
    .map((f) => {
      const value =
        typeof f.value === "string" ? `"${f.value}"` : JSON.stringify(f.value);
      const provenance =
        f.source === "inferred" && f.provenance ? `; ${f.provenance}` : "";
      return `- ${f.fact}: ${value} (${f.source}, ${f.confidence}${provenance})`;
    })
    .join("\n");
}
