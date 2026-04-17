/**
 * Shared strategic-plan generator.
 *
 * Takes any combination of (assessmentId, portfolioAnalysisId) and produces
 * a StrategicRoadmap via Claude. Called by:
 *   - /api/assessment/complete       (Creative Identity completion)
 *   - /api/inventory/analyze         (Portfolio Analysis completion)
 *   - /api/assessment/regenerate     (manual regen, future)
 *
 * Returns the planId immediately and kicks off Claude generation async
 * (fire-and-forget). Callers should poll strategic_plans.status.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getAllCaseStudies, getAllStructures } from "@/lib/content";
import Anthropic from "@anthropic-ai/sdk";
import type { StrategicRoadmap } from "@/types/assessment";
import type { InventoryAnalysisContent, AssetInventoryItem } from "@/types/inventory";

// ─── System prompt ────────────────────────────────────────────────
// Kept identical to the old /api/assessment/complete prompt so voice
// stays consistent. Mentions portfolio data conditionally.

const SYSTEM_PROMPT = `You are the In Sequence strategic advisor — an AI that helps creative professionals navigate the structural restructuring of the creative economy.

You are generating a personalized Strategic Roadmap. The inputs may include:
  - Creative Identity (the member's assessment data: discipline, stage, misalignments, archetype)
  - Portfolio Analysis (an AI-generated snapshot of the member's creative assets and their leverage potential)
  - Recent Deal Evaluations (last 90 days of deals they've scored through the evaluator)

Use whatever is provided. If a signal is missing, do not invent it — focus the roadmap on the signals you have.

VOICE: Grounded, specific, economical. No filler. Humble authority earned from practitioner experience. Systems thinking with storytelling. Never generic, never preachy, never "growth mindset" clichés.

FRAMEWORK: The In Sequence progression has 4 stages:
- Stage 1: Execution Excellence ($75K-$200K) — Structures #1, #2
- Stage 2: Judgment Positioning ($200K-$500K) — Structures #3, #4
- Stage 3: Ownership Accumulation ($500K-$2M+) — Structures #5, #9, #24
- Stage 4: Capital Formation ($2M+) — Structures #12, #14

KEY PRINCIPLES:
- Actions must be STRUCTURAL and INFRASTRUCTURAL — entity formation, financial systems, legal protections, deal structures, professional advisors. NOT content strategy, marketing tactics, or growth hacks.
- Any action that involves DRAFTING or WRITING something (proposals, term sheets, agreements) should note that the In Sequence AI assistant can help generate it.
- CRITICAL: The member's discipline is in the "discipline" field and their specialization is in the "sub_discipline" field. Use these EXACT values to describe the member. Never infer the discipline from creative_mode alone.
- Adapt language to the user's creative mode vocabulary. A maker creates work; a service provider delivers for clients. Use the right vocabulary for their world.
- Misalignments are the most valuable insight. The "misalignment_flags" in the Creative Identity data are detected by our scoring engine and MUST all appear in your output. Also identify any additional gaps you see. Almost every creative professional has structural misalignments — err on the side of surfacing them.
- If Portfolio Analysis is provided, ground at least one of the three actions in a specific asset or leverage scenario from it (e.g., "License your identity-system catalog — Structure #11 — because the Portfolio analysis flagged it as high-leverage unmonetized IP.")
- The roadmap should feel like it was written by someone who understands their specific creative discipline.

RESPONSE FORMAT: Respond with valid JSON matching the StrategicRoadmap schema exactly. No markdown, no code fences, just raw JSON.`;

// ─── Public API ──────────────────────────────────────────────────

export type PlanSource = "assessment" | "portfolio" | "combined";

export interface GeneratePlanInput {
  userId: string;
  assessmentId?: string | null;
  portfolioAnalysisId?: string | null;
  /**
   * Optional context from the caller that already has the latest assessment
   * answers (avoids a re-read). If omitted, the generator loads from DB.
   */
  overrideAssessmentContext?: Record<string, unknown> | null;
  overrideArchetypeContext?: Record<string, unknown> | null;
}

export interface GeneratePlanResult {
  planId: string;
  source: PlanSource;
  /**
   * The actual long-running Claude call. Callers MUST invoke this inside
   * Next.js's `after()` so the serverless function stays alive long enough
   * for Claude to respond (30–60s typical). Returning the closure instead of
   * firing it internally prevents accidental termination when the enclosing
   * request responds before Claude finishes.
   *
   *   import { after } from "next/server";
   *   const { planId, runGeneration } = await createStrategicPlan(input);
   *   after(runGeneration);
   *   return NextResponse.json({ planId });
   */
  runGeneration: () => Promise<void>;
}

/**
 * Create a `strategic_plans` row in "generating" status and return the
 * planId plus a `runGeneration` closure that performs the Claude call.
 *
 * Caller is responsible for scheduling the closure via Next.js `after()`,
 * which keeps the serverless function alive after the response is sent.
 * See GeneratePlanResult.runGeneration docs.
 */
export async function createStrategicPlan(
  input: GeneratePlanInput
): Promise<GeneratePlanResult> {
  const { userId, assessmentId, portfolioAnalysisId } = input;

  if (!assessmentId && !portfolioAnalysisId) {
    throw new Error("createStrategicPlan: at least one input required");
  }

  const admin = createAdminClient();

  const source: PlanSource =
    assessmentId && portfolioAnalysisId
      ? "combined"
      : assessmentId
        ? "assessment"
        : "portfolio";

  // Create plan row in "generating" status
  const { data: plan, error: planErr } = await admin
    .from("strategic_plans")
    .insert({
      user_id: userId,
      assessment_id: assessmentId ?? null,
      portfolio_analysis_id: portfolioAnalysisId ?? null,
      source,
      plan_content: {},
      status: "generating",
    })
    .select("id")
    .single();

  if (planErr || !plan) {
    throw new Error(`Failed to create plan row: ${planErr?.message}`);
  }

  const planId = plan.id as string;

  const runGeneration = async () => {
    try {
      await runGenerationImpl(planId, input, admin);
    } catch (err) {
      console.error("Strategic plan generation failed:", err);
      await admin
        .from("strategic_plans")
        .update({ status: "draft", plan_content: { error: String(err) } })
        .eq("id", planId);
    }
  };

  return { planId, source, runGeneration };
}

/**
 * @deprecated Use createStrategicPlan + Next.js after() instead. This
 * fire-and-forget variant is unreliable on Vercel serverless (async work
 * may be killed when the response returns). Kept temporarily for any
 * in-flight callers; remove once all callers migrate.
 */
export async function generateStrategicPlan(
  input: GeneratePlanInput
): Promise<{ planId: string; source: PlanSource }> {
  const { planId, source, runGeneration } = await createStrategicPlan(input);
  // Fire and forget — unreliable on serverless
  runGeneration().catch((err) => {
    console.error("Strategic plan generation failed (deprecated path):", err);
  });
  return { planId, source };
}

// ─── Internal: run the actual generation ─────────────────────────

async function runGenerationImpl(
  planId: string,
  input: GeneratePlanInput,
  admin: ReturnType<typeof createAdminClient>
): Promise<void> {
  const apiKey = process.env.SEQ_ANTHROPIC_API_KEY;
  if (!apiKey) {
    await admin
      .from("strategic_plans")
      .update({
        status: "draft",
        plan_content: { error: "No API key configured" },
      })
      .eq("id", planId);
    return;
  }

  // ── Load inputs ─────────────────────────────────────────────────
  const [assessmentData, portfolioData, recentDeals] = await Promise.all([
    loadAssessment(input.assessmentId, admin),
    loadPortfolio(input.portfolioAnalysisId, input.userId, admin),
    loadRecentDealEvaluations(input.userId, admin),
  ]);

  // ── Build user prompt ───────────────────────────────────────────
  const availableCaseStudies = getAllCaseStudies().map((cs) => ({
    slug: cs.slug,
    title: cs.title.replace(/<br\s*\/?>/g, " "),
  }));
  const availableStructures = getAllStructures().map((s) => ({
    id: s.sortOrder,
    slug: s.slug,
    title: s.title.replace(/<br\s*\/?>/g, " "),
  }));

  const sections: string[] = [];

  if (assessmentData || input.overrideAssessmentContext) {
    sections.push(
      `CREATIVE IDENTITY DATA:\n${JSON.stringify(
        input.overrideAssessmentContext ?? assessmentData?.context,
        null,
        2
      )}`
    );
    if (input.overrideArchetypeContext || assessmentData?.archetype) {
      sections.push(
        `MATCHED ARCHETYPE:\n${JSON.stringify(
          input.overrideArchetypeContext ?? assessmentData?.archetype,
          null,
          2
        )}`
      );
    }
  } else {
    sections.push(
      "CREATIVE IDENTITY DATA: Not provided. Base the roadmap on Portfolio and Deal data only. Infer stage conservatively from asset signal."
    );
  }

  if (portfolioData) {
    sections.push(
      `PORTFOLIO ANALYSIS:\n${JSON.stringify(
        {
          item_count: portfolioData.itemCount,
          items: portfolioData.items.map((i) => ({
            name: i.asset_name,
            type: i.asset_type,
            ownership: i.ownership_status,
            licensing_potential: i.licensing_potential,
          })),
          analysis: portfolioData.analysis,
        },
        null,
        2
      )}`
    );
  } else {
    sections.push("PORTFOLIO ANALYSIS: Not completed yet.");
  }

  if (recentDeals.length > 0) {
    // Pre-compute patterns so Claude has explicit signals to reference
    const signalCounts = recentDeals.reduce(
      (acc, d) => {
        const s = d.overall_signal ?? "unknown";
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const typeCounts = recentDeals.reduce(
      (acc, d) => {
        const t = d.deal_type ?? "unknown";
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const flagCounts = recentDeals.reduce(
      (acc, d) => {
        for (const f of d.red_flags ?? []) {
          acc[f] = (acc[f] ?? 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );
    const recurringFlags = Object.entries(flagCounts)
      .filter(([, count]) => count >= 2)
      .map(([flag, count]) => ({ flag, count }))
      .sort((a, b) => b.count - a.count);
    const avgScore =
      recentDeals.reduce((sum, d) => sum + (d.overall_score ?? 0), 0) /
      recentDeals.filter((d) => d.overall_score != null).length || 0;

    sections.push(
      `RECENT DEAL EVALUATIONS (last 90 days, ${recentDeals.length} deals):

SUMMARY PATTERNS:
- Signal distribution: ${Object.entries(signalCounts)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}
- Deal type distribution: ${Object.entries(typeCounts)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}
- Average overall score: ${avgScore.toFixed(1)}/10
- Recurring red flags (appeared 2+ times): ${
        recurringFlags.length > 0
          ? recurringFlags.map((rf) => `${rf.flag} (×${rf.count})`).join(", ")
          : "none"
      }

DEAL LIST:
${JSON.stringify(
  recentDeals.map((d) => ({
    deal_type: d.deal_type,
    deal_name: d.deal_name,
    overall_score: d.overall_score,
    overall_signal: d.overall_signal,
    red_flags: d.red_flags,
    completed_at: d.completed_at,
  })),
  null,
  2
)}

ROADMAP INSTRUCTIONS RE: DEALS:
- If recurring red flags are present, at least one of the three actions should address the underlying structural gap (not just "next deal be more careful").
- If the signal distribution skews yellow/red, treat the roadmap as corrective.
- If there's a clear deal_type pattern, mention it in position or vision ("Your last 3 licensing deals all scored yellow on structure quality — here's how the plan addresses that").
- Don't list individual deals in the roadmap output; synthesize the pattern.`
    );
  }

  sections.push(
    `AVAILABLE CASE STUDIES (use ONLY these exact slugs):\n${availableCaseStudies
      .map((cs) => `- "${cs.slug}" (${cs.title})`)
      .join("\n")}`
  );

  sections.push(
    `AVAILABLE STRUCTURES (use ONLY these IDs and slugs):\n${availableStructures
      .map((s) => `- id:${s.id}, slug:"${s.slug}", title:"${s.title}"`)
      .join("\n")}`
  );

  sections.push(`Generate the Strategic Roadmap following this exact JSON schema:

{
  "position": {
    "detected_stage": <number 1-4>,
    "stage_name": "<string>",
    "stage_description": "<2-3 sentences>",
    "transition_readiness": "<low|moderate|high>",
    "industry_context": "<1-2 sentences about their specific discipline>",
    "misalignments": [{"flag": "<flag_key>", "what_its_costing": "<string>", "why_it_matters": "<string>"}]
  },
  "misalignment_detail": [{"flag": "<flag_key>", "what_its_costing": "<string>", "why_it_matters": "<string>"}],
  "actions": [
    {"order": 1, "type": "foundation", "title": "<string>", "what": "<string>", "why": "<string>", "how": "<string>", "timeline": "<string>", "done_signal": "<string>", "ai_assist": {"type": "<draft|review|generate>", "description": "<string>"} or null, "providers": [{"name": "<string>", "url": "<string>", "type": "platform|service|advisor"}] or null},
    {"order": 2, "type": "positioning", ...same fields...},
    {"order": 3, "type": "momentum", ...same fields...}
  ],
  "vision": {
    "twelve_month_target": "<string>",
    "three_year_horizon": "<string>",
    "transition_signals": ["<string>", ...],
    "structures_to_study": [<structure_id numbers>],
    "relevant_cases": ["<case_study_slug>", ...]
  },
  "library": {
    "recommended_structures": [{"id": <number>, "slug": "<string>", "title": "<string>", "why": "<string>"}],
    "recommended_cases": [{"slug": "<string>", "title": "<string>", "why": "<string>"}],
    "reading_path": ["Structure #<N>: <Title>", "<CaseStudyName> case study", ...]
  },
  "entity_structure": {
    "parent": "<recommended parent entity name>",
    "children": [{"name": "<entity name>", "purpose": "<one-line purpose>"}],
    "note": "<optional implementation note>"
  },
  "value_flywheel": {
    "nodes": [{"label": "<structure or concept name>", "subtitle": "<short descriptor>", "structure_id": <optional_number>}],
    "edges": [{"from": <node_index>, "to": <node_index>}],
    "center_label": "<core compounding concept>",
    "center_subtitle": "<optional qualifier>"
  }
}

Return ONLY valid JSON.`);

  const userPrompt = sections.join("\n\n");

  try {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    let roadmap: StrategicRoadmap;
    try {
      roadmap = JSON.parse(textBlock.text);
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON response from Claude");
      roadmap = JSON.parse(jsonMatch[0]);
    }

    const autoRelease = process.env.ASSESSMENT_AUTO_RELEASE === "true";
    const status = autoRelease ? "published" : "review";

    await admin
      .from("strategic_plans")
      .update({
        plan_content: roadmap,
        status,
        published_at: autoRelease ? new Date().toISOString() : null,
      })
      .eq("id", planId);
  } catch (err) {
    console.error("Claude API error:", err);
    await admin
      .from("strategic_plans")
      .update({
        status: "draft",
        plan_content: { error: String(err) },
      })
      .eq("id", planId);
  }
}

// ─── Loaders ─────────────────────────────────────────────────────

async function loadAssessment(
  assessmentId: string | null | undefined,
  admin: ReturnType<typeof createAdminClient>
): Promise<{
  context: Record<string, unknown>;
  archetype: Record<string, unknown> | null;
} | null> {
  if (!assessmentId) return null;
  const { data } = await admin
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .maybeSingle();
  if (!data) return null;
  return {
    context: {
      discipline: data.discipline,
      sub_discipline: data.sub_discipline,
      creative_mode: data.creative_mode,
      detected_stage: data.detected_stage,
      stage_score: data.stage_score,
      transition_readiness: data.transition_readiness,
      misalignment_flags: data.misalignment_flags || [],
      income_range: data.income_range,
      income_structure: data.income_structure,
      what_they_pay_for: data.what_they_pay_for,
      equity_positions: data.equity_positions,
      demand_level: data.demand_level,
      business_structure: data.business_structure,
      energy_ranking: data.energy_ranking,
      drains: data.drains,
      dream_response: data.dream_response,
      three_year_goal: data.three_year_goal,
      risk_tolerance: data.risk_tolerance,
      constraints: data.constraints,
      specific_question: data.specific_question,
      stage_questions: data.stage_questions,
      industry_questions: data.industry_questions,
      discernment_questions: data.discernment_questions,
    },
    archetype: data.archetype_primary
      ? {
          primary: data.archetype_primary,
          secondary: data.archetype_secondary,
        }
      : null,
  };
}

async function loadPortfolio(
  portfolioAnalysisId: string | null | undefined,
  userId: string,
  admin: ReturnType<typeof createAdminClient>
): Promise<{
  itemCount: number;
  items: AssetInventoryItem[];
  analysis: InventoryAnalysisContent | null;
} | null> {
  // If a specific analysisId is given, load that one.
  // Otherwise, load the most recent completed analysis for this user (for
  // cases where Creative Identity is the trigger but Portfolio data exists).
  type AnalysisRow = {
    id: string;
    analysis_content: unknown;
    status: string;
  };
  let analysisRow: AnalysisRow | null = null;

  if (portfolioAnalysisId) {
    const { data } = await admin
      .from("asset_inventory_analyses")
      .select("id, analysis_content, status")
      .eq("id", portfolioAnalysisId)
      .maybeSingle();
    analysisRow = (data as AnalysisRow | null) ?? null;
  } else {
    const { data } = await admin
      .from("asset_inventory_analyses")
      .select("id, analysis_content, status")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    analysisRow = (data as AnalysisRow | null) ?? null;
  }

  const { data: items } = await admin
    .from("asset_inventory_items")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if ((!items || items.length === 0) && !analysisRow) return null;

  return {
    itemCount: items?.length ?? 0,
    items: (items as AssetInventoryItem[]) ?? [],
    analysis: analysisRow
      ? (analysisRow.analysis_content as InventoryAnalysisContent)
      : null,
  };
}

async function loadRecentDealEvaluations(
  userId: string,
  admin: ReturnType<typeof createAdminClient>
): Promise<
  Array<{
    deal_type: string | null;
    deal_name: string | null;
    overall_score: number | null;
    overall_signal: string | null;
    red_flags: string[] | null;
    completed_at: string | null;
  }>
> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin
    .from("deal_evaluations")
    .select(
      "deal_type, deal_name, overall_score, overall_signal, red_flags, completed_at"
    )
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("completed_at", ninetyDaysAgo)
    .order("completed_at", { ascending: false })
    .limit(10);
  return (data ?? []) as Array<{
    deal_type: string | null;
    deal_name: string | null;
    overall_score: number | null;
    overall_signal: string | null;
    red_flags: string[] | null;
    completed_at: string | null;
  }>;
}
