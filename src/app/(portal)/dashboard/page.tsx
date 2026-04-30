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
import DashboardRoadmapCTA from "@/components/portal/dashboard-roadmap-cta";
import DashboardNewContent from "@/components/portal/dashboard-new-content";
import DashboardSavedPreview from "@/components/portal/dashboard-saved-preview";
import DashboardLibraryStats from "@/components/portal/dashboard-library-stats";
import DashboardUpgradeNudge from "@/components/portal/dashboard-upgrade-nudge";
import {
  DashValuationCard,
  DashRiskFlagsCard,
  DashDealsEvaluatedCard,
  type RecentDealRow,
} from "@/components/portal/dashboard-cards";
import { createClient } from "@/lib/supabase/server";
import { planTier } from "@/lib/plans";
import { getRecommendations, getEditorialPicks, getNewContent, getCaseStudyRecommendationsForUser } from "@/lib/recommendations";
import type { SignalColor } from "@/types/evaluator";
import type { PlanSource, StageNumber, StrategicRoadmap } from "@/types/assessment";
import type { InventoryAnalysisContent } from "@/types/inventory";

const stripBr = (s: string) => s.replace(/<br\s*\/?>/gi, " ");

/* (DealIcon / MapIcon / ExploreIcon — removed with the onboarding
   path cards; see Batch E. Portfolio is now the canonical first step.) */

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
  let inventoryAnalysis: InventoryAnalysisContent | null = null;
  let recentDeals: RecentDealRow[] = [];
  let evalCount = 0;
  let evalSummary: { count: number; medianScore: number | null; signals: { green: number; yellow: number; red: number }; latestName: string | null; latestSignal: SignalColor | null } | null = null;

  // Profile completion tracking
  let profileCompletedCount = 0;
  const profileTotalCount = 3;

  // Profile data for case study recommendations
  let profileForRecs: { disciplines: string[]; interests: string[]; careerStage: string | null } | undefined;
  let assetsForRecs: { asset_type: string }[] = [];
  let hasCompletedAssessment = false;

  // Roadmap summary for dashboard CTA
  let roadmapStatus:
    | "generating"
    | "draft"
    | "review"
    | "published"
    | null = null;
  let roadmapStage: StageNumber | null = null;
  let roadmapStageName: string | null = null;
  let roadmapSource: PlanSource | null = null;
  let roadmapActionsCompleted = 0;

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

    // Load the user's latest strategic plan so the dashboard CTA can
    // reflect whether a roadmap exists + its current state.
    const [planResult, actionsResult] = await Promise.all([
      supabase
        .from("strategic_plans")
        .select("id, status, source, plan_content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("assessment_actions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);
    if (planResult.data) {
      roadmapStatus = planResult.data.status as typeof roadmapStatus;
      roadmapSource = (planResult.data.source as PlanSource) || null;
      const content = planResult.data.plan_content as StrategicRoadmap | null;
      if (content?.position) {
        roadmapStage = (content.position.detected_stage as StageNumber) || null;
        roadmapStageName = content.position.stage_name || null;
      }
    }
    roadmapActionsCompleted = actionsResult.data?.length || 0;

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
        inventoryAnalysis = analysis.analysis_content as InventoryAnalysisContent;
        inventorySummary = {
          estimated_total_value_range: analysis.analysis_content.summary.estimated_total_value_range,
          leverage_score: analysis.analysis_content.summary.leverage_score,
        };
      }
    }

    // Last 5 individual deals — fuels the new "Deals Evaluated" list
    // card (distinct from the existing aggregated DashboardEvalCTA).
    const { data: recentDealsData } = await supabase
      .from("deal_evaluations")
      .select("id, deal_name, deal_type, overall_signal, overall_score, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5);
    recentDeals = (recentDealsData ?? []) as RecentDealRow[];

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

      {/* Portfolio State — three cards surfacing actual data the member
          has generated. Promoted to the top of the dashboard so active
          users land on their portfolio status first; CTAs below act as
          "what's next" navigation rather than the entry point.

          Layout: Valuation+Drivers card spans full width on row 1.
          Risk Flags + Deals Evaluated render 2-up on row 2. Each card
          conditionally renders so users with partial data still see a
          coherent layout. */}
      {(inventoryAnalysis || recentDeals.length > 0) && (
        <div className="dash-section rv rv-d1">
          <SectionHeader title="Portfolio State" />
          {inventoryAnalysis && (
            <DashValuationCard
              valuationRange={inventoryAnalysis.summary.estimated_total_value_range}
              leverageScore={inventoryAnalysis.summary.leverage_score}
              leverageRationale={inventoryAnalysis.summary.leverage_rationale}
              drivers={inventoryAnalysis.value_drivers}
            />
          )}
          {((inventoryAnalysis?.risks && inventoryAnalysis.risks.length > 0) ||
            recentDeals.length > 0) && (
            <div className="dash-portfolio-row">
              {inventoryAnalysis?.risks && inventoryAnalysis.risks.length > 0 && (
                <DashRiskFlagsCard risks={inventoryAnalysis.risks} />
              )}
              {recentDeals.length > 0 && (
                <DashDealsEvaluatedCard deals={recentDeals} />
              )}
            </div>
          )}
        </div>
      )}

      {/* CTA order mirrors the member's journey:
             1. Portfolio (keystone input — Audit your assets)
             2. Roadmap (primary output — appears once a plan exists)
             3. Evaluate (ongoing input — refreshes the roadmap)
             4. Creative Identity (optional personalization — only shown
                until completed, auto-hides after)
          Previous onboarding "paths" cards have been removed — Portfolio
          is now the canonical first step, so offering three alternative
          entry points was off-message. */}
      {/* Asset Inventory CTA — only when no portfolio analysis exists.
          Once an analysis exists, the Portfolio State Valuation card
          subsumes this CTA's information and adds drivers + actions. */}
      {!inventoryAnalysis && (
        <DashboardInventoryCTA assetCount={inventoryCount} summary={inventorySummary} />
      )}

      <DashboardRoadmapCTA
        status={roadmapStatus}
        stage={roadmapStage}
        stageName={roadmapStageName}
        source={roadmapSource}
        actionsCompleted={roadmapActionsCompleted}
        actionsTotal={3}
      />

      {/* Deal Evaluator CTA — only when no deals evaluated yet. Once any
          deal exists, the Portfolio State Deals Evaluated card subsumes
          this CTA with per-deal detail. */}
      {recentDeals.length === 0 && (
        <DashboardEvalCTA evalCount={evalCount} summary={evalSummary} />
      )}

      <DashboardProfileCta creativeIdentityComplete={hasCompletedAssessment} />

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
                coverImage={cs.coverImage || cs.heroImage}
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

  let hasCompletedAssessment = false;

  if (user) {
    const [profileResult, bookmarksResult, completedAssessmentResult] =
      await Promise.all([
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
        supabase
          .from("assessments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "completed"),
      ]);

    if (profileResult.data) {
      profile = {
        disciplines: profileResult.data.disciplines ?? [],
        interests: profileResult.data.interests ?? [],
        career_stage: profileResult.data.career_stage ?? null,
      };
    }
    bookmarks = bookmarksResult.data ?? [];
    hasCompletedAssessment = (completedAssessmentResult.count || 0) > 0;
  }

  // Profile completion tracking (still used for recommendations)
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

      {/* Creative Identity CTA — hidden once CI is completed */}
      <DashboardProfileCta creativeIdentityComplete={hasCompletedAssessment} />

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
                  dark
                  coverImage={cs.coverImage || cs.heroImage}
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
