import type {
  AssessmentQuestion,
  StageNumber,
  CreativeMode,
  DisciplineGroup,
} from "@/types/assessment";
import { DISCIPLINE_TO_GROUP, DISCIPLINE_GROUP_MAP } from "@/types/assessment";
import {
  STAGE_1_POOL,
  STAGE_2_POOL,
  STAGE_3_POOL,
  INDUSTRY_POOLS,
  DISCERNMENT_POOL,
} from "./questions";

/**
 * Select adaptive questions for Section 4 based on:
 * - detected stage (determines which stage pool)
 * - creative mode (affects text/option variants — handled at render time)
 * - discipline (determines which industry pool)
 *
 * Returns 8-12 questions: 3-4 stage-specific + 2 industry-specific + 2 discernment
 */
export function selectAdaptiveQuestions(
  detectedStage: StageNumber,
  creativeMode: CreativeMode,
  discipline: string
): AssessmentQuestion[] {
  const questions: AssessmentQuestion[] = [];

  // 1. Stage-specific questions (3-4 from the appropriate pool)
  const stagePool = getStagePool(detectedStage);
  questions.push(...stagePool);

  // 2. Industry-specific questions (2 from discipline pool)
  const industryQuestions = getIndustryQuestions(discipline);
  questions.push(...industryQuestions);

  // 3. Discernment probe (2 questions, always included)
  questions.push(...DISCERNMENT_POOL);

  return questions;
}

function getStagePool(stage: StageNumber): AssessmentQuestion[] {
  switch (stage) {
    case 1:
      return STAGE_1_POOL;
    case 2:
      return STAGE_2_POOL;
    case 3:
    case 4:
      // Stage 4 uses Stage 3 pool (most advanced available)
      return STAGE_3_POOL;
  }
}

function getIndustryQuestions(discipline: string): AssessmentQuestion[] {
  // Map discipline to group
  const group: DisciplineGroup | undefined = DISCIPLINE_TO_GROUP[discipline];
  if (!group) return [];

  // Map group to industry pool key
  const poolKey = DISCIPLINE_GROUP_MAP[group];
  if (!poolKey) return [];

  return INDUSTRY_POOLS[poolKey] || [];
}
