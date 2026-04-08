import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAllCaseStudies, getAllStructures } from '@/lib/content';
import Anthropic from '@anthropic-ai/sdk';
import type { DealVerdict, EvaluationScores, DealType, CreativeMode } from '@/types/evaluator';

const SYSTEM_PROMPT = `You are the In Sequence deal evaluator — an AI that helps creative professionals evaluate specific deals they're considering.

You are generating a Deal Verdict for a member who just completed the In Sequence deal evaluation. The evaluation has already scored 6 dimensions (financial readiness, career positioning, partner quality, deal structure quality, risk profile, legal & tax readiness). Your job is to:

1. Write a punchy headline that captures the deal's overall signal
2. Write a 2-3 sentence summary explaining the verdict
3. Write a one-sentence summary for each dimension
4. Generate 3-7 specific recommended actions ordered by priority
5. Recommend relevant library resources (structures and case studies)

VOICE: Grounded, specific, direct. No filler. Concrete advice, not platitudes. Reference specific deal terms from their answers. Never generic.

KEY PRINCIPLES:
- Actions must be CONCRETE and NEGOTIATION-FOCUSED — request information rights, negotiate vesting terms, add audit clauses. NOT "do more research" or "think about it."
- Each action should reference the specific deal term that needs attention
- Structure references should link to the most relevant In Sequence structure document
- Adapt language to the member's creative mode vocabulary
- Red flags should be addressed first in actions

RESPONSE FORMAT: Respond with valid JSON matching the DealVerdict schema exactly. No markdown, no code fences, just raw JSON.`;

function getAllCaseStudySlugs() {
  return getAllCaseStudies().map((cs) => ({
    slug: cs.slug,
    title: cs.title.replace(/<br\s*\/?>/g, ' '),
  }));
}

function getAllStructureSlugs() {
  return getAllStructures().map((s) => ({
    id: s.sortOrder,
    slug: s.slug,
    title: s.title.replace(/<br\s*\/?>/g, ' '),
  }));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    evaluationId,
    userId,
    dealType,
    dealName,
    creativeMode,
    creativeModeSource,
    answers,
    scores,
    redFlags,
    assessmentContext,
  } = body;

  const admin = createAdminClient();

  // Create or update evaluation
  let evalId = evaluationId;
  const evalData = {
    user_id: user.id,
    status: 'completed' as const,
    creative_mode: creativeMode as CreativeMode,
    creative_mode_source: creativeModeSource,
    deal_type: dealType as DealType,
    deal_name: dealName,
    assessment_id: assessmentContext?.assessmentId ?? null,
    assessment_stage: assessmentContext?.detected_stage ?? null,
    assessment_flags: assessmentContext?.misalignment_flags ?? [],
    archetype_primary: assessmentContext?.archetype_primary ?? null,
    answers_financial: answers.financial ?? {},
    answers_career: answers.career ?? {},
    answers_partner: answers.partner ?? {},
    answers_structure: answers.structure ?? {},
    answers_risk: answers.risk ?? {},
    answers_legal: answers.legal ?? {},
    scores: scores as EvaluationScores,
    overall_score: scores?.overall?.score ?? null,
    overall_signal: scores?.overall?.signal ?? null,
    red_flags: redFlags?.map((rf: { message: string }) => rf.message) ?? [],
    completed_at: new Date().toISOString(),
  };

  if (evalId) {
    await admin.from('deal_evaluations').update(evalData).eq('id', evalId);
  } else {
    const { data: inserted, error } = await admin
      .from('deal_evaluations')
      .insert({ ...evalData })
      .select('id')
      .single();
    if (error || !inserted) {
      return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 });
    }
    evalId = inserted.id;
  }

  // Create verdict row in "generating" status
  const { data: verdictRow, error: verdictErr } = await admin
    .from('deal_verdicts')
    .insert({
      user_id: user.id,
      evaluation_id: evalId,
      status: 'generating',
      verdict_content: {},
    })
    .select('id')
    .single();

  if (verdictErr || !verdictRow) {
    return NextResponse.json({ error: 'Failed to create verdict' }, { status: 500 });
  }

  // Build Claude prompt
  const structures = getAllStructureSlugs();
  const caseStudies = getAllCaseStudySlugs();

  const userPrompt = JSON.stringify({
    dealType,
    dealName,
    creativeMode,
    scores,
    redFlags,
    answers,
    assessmentContext: assessmentContext
      ? {
          stage: assessmentContext.detected_stage,
          archetype: assessmentContext.archetype_primary,
          misalignmentFlags: assessmentContext.misalignment_flags,
        }
      : null,
    availableStructures: structures,
    availableCaseStudies: caseStudies,
    schema: {
      signal: { color: 'green|yellow|red', headline: 'string', summary: 'string' },
      dimension_summaries: { financial: 'string', career: 'string', partner: 'string', structure: 'string', risk: 'string', legal: 'string' },
      recommended_actions: [{ order: 'number', action: 'string', detail: 'string', structure_ref: '{ id, slug, title } | undefined' }],
      resources: {
        structures: [{ id: 'number', slug: 'string', title: 'string', why: 'string' }],
        case_studies: [{ slug: 'string', title: 'string', why: 'string' }],
      },
    },
  });

  // Call Claude
  const apiKey = process.env.SEQ_ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return a placeholder verdict if no API key
    const placeholderVerdict: DealVerdict = {
      signal: {
        color: scores.overall.signal,
        headline: `${scores.overall.signal === 'green' ? 'Strong deal fundamentals' : scores.overall.signal === 'yellow' ? 'This deal needs attention' : 'Serious concerns detected'}.`,
        summary: `Your evaluation scored ${scores.overall.score.toFixed(1)} out of 10 across six dimensions. ${redFlags?.length > 0 ? `${redFlags.length} red flag(s) were triggered.` : ''} Review the dimension breakdown below for specifics.`,
      },
      dimension_summaries: {
        financial: `Scored ${scores.financial?.score?.toFixed(1) ?? 'N/A'}/10.`,
        career: `Scored ${scores.career?.score?.toFixed(1) ?? 'N/A'}/10.`,
        partner: `Scored ${scores.partner?.score?.toFixed(1) ?? 'N/A'}/10.`,
        structure: `Scored ${scores.structure?.score?.toFixed(1) ?? 'N/A'}/10.`,
        risk: `Scored ${scores.risk?.score?.toFixed(1) ?? 'N/A'}/10.`,
        legal: `Scored ${scores.legal?.score?.toFixed(1) ?? 'N/A'}/10.`,
      },
      recommended_actions: redFlags?.map((rf: { message: string; questionId: string }, i: number) => ({
        order: i + 1,
        action: rf.message,
        detail: 'Address this before proceeding.',
      })) ?? [],
      resources: { structures: [], case_studies: [] },
    };

    await admin
      .from('deal_verdicts')
      .update({ verdict_content: placeholderVerdict, status: 'published' })
      .eq('id', verdictRow.id);

    return NextResponse.json({
      evaluationId: evalId,
      verdictId: verdictRow.id,
      verdict: placeholderVerdict,
    });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const verdict: DealVerdict = JSON.parse(text);

    // Save verdict
    await admin
      .from('deal_verdicts')
      .update({ verdict_content: verdict, status: 'published' })
      .eq('id', verdictRow.id);

    return NextResponse.json({
      evaluationId: evalId,
      verdictId: verdictRow.id,
      verdict,
    });
  } catch (err) {
    // On Claude error, save a basic verdict from scores
    const fallbackVerdict: DealVerdict = {
      signal: {
        color: scores.overall.signal,
        headline: scores.overall.signal === 'green'
          ? 'This deal has strong fundamentals.'
          : scores.overall.signal === 'yellow'
            ? 'This deal needs attention before you commit.'
            : 'This deal has fundamental problems.',
        summary: `Overall score: ${scores.overall.score.toFixed(1)}/10.`,
      },
      dimension_summaries: {
        financial: '', career: '', partner: '', structure: '', risk: '', legal: '',
      },
      recommended_actions: [],
      resources: { structures: [], case_studies: [] },
    };

    await admin
      .from('deal_verdicts')
      .update({ verdict_content: fallbackVerdict, status: 'draft' })
      .eq('id', verdictRow.id);

    return NextResponse.json({
      evaluationId: evalId,
      verdictId: verdictRow.id,
      verdict: fallbackVerdict,
    });
  }
}
