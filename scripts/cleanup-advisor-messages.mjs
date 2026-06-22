// One-time cleanup: repair advisor conversation rows whose `messages` array contains
// non-UIMessage entries (ModelMessages with `content`/role "tool" and no `parts`).
// Those rows crash convertToModelMessages on reload (AI_MessageConversionError) and
// were produced by the old route onFinish saving [...uiMessages, ...response.messages].
//
// Mirrors normalizeUiMessages() in src/app/api/advisor/chat/route.ts.
//
//   Dry run (default):  node scripts/cleanup-advisor-messages.mjs
//   Apply:              node scripts/cleanup-advisor-messages.mjs --apply
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isUiMessage(m) {
  return (
    !!m &&
    (m.role === "user" || m.role === "assistant" || m.role === "system") &&
    Array.isArray(m.parts)
  );
}

function normalizeUiMessages(input) {
  const arr = Array.isArray(input) ? input : [];
  return arr.filter(isUiMessage).map((msg) => {
    if (msg.role !== "assistant") return msg;
    const cleanParts = msg.parts.filter((p) => {
      if (p?.type?.startsWith("tool-") && p.toolCallId) {
        if (!p.input || typeof p.input !== "object") return false;
      }
      return true;
    });
    return { ...msg, parts: cleanParts };
  });
}

const { data, error } = await supa
  .from("ai_conversations")
  .select("id, message_count, messages")
  .limit(2000);

if (error) {
  console.error("query error", error);
  process.exit(1);
}

let changed = 0, dropped = 0, emptied = 0;
for (const row of data) {
  const before = Array.isArray(row.messages) ? row.messages.length : 0;
  const normalized = normalizeUiMessages(row.messages);
  if (normalized.length === before) continue; // healthy / nothing to drop

  changed++;
  dropped += before - normalized.length;
  if (normalized.length === 0) emptied++;
  console.log(
    `conv ${row.id}: ${before} -> ${normalized.length} messages` +
      (normalized.length === 0 ? "  (would empty — left for self-heal, skipping)" : "")
  );

  // Never blank a conversation: if normalization would empty it, leave it so the read
  // guard handles it and the next user turn rebuilds it cleanly.
  if (normalized.length === 0) continue;

  if (APPLY) {
    const { error: upErr } = await supa
      .from("ai_conversations")
      .update({ messages: normalized, message_count: normalized.length })
      .eq("id", row.id);
    if (upErr) console.error(`  update failed for ${row.id}:`, upErr.message);
  }
}

console.log(
  `\n${APPLY ? "APPLIED" : "DRY RUN"} — scanned ${data.length}, ` +
    `${changed} need repair (${dropped} bad entries), ${emptied} skipped as would-empty.`
);
if (!APPLY && changed) console.log("Re-run with --apply to write changes.");
