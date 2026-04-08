import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeStageScore } from "@/lib/assessment/scoring";
import { matchArchetype } from "@/lib/assessment/archetype-matching";
import { getArchetypeById } from "@/lib/assessment/archetypes";
import { getAllCaseStudies, getAllStructures } from "@/lib/content";
import Anthropic from "@anthropic-ai/sdk";
import type {
  AssessmentAnswers,
  CreativeMode,
  StrategicRoadmap,
} from "@/types/assessment";

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
- CRITICAL: The member's discipline is in the "discipline" field and their specialization is in the "sub_discipline" field. Use these EXACT values to describe the member. For example, if discipline is "design" and sub_discipline is "product_ux", describe them as a product/UX designer — NOT a painter, visual artist, or any other discipline. Never infer or guess their discipline from creative_mode alone.
- Adapt language to the user's creative mode vocabulary. A maker creates work; a service provider delivers for clients. Use the right vocabulary for their world.
- Misalignments are the most valuable insight. The "misalignment_flags" in the assessment data are detected by our scoring engine and MUST all appear in your output. Also identify any additional gaps you see. Almost every creative professional has structural misalignments — err on the side of surfacing them, not hiding them.
- The roadmap should feel like it was written by someone who understands their specific creative discipline — not generic business advice applied to creatives.

RESPONSE FORMAT: Respond with valid JSON matching the StrategicRoadmap schema exactly. No markdown, no code fences, just raw JSON.`;

function getAllCaseStudySlugs() {
  return getAllCaseStudies().map((cs) => ({ slug: cs.slug, title: cs.title.replace(/<br\s*\/?>/g, " ") }));
}

function getAllStructureSlugs() {
  return getAllStructures().map((s) => ({
    id: s.sortOrder,
    slug: s.slug,
    title: s.title.replace(/<br\s*\/?>/g, " "),
  }));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { planId } = body;

  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Load the existing plan to get the assessment ID
  const { data: plan, error: planErr } = await admin
    .from("strategic_plans")
    .select("id, assessment_id, user_id")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single();

  if (planErr || !plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Load the assessment
  const { data: assessment, error: fetchErr } = await admin
    .from("assessments")
    .select("*")
    .eq("id", plan.assessment_id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const answers: AssessmentAnswers = {
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
    (assessment.creative_mode as CreativeMode) || "hybrid",
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

  const archetypeContext = {
    primary: primaryArchetype,
    secondary: secondaryArchetype || undefined,
  };

  const availableCaseStudies = getAllCaseStudySlugs();
  const availableStructures = getAllStructureSlugs();

  const userPrompt = `MEMBER ASSESSMENT DATA:
${JSON.stringify(assessmentContext, null, 2)}

MATCHED ARCHETYPE:
${JSON.stringify(archetypeContext, null, 2)}

AVAILABLE CASE STUDIES (use ONLY these exact slugs in recommended_cases and relevant_cases):
${availableCaseStudies.map((cs) => `- "${cs.slug}" (${cs.title})`).join("\n")}

AVAILABLE STRUCTURES (use ONLY these IDs and slugs in recommended_structures and structures_to_study):
${availableStructures.map((s) => `- id:${s.id}, slug:"${s.slug}", title:"${s.title}"`).join("\n")}

Generate the Strategic Roadmap following this exact JSON schema:

{
  "position": {
    "detected_stage": <number 1-4>,
    "stage_name": "<string>",
    "stage_description": "<2-3 sentences about their current position>",
    "transition_readiness": "<low|moderate|high>",
    "industry_context": "<1-2 sentences about their specific discipline>",
    "misalignments": [{"flag": "<flag_key>", "what_its_costing": "<string>", "why_it_matters": "<string>"}]
  },
  "misalignment_detail": [{"flag": "<flag_key>", "what_its_costing": "<string>", "why_it_matters": "<string>"}],
  "actions": [
    {
      "order": 1, "type": "foundation",
      "title": "<string>", "what": "<string>", "why": "<string>",
      "how": "<string>", "timeline": "<string>", "done_signal": "<string>",
      "ai_assist": {"type": "<draft|review|generate>", "description": "<string>"} or null,
      "providers": [{"name": "<string>", "url": "<string>", "type": "platform|service|advisor"}] or null
    },
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
    "reading_path": ["Structure #<N>: <Title>", "<CaseStudyName> case study", ...]  // MUST use exact format: "Structure #17: Equity-for-Services Model" for structures, "Jessica Walsh case study" for cases. Each item is ONE specific structure or case study. Do NOT use ranges like "Structures 1-4" or vague references like "Case studies".
  },
  "entity_structure": {
    "parent": "<recommended parent entity name, e.g. 'Your Name Holdings LLC'>",
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

MISALIGNMENT RULES (CRITICAL):
- The "misalignment_flags" array in the assessment data contains flags detected by our scoring engine. These are MANDATORY — you MUST include every detected flag in both "position.misalignments" and "misalignment_detail". Use the exact flag key from the array.
- Beyond the detected flags, look for additional structural gaps in the member's situation. Most creative professionals have at least 1-2 misalignments. If the detected flags array is empty, identify at least one misalignment from the data — almost everyone has structural gaps between where they are and where they should be.
- The six possible flags are: income_exceeds_structure, judgment_not_priced, relationships_not_converted, ip_not_monetized, demand_exceeds_capacity, talent_without_structure. You may also identify custom misalignments using descriptive snake_case keys.
- Misalignments are the most valuable part of the roadmap. Be specific about what each gap is costing the member in concrete terms.

entity_structure: Recommend the simplest entity structure appropriate for this member's stage and goals. For Stage 1, this might be a single LLC. For Stage 2+, consider a parent holding entity with child entities for different revenue streams. Keep it practical — only include entities that match the member's current or near-term needs.

value_flywheel: Show how 3–6 of the recommended structures or actions compound together. Each node is a structure, asset, or action. Edges connect them in a cycle showing how value flows from one to the next. The center label captures the core concept that makes the flywheel work. Model this on the David Bowie case study flywheel: circular flow, each step enabling the next.

Personalize the archetype's action playbook to this member's discipline, creative mode, income level, constraints, and ambition. Return ONLY valid JSON.`;

  // Mark plan as regenerating
  await admin
    .from("strategic_plans")
    .update({ status: "generating" })
    .eq("id", planId);

  // Check API key before returning
  const apiKey = process.env.SEQ_ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Restore status so the page still works
    await admin.from("strategic_plans").update({ status: "published" }).eq("id", planId);
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  // Fire-and-forget: generate in background so the page can show "generating" state immediately
  (async () => {
    try {
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
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
        if (jsonMatch) {
          roadmap = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid JSON response from Claude");
        }
      }

      await admin
        .from("strategic_plans")
        .update({
          plan_content: roadmap,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", planId);
    } catch (err) {
      console.error("Regenerate failed:", err);
      // Restore to published so the page still works
      await admin
        .from("strategic_plans")
        .update({ status: "published" })
        .eq("id", planId);
    }
  })();

  return NextResponse.json({ success: true });
}
