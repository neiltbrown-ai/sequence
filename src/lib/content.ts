import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  isIndustrySlug,
  isDisciplineSlug,
  type IndustrySlug,
  type DisciplineSlug,
} from "./case-studies/taxonomy";

/* ─────────────────────────────────────────────
   Content utility layer — reads MDX files from
   /content and returns typed frontmatter + body.
   Used by Server Components at build/request time.
   ───────────────────────────────────────────── */

const CONTENT_DIR = path.join(process.cwd(), "content");

// ── Types ────────────────────────────────────

export interface StructureMeta {
  title: string;
  slug: string;
  type: "structure";
  subtype: "business-model" | "compensation";
  number: number;
  risk: string;
  stage: string;
  excerpt: string;
  tags: string[];
  access: "public" | "member";
  relatedStructures?: number[];
  relatedCaseStudies?: string[];
  coverImage?: string;
  sortOrder: number;
  published: boolean;
  updatedAt: string;
  /* Phase 6 extensions for structure detail page */
  category?: string;
  tagline?: string;
  stats?: Array<{ label: string; value: string }>;
  sections?: Array<{ id: string; label: string }>;
}

export interface CaseStudyMeta {
  title: string;
  slug: string;
  type: "case-study";
  number: number;
  /** Human-readable display string for the case-study detail page header.
   *  Freeform; describes the practitioner's specific configuration
   *  (e.g. "Music Production / Strategic Direction"). */
  discipline: string;
  /** Canonical industry slugs from `case-studies/taxonomy.ts`.
   *  1-2 typically (max 3); first item is the primary. */
  industries: IndustrySlug[];
  /** Canonical discipline slugs from `case-studies/taxonomy.ts`.
   *  1-3 typically (max 4); most-prominent first. */
  disciplines: DisciplineSlug[];
  excerpt: string;
  structures: number[];
  tags: string[];
  access: "public" | "member";
  coverImage?: string;
  heroImage?: string;
  heroCredit?: string;
  heroAlt?: string;
  heroPosition?: string;
  secondaryImage?: string;
  secondaryAlt?: string;
  secondaryCredit?: string;
  secondaryPosition?: string;
  subtitle?: string;
  readTime?: number;
  stats?: Array<{ value: string; label: string; estimated?: boolean }>;
  sections?: Array<{ id: string; label: string }>;
  featured?: boolean;
  published: boolean;
  updatedAt: string;
  publishedAt?: string;
  confidence?: "disclosed" | "mixed" | "inferred";
}

export interface ArticleImage {
  src: string;
  alt: string;
  type: "breakout" | "fullwidth";
  caption?: string;
  credit?: string;
}

export interface ArticleMeta {
  title: string;
  slug: string;
  type: "article";
  category: string;
  tag: string;
  date: string;
  excerpt: string;
  subtitle?: string;
  readTime: number;
  author: string;
  authorImage?: string;
  authorBio?: string;
  heroImage?: string;
  heroCredit?: string;
  images?: ArticleImage[];
  tags: string[];
  access: "public" | "member";
  relatedArticles?: string[];
  relatedStructures?: number[];
  published: boolean;
  updatedAt: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image: string;
}

// ── Generic readers ──────────────────────────

function readDirUncached(subdir: string) {
  const dir = path.join(CONTENT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data, content } = matter(raw);
      return { frontmatter: data, content, filename };
    });
}

// Content files are static for the lifetime of a deployment, so parse each
// subdir once per process and reuse it across requests — list pages otherwise
// re-read + re-parse 100+ MDX files on every render. Bypassed in development so
// authoring changes show up on refresh without restarting the dev server.
const _dirCache = new Map<string, ReturnType<typeof readDirUncached>>();

function readDir(subdir: string) {
  if (process.env.NODE_ENV !== "production") {
    return readDirUncached(subdir);
  }
  const cached = _dirCache.get(subdir);
  if (cached) return cached;
  const parsed = readDirUncached(subdir);
  _dirCache.set(subdir, parsed);
  return parsed;
}

// ── Case-study taxonomy validator ────────────
// Invalid slugs are loud in dev (throw), log-only in production.
// Missing arrays are tolerated during the Phase 1 migration window;
// once backfill lands, every case will have both populated.

const STRICT_TAXONOMY = process.env.NODE_ENV !== "production";

function validateCaseStudyTaxonomy(meta: {
  slug?: string;
  industries?: unknown;
  disciplines?: unknown;
}) {
  const errors: string[] = [];
  const slug = meta.slug ?? "<unknown>";

  if (Array.isArray(meta.industries)) {
    for (const v of meta.industries) {
      if (typeof v !== "string" || !isIndustrySlug(v)) {
        errors.push(`unknown industry slug "${v}"`);
      }
    }
  }
  if (Array.isArray(meta.disciplines)) {
    for (const v of meta.disciplines) {
      if (typeof v !== "string" || !isDisciplineSlug(v)) {
        errors.push(`unknown discipline slug "${v}"`);
      }
    }
  }

  if (!errors.length) return;
  const msg = `[case-study taxonomy] ${slug}: ${errors.join("; ")}`;
  if (STRICT_TAXONOMY) {
    throw new Error(msg);
  }
  // eslint-disable-next-line no-console
  console.warn(msg);
}

// ── Structures ───────────────────────────────

export function getAllStructures(filter?: {
  subtype?: "business-model" | "compensation";
}): StructureMeta[] {
  const items = readDir("structures")
    .filter((i) => i.frontmatter.published !== false)
    .map((i) => i.frontmatter as StructureMeta);

  const filtered = filter?.subtype
    ? items.filter((s) => s.subtype === filter.subtype)
    : items;

  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getStructureBySlug(slug: string) {
  const items = readDir("structures");
  let item = items.find((i) => i.frontmatter.slug === slug);
  // Fallback: strip leading number prefix (e.g. "02-retainer-bonus-model" → "retainer-bonus-model")
  if (!item) {
    const stripped = slug.replace(/^\d+-/, "");
    item = items.find((i) => i.frontmatter.slug === stripped);
  }
  if (!item) return null;
  return {
    frontmatter: item.frontmatter as StructureMeta,
    content: item.content,
  };
}

/** Lightweight listing data for the structures table component */
export function getStructuresTableData() {
  const models = getAllStructures({ subtype: "business-model" }).map((s) => ({
    num: `[${String(s.number).padStart(2, "0")}/${s.subtype === "business-model" ? "16" : "35"}]`,
    title: s.title,
    risk: s.risk,
    desc: s.excerpt,
    tag: s.stage,
  }));

  const deals = getAllStructures({ subtype: "compensation" }).map((s) => ({
    num: `[${String(s.number).padStart(2, "0")}/35]`,
    title: s.title,
    risk: s.risk,
    desc: s.excerpt,
    tag: s.stage,
  }));

  return { models, deals };
}

// ── Case Studies ─────────────────────────────

export function getAllCaseStudies(): CaseStudyMeta[] {
  return readDir("case-studies")
    .filter((i) => i.frontmatter.published !== false)
    .map((i) => {
      validateCaseStudyTaxonomy(i.frontmatter);
      return i.frontmatter as CaseStudyMeta;
    })
    .sort((a, b) => a.number - b.number);
}

export function getFeaturedCaseStudies(limit = 4): CaseStudyMeta[] {
  const all = getAllCaseStudies().filter((cs) => cs.coverImage);
  // Shuffle the full pool so different case studies appear on each render
  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, limit);
}

export function getCaseStudyBySlug(slug: string) {
  const items = readDir("case-studies");
  const item = items.find((i) => i.frontmatter.slug === slug);
  if (!item) return null;
  validateCaseStudyTaxonomy(item.frontmatter);
  return {
    frontmatter: item.frontmatter as CaseStudyMeta,
    content: item.content,
  };
}

// ── Articles ─────────────────────────────────

export function getAllArticles(filter?: {
  category?: string;
}): ArticleMeta[] {
  const items = readDir("articles")
    .filter((i) => i.frontmatter.published !== false)
    .map((i) => i.frontmatter as ArticleMeta);

  const filtered = filter?.category
    ? items.filter((a) => a.category === filter.category)
    : items;

  // Sort by date descending (newest first)
  return filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getArticleBySlug(slug: string) {
  const items = readDir("articles");
  const item = items.find((i) => i.frontmatter.slug === slug);
  if (!item) return null;
  return {
    frontmatter: item.frontmatter as ArticleMeta,
    content: item.content,
  };
}

// ── Testimonials ─────────────────────────────

export function getTestimonials(): Testimonial[] {
  const filePath = path.join(CONTENT_DIR, "data", "testimonials.json");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Testimonial[];
}

// ── New content count (last 7 days) ──────────

export function getNewContentCount(days: number = 7): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  let count = 0;

  const isRecent = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const t = Date.parse(dateStr);
    return !isNaN(t) && t > cutoff;
  };

  for (const s of getAllStructures()) {
    if (isRecent(s.updatedAt)) count++;
  }
  for (const c of getAllCaseStudies()) {
    if (isRecent(c.updatedAt)) count++;
  }
  for (const a of getAllArticles()) {
    if (isRecent(a.updatedAt) || isRecent(a.date)) count++;
  }

  return count;
}
