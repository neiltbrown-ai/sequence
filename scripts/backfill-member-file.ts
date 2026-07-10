/**
 * One-off: backfill the Member File (member_file_facts, migration 00021)
 * from existing assessments, asset inventory, and deal evaluations —
 * simplification strategy §2.2: "one-time backfill of existing
 * assessments/inventory/deals into file facts tagged `imported`."
 *
 * For each user with a completed assessment (latest completed per user —
 * mirrors getCurrentAssessment() in src/lib/assessment/current-assessment.ts),
 * derives facts tagged source 'imported', confidence 'high':
 *
 *   from the assessment:  discipline, sub_discipline, creative_mode,
 *                         stage (detected_stage), income_range,
 *                         entity_setup (business_structure),
 *                         equity_positions, value_leaks (misalignment_flags)
 *   from asset_inventory_items:  portfolio_asset_count (assets themselves
 *                                stay in their own table)
 *   from deal_evaluations:       deals_evaluated_count
 *
 * Idempotent: upserts on (user_id, fact), so re-running overwrites the
 * same imported facts.
 *
 * Usage:
 *   npx tsx scripts/backfill-member-file.ts             # write facts
 *   npx tsx scripts/backfill-member-file.ts --dry-run   # print, don't write
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local (or .env). No AI calls — pure data migration.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";

import {
  upsertFacts,
  type MemberFileFactInput,
} from "../src/lib/member-file/facts";

// ─── env loader (no dotenv dep) ────────────────────────────────────

function loadEnvFile(file: string) {
  try {
    const content = readFileSync(file, "utf-8");
    for (const raw of content.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* file missing — fine */
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── config ────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const PAGE_SIZE = 1000; // read pagination
const BATCH_SIZE = 25; // users written per batch

// ─── types ─────────────────────────────────────────────────────────

interface AssessmentRow {
  id: string;
  user_id: string;
  discipline: string | null;
  sub_discipline: string[] | null;
  creative_mode: string | null;
  detected_stage: number | null;
  income_range: string | null;
  business_structure: string | null;
  equity_positions: string | null;
  misalignment_flags: string[] | null;
  completed_at: string | null;
  created_at: string;
}

// ─── reads ─────────────────────────────────────────────────────────

/**
 * Latest completed assessment per user. Ordered completed_at desc (then
 * created_at desc as tiebreak) and deduped on first-seen user_id —
 * the same selection rule as getCurrentAssessment() for completed rows.
 * NOTE: assessments has no updated_at column — never select it.
 */
async function loadLatestCompletedAssessments(): Promise<Map<string, AssessmentRow>> {
  const byUser = new Map<string, AssessmentRow>();
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("assessments")
      .select(
        "id, user_id, discipline, sub_discipline, creative_mode, detected_stage, income_range, business_structure, equity_positions, misalignment_flags, completed_at, created_at"
      )
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load assessments: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const row of data as AssessmentRow[]) {
      if (!byUser.has(row.user_id)) byUser.set(row.user_id, row);
    }

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return byUser;
}

/** Count rows per user_id for a table (counted in JS — one-off scale). */
async function countByUser(table: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("user_id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load ${table}: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const row of data as { user_id: string | null }[]) {
      if (!row.user_id) continue;
      counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
    }

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return counts;
}

// ─── fact derivation ───────────────────────────────────────────────

function deriveFacts(
  assessment: AssessmentRow,
  assetCount: number | undefined,
  dealsCount: number | undefined
): MemberFileFactInput[] {
  const facts: MemberFileFactInput[] = [];

  const fromAssessment = (fact: string, value: unknown) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    facts.push({
      fact,
      value,
      source: "imported",
      confidence: "high",
      provenance: "imported from assessment",
    });
  };

  fromAssessment("discipline", assessment.discipline);
  fromAssessment("sub_discipline", assessment.sub_discipline);
  fromAssessment("creative_mode", assessment.creative_mode);
  fromAssessment("stage", assessment.detected_stage);
  fromAssessment("income_range", assessment.income_range);
  fromAssessment("entity_setup", assessment.business_structure);
  fromAssessment("equity_positions", assessment.equity_positions);
  fromAssessment("value_leaks", assessment.misalignment_flags);

  if (assetCount !== undefined && assetCount > 0) {
    facts.push({
      fact: "portfolio_asset_count",
      value: assetCount,
      source: "imported",
      confidence: "high",
      provenance: "imported from portfolio",
    });
  }

  if (dealsCount !== undefined && dealsCount > 0) {
    facts.push({
      fact: "deals_evaluated_count",
      value: dealsCount,
      source: "imported",
      confidence: "high",
      provenance: "imported from deal evaluations",
    });
  }

  return facts;
}

// ─── main ──────────────────────────────────────────────────────────

async function main() {
  console.log(`Member File backfill${DRY_RUN ? " (DRY RUN — nothing will be written)" : ""}\n`);

  const [assessments, assetCounts, dealCounts] = await Promise.all([
    loadLatestCompletedAssessments(),
    countByUser("asset_inventory_items"),
    countByUser("deal_evaluations"),
  ]);

  console.log(`Users with a completed assessment: ${assessments.size}`);
  console.log(`Users with inventory items:        ${assetCounts.size}`);
  console.log(`Users with deal evaluations:       ${dealCounts.size}\n`);

  const userIds = [...assessments.keys()];
  let usersWritten = 0;
  let factsWritten = 0;
  let failures = 0;

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);

    for (const userId of batch) {
      const assessment = assessments.get(userId)!;
      const facts = deriveFacts(assessment, assetCounts.get(userId), dealCounts.get(userId));

      if (facts.length === 0) continue;

      if (DRY_RUN) {
        console.log(`— ${userId} (${facts.length} facts):`);
        for (const f of facts) {
          console.log(`    ${f.fact} = ${JSON.stringify(f.value)}`);
        }
        usersWritten += 1;
        factsWritten += facts.length;
        continue;
      }

      const result = await upsertFacts(userId, facts, supabase);
      if (!result.ok) {
        failures += 1;
        console.error(`  FAILED ${userId}: ${result.error}`);
        continue;
      }
      usersWritten += 1;
      factsWritten += facts.length;
    }

    console.log(
      `Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(userIds.length / BATCH_SIZE)} done (${Math.min(i + BATCH_SIZE, userIds.length)}/${userIds.length} users)`
    );
  }

  console.log(
    `\n${DRY_RUN ? "Would write" : "Wrote"} ${factsWritten} facts across ${usersWritten} users.` +
      (failures > 0 ? ` ${failures} users FAILED.` : "")
  );

  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
