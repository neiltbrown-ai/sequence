import { NextRequest, NextResponse } from "next/server";
import { getAllStructures, getAllCaseStudies, getAllArticles } from "@/lib/content";

const MAX_PER_CATEGORY = 5;

function strip(s: string) { return s.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""); }

function matches(query: string, ...fields: (string | string[] | undefined)[]) {
  const q = query.toLowerCase();
  for (const field of fields) {
    if (!field) continue;
    if (Array.isArray(field)) {
      if (field.some((f) => f.toLowerCase().includes(q))) return true;
    } else {
      if (field.toLowerCase().includes(q)) return true;
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ structures: [], caseStudies: [], articles: [] });
  }

  const structures = getAllStructures()
    .filter((s) => matches(q, s.title, s.excerpt, s.tags))
    .slice(0, MAX_PER_CATEGORY)
    .map((s) => ({ title: s.title, slug: s.slug, excerpt: s.excerpt, type: "structure" as const }));

  const caseStudies = getAllCaseStudies()
    .filter((cs) => matches(q, cs.title, cs.excerpt, cs.tags, cs.discipline, cs.industry))
    .slice(0, MAX_PER_CATEGORY)
    .map((cs) => ({ title: strip(cs.title), slug: cs.slug, excerpt: cs.excerpt, type: "case-study" as const }));

  const articles = getAllArticles()
    .filter((a) => matches(q, a.title, a.excerpt, a.tags, a.category))
    .slice(0, MAX_PER_CATEGORY)
    .map((a) => ({ title: a.title, slug: a.slug, excerpt: a.excerpt, type: "article" as const }));

  return NextResponse.json({ structures, caseStudies, articles });
}
