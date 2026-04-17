import Link from "next/link";
import type { StageNumber, MisalignmentFlag } from "@/types/assessment";
import StageBadge from "./stage-badge";

const MISALIGNMENT_TEASERS: Record<MisalignmentFlag, string> = {
  income_exceeds_structure:
    "Your income has outgrown your business structure — this creates tax inefficiency and legal exposure.",
  judgment_not_priced:
    "Clients pay for your judgment, but your income structure doesn't reflect it.",
  relationships_not_converted:
    "Long-term client relationships that could become equity or advisory positions aren't being leveraged.",
  ip_not_monetized:
    "You own creative IP but aren't generating passive income from licensing or royalties.",
  demand_exceeds_capacity:
    "You're turning down work but haven't built systems to scale beyond your personal capacity.",
  talent_without_structure:
    "Strong creative discernment paired with minimal business infrastructure — the classic missed opportunity.",
};

export default function FreePreview({
  stage,
  topMisalignment,
}: {
  stage: StageNumber;
  topMisalignment: MisalignmentFlag | null;
}) {
  return (
    <div className="rdmp-free-preview">
      <div className="rdmp-free-header">
        <h1>Your Creative Identity Snapshot</h1>
        <p>Here&apos;s what we found about your current position.</p>
      </div>

      <div className="rdmp-free-stage">
        <StageBadge stage={stage} size="large" />
      </div>

      {topMisalignment && (
        <div className="rdmp-free-misalignment">
          <h3>Top Structural Misalignment</h3>
          <div className="rdmp-free-misalignment-card">
            <span className="rdmp-free-misalignment-flag">
              {topMisalignment.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
            <p>{MISALIGNMENT_TEASERS[topMisalignment]}</p>
          </div>
        </div>
      )}

      <div className="rdmp-free-gate">
        <h2>Your full roadmap is ready</h2>
        <p>
          Members get a personalized strategic roadmap with 3 specific next
          steps, relevant deal structures from our library of 35, and case
          studies of creatives who made this exact transition.
        </p>
        <ul className="rdmp-free-gate-list">
          <li>3 personalized action steps with timelines and done signals</li>
          <li>Structural misalignment analysis with cost breakdown</li>
          <li>12-month and 3-year vision targets</li>
          <li>Recommended structures and case studies from the library</li>
          <li>Provider recommendations for each action</li>
        </ul>
        <Link href="/pricing" className="rdmp-free-gate-btn">
          Join to See Your Roadmap
        </Link>
        <p className="rdmp-free-gate-note">From $12/year · Full library access included</p>
      </div>
    </div>
  );
}
