import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
}

export interface CaseStudyMeta {
  title: string;
  slug: string;
  type: "case-study";
  number: number;
  discipline: string;
  excerpt: string;
  structures: number[];
  tags: string[];
  access: "public" | "member";
  coverImage?: string;
  published: boolean;
  updatedAt: string;
}

export interface ArticleMeta {
  title: string;
  slug: string;
  type: "article";
  category: string;
  tag: string;
  date: string;
  excerpt: string;
  readTime: number;
  author: string;
  authorImage?: string;
  authorBio?: string;
  heroImage?: string;
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

function readDir(subdir: string) {
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
  const item = items.find((i) => i.frontmatter.slug === slug);
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
    .map((i) => i.frontmatter as CaseStudyMeta)
    .sort((a, b) => a.number - b.number);
}

export function getCaseStudyBySlug(slug: string) {
  const items = readDir("case-studies");
  const item = items.find((i) => i.frontmatter.slug === slug);
  if (!item) return null;
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
