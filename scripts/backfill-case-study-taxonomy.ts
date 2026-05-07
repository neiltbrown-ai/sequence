/**
 * One-off: backfill case study `industries[]` + `disciplines[]` per the
 * canonical taxonomy in `content/reference/case-study-taxonomy.md`.
 *
 * Two passes, separated by human review:
 *   1. Propose:  read MDX frontmatter+body, ask Claude to tag, write JSON.
 *   2. Apply:    read approved JSON, write tags into each MDX frontmatter
 *                (preserves all other frontmatter + body).
 *
 * Usage:
 *   npx tsx scripts/backfill-case-study-taxonomy.ts --calibration
 *     → tags the 10 hand-picked diverse cases below; writes
 *       content/case-study-taxonomy-proposals.calibration.json
 *
 *   npx tsx scripts/backfill-case-study-taxonomy.ts --all
 *     → tags all 104 cases; writes
 *       content/case-study-taxonomy-proposals.json
 *
 *   npx tsx scripts/backfill-case-study-taxonomy.ts --apply <json-path>
 *     → reads proposals JSON, writes industries[]/disciplines[] into
 *       each MDX frontmatter
 *
 *   npx tsx scripts/backfill-case-study-taxonomy.ts --resume <json-path> --all
 *     → continues a partial run; skips cases already in the JSON
 *
 * Reads SEQ_ANTHROPIC_API_KEY from .env.local (matches the rest of the
 * codebase — avoids collision with shell-level ANTHROPIC_API_KEY).
 */

import Anthropic from "@anthropic-ai/sdk";
import matter from "gray-matter";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";

import {
  INDUSTRIES,
  DISCIPLINES,
  isIndustrySlug,
  isDisciplineSlug,
  type IndustrySlug,
  type DisciplineSlug,
} from "../src/lib/case-studies/taxonomy";

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

// ─── config ────────────────────────────────────────────────────────

const REPO_ROOT = process.cwd();
const CASE_STUDIES_DIR = path.join(REPO_ROOT, "content", "case-studies");
const TAXONOMY_DOC = path.join(
  REPO_ROOT,
  "content",
  "reference",
  "case-study-taxonomy.md"
);
const MODEL = "claude-sonnet-4-20250514";

// 10 hand-picked calibration cases that span industries / crossovers.
// Edit if the corpus changes; not load-bearing — just for the calibration pass.
const CALIBRATION_SLUGS = [
  "rick-rubin", // music — has worked example
  "a24", // film_tv — has worked example
  "stefan-sagmeister", // design — has worked example
  "es-devlin", // theater + design crossover — has worked example
  "erik-spiekermann", // design + education — has worked example
  "sahil-lavingia", // writing + technology crossover — has worked example
  "liz-lambert", // hospitality + design + architecture crossover (test)
  "brandon-stanton", // photography + media crossover (test)
  "loveis-wise", // comics + visual_art question (test)
  "mrbeast", // media + film_tv question (test)
];

// ─── types ─────────────────────────────────────────────────────────

interface Proposal {
  slug: string;
  title: string;
  prior_industry: string | null;
  prior_discipline: string | null;
  industries: IndustrySlug[];
  disciplines: DisciplineSlug[];
  confidence: "high" | "medium" | "low";
  rationale: string;
  flagged?: boolean;
  flag_reason?: string;
  raw_unknown_industries?: string[];
  raw_unknown_disciplines?: string[];
}

interface ProposalsFile {
  generated_at: string;
  model: string;
  count: number;
  proposals: Proposal[];
}

// ─── prompt ────────────────────────────────────────────────────────

function buildSystemPrompt(taxonomyDoc: string): string {
  const industryEnum = INDUSTRIES.map((i) => `"${i.slug}"`).join(" | ");
  const disciplineEnum = DISCIPLINES.map((d) => `"${d.slug}"`).join(" | ");

  return [
    "You are a librarian tagging a case-study corpus against a fixed two-axis taxonomy.",
    "",
    "RULES (ranked):",
    "1. The two axes are DISJOINT vocabularies. Industries describe the SECTOR; disciplines describe what the practitioner DOES. `photography` is an INDUSTRY only — never a discipline. `design` and `writing` exist on BOTH axes (different meanings). Never put an industry slug in `disciplines` or vice versa.",
    "2. The Quick-lookup worked-examples table at the bottom of the taxonomy reference is GROUND TRUTH. If the case you are tagging is listed in that table, copy its tagging exactly. Do not re-derive.",
    "3. The user message includes `prior_industry` and `prior_discipline` fields. Those are LEGACY values from the deprecated single-string vocabulary. They are data points only — not authoritative. Do NOT inherit them. Specifically: if the prior industry says `Design` but the body describes editorial illustration, the correct industry is `comics` (per the taxonomy doc's `comics` scope, which covers commercial / editorial illustration).",
    "4. Apply the scope rules in the taxonomy reference STRICTLY. Read the IN/OUT bullets for each industry. If a case truly does not fit, set `confidence: \"low\"` and `flagged: true` — do not stretch a category.",
    "5. Be conservative — don't over-tag. A music case with a tangential film score is `industries: [\"music\"]`, not `[\"music\", \"film_tv\"]`. Resist adding a second industry unless the secondary work is substantial AND ongoing.",
    "",
    "OUTPUT — return JSON ONLY (no prose, no code fences) matching this schema exactly:",
    "{",
    `  "industries": (${industryEnum})[],   // 1-2 typically, max 3. Most-prominent first. ONLY these 16 values.`,
    `  "disciplines": (${disciplineEnum})[],   // 1-3 typically, max 4. Most-prominent first. ONLY these 10 values.`,
    '  "confidence": "high" | "medium" | "low",',
    '  "rationale": string,      // 1-2 sentences. Cite the scope rule or worked-example you used.',
    '  "flagged": boolean,       // true if you think this case may not fit cleanly',
    '  "flag_reason": string     // empty if flagged=false',
    "}",
    "",
    "==== TAXONOMY REFERENCE ====",
    taxonomyDoc,
  ].join("\n");
}

function buildUserPrompt(input: {
  slug: string;
  title: string;
  prior_industry?: string;
  prior_discipline?: string;
  excerpt?: string;
  body: string;
}): string {
  const bodyExcerpt = input.body.slice(0, 1500).replace(/\n+/g, "\n");
  return [
    `Slug: ${input.slug}`,
    `Title: ${input.title}`,
    `Prior industry (legacy single value): ${input.prior_industry ?? "(none)"}`,
    `Prior discipline (freeform display): ${input.prior_discipline ?? "(none)"}`,
    "",
    "Excerpt:",
    input.excerpt ?? "(none)",
    "",
    "Body opening (first ~1500 chars):",
    bodyExcerpt,
    "",
    "Tag this case study. Return JSON only.",
  ].join("\n");
}

// ─── core: tag one case ────────────────────────────────────────────

async function tagOne(
  client: Anthropic,
  systemPrompt: string,
  meta: {
    slug: string;
    title: string;
    industry?: string;
    discipline?: string;
    excerpt?: string;
  },
  body: string
): Promise<Proposal> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: buildUserPrompt({
          slug: meta.slug,
          title: meta.title,
          prior_industry: meta.industry,
          prior_discipline: meta.discipline,
          excerpt: meta.excerpt,
          body,
        }),
      },
    ],
  });

  const text = res.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("");

  let parsed: {
    industries: unknown;
    disciplines: unknown;
    confidence?: unknown;
    rationale?: unknown;
    flagged?: unknown;
    flag_reason?: unknown;
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error(`Could not parse JSON for ${meta.slug}: ${text.slice(0, 200)}`);
    parsed = JSON.parse(m[0]);
  }

  const rawIndustries = Array.isArray(parsed.industries)
    ? parsed.industries.filter((v): v is string => typeof v === "string")
    : [];
  const rawDisciplines = Array.isArray(parsed.disciplines)
    ? parsed.disciplines.filter((v): v is string => typeof v === "string")
    : [];

  const validIndustries = rawIndustries.filter(isIndustrySlug);
  const validDisciplines = rawDisciplines.filter(isDisciplineSlug);
  const unknownIndustries = rawIndustries.filter((v) => !isIndustrySlug(v));
  const unknownDisciplines = rawDisciplines.filter((v) => !isDisciplineSlug(v));

  return {
    slug: meta.slug,
    title: meta.title,
    prior_industry: meta.industry ?? null,
    prior_discipline: meta.discipline ?? null,
    industries: validIndustries,
    disciplines: validDisciplines,
    confidence:
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "low",
    rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
    flagged: parsed.flagged === true || unknownIndustries.length > 0 || unknownDisciplines.length > 0,
    flag_reason:
      typeof parsed.flag_reason === "string" && parsed.flag_reason
        ? parsed.flag_reason
        : unknownIndustries.length > 0 || unknownDisciplines.length > 0
          ? "model returned unknown slug(s)"
          : "",
    raw_unknown_industries: unknownIndustries.length ? unknownIndustries : undefined,
    raw_unknown_disciplines: unknownDisciplines.length ? unknownDisciplines : undefined,
  };
}

// ─── propose pass ──────────────────────────────────────────────────

interface CaseRecord {
  filename: string;
  slug: string;
  meta: Record<string, unknown>;
  body: string;
}

function readAllCases(): CaseRecord[] {
  return readdirSync(CASE_STUDIES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const filePath = path.join(CASE_STUDIES_DIR, filename);
      const raw = readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const slug =
        (typeof data.slug === "string" && data.slug) || filename.replace(/\.mdx$/, "");
      return { filename, slug, meta: data, body: content };
    });
}

async function runProposePass(opts: {
  scope: "calibration" | "all";
  outPath: string;
  resumeFromPath?: string;
}) {
  const apiKey = process.env.SEQ_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("SEQ_ANTHROPIC_API_KEY missing from .env.local / .env");

  // Match production routes — let the SDK use its default base URL.
  // Don't read SEQ_ANTHROPIC_BASE_URL: that env var includes a "/v1"
  // suffix used by other tooling, but the SDK appends "/v1/messages"
  // itself, so passing it produces "/v1/v1/messages" → 404.
  const client = new Anthropic({ apiKey });

  const taxonomyDoc = readFileSync(TAXONOMY_DOC, "utf-8");
  const systemPrompt = buildSystemPrompt(taxonomyDoc);

  const all = readAllCases();
  const targets =
    opts.scope === "calibration"
      ? CALIBRATION_SLUGS.map((slug) => {
          const found = all.find((c) => c.slug === slug);
          if (!found) throw new Error(`Calibration slug not found in corpus: ${slug}`);
          return found;
        })
      : all;

  // Resume support — skip cases already in the prior JSON
  const existing: Record<string, Proposal> = {};
  if (opts.resumeFromPath && existsSync(opts.resumeFromPath)) {
    const prior = JSON.parse(readFileSync(opts.resumeFromPath, "utf-8")) as ProposalsFile;
    for (const p of prior.proposals) existing[p.slug] = p;
    console.log(`Resuming: ${Object.keys(existing).length} cases already tagged.`);
  }

  const proposals: Proposal[] = [];
  for (let i = 0; i < targets.length; i++) {
    const c = targets[i];
    if (existing[c.slug]) {
      proposals.push(existing[c.slug]);
      continue;
    }
    const prefix = `[${i + 1}/${targets.length}]`;
    process.stdout.write(`${prefix} ${c.slug} … `);
    try {
      const proposal = await tagOne(
        client,
        systemPrompt,
        {
          slug: c.slug,
          title: typeof c.meta.title === "string" ? c.meta.title : c.slug,
          industry: typeof c.meta.industry === "string" ? c.meta.industry : undefined,
          discipline: typeof c.meta.discipline === "string" ? c.meta.discipline : undefined,
          excerpt: typeof c.meta.excerpt === "string" ? c.meta.excerpt : undefined,
        },
        c.body
      );
      proposals.push(proposal);
      const flagBadge = proposal.flagged ? " ⚠" : "";
      console.log(
        `industries=[${proposal.industries.join(",")}] disciplines=[${proposal.disciplines.join(",")}] (${proposal.confidence})${flagBadge}`
      );
    } catch (err) {
      console.log(`✗ ${(err as Error).message}`);
      proposals.push({
        slug: c.slug,
        title: typeof c.meta.title === "string" ? c.meta.title : c.slug,
        prior_industry: typeof c.meta.industry === "string" ? c.meta.industry : null,
        prior_discipline: typeof c.meta.discipline === "string" ? c.meta.discipline : null,
        industries: [],
        disciplines: [],
        confidence: "low",
        rationale: "",
        flagged: true,
        flag_reason: `request failed: ${(err as Error).message}`,
      });
    }

    // Write incremental progress every 5 cases so a crash doesn't lose the run
    if ((i + 1) % 5 === 0) {
      writeFileSync(opts.outPath, JSON.stringify(buildOutput(proposals), null, 2));
    }
  }

  writeFileSync(opts.outPath, JSON.stringify(buildOutput(proposals), null, 2));
  printSummary(proposals);
  console.log(`\nWrote ${proposals.length} proposals → ${path.relative(REPO_ROOT, opts.outPath)}`);
}

function buildOutput(proposals: Proposal[]): ProposalsFile {
  return {
    generated_at: new Date().toISOString(),
    model: MODEL,
    count: proposals.length,
    proposals,
  };
}

function printSummary(proposals: Proposal[]) {
  console.log("\n=== Summary ===");
  const byIndustry: Record<string, number> = {};
  const byDiscipline: Record<string, number> = {};
  let flaggedCount = 0;
  let lowConfidenceCount = 0;
  for (const p of proposals) {
    for (const i of p.industries) byIndustry[i] = (byIndustry[i] ?? 0) + 1;
    for (const d of p.disciplines) byDiscipline[d] = (byDiscipline[d] ?? 0) + 1;
    if (p.flagged) flaggedCount++;
    if (p.confidence === "low") lowConfidenceCount++;
  }
  console.log("\nIndustries:");
  for (const i of INDUSTRIES) {
    console.log(`  ${i.slug.padEnd(16)} ${byIndustry[i.slug] ?? 0}`);
  }
  console.log("\nDisciplines:");
  for (const d of DISCIPLINES) {
    console.log(`  ${d.slug.padEnd(14)} ${byDiscipline[d.slug] ?? 0}`);
  }
  console.log(`\nFlagged: ${flaggedCount}`);
  console.log(`Low-confidence: ${lowConfidenceCount}`);
}

// ─── apply pass ────────────────────────────────────────────────────

async function runApplyPass(jsonPath: string) {
  if (!existsSync(jsonPath)) throw new Error(`Proposals file not found: ${jsonPath}`);
  const file = JSON.parse(readFileSync(jsonPath, "utf-8")) as ProposalsFile;

  let written = 0;
  let skipped = 0;
  for (const p of file.proposals) {
    if (p.industries.length === 0 || p.disciplines.length === 0) {
      console.warn(`skip ${p.slug} — empty industries or disciplines`);
      skipped++;
      continue;
    }
    const filePath = path.join(CASE_STUDIES_DIR, `${p.slug}.mdx`);
    if (!existsSync(filePath)) {
      console.warn(`skip ${p.slug} — file not found`);
      skipped++;
      continue;
    }
    const raw = readFileSync(filePath, "utf-8");
    const updated = injectFrontmatterFields(raw, {
      industries: p.industries,
      disciplines: p.disciplines,
    });
    if (updated === raw) {
      skipped++;
      continue;
    }
    writeFileSync(filePath, updated);
    written++;
  }
  console.log(`\nWrote ${written} files, skipped ${skipped}.`);
}

/**
 * Insert/replace `industries:` and `disciplines:` lines in the YAML
 * frontmatter block, preserving all other fields and body content.
 *
 * Insertion point: directly after the `industry:` line if present
 * (so the new fields sit next to the legacy field for diff readability),
 * otherwise after the `discipline:` line, otherwise at the end of the
 * frontmatter.
 */
function injectFrontmatterFields(
  raw: string,
  fields: { industries: string[]; disciplines: string[] }
): string {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fmMatch) return raw;
  const fmBody = fmMatch[1];
  const lines = fmBody.split(/\r?\n/);

  const renderArray = (arr: string[]) =>
    `[${arr.map((v) => `"${v}"`).join(", ")}]`;

  const newIndustriesLine = `industries: ${renderArray(fields.industries)}`;
  const newDisciplinesLine = `disciplines: ${renderArray(fields.disciplines)}`;

  // Remove any pre-existing industries:/disciplines: lines so this is idempotent.
  const filtered = lines.filter(
    (l) => !/^industries\s*:/.test(l) && !/^disciplines\s*:/.test(l)
  );

  let insertAt = filtered.findIndex((l) => /^industry\s*:/.test(l));
  if (insertAt === -1) insertAt = filtered.findIndex((l) => /^discipline\s*:/.test(l));
  if (insertAt === -1) {
    filtered.push(newIndustriesLine, newDisciplinesLine);
  } else {
    filtered.splice(insertAt + 1, 0, newIndustriesLine, newDisciplinesLine);
  }

  const newFm = filtered.join("\n");
  return raw.replace(fmMatch[0], `---\n${newFm}\n---\n`);
}

// ─── CLI ───────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const has = (flag: string) => argv.includes(flag);
  const valueOf = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
  };

  const applyJson = valueOf("--apply");
  if (applyJson) {
    await runApplyPass(applyJson);
    return;
  }

  const calibration = has("--calibration");
  const all = has("--all");
  if (!calibration && !all) {
    console.error(
      "Usage:\n" +
        "  npx tsx scripts/backfill-case-study-taxonomy.ts --calibration [--out path]\n" +
        "  npx tsx scripts/backfill-case-study-taxonomy.ts --all [--out path] [--resume path]\n" +
        "  npx tsx scripts/backfill-case-study-taxonomy.ts --apply <json-path>"
    );
    process.exit(1);
  }

  const defaultOut = calibration
    ? path.join(REPO_ROOT, "content", "case-study-taxonomy-proposals.calibration.json")
    : path.join(REPO_ROOT, "content", "case-study-taxonomy-proposals.json");
  const outPath = valueOf("--out") ?? defaultOut;
  const resumeFromPath = valueOf("--resume");

  await runProposePass({
    scope: calibration ? "calibration" : "all",
    outPath,
    resumeFromPath,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
