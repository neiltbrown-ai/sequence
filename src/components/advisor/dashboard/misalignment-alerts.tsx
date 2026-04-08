"use client";

interface MisalignmentAlertsProps {
  misalignments: Record<string, unknown>[];
}

const FLAG_LABELS: Record<string, string> = {
  income_exceeds_structure: "Your income has outgrown your business structure",
  judgment_not_priced: "You\u2019re delivering judgment-level value at execution-level pricing",
  relationships_not_converted: "Long-term relationships without ownership participation",
  ip_not_monetized: "Unmonetized intellectual property",
  demand_exceeds_capacity: "Demand exceeds your current capacity model",
  talent_without_structure: "Influence without infrastructure",
};

export default function MisalignmentAlerts({
  misalignments,
}: MisalignmentAlertsProps) {
  if (misalignments.length === 0) return null;

  return (
    <div className="adv-dash-misalignments">
      {misalignments.map((m) => {
        const flag = m.flag as string;
        return (
          <div key={flag} className="adv-dash-misalignment">
            <span className="adv-dash-misalignment-icon">!</span>
            <div className="adv-dash-misalignment-content">
              <p className="adv-dash-misalignment-label">
                {FLAG_LABELS[flag] || flag.replace(/_/g, " ")}
              </p>
              {m.what_its_costing != null && (
                <p className="adv-dash-misalignment-detail">
                  {String(m.what_its_costing)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
