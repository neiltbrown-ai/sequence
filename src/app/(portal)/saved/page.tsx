import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getAllStructures,
  getAllCaseStudies,
  getAllArticles,
} from "@/lib/content";
import SavedItems, { type SavedItem } from "@/components/portal/saved-items";
import type { StrategicRoadmap } from "@/types/assessment";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  /* ── Fetch bookmarks ── */
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("content_type, slug, created_at")
    .order("created_at", { ascending: false });

  /* ── Load MDX metadata ── */
  const structures = getAllStructures();
  const caseStudies = getAllCaseStudies();
  const articles = getAllArticles();

  /* ── Join bookmarks with MDX metadata ── */
  const savedItems = (bookmarks || [])
    .map((b): SavedItem | null => {
      if (b.content_type === "structure") {
        const meta = structures.find((s) => s.slug === b.slug);
        if (!meta) return null;
        return {
          contentType: "structure" as const,
          slug: b.slug,
          title: meta.title,
          description: meta.excerpt,
          tags: [meta.stage, meta.risk].filter(Boolean),
          href: `/library/structures/${meta.slug}`,
          number: meta.number,
          savedAt: b.created_at,
        };
      }
      if (b.content_type === "case_study") {
        const meta = caseStudies.find((c) => c.slug === b.slug);
        if (!meta) return null;
        return {
          contentType: "case_study" as const,
          slug: b.slug,
          title: meta.title,
          description: meta.excerpt,
          tags: [meta.discipline, ...(meta.tags || [])].filter(Boolean),
          href: `/library/case-studies/${meta.slug}`,
          savedAt: b.created_at,
        };
      }
      if (b.content_type === "article") {
        const meta = articles.find((a) => a.slug === b.slug);
        if (!meta) return null;
        return {
          contentType: "article" as const,
          slug: b.slug,
          title: meta.title,
          description: meta.excerpt,
          tags: meta.tags || [],
          href: `/library/articles/${meta.slug}`,
          savedAt: b.created_at,
        };
      }
      return null;
    })
    .filter((item): item is SavedItem => item !== null);

  /* ── If empty, fetch roadmap recommendations ── */
  type Recommendation = {
    slug: string;
    title: string;
    why: string;
    href: string;
    contentType: "structure" | "case_study" | "article";
  };
  let recommendations: Recommendation[] = [];

  if (savedItems.length === 0) {
    const { data: plan } = await supabase
      .from("strategic_plans")
      .select("plan_content")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (plan?.plan_content) {
      const roadmap = plan.plan_content as StrategicRoadmap;
      const recStructures = (roadmap.library?.recommended_structures || []).map(
        (s) => ({
          slug: structures.find((st) => st.number === s.id)?.slug || "",
          title: s.title,
          why: s.why,
          href: `/library/structures/${structures.find((st) => st.number === s.id)?.slug || ""}`,
          contentType: "structure" as const,
        })
      );
      const recCases = (roadmap.library?.recommended_cases || []).map((c) => ({
        slug: c.slug,
        title: c.title,
        why: c.why,
        href: `/library/case-studies/${c.slug}`,
        contentType: "case_study" as const,
      }));
      recommendations = [...recStructures, ...recCases].filter((r) => r.slug);
    }
  }

  return <SavedItems items={savedItems} recommendations={recommendations} />;
}
