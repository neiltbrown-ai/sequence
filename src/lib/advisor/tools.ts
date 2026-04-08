import { tool } from "ai";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeStageScore } from "@/lib/assessment/scoring";
import { matchArchetype } from "@/lib/assessment/archetype-matching";
import { getArchetypeById } from "@/lib/assessment/archetypes";
import { selectAdaptiveQuestions } from "@/lib/assessment/question-selection";
import { getAllStructures, getAllCaseStudies } from "@/lib/content";
import type { AssessmentAnswers, CreativeMode, MisalignmentFlag, StageNumber } from "@/types/assessment";

// ── Client-Rendered Tools (no execute — rendered in chat, user provides result) ────

/** Display single-select option cards */
export const showOptionCards = tool({
  description:
    "Display tappable option cards for the member to choose from. Used for single-select questions like discipline, creative mode, income range, etc.",
  inputSchema: z.object({
    questionId: z.string().describe("The question ID (e.g., Q1, Q2, Q6)"),
    questionText: z.string().describe("The question text to display above the cards"),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })
    ),
  }),
});

/** Display multi-select cards with done button */
export const showMultiSelect = tool({
  description:
    "Display multi-select cards where the member can select multiple options and click Done. Used for questions like energy drains, constraints.",
  inputSchema: z.object({
    questionId: z.string(),
    questionText: z.string(),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })
    ),
    maxSelections: z.number().optional().describe("Maximum number of selections allowed"),
  }),
});

/** Display drag/tap-to-rank widget */
export const showRanking = tool({
  description:
    "Display a ranking widget where the member drags or taps to order items. Used for energy ranking (Q3).",
  inputSchema: z.object({
    questionId: z.string(),
    questionText: z.string(),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })
    ),
  }),
});

/** Display allocation sliders that sum to 100% */
export const showAllocationSliders = tool({
  description:
    "Display allocation sliders that must sum to 100%. Used for income structure breakdown (Q7).",
  inputSchema: z.object({
    questionId: z.string(),
    questionText: z.string(),
    categories: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    ),
  }),
});

/** Display a single slider for range selection */
export const showSlider = tool({
  description:
    "Display a single slider or option cards for selecting from an ordered range. Used for questions with ordered options.",
  inputSchema: z.object({
    questionId: z.string(),
    questionText: z.string(),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    ),
  }),
});

/** Display currency input field */
export const showCurrencyInput = tool({
  description:
    "Display a formatted currency input field. Used in deal evaluation for financial questions.",
  inputSchema: z.object({
    questionId: z.string(),
    questionText: z.string(),
    placeholder: z.string().optional(),
  }),
});

/** Display free text input area */
export const showFreeText = tool({
  description:
    "Display a multi-line free text input area. Used for open-ended questions like the dream question (Q5) or specific question.",
  inputSchema: z.object({
    questionId: z.string(),
    questionText: z.string(),
    placeholder: z.string().optional(),
  }),
});

/** Display roadmap action cards inline in chat */
export const showActionCards = tool({
  description:
    "Display interactive action cards in the chat, typically after roadmap generation. Each card has a title, description, and CTA.",
  inputSchema: z.object({
    actions: z.array(
      z.object({
        order: z.number(),
        type: z.string(),
        title: z.string(),
        what: z.string(),
        timeline: z.string().optional(),
      })
    ),
    prompt: z.string().optional().describe("Text to show below the cards, e.g., 'Which action would you like to work on?'"),
  }),
});

/** Display full roadmap summary */
export const showRoadmapSummary = tool({
  description:
    "Display the full roadmap summary with stage badge, misalignments, three actions, and vision. Used after assessment completion.",
  inputSchema: z.object({
    stage: z.number(),
    stageName: z.string(),
    stageDescription: z.string(),
    transitionReadiness: z.string(),
    misalignments: z.array(
      z.object({
        flag: z.string(),
        whatItsCosting: z.string(),
      })
    ),
    actions: z.array(
      z.object({
        order: z.number(),
        type: z.string(),
        title: z.string(),
        what: z.string(),
        timeline: z.string().optional(),
      })
    ),
    vision: z
      .object({
        twelveMonthTarget: z.string(),
        threeYearHorizon: z.string(),
      })
      .optional(),
  }),
});

// ── Display-Only Visual Tools (server-executed — render from input args in UI) ────
// These execute instantly on the server (returning a marker), which lets the AI
// continue its response in the same stream. The UI renders visuals from the tool's
// input args, not the result. This avoids the auto-resubmit loop that client tools cause.

/** Display a horizontal bar chart comparing values */
export const showBarChart = tool({
  description:
    "Display a horizontal bar chart comparing numeric values. Use when comparing revenue splits, income breakdown, deal percentages, or any 2-12 numeric comparisons.",
  inputSchema: z.object({
    title: z.string().optional().describe("Chart title"),
    rows: z.array(
      z.object({
        label: z.string(),
        value: z.string().describe("Display value, e.g. '$120K' or '45%'"),
        pct: z.number().describe("Bar width as percentage 0-100, relative to the largest value"),
      })
    ).min(2).max(12),
  }),
  execute: async () => ({ displayed: true }),
});

/** Display an entity/org structure diagram */
export const showEntityChart = tool({
  description:
    "Display an entity or organizational structure diagram with a parent entity and child entities. Use when discussing entity formation, holding companies, or organizational hierarchy.",
  inputSchema: z.object({
    title: z.string().optional(),
    parent: z.string().describe("The parent/top-level entity name"),
    children: z.array(
      z.object({
        name: z.string(),
        desc: z.string().describe("Short description or role of this entity"),
      })
    ).min(1).max(8),
  }),
  execute: async () => ({ displayed: true }),
});

/** Display large stat callout metrics */
export const showMetrics = tool({
  description:
    "Display 1-4 large stat callout metrics. Use for highlighting key numbers like deal value, ownership percentage, revenue, or growth rate.",
  inputSchema: z.object({
    metrics: z.array(
      z.object({
        value: z.string().describe("The number/stat, e.g. '$2.4M' or '35%'"),
        label: z.string().describe("What the metric represents"),
      })
    ).min(1).max(4),
  }),
  execute: async () => ({ displayed: true }),
});

/** Display a data table for structured comparisons */
export const showDataTable = tool({
  description:
    "Display a data table for structured comparisons. Use for comparing deal terms side-by-side, listing structure pros/cons, or showing multi-column data.",
  inputSchema: z.object({
    title: z.string().optional(),
    headers: z.array(z.string()).min(2).max(6),
    rows: z.array(z.array(z.string())).min(1).max(20),
  }),
  execute: async () => ({ displayed: true }),
});

/** Display a radar/spider chart for multi-dimensional scoring */
export const showRadarChart = tool({
  description:
    "Display a radar chart for multi-dimensional scoring. Use when showing deal evaluation scores across dimensions, position assessment, or comparing strengths and weaknesses.",
  inputSchema: z.object({
    title: z.string().optional(),
    dimensions: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        score: z.number().min(0).max(10).describe("Score from 0 to 10"),
      })
    ).min(3).max(8),
  }),
  execute: async () => ({ displayed: true }),
});

/** Display a value flywheel diagram showing a cyclical reinforcement loop */
export const showFlywheel = tool({
  description:
    "Display a flywheel diagram showing a cyclical reinforcement loop. Use when explaining how different parts of a creative business feed into each other. Provide 3-6 steps that form a cycle.",
  inputSchema: z.object({
    title: z.string().optional(),
    center: z.string().optional().describe("Label for the center of the flywheel"),
    steps: z.array(
      z.object({
        label: z.string().describe("Short label for this flywheel step"),
        detail: z.string().optional().describe("One-sentence explanation"),
      })
    ).min(3).max(6),
  }),
  execute: async () => ({ displayed: true }),
});

// ── Server-Executed Tools (with execute — run on server, result fed to AI) ────

/** Save a single assessment answer to the database */
export const saveAssessmentAnswer = tool({
  description:
    "Save a single assessment answer to the database. Call this after each structured question response. The field should match the Supabase column name.",
  inputSchema: z.object({
    assessmentId: z.string(),
    field: z.string().describe("The Supabase column name (e.g., discipline, creative_mode, income_range)"),
    value: z.unknown().describe("The answer value"),
  }),
  execute: async ({ assessmentId, field, value }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("assessments")
      .update({ [field]: value })
      .eq("id", assessmentId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },
});

/** Compute stage score from assessment answers */
export const computeStageScoreTool = tool({
  description:
    "Compute the member's stage score from their Section 3 (Reality) answers. Call this after completing Section 3. Returns detected stage, score, readiness, and misalignment flags.",
  inputSchema: z.object({
    incomeRange: z.string().optional(),
    incomeStructure: z.record(z.string(), z.number()).optional(),
    whatTheyPayFor: z.string().optional(),
    equityPositions: z.string().optional(),
    demandLevel: z.string().optional(),
    businessStructure: z.string().optional(),
  }),
  execute: async (params) => {
    const answers: AssessmentAnswers = {
      income_range: params.incomeRange,
      income_structure: params.incomeStructure,
      what_they_pay_for: params.whatTheyPayFor,
      equity_positions: params.equityPositions,
      demand_level: params.demandLevel,
      business_structure: params.businessStructure,
    };

    const result = computeStageScore(answers);
    return {
      detectedStage: result.detectedStage,
      stageScore: result.stageScore,
      transitionReadiness: result.transitionReadiness,
      misalignmentFlags: result.misalignmentFlags,
    };
  },
});

/** Match member to archetype */
export const matchArchetypeTool = tool({
  description:
    "Match the member to their best-fit archetype based on stage, creative mode, and misalignment flags. Call after computing stage score.",
  inputSchema: z.object({
    detectedStage: z.number(),
    stageScore: z.number(),
    creativeMode: z.string(),
    misalignmentFlags: z.array(z.string()),
  }),
  execute: async ({ detectedStage, stageScore, creativeMode, misalignmentFlags }) => {
    const result = matchArchetype(
      detectedStage as StageNumber,
      stageScore,
      creativeMode as CreativeMode,
      misalignmentFlags as MisalignmentFlag[]
    );

    return {
      primary: {
        id: result.primary.id,
        name: result.primary.name,
        description: result.primary.description,
        actions: result.primary.actions.map((a) => ({
          order: a.order,
          type: a.type,
          title: a.title,
          what: a.what,
          why: a.why,
          how: a.how,
          timeline: a.timeline,
          doneSignal: a.done_signal,
        })),
      },
      secondary: result.secondary
        ? {
            id: result.secondary.id,
            name: result.secondary.name,
          }
        : null,
    };
  },
});

/** Create a new assessment record */
export const createAssessmentTool = tool({
  description:
    "Create a new assessment record for the member. Call this at the start of assessment mode. Returns the assessment ID.",
  inputSchema: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("assessments")
      .insert({
        user_id: userId,
        status: "in_progress",
        version: 1,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to create assessment" };
    }
    return { success: true, assessmentId: data.id };
  },
});

/** Generate strategic roadmap from completed assessment */
export const generateRoadmapTool = tool({
  description:
    "Generate the strategic roadmap from a completed assessment. This triggers the Claude API to create the personalized roadmap. Returns the plan ID.",
  inputSchema: z.object({
    assessmentId: z.string(),
  }),
  execute: async ({ assessmentId }) => {
    // Call the existing assessment/complete endpoint logic
    // For now, we use a direct API call to our own endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    try {
      const response = await fetch(`${baseUrl}/api/assessment/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      const result = await response.json();
      if (result.planId) {
        return { success: true, planId: result.planId, status: "generating" };
      }
      return { success: false, error: result.error || "Unknown error" };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});

/** Search the In Sequence content library */
export const searchLibrary = tool({
  description:
    "Search the In Sequence library for structures, case studies, or articles matching a query. Returns top matches with title, slug, and excerpt.",
  inputSchema: z.object({
    query: z.string().describe("Search terms"),
    contentType: z
      .enum(["structure", "case-study", "all"])
      .optional()
      .default("all"),
  }),
  execute: async ({ query, contentType }) => {
    const results: { type: string; slug: string; title: string; excerpt: string }[] = [];
    const queryLower = query.toLowerCase();

    if (contentType === "all" || contentType === "structure") {
      const structures = await getAllStructures();
      const matched = structures
        .filter(
          (s) =>
            s.title.toLowerCase().includes(queryLower) ||
            s.excerpt?.toLowerCase().includes(queryLower) ||
            s.tags?.some((t: string) => t.toLowerCase().includes(queryLower))
        )
        .slice(0, 5);

      for (const s of matched) {
        results.push({
          type: "structure",
          slug: s.slug,
          title: `Structure #${s.number}: ${s.title}`,
          excerpt: s.excerpt || "",
        });
      }
    }

    if (contentType === "all" || contentType === "case-study") {
      const cases = await getAllCaseStudies();
      const matched = cases
        .filter(
          (c) =>
            c.title.toLowerCase().includes(queryLower) ||
            c.excerpt?.toLowerCase().includes(queryLower) ||
            c.tags?.some((t: string) => t.toLowerCase().includes(queryLower))
        )
        .slice(0, 5);

      for (const c of matched) {
        results.push({
          type: "case-study",
          slug: c.slug,
          title: c.title,
          excerpt: c.excerpt || "",
        });
      }
    }

    return { results, count: results.length };
  },
});

/** Get details about a specific structure */
export const getStructureDetail = tool({
  description:
    "Get details about a specific deal structure by number. Returns title, excerpt, stage, risk, and tags.",
  inputSchema: z.object({
    structureNumber: z.number().describe("The structure number (1-35)"),
  }),
  execute: async ({ structureNumber }) => {
    const structures = await getAllStructures();
    const structure = structures.find((s) => s.number === structureNumber);
    if (!structure) {
      return { found: false, error: `Structure #${structureNumber} not found` };
    }
    return {
      found: true,
      number: structure.number,
      title: structure.title,
      slug: structure.slug,
      excerpt: structure.excerpt || "",
      stage: structure.stage,
      risk: structure.risk,
      tags: structure.tags || [],
      tagline: structure.tagline || "",
    };
  },
});

/** Update a roadmap action status */
export const markActionStatus = tool({
  description:
    "Update a roadmap action's status (pending, in_progress, completed, skipped). Call when the member indicates they've started or completed an action.",
  inputSchema: z.object({
    actionId: z.string(),
    status: z.enum(["pending", "in_progress", "completed", "skipped"]),
  }),
  execute: async ({ actionId, status }) => {
    const admin = createAdminClient();
    const updateData: Record<string, unknown> = { status };
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await admin
      .from("assessment_actions")
      .update(updateData)
      .eq("id", actionId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },
});

/** Get adaptive questions for Section 4 */
export const getAdaptiveQuestions = tool({
  description:
    "Get the adaptive deep-dive questions for Section 4 based on detected stage and discipline. Call after computing stage score in Section 3.",
  inputSchema: z.object({
    detectedStage: z.number(),
    creativeMode: z.string(),
    discipline: z.string(),
  }),
  execute: async ({ detectedStage, creativeMode, discipline }) => {
    const questions = selectAdaptiveQuestions(
      detectedStage as StageNumber,
      creativeMode as CreativeMode,
      discipline
    );

    return {
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        answerType: q.answerType,
        options: q.options,
        pool: q.pool,
        questionTextVariants: q.questionTextVariants,
      })),
      count: questions.length,
    };
  },
});

// ── Tool Registry ──────────────────────────────────────────────────

/**
 * Get all tools for the advisor chat API.
 * Client tools (no execute) are rendered in the browser.
 * Server tools (with execute) run on the server and return results to the AI.
 */
export function getAdvisorTools() {
  return {
    // Client-rendered tools
    show_option_cards: showOptionCards,
    show_multi_select: showMultiSelect,
    show_ranking: showRanking,
    show_allocation_sliders: showAllocationSliders,
    show_slider: showSlider,
    show_currency_input: showCurrencyInput,
    show_free_text: showFreeText,
    show_action_cards: showActionCards,
    show_roadmap_summary: showRoadmapSummary,

    // Server-executed tools
    save_assessment_answer: saveAssessmentAnswer,
    compute_stage_score: computeStageScoreTool,
    match_archetype: matchArchetypeTool,
    create_assessment: createAssessmentTool,
    generate_roadmap: generateRoadmapTool,
    search_library: searchLibrary,
    get_structure_detail: getStructureDetail,
    mark_action_status: markActionStatus,
    get_adaptive_questions: getAdaptiveQuestions,

    // Display-only visual tools (server-executed, UI renders from input args)
    show_bar_chart: showBarChart,
    show_entity_chart: showEntityChart,
    show_metrics: showMetrics,
    show_data_table: showDataTable,
    show_radar_chart: showRadarChart,
    show_flywheel: showFlywheel,
  };
}
