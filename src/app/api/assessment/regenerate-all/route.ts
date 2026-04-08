import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * TEMP admin endpoint: triggers regeneration for all published plans.
 * Only accessible by the authenticated user — call POST /api/assessment/regenerate-all
 * Each plan is regenerated via the /api/assessment/regenerate endpoint.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get all published plans
  const { data: plans, error } = await admin
    .from("strategic_plans")
    .select("id, user_id")
    .eq("status", "published");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!plans || plans.length === 0) {
    return NextResponse.json({ message: "No plans to regenerate", count: 0 });
  }

  // Trigger regeneration for each plan by calling the regenerate endpoint
  // We do this sequentially to avoid overwhelming the Claude API
  const results: { planId: string; userId: string; status: string }[] = [];

  for (const plan of plans) {
    try {
      // Call the regenerate endpoint internally by importing the logic
      // Instead, we'll just mark as generating and queue them
      // For simplicity, use fetch to our own endpoint (requires the user's auth)
      // But since we're admin, let's just inline the regeneration

      // Mark as generating
      await admin
        .from("strategic_plans")
        .update({ status: "generating" })
        .eq("id", plan.id);

      results.push({ planId: plan.id, userId: plan.user_id, status: "queued" });
    } catch (err) {
      results.push({ planId: plan.id, userId: plan.user_id, status: `error: ${err}` });
    }
  }

  // Now actually regenerate each one
  // Import the regeneration logic inline
  const { computeStageScore } = await import("@/lib/assessment/scoring");
  const { matchArchetype } = await import("@/lib/assessment/archetype-matching");
  const { getArchetypeById } = await import("@/lib/assessment/archetypes");
  const { getAllCaseStudies, getAllStructures } = await import("@/lib/content");
  const Anthropic = (await import("@anthropic-ai/sdk")).default;

  const apiKey = process.env.SEQ_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key", results }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });

  const SYSTEM_PROMPT = `You are the In Sequence strategic advisor — an AI that helps creative professionals navigate the structural restructuring of the creative economy.

You are generating a personalized Strategic Roadmap for a member who just completed the In Sequence assessment.

VOICE: Grounded, specific, economical. No filler. Humble authority earned from practitioner experience. Systems thinking with storytelling. Never generic, never preachy, never "growth mindset" clichés.

FRAMEWORK: The In Sequence progression has 4 stages:
- Stage 1: Execution Excellence ($75K-$200K) — Structures #1, #2
- Stage 2: Judgment Positioning ($200K-$500K) — Structures #3, #4
- Stage 3: Ownership Accumulation ($500K-$2M+) — Structures #5, #9, #24
- Stage 4: Capital Formation ($2M+) — Structures #12, #14

KEY PRINCIPLES:
- Actions must be STRUCTURAL and INFRASTRUCTURAL — entity formation, financial systems, legal protections, deal structures, professional advisors. NOT content strategy, marketing tactics, or growth hacks.
- Any action that involves DRAFTING or WRITING something (proposals, term sheets, agreements) should note that the In Sequence AI assistant can help generate it.
- CRITICAL: The member's discipline is in the "discipline" field and their specialization is in the "sub_discipline" field. Use these EXACT values to describe the member.
- Adapt language to the user's creative mode vocabulary.
- Misalignments are the most valuable insight.
- The roadmap should feel like it was written by someone who understands their specific creative discipline.

RESPONSE FORMAT: Respond with valid JSON matching the StrategicRoadmap schema exactly. No markdown, no code fences, just raw JSON.`;

  const availableCaseStudies = getAllCaseStudies().map((cs) => ({ slug: cs.slug, title: cs.title.replace(/<br\s*\/?>/g, " ") }));
  const availableStructures = getAllStructures().map((s) => ({ id: s.sortOrder, slug: s.slug, title: s.title.replace(/<br\s*\/?>/g, " ") }));

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    try {
      // Load assessment for this plan
      const { data: planData } = await admin
        .from("strategic_plans")
        .select("assessment_id")
        .eq("id", r.planId)
        .single();

      if (!planData) { r.status = "error: no plan data"; continue; }

      const { data: assessment } = await admin
        .from("assessments")
        .select("*")
        .eq("id", planData.assessment_id)
        .single();

      if (!assessment) { r.status = "error: no assessment"; continue; }

      const answers = {
        discipline: assessment.discipline,
        sub_discipline: assessment.sub_discipline,
        creative_mode: assessment.creative_mode,
        energy_ranking: assessment.energy_ranking,
        drains: assessment.drains,
        dream_response: assessment.dream_response,
        income_range: assessment.income_range,
        income_structure: assessment.income_structure,
        what_they_pay_for: assessment.what_they_pay_for,
        equity_positions: assessment.equity_positions,
        demand_level: assessment.demand_level,
        business_structure: assessment.business_structure,
        stage_questions: assessment.stage_questions,
        industry_questions: assessment.industry_questions,
        discernment_questions: assessment.discernment_questions,
        three_year_goal: assessment.three_year_goal,
        risk_tolerance: assessment.risk_tolerance,
        constraints: assessment.constraints,
        specific_question: assessment.specific_question,
      };

      const stageResult = computeStageScore(answers);
      const archetypeResult = matchArchetype(
        stageResult.detectedStage,
        stageResult.stageScore,
        (assessment.creative_mode) || "hybrid",
        stageResult.misalignmentFlags
      );
      const primaryArchetype = archetypeResult.primary;
      const secondaryArchetype = archetypeResult.secondary
        ? getArchetypeById(archetypeResult.secondary.id)
        : null;

      const assessmentContext = {
        discipline: answers.discipline,
        sub_discipline: answers.sub_discipline,
        creative_mode: answers.creative_mode,
        detected_stage: stageResult.detectedStage,
        stage_score: stageResult.stageScore,
        transition_readiness: stageResult.transitionReadiness,
        misalignment_flags: stageResult.misalignmentFlags,
        income_range: answers.income_range,
        income_structure: answers.income_structure,
        what_they_pay_for: answers.what_they_pay_for,
        equity_positions: answers.equity_positions,
        demand_level: answers.demand_level,
        business_structure: answers.business_structure,
        energy_ranking: answers.energy_ranking,
        drains: answers.drains,
        dream_response: answers.dream_response,
        three_year_goal: answers.three_year_goal,
        risk_tolerance: answers.risk_tolerance,
        constraints: answers.constraints,
        specific_question: answers.specific_question,
        stage_questions: answers.stage_questions,
        industry_questions: answers.industry_questions,
        discernment_questions: answers.discernment_questions,
      };

      const userPrompt = `MEMBER ASSESSMENT DATA:
${JSON.stringify(assessmentContext, null, 2)}

MATCHED ARCHETYPE:
${JSON.stringify({ primary: primaryArchetype, secondary: secondaryArchetype || undefined }, null, 2)}

AVAILABLE CASE STUDIES (use ONLY these exact slugs):
${availableCaseStudies.map((cs) => `- "${cs.slug}" (${cs.title})`).join("\n")}

AVAILABLE STRUCTURES (use ONLY these IDs and slugs):
${availableStructures.map((st) => `- id:${st.id}, slug:"${st.slug}", title:"${st.title}"`).join("\n")}

Generate the Strategic Roadmap following this exact JSON schema:

{
  "position": { "detected_stage": <1-4>, "stage_name": "<string>", "stage_description": "<string>", "transition_readiness": "<low|moderate|high>", "industry_context": "<string>", "misalignments": [{"flag": "<string>", "what_its_costing": "<string>", "why_it_matters": "<string>"}] },
  "misalignment_detail": [{"flag": "<string>", "what_its_costing": "<string>", "why_it_matters": "<string>"}],
  "actions": [{"order": 1, "type": "foundation", "title": "<string>", "what": "<string>", "why": "<string>", "how": "<string>", "timeline": "<string>", "done_signal": "<string>", "ai_assist": {"type": "<draft|review|generate>", "description": "<string>"} or null, "providers": [{"name": "<string>", "url": "<string>", "type": "platform|service|advisor"}] or null}, ...],
  "vision": { "twelve_month_target": "<string>", "three_year_horizon": "<string>", "transition_signals": ["<string>"], "structures_to_study": [<ids>], "relevant_cases": ["<slugs>"] },
  "library": { "recommended_structures": [{"id": <n>, "slug": "<string>", "title": "<string>", "why": "<string>"}], "recommended_cases": [{"slug": "<string>", "title": "<string>", "why": "<string>"}], "reading_path": ["<string>"] },
  "entity_structure": { "parent": "<string>", "children": [{"name": "<string>", "purpose": "<string>"}], "note": "<string>" },
  "value_flywheel": { "nodes": [{"label": "<string>", "subtitle": "<string>", "structure_id": <n>}], "edges": [{"from": <n>, "to": <n>}], "center_label": "<string>", "center_subtitle": "<string>" }
}

entity_structure: Recommend the simplest entity structure appropriate for this member's stage and goals.
value_flywheel: Show how 3–6 of the recommended structures or actions compound together.

Return ONLY valid JSON.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        r.status = "error: no text response";
        await admin.from("strategic_plans").update({ status: "published" }).eq("id", r.planId);
        continue;
      }

      let roadmap;
      try {
        roadmap = JSON.parse(textBlock.text);
      } catch {
        const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          roadmap = JSON.parse(jsonMatch[0]);
        } else {
          r.status = "error: invalid JSON";
          await admin.from("strategic_plans").update({ status: "published" }).eq("id", r.planId);
          continue;
        }
      }

      await admin
        .from("strategic_plans")
        .update({ plan_content: roadmap, status: "published", published_at: new Date().toISOString() })
        .eq("id", r.planId);

      r.status = "success";
    } catch (err) {
      r.status = `error: ${err}`;
      await admin.from("strategic_plans").update({ status: "published" }).eq("id", r.planId);
    }
  }

  return NextResponse.json({ message: `Regenerated ${results.filter(r => r.status === "success").length} of ${results.length} plans`, results });
}
