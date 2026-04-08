'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { EvaluatorAnswers, DealType, CreativeMode } from '@/types/evaluator';

const DEBOUNCE_MS = 800;

export function useEvaluatorAutosave(
  userId: string,
  evaluationId: string | null,
  answers: EvaluatorAnswers,
  dealType: DealType | null,
  dealName: string | null,
  creativeMode: CreativeMode | null,
  creativeModeSource: 'assessment' | 'evaluator',
  assessmentId: string | null,
  assessmentStage: number | null,
  assessmentFlags: string[],
  currentDimension: number,
  currentQuestion: number,
  onEvaluationCreated: (id: string) => void,
) {
  const supabaseRef = useRef(createClient());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const evaluationIdRef = useRef(evaluationId);
  const onCreatedRef = useRef(onEvaluationCreated);

  useEffect(() => {
    evaluationIdRef.current = evaluationId;
  }, [evaluationId]);
  useEffect(() => {
    onCreatedRef.current = onEvaluationCreated;
  }, [onEvaluationCreated]);

  const save = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setSaving(true);
    setSaveError(null);

    const supabase = supabaseRef.current;

    try {
      const data = {
        creative_mode: creativeMode,
        creative_mode_source: creativeModeSource,
        deal_type: dealType,
        deal_name: dealName,
        assessment_id: assessmentId,
        assessment_stage: assessmentStage,
        assessment_flags: assessmentFlags,
        answers_financial: answers.financial,
        answers_career: answers.career,
        answers_partner: answers.partner,
        answers_structure: answers.structure,
        answers_risk: answers.risk,
        answers_legal: answers.legal,
        current_dimension: currentDimension,
        current_question: currentQuestion,
      };

      if (evaluationIdRef.current) {
        const { error } = await supabase
          .from('deal_evaluations')
          .update(data)
          .eq('id', evaluationIdRef.current);

        if (error) {
          setSaveError(error.message);
          return;
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('deal_evaluations')
          .insert({ ...data, user_id: userId, status: 'in_progress' })
          .select('id')
          .single();

        if (error) {
          setSaveError(error.message);
          return;
        }
        if (inserted) {
          evaluationIdRef.current = inserted.id;
          onCreatedRef.current(inserted.id);
        }
      }

      setLastSaved(new Date().toISOString());
    } finally {
      pendingRef.current = false;
      setSaving(false);
    }
  }, [
    userId, answers, dealType, dealName, creativeMode, creativeModeSource,
    assessmentId, assessmentStage, assessmentFlags,
    currentDimension, currentQuestion,
  ]);

  // Debounced save on answer changes
  useEffect(() => {
    // Don't save if no answers yet
    const hasAnswers = Object.values(answers).some(
      (dim) => Object.keys(dim).length > 0,
    );
    if (!hasAnswers && !dealType) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [answers, dealType, dealName, currentDimension, currentQuestion, save]);

  return { saving, lastSaved, saveError };
}
