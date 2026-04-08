import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StageNumber, PlanStatus } from "@/types/assessment";

const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Stage 1",
  2: "Stage 2",
  3: "Stage 3",
  4: "Stage 4",
};

const STATUS_LABELS: Record<PlanStatus, string> = {
  generating: "Generating",
  draft: "Draft",
  review: "Needs Review",
  published: "Published",
  rejected: "Rejected",
};

export default async function AdminAssessmentsPage() {
  const admin = createAdminClient();

  // ── Diagnostic: independent counts to debug empty queue ──
  const { count: assessmentCount, error: assessmentCountErr } = await admin
    .from("assessments")
    .select("*", { count: "exact", head: true });

  const { count: planCount, error: planCountErr } = await admin
    .from("strategic_plans")
    .select("*", { count: "exact", head: true });

  const diagnostics = {
    assessments: assessmentCount ?? 0,
    assessmentErr: assessmentCountErr?.message || null,
    plans: planCount ?? 0,
    planErr: planCountErr?.message || null,
  };

  // Fetch all plans with assessment + profile data
  // Note: join via profiles (public schema) rather than auth.users
  // which isn't accessible via PostgREST
  const { data: plans, error: plansErr } = await admin
    .from("strategic_plans")
    .select(`
      id,
      status,
      created_at,
      published_at,
      reviewed_by,
      assessment_id,
      user_id,
      assessments (
        discipline,
        creative_mode,
        detected_stage,
        archetype_primary
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (plansErr) {
    console.error("Failed to fetch plans:", plansErr);
  }

  // Common plan shape used across primary + fallback queries
  type PlanRow = {
    id: string;
    status: string;
    created_at: string;
    published_at: string | null;
    reviewed_by: string | null;
    assessment_id: string;
    user_id: string;
    assessments?: {
      discipline: string;
      creative_mode: string;
      detected_stage: number;
      archetype_primary: string;
    } | null;
  };

  // If the join query fails, try without the join as fallback
  let fallbackPlans: PlanRow[] | null = null;
  if (plansErr && !plans) {
    const { data } = await admin
      .from("strategic_plans")
      .select("id, status, created_at, published_at, reviewed_by, assessment_id, user_id")
      .order("created_at", { ascending: false })
      .limit(100);
    fallbackPlans = (data as PlanRow[]) || null;
  }

  const activePlans: PlanRow[] = (plans as PlanRow[] | null) || fallbackPlans || [];

  // Fetch profiles for all plan user_ids
  const userIds = [...new Set(activePlans.map((p) => p.user_id).filter(Boolean))];
  const profileMap = new Map<string, { full_name: string | null; email: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    profiles?.forEach((p) => {
      profileMap.set(p.id, { full_name: p.full_name, email: p.email });
    });
  }

  // If using fallback (no join), fetch assessment data separately
  const assessmentMap = new Map<string, { discipline: string; creative_mode: string; detected_stage: number; archetype_primary: string }>();
  if (fallbackPlans && fallbackPlans.length > 0) {
    const assessmentIds = [...new Set(fallbackPlans.map((p) => p.assessment_id).filter(Boolean))];
    if (assessmentIds.length > 0) {
      const { data: assessments } = await admin
        .from("assessments")
        .select("id, discipline, creative_mode, detected_stage, archetype_primary")
        .in("id", assessmentIds);

      assessments?.forEach((a) => {
        assessmentMap.set(a.id, {
          discipline: a.discipline,
          creative_mode: a.creative_mode,
          detected_stage: a.detected_stage,
          archetype_primary: a.archetype_primary,
        });
      });
    }
  }

  const pendingCount = activePlans.filter((p) => p.status === "review").length || 0;

  return (
    <div className="adm-assessments">
      <div className="adm-header rv vis">
        <h1 className="adm-title">Assessments</h1>
        <p className="adm-subtitle">
          Review queue and strategic plans. {pendingCount} pending review · {activePlans.length} total plans.
        </p>
      </div>

      {/* Diagnostic — remove once queue is working */}
      <div style={{ padding: "12px 16px", marginTop: 16, marginBottom: 16, background: "rgba(0,0,0,0.03)", borderRadius: 6, fontFamily: "var(--mono)", fontSize: 11 }}>
        <strong>Debug:</strong>{" "}
        assessments in DB: {diagnostics.assessments}{diagnostics.assessmentErr && <span style={{ color: "red" }}> (err: {diagnostics.assessmentErr})</span>}
        {" · "}
        plans in DB: {diagnostics.plans}{diagnostics.planErr && <span style={{ color: "red" }}> (err: {diagnostics.planErr})</span>}
        {plansErr && <span style={{ color: "red" }}> · join query err: {plansErr.message}</span>}
        {fallbackPlans && <span> · using fallback query ({fallbackPlans.length} rows)</span>}
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Discipline</th>
            <th>Stage</th>
            <th>Archetype</th>
            <th>Status</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {activePlans.map((plan) => {
            // Try joined data first, then fallback assessment map
            const assessment = plan.assessments || assessmentMap.get(plan.assessment_id) || null;
            const profile = profileMap.get(plan.user_id);

            const status = plan.status as PlanStatus;
            const stage = assessment?.detected_stage as StageNumber | undefined;

            return (
              <tr key={plan.id} className={status === "review" ? "adm-row-highlight" : ""}>
                <td>
                  <div className="adm-member-cell">
                    <span className="adm-member-name">
                      {profile?.full_name || "Unknown"}
                    </span>
                    <span className="adm-member-email">{profile?.email}</span>
                  </div>
                </td>
                <td>{assessment?.discipline || "—"}</td>
                <td>{stage ? STAGE_NAMES[stage] : "—"}</td>
                <td className="adm-archetype">
                  {assessment?.archetype_primary?.replace(/_/g, " ") || "—"}
                </td>
                <td>
                  <span className={`adm-status adm-status--${status}`}>
                    {STATUS_LABELS[status] || status}
                  </span>
                </td>
                <td className="adm-date">
                  {new Date(plan.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  <Link
                    href={`/admin/assessments/${plan.id}`}
                    className="adm-review-link"
                  >
                    {status === "review" ? "Review" : "View"}
                  </Link>
                </td>
              </tr>
            );
          })}
          {activePlans.length === 0 && (
            <tr>
              <td colSpan={7} className="adm-empty">
                No assessment plans yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
