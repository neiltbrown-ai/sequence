"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AssessmentAnswers, WizardSection } from "@/types/assessment";

const DEBOUNCE_MS = 800;

export function useAssessmentAutosave(
  userId: string,
  assessmentId: string | null,
  answers: AssessmentAnswers,
  currentSection: WizardSection,
  currentQuestionIndex: number,
  onAssessmentCreated: (id: string) => void,
) {
  const supabaseRef = useRef(createClient());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const assessmentIdRef = useRef(assessmentId);
  const onCreatedRef = useRef(onAssessmentCreated);

  // Keep refs in sync
  useEffect(() => {
    assessmentIdRef.current = assessmentId;
  }, [assessmentId]);
  useEffect(() => {
    onCreatedRef.current = onAssessmentCreated;
  }, [onAssessmentCreated]);

  const save = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setSaving(true);
    setSaveError(null);

    const supabase = supabaseRef.current;

    try {
      const data = {
        // Section 1
        discipline: answers.discipline || null,
        sub_discipline: answers.sub_discipline || null,
        creative_mode: answers.creative_mode || null,
        // Section 2
        energy_ranking: answers.energy_ranking || null,
        drains: answers.drains || null,
        dream_response: answers.dream_response || null,
        // Section 3
        income_range: answers.income_range || null,
        income_structure: answers.income_structure || null,
        what_they_pay_for: answers.what_they_pay_for || null,
        equity_positions: answers.equity_positions || null,
        demand_level: answers.demand_level || null,
        business_structure: answers.business_structure || null,
        // Section 4
        stage_questions: answers.stage_questions || {},
        industry_questions: answers.industry_questions || {},
        discernment_questions: answers.discernment_questions || {},
        // Section 5
        three_year_goal: answers.three_year_goal || null,
        risk_tolerance: answers.risk_tolerance || null,
        constraints: answers.constraints || null,
        specific_question: answers.specific_question || null,
        // Progress
        current_section: currentSection,
        current_question: currentQuestionIndex,
      };

      if (assessmentIdRef.current) {
        // Update existing
        const { error } = await supabase
          .from("assessments")
          .update(data)
          .eq("id", assessmentIdRef.current);

        if (error) {
          console.error("[Autosave] Update failed:", error.message, error);
          setSaveError(error.message);
          return;
        }
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from("assessments")
          .insert({
            ...data,
            user_id: userId,
            status: "in_progress",
            version: 1,
          })
          .select("id")
          .single();

        if (error) {
          console.error("[Autosave] Insert failed:", error.message, error);
          setSaveError(error.message);
          return;
        }

        if (created) {
          assessmentIdRef.current = created.id;
          onCreatedRef.current(created.id);
          // Store in localStorage for recovery
          if (typeof window !== "undefined") {
            localStorage.setItem("seq_assessment_id", created.id);
          }
        }
      }

      setLastSaved(new Date().toISOString());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown save error";
      console.error("[Autosave] Exception:", msg, err);
      setSaveError(msg);
    } finally {
      setSaving(false);
      pendingRef.current = false;
    }
  }, [answers, currentSection, currentQuestionIndex, userId]);

  // Debounced save on answers change
  useEffect(() => {
    // Don't save if no answers yet
    const hasAnswers = Object.values(answers).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    if (!hasAnswers) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [answers, currentSection, currentQuestionIndex, save]);

  return { saving, lastSaved, saveError };
}
