import {
  getAllStructures,
  getAllCaseStudies,
  getAllArticles,
  type StructureMeta,
  type CaseStudyMeta,
  type ArticleMeta,
} from "@/lib/content";
import Link from "next/link";
import LibCard from "@/components/portal/lib-card";
import SectionHeader from "@/components/portal/section-header";
import DashboardWelcome from "@/components/portal/dashboard-welcome";
import DashboardInventoryCTA from "@/components/portal/dashboard-inventory-cta";
import DashboardEvalCTA from "@/components/portal/dashboard-eval-cta";
import DashboardProfileCta from "@/components/portal/dashboard-profile-cta";
import DashboardNewContent from "@/components/portal/dashboard-new-content";
import DashboardSavedPreview from "@/components/portal/dashboard-saved-preview";
import DashboardLibraryStats from "@/components/portal/dashboard-library-stats";
import DashboardUpgradeNudge from "@/components/portal/dashboard-upgrade-nudge";
import { createClient } from "@/lib/supabase/server";
import { planTier } from "@/lib/plans";
import { getRecommendations, getEditorialPicks, getNewContent, getCaseStudyRecommendationsForUser } from "@/lib/recommendations";
import type { SignalColor } from "@/types/evaluator";

const stripBr = (s: string) => s.replace(/<br\s*\/?>/gi, " ");

function DealIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 15h6" />
      <path d="M9 11h6" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Full Access Dashboard (existing layout)
   ───────────────────────────────────────────── */

async function FullAccessDashboard() {
  const structures = getAllStructures();
  const caseStudies = getAllCaseStudies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let inventoryCount = 0;
  let inventorySummary: { estimated_total_value_range: string; leverage_score: string } | null = null;
  let evalCount = 0;
  let evalSummary: { count: number; medianScore: number | null; signals: { green: number; yellow: number; red: number }; latestName: string | null; latestSignal: SignalColor | null } | null = null;

  // Profile completion tracking
  let profileCompletedCount = 0;
  const profileTotalCount = 3;

  // Profile data for case study recommendations
  let profileForRecs: { disciplines: string[]; interests: string[]; careerStage: string | null } | undefined;
  let assetsForRecs: { asset_type: string }[] = [];
  let hasCompletedAssessment = false;

  if (user) {
    const profileResult = await supabase
      .from("profiles")
      .select("disciplines, interests, career_stage")
      .eq("id", user.id)
      .maybeSingle();

    if (profileResult.data) {
      const fields = [
        { filled: (profileResult.data.disciplines ?? []).length > 0 },
        { filled: (profileResult.data.interests ?? []).length > 0 },
        { filled: !!profileResult.data.career_stage },
      ];
      profileCompletedCount = fields.filter((f) => f.filled).length;
      profileForRecs = {
        disciplines: profileResult.data.disciplines ?? [],
        interests: profileResult.data.interests ?? [],
        careerStage: profileResult.data.career_stage ?? null,
      };
    }

    const [invCountResult, invAssetsResult, evalResult, completedAssessmentResult] = await Promise.all([
      supabase
        .from("asset_inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("asset_inventory_items")
        .select("asset_type")
        .eq("user_id", user.id),
      supabase
        .from("deal_evaluations")
        .select("id, deal_name, overall_score, overall_signal")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false }),
      supabase
        .from("assessments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

    hasCompletedAssessment = (completedAssessmentResult.count || 0) > 0;

    inventoryCount = invCountResult.count || 0;
    assetsForRecs = (invAssetsResult.data as { asset_type: string }[]) || [];

    if (inventoryCount > 0) {
      const { data: analysis } = await supabase
        .from("asset_inventory_analyses")
        .select("analysis_content, status")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (analysis?.analysis_content?.summary) {
        inventorySummary = {
          estimated_total_value_range: analysis.analysis_content.summary.estimated_total_value_range,
          leverage_score: analysis.analysis_content.summary.leverage_score,
        };
      }
    }

    const evals = evalResult.data ?? [];
    evalCount = evals.length;
    if (evalCount > 0) {
      const scores = evals.map((e) => e.overall_score).filter((s): s is number => s !== null).sort((a, b) => a - b);
      const median = scores.length > 0
        ? scores.length % 2 === 1
          ? scores[Math.floor(scores.length / 2)]
          : (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
        : null;
      const signals = { green: 0, yellow: 0, red: 0 };
      for (const e of evals) {
        if (e.overall_signal === "green") signals.green++;
        else if (e.overall_signal === "red") signals.red++;
        else signals.yellow++;
      }
      evalSummary = {
        count: evalCount,
        medianScore: median,
        signals,
        latestName: evals[0]?.deal_name ?? null,
        latestSignal: (evals[0]?.overall_signal as SignalColor) ?? null,
      };
    }
  }

  // Dynamically pick top 3 case studies: portfolio assets > profile > editorial picks
  const recommended: (StructureMeta | CaseStudyMeta)[] = getCaseStudyRecommendationsForUser({
    assets: assetsForRecs,
    profile: profileForRecs,
    caseStudies,
    limit: 3,
  });

  return (
    <>
      <DashboardWelcome />

      {/* Profile completion CTA */}
      <DashboardProfileCta completedCount={profileCompletedCount} totalCount={profileTotalCount} />

      {/* Onboarding paths — hidden once user has assets or has completed assessment */}
      {inventoryCount === 0 && !hasCompletedAssessment && (
        <div className="dash-section rv rv-d1">
          <div className="adv-path-cards">
            <Link href="/evaluate" className="adv-path-card">
              <span className="adv-path-card-icon"><DealIcon /></span>
              <h3 className="adv-path-card-title">Evaluate a deal</h3>
              <p className="adv-path-card-desc">Get clarity on a specific offer or opportunity.</p>
            </Link>
            <Link href="/advisor?path=map" className="adv-path-card">
              <span className="adv-path-card-icon"><MapIcon /></span>
              <h3 className="adv-path-card-title">Map my position</h3>
              <p className="adv-path-card-desc">Understand where you stand and what to do next.</p>
            </Link>
            <Link href="/advisor" className="adv-path-card">
              <span className="adv-path-card-icon"><ExploreIcon /></span>
              <h3 className="adv-path-card-title">Just exploring</h3>
              <p className="adv-path-card-desc">Browse the framework, ask questions, see what&apos;s possible.</p>
            </Link>
          </div>
        </div>
      )}

      <DashboardInventoryCTA assetCount={inventoryCount} summary={inventorySummary} />
      <DashboardEvalCTA evalCount={evalCount} summary={evalSummary} />

      <div className="dash-section rv rv-d1">
        <SectionHeader title="Featured Case Studies" linkHref="/library/case-studies" linkLabel="Browse all" />
        <div className="card-row">
          {recommended.map((item, i) => {
            if (item.type === "structure") {
              const s = item as StructureMeta;
              return (
                <LibCard
                  key={s.slug}
                  href={`/library/structures/${s.slug}`}
                  type="Structure"
                  number={String(s.number)}
                  title={s.title}
                  description={s.excerpt}
                  tags={[s.stage, s.risk]}
                  className={`rv rv-d${i + 1}`}
                  dark
                />
              );
            }
            const cs = item as CaseStudyMeta;
            return (
              <LibCard
                key={cs.slug}
                href={`/library/case-studies/${cs.slug}`}
                type="Case Study"
                title={stripBr(cs.title)}
                description={cs.excerpt}
                tags={[cs.discipline]}
                isNew
                className={`rv rv-d${i + 1}`}
                dark
              />
            );
          })}
        </div>
      </div>

      <div className="dash-footer" />
    </>
  );
}

/* ─────────────────────────────────────────────
   Library Dashboard (content-focused)
   ───────────────────────────────────────────── */

async function LibraryDashboard() {
  const structures = getAllStructures();
  const caseStudies = getAllCaseStudies();
  const articles = getAllArticles();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile + bookmarks in parallel
  let profile: { disciplines: string[]; interests: string[]; career_stage: string | null } = {
    disciplines: [],
    interests: [],
    career_stage: null,
  };
  let bookmarks: { content_slug: string; content_type: string; created_at: string }[] = [];

  if (user) {
    const [profileResult, bookmarksResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("disciplines, interests, career_stage")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("bookmarks")
        .select("content_slug, content_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (profileResult.data) {
      profile = {
        disciplines: profileResult.data.disciplines ?? [],
        interests: profileResult.data.interests ?? [],
        career_stage: profileResult.data.career_stage ?? null,
      };
    }
    bookmarks = bookmarksResult.data ?? [];
  }

  // Profile completion tracking
  const profileFields = [
    { key: "disciplines", filled: profile.disciplines.length > 0 },
    { key: "interests", filled: profile.interests.length > 0 },
    { key: "career_stage", filled: !!profile.career_stage },
  ];
  const completedCount = profileFields.filter((f) => f.filled).length;
  const hasProfile = completedCount >= 3;

  // Bookmarked slugs for exclusion
  const bookmarkedSlugs = new Set(bookmarks.map((b) => b.content_slug));

  // Recommendations
  const recommendations = hasProfile
    ? getRecommendations(
        {
          disciplines: profile.disciplines,
          interests: profile.interests,
          careerStage: profile.career_stage,
          bookmarkedSlugs,
        },
        structures,
        caseStudies,
        articles,
        6,
      )
    : getEditorialPicks(structures, caseStudies, articles, 6);

  // New content
  const newContent = getNewContent(structures, caseStudies, articles, 3);

  // Saved items preview — resolve bookmark slugs to content metadata
  const savedItems: (StructureMeta | CaseStudyMeta | ArticleMeta)[] = [];
  for (const bm of bookmarks.slice(0, 3)) {
    if (bm.content_type === "structure") {
      const found = structures.find((s) => s.slug === bm.content_slug);
      if (found) savedItems.push(found);
    } else if (bm.content_type === "case-study") {
      const found = caseStudies.find((cs) => cs.slug === bm.content_slug);
      if (found) savedItems.push(found);
    } else if (bm.content_type === "article") {
      const found = articles.find((a) => a.slug === bm.content_slug);
      if (found) savedItems.push(found);
    }
  }

  return (
    <>
      <DashboardWelcome />

      {/* Profile completion CTA */}
      <DashboardProfileCta completedCount={completedCount} totalCount={3} />

      {/* New this week */}
      <DashboardNewContent items={newContent} />

      {/* Recommended for you */}
      <div className="dash-section rv rv-d1">
        <SectionHeader
          title={hasProfile ? "Recommended for You" : "Start Here"}
          linkHref="/library/structures"
          linkLabel="Browse all"
        />
        <div className="card-row card-row--2x3">
          {recommendations.map((rec, i) => {
            const item = rec.item;
            const reason = rec.matchReasons[0];
            if (item.type === "structure") {
              const s = item as StructureMeta;
              return (
                <LibCard
                  key={s.slug}
                  href={`/library/structures/${s.slug}`}
                  type="Structure"
                  number={String(s.number)}
                  title={s.title}
                  description={s.excerpt}
                  tags={[s.stage, s.risk]}
                  matchReason={reason}
                  className={`rv rv-d${(i % 3) + 1}`}
                />
              );
            }
            if (item.type === "case-study") {
              const cs = item as CaseStudyMeta;
              return (
                <LibCard
                  key={cs.slug}
                  href={`/library/case-studies/${cs.slug}`}
                  type="Case Study"
                  title={stripBr(cs.title)}
                  description={cs.excerpt}
                  tags={[cs.discipline]}
                  matchReason={reason}
                  className={`rv rv-d${(i % 3) + 1}`}
                />
              );
            }
            const a = item as ArticleMeta;
            return (
              <LibCard
                key={a.slug}
                href={`/library/articles/${a.slug}`}
                type="Article"
                title={stripBr(a.title)}
                description={a.excerpt}
                tags={[a.category]}
                matchReason={reason}
                className={`rv rv-d${(i % 3) + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Saved items */}
      <DashboardSavedPreview items={savedItems} totalCount={bookmarks.length} />

      {/* Library stats */}
      <DashboardLibraryStats
        structureCount={structures.length}
        caseStudyCount={caseStudies.length}
        articleCount={articles.length}
      />

      {/* Upgrade nudge */}
      <DashboardUpgradeNudge />

      <div className="dash-footer" />
    </>
  );
}

/* ─────────────────────────────────────────────
   Page — delegates to the right dashboard
   ───────────────────────────────────────────── */

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let tier = "library";
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    tier = planTier(sub?.plan);
  }

  if (tier === "library") {
    return <LibraryDashboard />;
  }

  return <FullAccessDashboard />;
}
