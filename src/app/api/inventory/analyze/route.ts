import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildMemberContext } from "@/lib/advisor/context-builder";
import { getAllStructures } from "@/lib/content";
import Anthropic from "@anthropic-ai/sdk";
import type { AssetInventoryItem, InventoryAnalysisContent } from "@/types/inventory";

const SYSTEM_PROMPT = `You are the In Sequence asset valuation advisor — an AI that helps creative professionals understand the structural value of their unmonetized IP, judgment, relationships, processes, audience, and brand equity.

VOICE: Grounded, specific, economical. No filler. Humble authority earned from practitioner experience. Conservative estimates, never hype. Systems thinking with storytelling. Never generic, never preachy, never "growth mindset" clichés.

FRAMEWORK: The In Sequence progression has 4 stages:
- Stage 1: Execution Excellence ($75K-$200K) — Structures #1, #2
- Stage 2: Judgment Positioning ($200K-$500K) — Structures #3, #4
- Stage 3: Ownership Accumulation ($500K-$2M+) — Structures #5, #9, #24
- Stage 4: Capital Formation ($2M+) — Structures #12, #14

ASSET TYPE DEFINITIONS:
- IP: Created works the member owns or could own — designs, music, photography, written content, software, brand systems
- Judgment: Strategic advice, creative direction, taste-making, or consultation given away free inside execution projects
- Relationship: Access, introductions, endorsements, or network leverage provided without compensation
- Process: Proprietary methodology, workflow, framework, or system they developed
- Audience: Email lists, social followings, community access, distribution channels, platform presence
- Brand: Name recognition, endorsement value, credibility that carries weight in their market

KEY PRINCIPLES:
- Estimated values should be CONSERVATIVE RANGES based on real market comparables. Better to be grounded than aspirational.
- Actions must be STRUCTURAL: entity formation, licensing agreements, advisory contracts, IP registration, deal restructuring. NOT content strategy, marketing tactics, or growth hacks.
- Reference specific In Sequence structure numbers when recommending actions.
- If the member has assessment data, personalize to their stage, archetype, discipline, and creative mode.
- Focus on what's structurally WRONG before prescribing growth. Highlight what they're leaving on the table.

RESPONSE FORMAT: Respond with valid JSON matching the InventoryAnalysisContent schema exactly. No markdown, no code fences, just raw JSON.`;

function getStructureCatalog() {
  return getAllStructures().map((s) => ({
    id: s.sortOrder,
    slug: s.slug,
    title: s.title.replace(/<br\s*\/?>/g, " "),
  }));
}

export async function POST() {
  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Load inventory items
  const { data: items, error: itemsErr } = await admin
    .from("asset_inventory_items")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (itemsErr || !items || items.length === 0) {
    return NextResponse.json(
      { error: "No inventory items found" },
      { status: 400 }
    );
  }

  // Create analysis row
  const { data: analysis, error: analysisErr } = await admin
    .from("asset_inventory_analyses")
    .insert({
      user_id: user.id,
      item_count: items.length,
      status: "generating",
    })
    .select("id")
    .single();

  if (analysisErr || !analysis) {
    console.error("Failed to create analysis row:", analysisErr);
    return NextResponse.json(
      { error: "Failed to start analysis" },
      { status: 500 }
    );
  }

  // Build context and run analysis async
  generateAnalysis(
    analysis.id,
    user.id,
    items as AssetInventoryItem[],
    admin
  ).catch((err) => {
    console.error("Inventory analysis failed:", err);
  });

  return NextResponse.json({ analysisId: analysis.id });
}

async function generateAnalysis(
  analysisId: string,
  userId: string,
  items: AssetInventoryItem[],
  admin: ReturnType<typeof createAdminClient>
) {
  const apiKey = process.env.SEQ_ANTHROPIC_API_KEY;
  if (!apiKey) {
    await admin
      .from("asset_inventory_analyses")
      .update({ status: "failed", analysis_content: { error: "No API key configured" } })
      .eq("id", analysisId);
    return;
  }

  try {
    // Load member context for personalization
    let memberContextStr = "";
    try {
      const memberContext = await buildMemberContext(userId);
      if (memberContext.assessment) {
        memberContextStr = `\n\nMEMBER ASSESSMENT CONTEXT:
- Discipline: ${memberContext.assessment.discipline || "Unknown"}
- Creative Mode: ${memberContext.assessment.creative_mode || "Unknown"}
- Detected Stage: ${memberContext.assessment.detected_stage || "Unknown"}
- Income Range: ${memberContext.assessment.income_range || "Unknown"}
- Archetype: ${memberContext.assessment.archetype_primary || "Unknown"}
- Misalignment Flags: ${JSON.stringify(memberContext.assessment.misalignment_flags || [])}`;
      }
    } catch {
      // Assessment context is optional — continue without it
    }

    const structures = getStructureCatalog();

    const userPrompt = `INVENTORY ITEMS (${items.length} total):
${items.map((item, i) => `${i + 1}. "${item.asset_name}"
   Type: ${item.asset_type}
   Ownership: ${item.ownership_status}
   Licensing Potential: ${item.licensing_potential}
   Description: ${item.description || "None provided"}
   Notes: ${item.notes || "None"}`).join("\n\n")}
${memberContextStr}

AVAILABLE STRUCTURES (reference these by number when recommending):
${structures.map((s) => `- #${s.id}: ${s.title}`).join("\n")}

Generate the InventoryAnalysisContent following this exact JSON schema:

{
  "summary": {
    "total_assets": <number>,
    "estimated_total_value_range": "<string, e.g. '$50K-$200K'>",
    "leverage_score": "<low|medium|high>",
    "key_insight": "<1-2 sentences: the single most important structural observation>"
  },
  "asset_valuations": [
    {
      "asset_name": "<string>",
      "asset_type": "<ip|judgment|relationship|process|audience|brand>",
      "estimated_value_range": "<string, e.g. '$10K-$30K'>",
      "value_rationale": "<1-2 sentences explaining the estimate>",
      "immediate_actions": ["<specific structural action>", ...]
    }
  ],
  "scenarios": [
    {
      "scenario_name": "<string>",
      "description": "<2-3 sentences>",
      "potential_value": "<string>",
      "required_steps": ["<step>", ...],
      "timeline": "<string, e.g. '3-6 months'>",
      "risk_level": "<low|medium|high>"
    }
  ],
  "roadmap": {
    "immediate_actions": [
      { "order": 1, "action": "<string>", "why": "<string>", "timeline": "<string>" },
      { "order": 2, "action": "<string>", "why": "<string>", "timeline": "<string>" },
      { "order": 3, "action": "<string>", "why": "<string>", "timeline": "<string>" }
    ],
    "medium_term": "<1-2 sentences>",
    "long_term_vision": "<1-2 sentences>",
    "recommended_structures": [<structure numbers>]
  }
}

Rules:
- Value one valuation entry per inventory item
- Generate 2-3 realistic scenarios showing how assets could be leveraged together
- Roadmap actions must be STRUCTURAL (legal, financial, contractual) — not marketing or content tactics
- Be conservative with value estimates. Use real market comparables where possible.
- Return ONLY valid JSON.`;

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

    let analysisContent: InventoryAnalysisContent;
    try {
      analysisContent = JSON.parse(textBlock.text);
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from Claude");
      }
    }

    await admin
      .from("asset_inventory_analyses")
      .update({
        analysis_content: analysisContent,
        status: "completed",
      })
      .eq("id", analysisId);
  } catch (err) {
    console.error("Claude API error:", err);
    await admin
      .from("asset_inventory_analyses")
      .update({
        status: "failed",
        analysis_content: { error: String(err) },
      })
      .eq("id", analysisId);
  }
}
